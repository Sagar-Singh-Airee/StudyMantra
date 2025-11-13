// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';
import { BookOpen, UploadCloud, BarChart2 } from 'lucide-react';

// Import your Agora logo
import agoraLogo from '../assets/agora-logo.png';

export default function Home() {
  const navigate = useNavigate();

  const Card = ({ title, desc, icon, onClick }) => (
    <div
      onClick={onClick}
      className="card p-6 cursor-pointer hover:scale-[1.02] transition-transform shadow-md"
    >
      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-[var(--google-blue)] text-white mb-4 shadow">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{desc}</p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Top Welcome Banner */}
      <div className="card p-8 flex items-center justify-between bg-white shadow-lg">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Welcome to StudyMantra 📚</h1>
          <p className="text-gray-600 mt-1">
            AI-powered learning with real-time collaboration.
          </p>
        </div>
        <button
          onClick={() => navigate('/study')}
          className="btn-primary px-6 py-3"
        >
          Start Studying →
        </button>
      </div>

      {/* Quick Action Cards */}
      <div className="grid md:grid-cols-3 gap-6">

        <Card
          title="Start Studying"
          desc="Open your material and focus with the Pomodoro timer."
          icon={<BookOpen className="w-6 h-6" />}
          onClick={() => navigate('/study')}
        />

        <Card
          title="Upload Material"
          desc="Upload PDFs and auto-generate quizzes instantly."
          icon={<UploadCloud className="w-6 h-6" />}
          onClick={() => navigate('/upload')}
        />

        <Card
          title="Analytics"
          desc="Track progress and export reports for the hackathon."
          icon={<BarChart2 className="w-6 h-6" />}
          onClick={() => navigate('/analytics')}
        />
      </div>

      {/* Recent Material + Agora Banner */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent Material Card */}
        <div className="lg:col-span-2 card p-6 shadow">
          <h3 className="font-bold mb-2">Recent Study Material</h3>
          <p className="text-sm text-gray-600">
            Your latest uploaded PDF will appear here.
          </p>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-500">
            No recent uploads — upload your first PDF!
          </div>
        </div>

        {/* Agora Collab Card */}
        <div className="card p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="font-bold mb-2">Hackathon Collaboration</h3>
            <p className="text-sm text-gray-600">
              StudyMantra × Agora — enabling real-time study rooms.
            </p>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <img src={agoraLogo} alt="Agora" className="w-28 object-contain" />
            <div>
              <div className="font-semibold text-sm">Powered by Agora</div>
              <div className="text-xs text-gray-500">Realtime SDK Partner</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
