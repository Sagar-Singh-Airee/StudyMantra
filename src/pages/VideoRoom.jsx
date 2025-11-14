// src/pages/VideoRoom.jsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import VideoCall from '../components/VideoCall';
import agoraLogo from '../assets/agora-logo.png';

export default function VideoRoom() {
  const navigate = useNavigate();

  const handleLeave = () => {
    navigate('/study');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 mb-1">Study Room</h1>
            <p className="text-sm text-gray-600">Real-time collaboration powered by Agora</p>
          </div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3"
          >
            <img
              src={agoraLogo}
              alt="Agora"
              className="w-24 object-contain"
            />
          </motion.div>
        </div>
      </div>

      {/* Video Component */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <VideoCall onLeave={handleLeave} />
      </div>
    </motion.div>
  );
}