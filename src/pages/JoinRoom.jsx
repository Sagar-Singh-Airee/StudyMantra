// src/pages/JoinRoom.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, ArrowRight, Loader, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function JoinRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [roomInfo, setRoomInfo] = useState(null);
  const [userName, setUserName] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    fetchRoomInfo();
  }, [roomId]);

  const fetchRoomInfo = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/rooms/${roomId}`);
      if (!response.ok) throw new Error('Room not found');
      
      const data = await response.json();
      setRoomInfo(data);
      setLoading(false);
    } catch (error) {
      toast.error('Room not found or expired');
      setTimeout(() => navigate('/'), 2000);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setJoining(true);

    try {
      // Store user info
      const userId = `user-${Date.now()}`;
      const user = {
        id: userId,
        name: userName,
        role: 'participant',
      };

      localStorage.setItem('sharedStudyUser', JSON.stringify(user));
      localStorage.setItem('sharedStudyRoomId', roomId);

      // Navigate to study session
      navigate('/study', { 
        state: { 
          sharedMode: true, 
          roomId, 
          user,
          isHost: false 
        } 
      });

      toast.success('Joining room...');
    } catch (error) {
      toast.error('Failed to join room');
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white"
            >
              <Users className="w-10 h-10" />
            </motion.div>

            <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Join Study Room
            </h1>
            <p className="text-gray-600">
              You've been invited to collaborate!
            </p>
          </div>

          {/* Room Info */}
          {roomInfo && (
            <div className="mb-6 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
              <div className="text-sm text-gray-600 mb-1">Study Material:</div>
              <div className="font-bold text-gray-900">
                {roomInfo.docName || 'Shared Document'}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Host: {roomInfo.hostName || 'Unknown'}
              </div>
            </div>
          )}

          {/* Join Form */}
          <form onSubmit={handleJoin}>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                disabled={joining}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={joining}
              className={`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                joining
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-xl'
              }`}
            >
              {joining ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Room
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">What you can do:</p>
                <ul className="text-xs space-y-1 text-blue-700">
                  <li>• Collaborate in real-time</li>
                  <li>• Share highlights & notes</li>
                  <li>• Follow the presenter</li>
                  <li>• Ask AI together</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}