// src/components/VideoCall.jsx
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

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

// Video quality presets
const VIDEO_PRESETS = {
  '720p': { resolution: 1280, frameRate: 30, bitrate: 2000 },
  '540p': { resolution: 960, frameRate: 30, bitrate: 1200 },
  '360p': { resolution: 640, frameRate: 24, bitrate: 800 }
};

export default function VideoCall({
  onLeave = () => {},
  appId = APP_ID,
  channel = CHANNEL_DEFAULT,
  token = TOKEN,
  userName = 'Guest',
  isHost = false
}) {
  // Refs
  const clientRef = useRef(null);
  const localTracksRef = useRef({ 
    audioTrack: null, 
    videoTrack: null, 
    screenTrack: null
  });
  const localContainerRef = useRef(null);

  // State
  const [connectionState, setConnectionState] = useState(ConnectionState.DISCONNECTED);
  const [localUid, setLocalUid] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState(new Map());
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Enhanced error handling
  const showError = useCallback((message) => {
    console.error('[VideoCall] ', message);
  }, []);

  const showSuccess = useCallback((message) => {
    console.log('[VideoCall] ', message);
  }, []);

  // Cleanup function
  const cleanup = useCallback(async () => {
    const client = clientRef.current;
    try {
      const { audioTrack, videoTrack, screenTrack } = localTracksRef.current;
      
      // Cleanup all tracks
      [audioTrack, videoTrack, screenTrack].forEach(track => {
        if (track) {
          try { 
            track.stop(); 
            track.close(); 
          } catch (err) {
            console.warn('Error stopping track:', err);
          }
        }
      });

      localTracksRef.current = { 
        audioTrack: null, 
        videoTrack: null, 
        screenTrack: null
      };

      if (client) {
        try { 
          await client.leave(); 
        } catch (err) {
          console.warn('Error leaving client:', err);
        }
      }

      setRemoteUsers(new Map());
      setLocalUid(null);
      setConnectionState(ConnectionState.DISCONNECTED);
      
    } catch (err) {
      console.warn('[cleanup] ', err);
    }
  }, []);

  const leaveCall = useCallback(async () => {
    await cleanup();
    onLeave();
  }, [cleanup, onLeave]);

  // Initialize Agora connection
  useEffect(() => {
    let mounted = true;

    if (!appId) {
      showError('Agora App ID missing. Set VITE_AGORA_APP_ID in .env and restart.');
      return;
    }

    const initializeCall = async () => {
      try {
        setConnectionState(ConnectionState.CONNECTING);
        
        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        // Set up event handlers
        const handleUserPublished = async (user, mediaType) => {
          try {
            await client.subscribe(user, mediaType);
            
            setRemoteUsers(prev => {
              const updated = new Map(prev);
              const existing = updated.get(user.uid) || { 
                uid: user.uid, 
                videoTrack: null, 
                audioTrack: null
              };

              if (mediaType === 'video') existing.videoTrack = user.videoTrack;
              if (mediaType === 'audio') existing.audioTrack = user.audioTrack;

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
        };

        // Register events
        client.on('user-published', handleUserPublished);
        client.on('user-unpublished', handleUserUnpublished);
        client.on('user-left', handleUserLeft);

        // Join channel
        const uid = await client.join(appId, channel, token || null, null);
        if (!mounted) return;
        
        setLocalUid(uid);

        // Create local tracks
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          {},
          { 
            encoderConfig: VIDEO_PRESETS['720p'],
            optimizationMode: 'detail'
          }
        );

        localTracksRef.current = { audioTrack, videoTrack, screenTrack: null };

        // Play local preview
        if (localContainerRef.current) {
          videoTrack.play(localContainerRef.current, { mirror: true });
        }

        // Publish tracks
        await client.publish([audioTrack, videoTrack]);

        setConnectionState(ConnectionState.CONNECTED);
        showSuccess('Successfully joined the call');

      } catch (err) {
        console.error('Failed to initialize call:', err);
        setConnectionState(ConnectionState.FAILED);
        showError(`Failed to join: ${err.message}`);
      }
    };

    initializeCall();

    // Cleanup function
    return () => {
      mounted = false;
      cleanup();
    };
  }, [appId, channel, token, cleanup, showError, showSuccess]);

  // Call duration timer
  useEffect(() => {
    if (connectionState !== ConnectionState.CONNECTED) return;
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [connectionState]);

  // Toggle functions
  const toggleVideo = useCallback(async () => {
    const videoTrack = localTracksRef.current.videoTrack;
    if (!videoTrack) return;
    
    try {
      await videoTrack.setEnabled(!videoEnabled);
      setVideoEnabled(!videoEnabled);
    } catch (err) {
      showError('Failed to toggle video');
    }
  }, [videoEnabled, showError]);

  const toggleAudio = useCallback(async () => {
    const audioTrack = localTracksRef.current.audioTrack;
    if (!audioTrack) return;
    
    try {
      await audioTrack.setEnabled(!audioEnabled);
      setAudioEnabled(!audioEnabled);
    } catch (err) {
      showError('Failed to toggle audio');
    }
  }, [audioEnabled, showError]);

  const toggleScreenShare = useCallback(async () => {
    const client = clientRef.current;
    if (!client) return;

    try {
      if (!isScreenSharing) {
        // Start screen share
        const screenTrack = await AgoraRTC.createScreenVideoTrack({ 
          encoderConfig: '1080p_2',
          optimizationMode: 'detail'
        }, 'auto');
        
        localTracksRef.current.screenTrack = screenTrack;

        // Unpublish video track and publish screen track
        if (localTracksRef.current.videoTrack) {
          await client.unpublish(localTracksRef.current.videoTrack);
        }
        
        await client.publish(screenTrack);
        setIsScreenSharing(true);
        
        // Handle screen share end
        screenTrack.on('track-ended', () => {
          toggleScreenShare();
        });
        
        showSuccess('Screen sharing started');
      } else {
        // Stop screen share
        const { screenTrack, videoTrack } = localTracksRef.current;
        
        if (screenTrack) {
          await client.unpublish(screenTrack);
          screenTrack.stop();
          screenTrack.close();
          localTracksRef.current.screenTrack = null;
        }
        
        if (videoTrack) {
          await client.publish(videoTrack);
          if (localContainerRef.current) {
            videoTrack.play(localContainerRef.current, { mirror: true });
          }
        }
        
        setIsScreenSharing(false);
        showSuccess('Screen sharing stopped');
      }
    } catch (err) {
      showError(`Failed to toggle screen share: ${err.message}`);
    }
  }, [isScreenSharing, showError, showSuccess]);

  // Format time for display
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remoteUserArray = Array.from(remoteUsers.values());

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${
            connectionState === 'connected' ? 'bg-green-500' :
            connectionState === 'connecting' ? 'bg-yellow-500' :
            connectionState === 'reconnecting' ? 'bg-orange-500' : 'bg-red-500'
          }`} />
          <span className="text-sm font-medium capitalize">{connectionState}</span>
          <span className="text-sm">{formatTime(callDuration)}</span>
          <span className="text-sm">{remoteUserArray.length + 1} participants</span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono bg-black/20 px-2 py-1 rounded">
            {channel}
          </span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-auto">
        <div className={`grid gap-4 h-full ${
          remoteUserArray.length === 0 ? 'grid-cols-1' :
          remoteUserArray.length <= 3 ? 'grid-cols-2' : 'grid-cols-3'
        }`}>
          {/* Local Video */}
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-600 bg-gray-800">
            <div 
              ref={localContainerRef}
              className="w-full h-64 flex items-center justify-center"
            />
            <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
              {userName} (You) {!videoEnabled && '(Camera Off)'}
            </div>
            {!videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Remote Videos */}
          {remoteUserArray.map(user => (
            <RemoteVideoCard key={user.uid} user={user} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-gray-800 border-t border-gray-700">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all ${
              videoEnabled 
                ? 'bg-gray-600 hover:bg-gray-500' 
                : 'bg-red-600 hover:bg-red-500'
            }`}
            title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {videoEnabled ? '📹' : '📷❌'}
          </button>

          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all ${
              audioEnabled 
                ? 'bg-gray-600 hover:bg-gray-500' 
                : 'bg-red-600 hover:bg-red-500'
            }`}
            title={audioEnabled ? 'Mute' : 'Unmute'}
          >
            {audioEnabled ? '🎤' : '🎤❌'}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-all ${
              isScreenSharing 
                ? 'bg-blue-600 hover:bg-blue-500'
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            {isScreenSharing ? '🖥️❌' : '🖥️'}
          </button>

          <button
            onClick={leaveCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-500 transition-all"
            title="Leave call"
          >
            📞❌
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-20 right-4 w-80 bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Video Quality</label>
              <select className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2">
                <option value="720p">720p HD</option>
                <option value="540p">540p</option>
                <option value="360p">360p</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="mt-4 w-full bg-gray-700 hover:bg-gray-600 py-2 rounded transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

// Remote Video Card Component
function RemoteVideoCard({ user }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (user.videoTrack && videoRef.current) {
      user.videoTrack.play(videoRef.current);
    }
    
    return () => {
      if (user.videoTrack) {
        try {
          user.videoTrack.stop();
        } catch (err) {
          // Track might already be stopped
        }
      }
    };
  }, [user.videoTrack]);

  const hasVideo = !!user.videoTrack;

  return (
    <div className="relative rounded-xl overflow-hidden border-2 border-gray-600 bg-gray-800">
      <div 
        ref={videoRef}
        className="w-full h-64 flex items-center justify-center"
      />
      <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-lg text-sm">
        User {user.uid} {!hasVideo && '(Camera Off)'}
      </div>
      {!hasVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}