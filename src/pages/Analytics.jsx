import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Trophy, Clock, Target, TrendingUp, Download, Home } from 'lucide-react';
import { useStudySession } from '../context/StudySessionContext';
import { exportStudyReport } from '../utils/exportReport';
import toast from 'react-hot-toast';

function Analytics() {
  const navigate = useNavigate();
  const { studyData } = useStudySession();

  const chartData = studyData.quizHistory.slice(-10).map((quiz, index) => ({
    name: `Q${index + 1}`,
    score: quiz.score,
  }));

  const handleExport = () => {
    exportStudyReport(studyData);
    toast.success('Report exported successfully!');
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📊 Analytics Dashboard</h1>
            <p className="text-white/80">Track your learning progress</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              <Download className="w-5 h-5" />
              Export Report
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 bg-white/20 backdrop-blur text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition"
            >
              <Home className="w-5 h-5" />
              Home
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Trophy className="w-8 h-8" />}
            label="Quizzes Completed"
            value={studyData.completedQuizzes}
            color="blue"
          />
          <StatCard
            icon={<Target className="w-8 h-8" />}
            label="Average Score"
            value={`${studyData.averageScore}%`}
            color="green"
          />
          <StatCard
            icon={<Clock className="w-8 h-8" />}
            label="Study Time"
            value={`${studyData.totalStudyTime}m`}
            color="purple"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            label="Current Streak"
            value={`${studyData.currentStreak} days`}
            color="orange"
          />
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Quiz Scores</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No quiz data yet. Complete some quizzes to see your progress!
              </div>
            )}
          </div>

          {/* Line Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Performance Trend</h2>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                Complete more quizzes to see trends!
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Activity</h2>
          {studyData.quizHistory.length > 0 ? (
            <div className="space-y-3">
              {studyData.quizHistory.slice(-5).reverse().map((quiz, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Quiz #{studyData.quizHistory.length - index}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(quiz.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{quiz.score}%</p>
                    <p className="text-sm text-gray-600">
                      {quiz.correctAnswers}/{quiz.totalQuestions} correct
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No activity yet. Start studying!</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className={`${colorClasses[color]} w-12 h-12 rounded-lg flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <p className="text-gray-600 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

export default Analytics;