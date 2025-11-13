// src/pages/Analytics.jsx
import { DownloadCloud } from 'lucide-react';
import { exportStudyReport } from '../utils/exportReport';
import { useStudySession } from '../context/StudySessionContext';
import toast from 'react-hot-toast';

export default function Analytics() {
  const { studyData } = useStudySession();

  const handleExport = () => {
    exportStudyReport(studyData);
    toast.success('Report exported successfully!');
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="card p-6 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">📊 Analytics Dashboard</h1>
          <p className="text-gray-600 text-sm">Track your learning progress</p>
        </div>

        <button 
          onClick={handleExport}
          className="btn-primary flex items-center gap-2"
        >
          <DownloadCloud className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">

        <SummaryCard 
          label="Quizzes Completed"
          value={studyData.completedQuizzes}
          color="bg-[var(--google-blue)]"
        />

        <SummaryCard 
          label="Average Score"
          value={studyData.averageScore + '%'}
          color="bg-[var(--google-green)]"
        />

        <SummaryCard 
          label="Total Study Time"
          value={studyData.totalStudyTime + ' min'}
          color="bg-[var(--google-yellow)]"
        />

      </div>

      {/* Recent Activity */}
      <div className="card p-6 shadow-md">
        <h2 className="font-bold mb-4 text-gray-800">📘 Recent Quizzes</h2>

        {studyData.quizHistory.length === 0 ? (
          <p className="text-gray-400 text-sm">No quiz activity found.</p>
        ) : (
          <div className="space-y-3">
            {studyData.quizHistory
              .slice(-6)
              .reverse()
              .map((quiz, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-gray-800">Quiz #{studyData.quizHistory.length - i}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(quiz.date).toLocaleString()}
                    </p>
                  </div>

                  <p className="text-lg font-bold text-[var(--google-blue)]">
                    {quiz.score}%
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div className="card p-6 shadow-md">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 text-white ${color}`}>
        {/* Accent square */}
      </div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  );
}
