// src/pages/Analytics.jsx
import { DownloadCloud, TrendingUp, Trophy, Clock, Target, Calendar, ChevronRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { exportStudyReport } from '../utils/exportReport';
import { useStudySession } from '../context/StudySessionContext';
import toast from 'react-hot-toast';

export default function Analytics() {
  const { studyData } = useStudySession();

  const handleExport = () => {
    exportStudyReport(studyData);
    toast.success('Report exported successfully!');
  };

  const avgQuizTime = studyData.completedQuizzes > 0 
    ? Math.round(studyData.totalStudyTime / studyData.completedQuizzes) 
    : 0;
  
  const recentStreak = calculateStreak(studyData.quizHistory);
  const improvement = calculateImprovement(studyData.quizHistory);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📊 Analytics Dashboard
            </h1>
            <p className="text-gray-600">Track your learning journey and progress</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <DownloadCloud className="w-5 h-5" />
            Export Report
          </motion.button>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<Trophy />}
          label="Quizzes Completed"
          value={studyData.completedQuizzes}
          gradient="from-yellow-400 to-orange-500"
          suffix=" total"
          variants={itemVariants}
        />

        <MetricCard
          icon={<Target />}
          label="Average Score"
          value={studyData.averageScore}
          gradient="from-blue-500 to-cyan-500"
          suffix="%"
          variants={itemVariants}
        />

        <MetricCard
          icon={<Clock />}
          label="Study Time"
          value={studyData.totalStudyTime}
          gradient="from-purple-500 to-pink-500"
          suffix=" min"
          variants={itemVariants}
        />

        <MetricCard
          icon={<TrendingUp />}
          label="Improvement"
          value={improvement >= 0 ? `+${improvement}` : improvement}
          gradient="from-green-500 to-emerald-500"
          suffix="%"
          variants={itemVariants}
        />
      </div>

      {/* Performance Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Recent Activity
              </h2>
              {studyData.quizHistory.length > 0 && (
                <span className="text-sm font-semibold text-gray-500">
                  Last {Math.min(6, studyData.quizHistory.length)} quizzes
                </span>
              )}
            </div>

            {studyData.quizHistory.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {studyData.quizHistory
                  .slice(-6)
                  .reverse()
                  .map((quiz, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ x: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                      className="group flex items-center justify-between p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-100 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                          quiz.score >= 80 ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                          quiz.score >= 60 ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                          'bg-gradient-to-br from-orange-500 to-red-500'
                        }`}>
                          {quiz.score}%
                        </div>
                        
                        <div>
                          <p className="font-bold text-gray-900 text-lg">
                            Quiz #{studyData.quizHistory.length - i}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(quiz.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Insights & Achievements */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Quick Insights */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Award className="w-6 h-6" />
                Quick Insights
              </h3>
              
              <div className="space-y-4">
                <InsightItem
                  label="Current Streak"
                  value={recentStreak}
                  suffix=" days"
                />
                <InsightItem
                  label="Avg. Quiz Time"
                  value={avgQuizTime}
                  suffix=" min"
                />
                <InsightItem
                  label="Best Score"
                  value={Math.max(...studyData.quizHistory.map(q => q.score), 0)}
                  suffix="%"
                />
              </div>
            </div>
          </div>

          {/* Performance Badge */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Performance</h3>
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="text-6xl mb-3"
              >
                {studyData.averageScore >= 80 ? '🏆' :
                 studyData.averageScore >= 60 ? '⭐' : '📈'}
              </motion.div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                {studyData.averageScore >= 80 ? 'Outstanding!' :
                 studyData.averageScore >= 60 ? 'Great Progress!' :
                 'Keep Going!'}
              </p>
              <p className="text-xs text-gray-500">
                {studyData.averageScore >= 80 
                  ? 'You\'re performing exceptionally well!' 
                  : studyData.averageScore >= 60
                  ? 'You\'re making solid progress'
                  : 'Consistency is key to improvement'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function MetricCard({ icon, label, value, gradient, suffix = '', variants }) {
  return (
    <motion.div variants={variants} whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 blur-2xl`} />
        
        <div className="relative z-10">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
            {icon}
          </div>
          
          <p className="text-sm font-semibold text-gray-600 mb-1">{label}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-black text-gray-900">{value}</p>
            <span className="text-lg font-semibold text-gray-500">{suffix}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InsightItem({ label, value, suffix }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/20">
      <span className="text-white/90 font-medium">{label}</span>
      <span className="text-white font-bold text-lg">
        {value}{suffix}
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-6xl mb-4"
      >
        📚
      </motion.div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No Quiz History Yet</h3>
      <p className="text-gray-600 mb-6">Complete your first quiz to see analytics</p>
      <button className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
        Start Your First Quiz
      </button>
    </div>
  );
}

function calculateStreak(quizHistory) {
  if (quizHistory.length === 0) return 0;
  
  let streak = 1;
  const sortedQuizzes = [...quizHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  for (let i = 1; i < sortedQuizzes.length; i++) {
    const diff = Math.abs(new Date(sortedQuizzes[i-1].date) - new Date(sortedQuizzes[i].date));
    const daysDiff = diff / (1000 * 60 * 60 * 24);
    if (daysDiff <= 1) streak++;
    else break;
  }
  
  return streak;
}

function calculateImprovement(quizHistory) {
  if (quizHistory.length < 2) return 0;
  
  const recent = quizHistory.slice(-3).reduce((sum, q) => sum + q.score, 0) / Math.min(3, quizHistory.length);
  const old = quizHistory.slice(0, 3).reduce((sum, q) => sum + q.score, 0) / Math.min(3, quizHistory.length);
  
  return Math.round(recent - old);
}