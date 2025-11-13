// src/pages/VideoRoom.jsx
import { useNavigate } from 'react-router-dom';
import VideoCall from '../components/VideoCall';

// Import your Agora logo
import agoraLogo from '../assets/agora-logo.png';

export default function VideoRoom() {
  const navigate = useNavigate();

  const handleLeave = () => {
    navigate('/study');
  };

  return (
    <div className="card p-6 shadow-lg">

      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Study Room</h1>
          <p className="text-sm text-gray-600">Real-time collaboration powered by Agora</p>
        </div>

        <img
          src={agoraLogo}
          alt="Agora"
          className="w-28 object-contain"
        />
      </div>

      {/* Video Component */}
      <VideoCall onLeave={handleLeave} />

    </div>
  );
}
