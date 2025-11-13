import { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';
import toast from 'react-hot-toast';

// You need to get these from Agora Console (https://console.agora.io)
const APP_ID = 'ef51dc25a99043caaba0f2cdc776ed94';
const CHANNEL = 'StudyMantra-Room';

function VideoCall({ onLeave }) {
  const [client] = useState(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localTracks, setLocalTracks] = useState({ video: null, audio: null });
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const localVideoRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Join channel
        const uid = await client.join(APP_ID, CHANNEL, null, null);
        
        // Create local tracks
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks({ video: videoTrack, audio: audioTrack });
        
        // Play local video
        if (localVideoRef.current) {
          videoTrack.play(localVideoRef.current);
        }
        
        // Publish tracks
        await client.publish([audioTrack, videoTrack]);
        
        toast.success('Connected to study room!');
      } catch (error) {
        console.error('Failed to initialize:', error);
        toast.error('Failed to connect. Check your Agora credentials.');
      }
    };

    // Handle remote users
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        setRemoteUsers(prev => [...prev, user]);
      }
    });

    client.on('user-unpublished', (user) => {
      setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
    });

    init();

    return () => {
      localTracks.video?.close();
      localTracks.audio?.close();
      client.leave();
    };
  }, [client]);

  const toggleVideo = () => {
    if (localTracks.video) {
      localTracks.video.setEnabled(!videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (localTracks.audio) {
      localTracks.audio.setEnabled(!audioEnabled);
      setAudioEnabled(!audioEnabled);
    }
  };

  const handleLeave = () => {
    localTracks.video?.close();
    localTracks.audio?.close();
    client.leave();
    onLeave();
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">📹 Study Together</h2>
      
      {/* Video Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Local Video */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
          <div ref={localVideoRef} className="w-full h-full" />
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
            You
          </div>
        </div>
        
        {/* Remote Videos */}
        {remoteUsers.map((user) => (
          <div key={user.uid} className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <div 
              ref={(ref) => {
                if (ref && user.videoTrack) {
                  user.videoTrack.play(ref);
                }
              }}
              className="w-full h-full"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-sm">
              User {user.uid}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full ${videoEnabled ? 'bg-gray-200' : 'bg-red-500 text-white'}`}
        >
          {videoEnabled ? <Video /> : <VideoOff />}
        </button>
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full ${audioEnabled ? 'bg-gray-200' : 'bg-red-500 text-white'}`}
        >
          {audioEnabled ? <Mic /> : <MicOff />}
        </button>
        <button
          onClick={handleLeave}
          className="p-4 rounded-full bg-red-500 text-white"
        >
          <PhoneOff />
        </button>
      </div>
    </div>
  );
}

export default VideoCall;