// src/pages/StudySession.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';

import Timer from '../components/Timer';
import toast from 'react-hot-toast';
import { useStudySession } from '../context/StudySessionContext';

export default function StudySession() {
  const navigate = useNavigate();
  const { studyData, addStudyTime } = useStudySession();

  const [material, setMaterial] = useState('');
  const [sessionStartTime] = useState(Date.now());

  // Load Study Material
  useEffect(() => {
    const saved = localStorage.getItem('studyMaterial');

    if (!saved) {
      toast.error('No study material found!');
      navigate('/upload');
    } else {
      setMaterial(saved);
    }
  }, [navigate]);

  // Timer Completed → Move to quiz
  const handleTimerComplete = () => {
    const studyTime = Math.floor((Date.now() - sessionStartTime) / 60000);
    addStudyTime(studyTime);

    toast.success('Study session complete! Time for a quiz!');
    navigate('/quiz');
  };

  // Manual quiz start
  const startQuizNow = () => {
    const mins = Math.floor((Date.now() - sessionStartTime) / 60000);
    addStudyTime(mins);
    navigate('/quiz');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">

      {/* LEFT SIDE — Study Material */}
      <div className="lg:col-span-2 card p-6 shadow-md">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[var(--google-blue)]" />
              Study Material
            </h2>
            <p className="text-sm text-gray-600">
              {studyData.pdfFileName || 'No file name available'}
            </p>
          </div>

          <button
            onClick={startQuizNow}
            className="btn-primary flex items-center gap-2"
          >
            Start Quiz Now
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg max-h-[650px] overflow-y-auto text-gray-800 leading-relaxed shadow-inner">
          {material
            ? material.split('\n\n').map((para, i) => (
                <p key={i} className="mb-4 text-gray-700">{para}</p>
              ))
            : <p className="text-gray-400">No material loaded.</p>
          }
        </div>
      </div>

      {/* RIGHT SIDE — Timer + Stats + Agora Room */}
      <div className="space-y-6">

        {/* Timer Card */}
        <div className="card p-6 shadow-md">
          <h3 className="font-bold mb-4 text-gray-800">⏱️ Focus Timer</h3>
          <Timer onComplete={handleTimerComplete} />
        </div>

        {/* Stats Card */}
        <div className="card p-6 shadow-md">
          <h3 className="font-bold mb-4 text-gray-800">📊 Your Stats</h3>

          <div className="space-y-3">
            <Stat label="Quizzes Completed" value={studyData.completedQuizzes} />
            <Stat label="Average Score" value={`${studyData.averageScore}%`} />
            <Stat label="Total Study Time" value={`${studyData.totalStudyTime} min`} />
          </div>
        </div>

        {/* Agora Study Room */}
        <div className="card p-6 shadow-md">
          <h3 className="font-bold mb-2 text-gray-800">👥 Study Together</h3>
          <p className="text-sm text-gray-600 mb-4">
            Join an Agora-powered real-time study room.
          </p>

          <button
            onClick={() => navigate('/video')}
            className="btn-primary w-full"
          >
            Join Study Room
          </button>
        </div>

      </div>
    </div>
  );
}

/* Small reusable stat component */
function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg shadow-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-gray-800">{value}</span>
    </div>
  );
}
