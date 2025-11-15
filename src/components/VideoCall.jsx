// src/components/VideoCall.jsx
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import {
  Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MonitorOff,
  Volume2, Settings, Users
} from 'lucide-react';

// Config from env
const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const TOKEN = import.meta.env.VITE_AGORA_TOKEN || null;
const CHANNEL_DEFAULT = import.meta.env.VITE_AGORA_CHANNEL || 'studymantra-room';

// Connection states
const ConnectionState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  FAILED: 'failed'
};

export default function VideoCall({
  onLeave = () => {},
  appId = APP_ID,
  channel = CHANNEL_DEFAULT,
  token = TOKEN,
  userName = 'Guest'
}) {
  // Refs
  const clientRef = useRef(null);
  const localTracksRef = useRef({ audioTrack: null, videoTrack: null, screenTrack: null });
  const reconnectTimeoutRef = useRef(null);
  const statsIntervalRef = useRef(null);

  // State
  const [connectionState, setConnectionState] = useState(ConnectionState.DISCONNECTED);
  const [localUid, setLocalUid] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState(new Map());
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [availableDevices, setAvailableDevices] = useState({ cameras: [], microphones: [] });
  const [selectedDevices, setSelectedDevices] = useState({ camera: null, microphone: null });
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState({});
  const [speakingUsers, setSpeakingUsers] = useState(new Set());

  // Local video container refs for play
  const localContainerRef = useRef(null);

  // --- Helpers ---
  const showError = useCallback((message) => {
    console.error('[VideoCall] ', message);
  }, []);

  const setupVolumeIndicator = useCallback((audioTrack, uid) => {
    if (!audioTrack) return;
    // If getVolumeLevel not available, skip
    if (typeof audioTrack.getVolumeLevel !== 'function') return;

    const interval = setInterval(() => {
      try {
        const v = audioTrack.getVolumeLevel();
        setSpeakingUsers(prev => {
          const s = new Set(prev);
          if (v > 0.1) s.add(uid);
          else s.delete(uid);
          return s;
        });
      } catch (err) {
        // ignore
      }
    }, 250);

    // attach cleanup handle
    audioTrack._volumeCleanup = () => clearInterval(interval);
  }, []);

  // Cleanly stop tracks & leave without calling onLeave (used for unmount/cleanup)
  const doLeaveWithoutNav = useCallback(async () => {
    const client = clientRef.current;
    try {
      const { audioTrack, videoTrack, screenTrack } = localTracksRef.current;
      [audioTrack, videoTrack, screenTrack].forEach(t => {
        if (t) {
          t._volumeCleanup?.();
          try { t.stop?.(); } catch {}
          try { t.close?.(); } catch {}
        }
      });

      localTracksRef.current = { audioTrack: null, videoTrack: null, screenTrack: null };

      if (client) {
        try { await client.unpublish?.(); } catch {}
        try { await client.leave(); } catch {}
      }

      setRemoteUsers(new Map());
      setSpeakingUsers(new Set());
      setLocalUid(null);
      setConnectionState(ConnectionState.DISCONNECTED);
    } catch (err) {
      console.warn('[doLeaveWithoutNav] ', err);
    }
  }, []);

  // User-initiated leave (will call onLeave after cleanup)
  const leaveCall = useCallback(async () => {
    // Call cleanup WITHOUT navigation first
    await doLeaveWithoutNav();
    // Then notify parent (this is the only place onLeave is called)
    try {
      onLeave(); // parent will typically navigate
    } catch (err) {
      console.warn('onLeave handler threw', err);
    }
  }, [doLeaveWithoutNav, onLeave]);

  // --- Single mount effect: create client, wire listeners, auto-join
  useEffect(() => {
    let mounted = true;

    if (!appId) {
      showError('Agora App ID missing. Set VITE_AGORA_APP_ID in .env and restart.');
      return undefined;
    }

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    // Try dual stream if available but don't crash if not supported
    if (typeof client.enableDualStream === 'function') {
      client.enableDualStream().catch(() => {});
    }

    // Event handlers
    const handleUserPublished = async (user, mediaType) => {
      try {
        await client.subscribe(user, mediaType);
        // Build/merge remote user entry
        setRemoteUsers(prev => {
          const updated = new Map(prev);
          const existing = updated.get(user.uid) || { uid: user.uid };

          if (mediaType === 'video') existing.videoTrack = user.videoTrack;
          if (mediaType === 'audio') {
            existing.audioTrack = user.audioTrack;
            setupVolumeIndicator(user.audioTrack, user.uid);
          }

          updated.set(user.uid, existing);
          return updated;
        });
      } catch (err) {
        showError(`Failed to subscribe to remote user ${user.uid}`);
      }
    };

    const handleUserUnpublished = (user, mediaType) => {
      setRemoteUsers(prev => {
        const updated = new Map(prev);
        const existing = updated.get(user.uid);
        if (existing) {
          if (mediaType === 'video') {
            try { existing.videoTrack?.stop(); } catch {}
            existing.videoTrack = null;
          }
          if (mediaType === 'audio') {
            try { existing.audioTrack?.stop(); } catch {}
            existing.audioTrack = null;
          }
          updated.set(user.uid, existing);
        }
        return updated;
      });
      setSpeakingUsers(prev => {
        const s = new Set(prev); s.delete(user.uid); return s;
      });
    };

    const handleUserLeft = (user) => {
      setRemoteUsers(prev => {
        const updated = new Map(prev);
        const existing = updated.get(user.uid);
        if (existing) {
          try { existing.videoTrack?.stop(); } catch {}
          try { existing.audioTrack?.stop(); } catch {}
        }
        updated.delete(user.uid);
        return updated;
      });
      setSpeakingUsers(prev => { const s = new Set(prev); s.delete(user.uid); return s; });
    };

    const handleConnectionStateChange = (curState, prevState) => {
      // Map SDK states to our enum roughly
      if (curState === 'CONNECTED' || curState === 'connected') {
        setConnectionState(ConnectionState.CONNECTED);
      } else if (curState === 'DISCONNECTED' || curState === 'disconnected') {
        setConnectionState(ConnectionState.DISCONNECTED);
        // attempt reconnect
        attemptReconnect();
      } else if (curState === 'RECONNECTING' || curState === 'reconnecting') {
        setConnectionState(ConnectionState.RECONNECTING);
      } else if (curState === 'CONNECTING' || curState === 'connecting') {
        setConnectionState(ConnectionState.CONNECTING);
      }
    };

    const handleNetworkQuality = () => {
      // Network quality tracking removed
    };

    const handleException = (ev) => {
      console.warn('[Agora exception]', ev);
    };

    // Register events
    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-left', handleUserLeft);
    client.on && client.on('connection-state-change', handleConnectionStateChange);
    client.on && client.on('exception', handleException);

    // Auto-join helper
    const autoJoin = async () => {
      try {
        setConnectionState(ConnectionState.CONNECTING);
        const uid = await client.join(appId, channel, token || null, null);
        if (!mounted) return;
        setLocalUid(uid);
        // get devices
        try {
          const devices = await AgoraRTC.getDevices();
          const cams = devices.filter(d => d.kind === 'videoinput');
          const mics = devices.filter(d => d.kind === 'audioinput');
          setAvailableDevices({ cameras: cams, microphones: mics });
          if (!selectedDevices.camera && cams.length) setSelectedDevices(s => ({ ...s, camera: cams[0].deviceId }));
          if (!selectedDevices.microphone && mics.length) setSelectedDevices(s => ({ ...s, microphone: mics[0].deviceId }));
        } catch (e) {
          // ignore device listing errors
        }

        // Create tracks (allow browser prompt)
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          {}, { encoderConfig: '720p_2' }
        );

        localTracksRef.current = { audioTrack, videoTrack, screenTrack: null };

        // setup local volume indicator
        setupVolumeIndicator(audioTrack, 'local');

        // Play local preview
        try { videoTrack.play(localContainerRef.current); } catch (e) { /* ignore */ }

        await client.publish([audioTrack, videoTrack]);

        setConnectionState(ConnectionState.CONNECTED);

        // start stats
        startStatsCollection();
      } catch (err) {
        const message = err?.message || String(err);
        showError(`Failed to join: ${message}`);
        setConnectionState(ConnectionState.FAILED);
      }
    };

    // Start auto join
    autoJoin();

    // cleanup function when unmount => do NOT call onLeave here
    return () => {
      mounted = false;
      // remove listeners
      try {
        client.off && client.off('user-published', handleUserPublished);
        client.off && client.off('user-unpublished', handleUserUnpublished);
        client.off && client.off('user-left', handleUserLeft);
        client.off && client.off('connection-state-change', handleConnectionStateChange);
        client.off && client.off('network-quality', handleNetworkQuality);
        client.off && client.off('exception', handleException);
      } catch (e) {}
      // clear reconnection / stats
      if (reconnectTimeoutRef.current) { clearTimeout(reconnectTimeoutRef.current); reconnectTimeoutRef.current = null; }
      if (statsIntervalRef.current) { clearInterval(statsIntervalRef.current); statsIntervalRef.current = null; }
      // leave quietly
      doLeaveWithoutNav();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run only on mount

  // --- Reconnect logic (keeps same as before)
  const attemptReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) return;
    setConnectionState(ConnectionState.RECONNECTING);
    reconnectTimeoutRef.current = setTimeout(async () => {
      try {
        reconnectTimeoutRef.current = null;
        // try rejoin
        const client = clientRef.current;
        if (client) {
          // cleanup and rejoin
          await doLeaveWithoutNav();
          // re-call join flow by manual create tracks + publish
          // simplified: call the same join sequence by creating tracks then publishing
          const uid = await client.join(appId, channel, token || null, null);
          setLocalUid(uid);
          const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
          localTracksRef.current = { audioTrack, videoTrack, screenTrack: null };
          setupVolumeIndicator(audioTrack, 'local');
          try { videoTrack.play(localContainerRef.current); } catch {}
          await client.publish([audioTrack, videoTrack]);
          setConnectionState(ConnectionState.CONNECTED);
        }
      } catch (err) {
        console.warn('[reconnect] failed', err);
        reconnectTimeoutRef.current = null;
        // schedule another attempt
        attemptReconnect();
      }
    }, 3000);
  }, [appId, channel, token, doLeaveWithoutNav]);

  // -- Stats collection
  const startStatsCollection = useCallback(() => {
    if (statsIntervalRef.current) return;
    statsIntervalRef.current = setInterval(() => {
      try {
        const client = clientRef.current;
        if (!client) return;
        const rtcStats = client.getRTCStats ? client.getRTCStats() : {};
        const localStats = localTracksRef.current.videoTrack?.getStats?.();
        setStats({
          duration: rtcStats.Duration || 0,
          userCount: rtcStats.UserCount || (remoteUsers.size + 1),
          sendBitrate: Math.floor((rtcStats.SendBitrate || 0) / 1000),
          recvBitrate: Math.floor((rtcStats.RecvBitrate || 0) / 1000),
          sendResolution: localStats ? `${localStats.sendResolutionWidth}x${localStats.sendResolutionHeight}` : 'N/A',
          sendFrameRate: localStats?.sendFrameRate || 0
        });
      } catch (err) {
        // ignore stats errors
      }
    }, 1000);
  }, [remoteUsers.size]);

  // Toggle video/audio/screensharing with safety checks
  const toggleVideo = useCallback(async () => {
    const vt = localTracksRef.current.videoTrack;
    if (!vt) return;
    try {
      await vt.setEnabled(!videoEnabled);
      setVideoEnabled(v => !v);
      // if re-enabled, play preview
      if (!videoEnabled) {
        try { vt.play(localContainerRef.current); } catch {}
      }
    } catch (err) { showError('Failed to toggle camera'); }
  }, [videoEnabled, showError]);

  const toggleAudio = useCallback(async () => {
    const at = localTracksRef.current.audioTrack;
    if (!at) return;
    try {
      await at.setEnabled(!audioEnabled);
      setAudioEnabled(a => !a);
    } catch (err) { showError('Failed to toggle microphone'); }
  }, [audioEnabled, showError]);

  const toggleScreenShare = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;
    try {
      if (!isScreenSharing) {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({}, 'disable');
        localTracksRef.current.screenTrack = screenTrack;
        // unpublish camera, publish screen
        if (localTracksRef.current.videoTrack) {
          await client.unpublish([localTracksRef.current.videoTrack]);
        }
        await client.publish([screenTrack]);
        setIsScreenSharing(true);
        screenTrack.on && screenTrack.on('track-ended', () => {
          // user stopped screen share
          toggleScreenShare();
        });
      } else {
        // stop screen
        const { screenTrack, videoTrack } = localTracksRef.current;
        if (screenTrack) {
          await client.unpublish([screenTrack]).catch(() => {});
          try { screenTrack.stop(); screenTrack.close(); } catch {}
          localTracksRef.current.screenTrack = null;
        }
        // republish camera
        if (videoTrack) await client.publish([videoTrack]);
        setIsScreenSharing(false);
      }
    } catch (err) {
      showError('Failed to toggle screen share');
      setIsScreenSharing(false);
    }
  }, [isScreenSharing, showError]);

  // Change device
  const changeDevice = useCallback(async (type, deviceId) => {
    try {
      const tracks = localTracksRef.current;
      if (type === 'camera' && tracks.videoTrack) {
        await tracks.videoTrack.setDevice(deviceId);
        setSelectedDevices(s => ({ ...s, camera: deviceId }));
      } else if (type === 'microphone' && tracks.audioTrack) {
        await tracks.audioTrack.setDevice(deviceId);
        setSelectedDevices(s => ({ ...s, microphone: deviceId }));
      }
    } catch (err) {
      showError('Failed to change device');
    }
  }, [showError]);

  // Refresh devices
  const refreshDevices = useCallback(async () => {
    try {
      const devices = await AgoraRTC.getDevices();
      const cams = devices.filter(d => d.kind === 'videoinput');
      const mics = devices.filter(d => d.kind === 'audioinput');
      setAvailableDevices({ cameras: cams, microphones: mics });
    } catch (err) {
      showError('Cannot access camera/mic. Check permissions.');
    }
  }, [showError]);

  // Convert remoteUsers Map to array for rendering
  const remoteUserArray = useMemo(() => Array.from(remoteUsers.values()), [remoteUsers]);

  // Render
  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Main Grid */}
      <div className="flex-1 overflow-auto p-4">
        <div className={`grid gap-4 h-full ${
          remoteUserArray.length === 0 ? 'grid-cols-1' :
          remoteUserArray.length === 1 ? 'grid-cols-1 md:grid-cols-2' :
          remoteUserArray.length <= 4 ? 'grid-cols-2' :
          'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        }`}>
          {/* Local */}
          <LocalVideoCard
            containerRef={localContainerRef}
            tracksRef={localTracksRef}
            videoEnabled={videoEnabled}
            isScreenSharing={isScreenSharing}
            userName={userName}
            isSpeaking={speakingUsers.has('local')}
          />

          {/* Remote */}
          {remoteUserArray.map(u => (
            <RemoteVideoCard key={u.uid} user={u} isSpeaking={speakingUsers.has(u.uid)} />
          ))}

          {/* Empty */}
          {remoteUserArray.length === 0 && connectionState === ConnectionState.CONNECTED && (
            <div className="flex flex-col items-center justify-center text-gray-400 bg-[#151515] rounded-xl p-8 border border-gray-800">
              <Users size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-medium mb-1">Waiting for others</p>
              <p className="text-sm text-gray-500">Share the channel name: <span className="font-mono text-white">{channel}</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-[#151515] border-t border-gray-800 p-6">
        <div className="flex justify-center items-center gap-4">
          <button type="button" onClick={toggleVideo} className={`p-4 rounded-full ${videoEnabled ? 'bg-white/10 hover:bg-white/20' : 'bg-red-600 hover:bg-red-700'}`} title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}>
            {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
          </button>

          <button type="button" onClick={toggleAudio} className={`p-4 rounded-full ${audioEnabled ? 'bg-white/10 hover:bg-white/20' : 'bg-red-600 hover:bg-red-700'}`} title={audioEnabled ? 'Mute' : 'Unmute'}>
            {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          <button type="button" onClick={toggleScreenShare} className={`p-4 rounded-full ${isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/10 hover:bg-white/20'}`} title={isScreenSharing ? 'Stop sharing' : 'Share screen'}>
            {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
          </button>

          <button type="button" onClick={leaveCall} className="p-4 rounded-full bg-red-600 hover:bg-red-700" title="Leave call">
            <PhoneOff size={24} />
          </button>

          <button type="button" onClick={() => setShowSettings(s => !s)} className="p-4 rounded-full bg-white/10 hover:bg-white/20" title="Settings">
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <SettingsPanel
          devices={availableDevices}
          selected={selectedDevices}
          onChange={changeDevice}
          onClose={() => setShowSettings(false)}
          onRefresh={refreshDevices}
        />
      )}

      {/* Stats */}
      {showStats && stats.duration !== undefined && (
        <div className="absolute top-20 right-4 bg-black/90 border border-gray-700 rounded-lg p-4 text-xs font-mono space-y-1 backdrop-blur-sm">
          <div className="font-bold mb-2 text-white">Call Statistics</div>
          <div>Duration: {Math.floor(stats.duration / 60)}m {stats.duration % 60}s</div>
          <div>Users: {stats.userCount}</div>
          <div>Send: {stats.sendBitrate} kb/s</div>
          <div>Recv: {stats.recvBitrate} kb/s</div>
          <div>Resolution: {stats.sendResolution}</div>
          <div>FPS: {stats.sendFrameRate}</div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------
// Local and Remote card components (kept features)
// ---------------------------------------------------
function LocalVideoCard({ containerRef, tracksRef, videoEnabled, isScreenSharing, userName, isSpeaking }) {
  const cRef = containerRef || React.createRef();

  useEffect(() => {
    const track = isScreenSharing ? tracksRef.current.screenTrack : tracksRef.current.videoTrack;
    if (track && cRef.current && videoEnabled) {
      try { track.play(cRef.current); } catch (e) { /* ignore */ }
    }
    return () => {
      try { track?.stop?.(); } catch {}
    };
  }, [tracksRef, videoEnabled, isScreenSharing, cRef]);

  return (
    <div className={`relative bg-black rounded-xl overflow-hidden border-2 transition-all ${isSpeaking ? 'border-green-500' : 'border-gray-800'}`}>
      <div ref={cRef} className="w-full h-full min-h-[300px] bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        {!videoEnabled && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-400">Camera Off</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
          {isSpeaking && <Volume2 size={14} className="text-green-500" />}
          {userName} (You)
        </div>
        {isScreenSharing && <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">Screen</div>}
      </div>
    </div>
  );
}

function RemoteVideoCard({ user, isSpeaking }) {
  const ref = useRef(null);

  useEffect(() => {
    if (user.videoTrack && ref.current) {
      try { user.videoTrack.play(ref.current); } catch {}
    }
    if (user.audioTrack) {
      try { user.audioTrack.play(); } catch {}
    }
    return () => { try { user.videoTrack?.stop?.(); } catch {} };
  }, [user.videoTrack, user.audioTrack]);

  const hasVideo = !!user.videoTrack;
  return (
    <div className={`relative bg-black rounded-xl overflow-hidden border-2 transition-all ${isSpeaking ? 'border-green-500' : 'border-gray-800'}`}>
      <div ref={ref} className="w-full h-full min-h-[300px] bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        {!hasVideo && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl font-bold">
              {String(user.uid).charAt(0)}
            </div>
            <span className="text-gray-400">Camera Off</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-3">
        <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2">
          {isSpeaking && <Volume2 size={14} className="text-green-500" />}
          User {user.uid}
        </div>
      </div>
    </div>
  );
}

// Settings panel unchanged
function SettingsPanel({ devices, selected, onChange, onClose, onRefresh }) {
  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#1a1a1a] border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Settings</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Camera</label>
            <select value={selected.camera || ''} onChange={(e) => onChange('camera', e.target.value)} className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg p-2.5 text-sm">
              {devices.cameras.map(device => <option key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${device.deviceId.slice(0,8)}`}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Microphone</label>
            <select value={selected.microphone || ''} onChange={(e) => onChange('microphone', e.target.value)} className="w-full bg-[#0a0a0a] border border-gray-700 rounded-lg p-2.5 text-sm">
              {devices.microphones.map(device => <option key={device.deviceId} value={device.deviceId}>{device.label || `Microphone ${device.deviceId.slice(0,8)}`}</option>)}
            </select>
          </div>

          <button type="button" onClick={onRefresh} className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg p-2.5 text-sm font-medium">Refresh Devices</button>
        </div>
      </div>
    </div>
  );
}