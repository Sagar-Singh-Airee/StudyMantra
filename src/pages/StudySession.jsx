import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import Timer from '../components/Timer';
import { useStudySession } from '../context/StudySessionContext';
import toast from 'react-hot-toast';

function StudySession() {
  const navigate = useNavigate();
  const { studyData, addStudyTime } = useStudySession();
  const [material, setMaterial] = useState('');
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    const saved = localStorage.getItem('studyMaterial');
    if (!saved) {
      toast.error('No study material found!');
      navigate('/upload');
    } else {
      setMaterial(saved);
    }
  }, [navigate]);

  const handleTimerComplete = () => {
    const studyTime = Math.floor((Date.now() - sessionStartTime) / 60000);
    addStudyTime(studyTime);
    toast.success('Study session complete! Time for a quiz!');
    navigate('/quiz');
  };

  const startQuizNow = () => {
    const studyTime = Math.floor((Date.now() - sessionStartTime) / 60000);
    addStudyTime(studyTime);
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Study Session</h1>
                <p className="text-gray-600">{studyData.pdfFileName || 'Your Material'}</p>
              </div>
            </div>
            <button
              onClick={startQuizNow}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Start Quiz Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Study Material */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">📚 Study Material</h2>
            <div className="prose max-w-none">
              <div className="bg-gray-50 p-6 rounded-lg max-h-[600px] overflow-y-auto text-gray-700 leading-relaxed">
                {material.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Timer & Stats */}
          <div className="space-y-6">
            <Timer onComplete={handleTimerComplete} />
            
            {/* Stats Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold mb-4 text-gray-800">📊 Your Stats</h3>
              <div className="space-y-3">
                <StatItem 
                  label="Quizzes Completed" 
                  value={studyData.completedQuizzes} 
                  icon="🎯"
                />
                <StatItem 
                  label="Average Score" 
                  value={`${studyData.averageScore}%`} 
                  icon="⭐"
                />
                <StatItem 
                  label="Study Time" 
                  value={`${studyData.totalStudyTime} min`} 
                  icon="⏱️"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <span className="text-gray-600 flex items-center gap-2">
        <span>{icon}</span>
        {label}
      </span>
      <span className="font-bold text-gray-800">{value}</span>
    </div>
  );
}

export default StudySession;