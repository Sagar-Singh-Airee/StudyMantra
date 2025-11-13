// src/pages/VideoRoom.jsx
import { useNavigate } from 'react-router-dom';
import VideoCall from '../components/VideoCall';

export default function VideoRoom() {
  const navigate = useNavigate();

  const handleLeave = () => {
    // You can expand this to show a confirmation modal, stats, etc.
    navigate('/study');
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-purple-600 to-indigo-700">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Study Room</h1>
            <p className="text-gray-600">Join classmates and study together</p>
          </div>
          <div>
            <button
              onClick={() => navigate('/study')}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg"
            >
              Back to Study
            </button>
          </div>
        </div>

        {/* VideoCall component (uses your existing VideoCall.jsx) */}
        <VideoCall onLeave={handleLeave} />
      </div>
    </div>
  );
}
