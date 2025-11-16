// src/pages/Analytics.jsx
import { DownloadCloud, TrendingUp, Trophy, Clock, Target, Calendar, ChevronRight, Award, Zap, TrendingDown, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { exportStudyReport } from '../utils/exportReport';
import { useStudySession } from '../context/StudySessionContext';
import toast from 'react-hot-toast';
import { useState, useMemo } from 'react';

export default function Analytics() {
  const { studyData } = useStudySession();
  const [timeRange, setTimeRange] = useState('all'); // 'week', 'month', 'all'

  const handleExport = () => {
    exportStudyReport(studyData);
    toast.success('Report exported successfully!');
  };

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (timeRange === 'all') return studyData;
    
    const now = new Date();
    const filterDate = new Date();
    
    if (timeRange === 'week') {
      filterDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'month') {
      filterDate.setDate(now.getDate() - 30);
    }
    
    const filteredHistory = studyData.quizHistory.filter(quiz => 
      new Date(quiz.date) >= filterDate
    );
    
    return {
      ...studyData,
      quizHistory: filteredHistory,
      completedQuizzes: filteredHistory.length,
      totalStudyTime: filteredHistory.reduce((total, quiz) => total + (quiz.duration || 0), 0),
      averageScore: filteredHistory.length > 0 
        ? Math.round(filteredHistory.reduce((sum, quiz) => sum + quiz.score, 0) / filteredHistory.length)
        : 0
    };
  }, [studyData, timeRange]);

  const stats = useMemo(() => {
    const completedQuizzes = filteredData.completedQuizzes;
    const totalStudyTime = filteredData.totalStudyTime;
    const avgScore = filteredData.averageScore;
    
    const avgQuizTime = completedQuizzes > 0 
      ? Math.round(totalStudyTime / completedQuizzes) 
      : 0;
    
    const recentStreak = calculateStreak(filteredData.quizHistory);
    const improvement = calculateImprovement(filteredData.quizHistory);
    const consistency = calculateConsistency(filteredData.quizHistory);
    const bestScore = Math.max(...filteredData.quizHistory.map(q => q.score), 0);
    const totalQuizzes = studyData.quizHistory.length;

    return {
      completedQuizzes,
      totalStudyTime,
      averageScore: avgScore,
      avgQuizTime,
      recentStreak,
      improvement,
      consistency,
      bestScore,
      totalQuizzes
    };
  }, [filteredData, studyData.quizHistory.length]);

  const performanceLevel = useMemo(() => {
    if (stats.averageScore >= 90) return { level: 'Expert', emoji: '🏆', color: 'from-yellow-400 to-orange-500' };
    if (stats.averageScore >= 80) return { level: 'Advanced', emoji: '⭐', color: 'from-purple-500 to-pink-500' };
    if (stats.averageScore >= 70) return { level: 'Proficient', emoji: '🚀', color: 'from-blue-500 to-cyan-500' };
    if (stats.averageScore >= 60) return { level: 'Intermediate', emoji: '📈', color: 'from-green-500 to-emerald-500' };
    return { level: 'Beginner', emoji: '🌱', color: 'from-gray-500 to-gray-700' };
  }, [stats.averageScore]);

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
      {/* Header with Time Filter */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              📊 Analytics Dashboard
            </h1>
            <p className="text-gray-600">Track your learning journey and progress</p>
            
            {/* Time Range Filter */}
            <div className="flex gap-2 mt-4">
              {['week', 'month', 'all'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                    timeRange === range
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
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

      {/* Performance Level Banner */}
      <motion.div 
        variants={itemVariants}
        className={`bg-gradient-to-r ${performanceLevel.color} rounded-3xl p-6 text-white shadow-xl`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Performance Level</h2>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{performanceLevel.emoji}</span>
              <div>
                <p className="text-xl font-bold">{performanceLevel.level}</p>
                <p className="text-blue-100">Average Score: {stats.averageScore}%</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Quizzes Completed</p>
            <p className="text-2xl font-bold">{stats.completedQuizzes}</p>
          </div>
        </div>
      </motion.div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<Trophy className="w-6 h-6" />}
          label="Quizzes Completed"
          value={stats.completedQuizzes}
          total={stats.totalQuizzes}
          gradient="from-yellow-400 to-orange-500"
          suffix=""
          variants={itemVariants}
        />

        <MetricCard
          icon={<Target className="w-6 h-6" />}
          label="Average Score"
          value={stats.averageScore}
          gradient="from-blue-500 to-cyan-500"
          suffix="%"
          variants={itemVariants}
        />

        <MetricCard
          icon={<Clock className="w-6 h-6" />}
          label="Total Study Time"
          value={stats.totalStudyTime}
          gradient="from-purple-500 to-pink-500"
          suffix=" min"
          variants={itemVariants}
        />

        <MetricCard
          icon={stats.improvement >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          label="Improvement"
          value={stats.improvement >= 0 ? `+${stats.improvement}` : stats.improvement}
          gradient={stats.improvement >= 0 ? "from-green-500 to-emerald-500" : "from-red-500 to-orange-500"}
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
              {filteredData.quizHistory.length > 0 && (
                <span className="text-sm font-semibold text-gray-500">
                  Last {Math.min(6, filteredData.quizHistory.length)} of {filteredData.quizHistory.length} quizzes
                </span>
              )}
            </div>

            {filteredData.quizHistory.length === 0 ? (
              <EmptyState timeRange={timeRange} />
            ) : (
              <div className="space-y-3">
                {filteredData.quizHistory
                  .slice(-6)
                  .reverse()
                  .map((quiz, i) => (
                    <QuizItem 
                      key={i} 
                      quiz={quiz} 
                      index={i} 
                      totalQuizzes={filteredData.quizHistory.length}
                    />
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
                <Zap className="w-6 h-6" />
                Quick Insights
              </h3>
              
              <div className="space-y-4">
                <InsightItem
                  icon={<Award className="w-4 h-4" />}
                  label="Current Streak"
                  value={stats.recentStreak}
                  suffix=" days"
                />
                <InsightItem
                  icon={<Clock className="w-4 h-4" />}
                  label="Avg. Quiz Time"
                  value={stats.avgQuizTime}
                  suffix=" min"
                />
                <InsightItem
                  icon={<Star className="w-4 h-4" />}
                  label="Best Score"
                  value={stats.bestScore}
                  suffix="%"
                />
                <InsightItem
                  icon={<TrendingUp className="w-4 h-4" />}
                  label="Consistency"
                  value={stats.consistency}
                  suffix="%"
                />
              </div>
            </div>
          </div>

          {/* Study Goals */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Study Goals
            </h3>
            <div className="space-y-4">
              <GoalItem
                label="Complete 10 quizzes"
                completed={Math.min(stats.completedQuizzes, 10)}
                total={10}
              />
              <GoalItem
                label="Reach 80% average"
                completed={Math.min(stats.averageScore, 80)}
                total={80}
              />
              <GoalItem
                label="5-day streak"
                completed={Math.min(stats.recentStreak, 5)}
                total={5}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function QuizItem({ quiz, index, totalQuizzes }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    return 'from-orange-500 to-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ x: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
      className="group flex items-center justify-between p-5 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-100 cursor-pointer transition-all"
    >
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg bg-gradient-to-br ${getScoreColor(quiz.score)}`}>
          {quiz.score}%
        </div>
        
        <div>
          <p className="font-bold text-gray-900 text-lg">
            Quiz #{totalQuizzes - index}
          </p>
          <p className="text-sm text-gray-600">
            {new Date(quiz.date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          {quiz.duration && (
            <p className="text-xs text-gray-500 mt-1">
              Duration: {quiz.duration} min
            </p>
          )}
        </div>
      </div>

      <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
    </motion.div>
  );
}

function MetricCard({ icon, label, value, total, gradient, suffix = '', variants }) {
  return (
    <motion.div variants={variants} whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
      <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 relative overflow-hidden h-full">
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
          
          {total && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(value / total) * 100}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{value}/{total} completed</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function InsightItem({ icon, label, value, suffix }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/20">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-white/90 font-medium">{label}</span>
      </div>
      <span className="text-white font-bold text-lg">
        {value}{suffix}
      </span>
    </div>
  );
}

function GoalItem({ label, completed, total }) {
  const percentage = Math.min((completed / total) * 100, 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-semibold text-gray-900">{completed}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function EmptyState({ timeRange }) {
  const getTimeRangeText = () => {
    switch (timeRange) {
      case 'week': return 'the past week';
      case 'month': return 'the past month';
      default: return 'any time period';
    }
  };

  return (
    <div className="text-center py-16">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-6xl mb-4"
      >
        📚
      </motion.div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">No Quiz Data Found</h3>
      <p className="text-gray-600 mb-6">
        No quizzes completed in {getTimeRangeText()}. Start studying to see your analytics!
      </p>
      <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
        Start a Quiz Now
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

function calculateConsistency(quizHistory) {
  if (quizHistory.length < 2) return 100;
  
  const scores = quizHistory.map(q => q.score);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Convert to a consistency percentage (lower std dev = higher consistency)
  const maxPossibleStdDev = 50; // Assuming scores range from 0-100
  const consistency = Math.max(0, 100 - (standardDeviation / maxPossibleStdDev) * 100);
  
  return Math.round(consistency);
}