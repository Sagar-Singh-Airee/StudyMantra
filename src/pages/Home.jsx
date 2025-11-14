// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';
import { BookOpen, UploadCloud, BarChart2, Sparkles, Trophy, Clock, ArrowRight, Zap, Target, TrendingUp, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ streak: 0, points: 0, rank: 0 });
  const [material, setMaterial] = useState(null);

  useEffect(() => {
    // Load user stats
    const savedStats = JSON.parse(localStorage.getItem('userStats') || '{"streak": 7, "points": 2450, "rank": 12}');
    setStats(savedStats);
    
    // Load recent material
    const fileName = localStorage.getItem('pdfFileName');
    if (fileName) setMaterial(fileName);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.48, 0.15, 0.25, 0.96] } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-8"
    >
      {/* Hero Section with Glassmorphism */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-1">
        <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 md:p-12">
          {/* Animated Background Blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full text-sm font-semibold text-white shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                AI-Powered Learning
              </motion.div>
              
              <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent leading-tight">
                Welcome to
                <br />
                StudyMantra 📚
              </h1>
              
              <p className="text-lg text-gray-600 max-w-xl">
                Transform your learning journey with AI-powered quizzes, real-time collaboration, and intelligent analytics.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/study')}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl flex items-center gap-2"
                >
                  Start Studying
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/upload')}
                  className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-800 rounded-2xl font-bold hover:border-blue-400 transition-colors"
                >
                  Upload Material
                </motion.button>
              </div>
            </div>

            {/* Floating Stats Cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="grid grid-cols-3 gap-4"
            >
              <StatBubble icon={<Trophy className="w-6 h-6" />} value={stats.rank} label="Rank" color="from-yellow-400 to-orange-500" />
              <StatBubble icon={<Zap className="w-6 h-6" />} value={stats.streak} label="Streak" color="from-green-400 to-emerald-500" />
              <StatBubble icon={<Target className="w-6 h-6" />} value={stats.points} label="Points" color="from-blue-400 to-purple-500" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Quick Action Cards */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6">
        <ActionCard
          title="Start Studying"
          description="Open your material and focus with AI assistance"
          icon={<BookOpen className="w-8 h-8" />}
          gradient="from-blue-500 to-cyan-500"
          onClick={() => navigate('/study')}
          stats="25 min avg session"
        />
        
        <ActionCard
          title="Upload Material"
          description="Auto-generate quizzes from any PDF instantly"
          icon={<UploadCloud className="w-8 h-8" />}
          gradient="from-purple-500 to-pink-500"
          onClick={() => navigate('/upload')}
          stats="5 sec processing"
        />
        
        <ActionCard
          title="View Analytics"
          description="Track progress with beautiful insights"
          icon={<BarChart2 className="w-8 h-8" />}
          gradient="from-orange-500 to-red-500"
          onClick={() => navigate('/analytics')}
          stats="Real-time updates"
        />
      </motion.div>

      {/* Recent Activity & Features */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <RecentMaterialCard material={material} navigate={navigate} />
        </motion.div>

        <motion.div variants={itemVariants}>
          <FeatureHighlights />
        </motion.div>
      </div>

      {/* Agora Collaboration Banner */}
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 cursor-pointer"
        onClick={() => navigate('/video')}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-white">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Video className="w-6 h-6" />
              Study Together in Real-Time
            </h3>
            <p className="text-white/90 text-lg">
              Join collaborative study rooms powered by Agora RTC
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="px-6 py-3 bg-white text-purple-600 rounded-xl font-bold"
          >
            Join Room →
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      </motion.div>
    </motion.div>
  );
}

function StatBubble({ icon, value, label, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.1, rotate: 5 }}
      className={`relative p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-2xl`}
    >
      <div className="text-center space-y-1">
        <div className="flex justify-center">{icon}</div>
        <div className="text-2xl font-black">{value}</div>
        <div className="text-xs font-medium opacity-90">{label}</div>
      </div>
    </motion.div>
  );
}

function ActionCard({ title, description, icon, gradient, onClick, stats }) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative overflow-hidden bg-white rounded-3xl p-8 cursor-pointer border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <div className="relative z-10 space-y-4">
        <motion.div
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-xl`}
        >
          {icon}
        </motion.div>
        
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500 font-medium">{stats}</span>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
        </div>
      </div>
    </motion.div>
  );
}

function RecentMaterialCard({ material, navigate }) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-600" />
          Recent Study Material
        </h3>
      </div>

      {material ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">{material}</h4>
              <p className="text-sm text-gray-600 mb-3">Last accessed today</p>
              <div className="flex gap-2">
                <button onClick={() => navigate('/study')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                  Continue
                </button>
                <button onClick={() => navigate('/quiz')} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:border-blue-400 transition">
                  Generate Quiz
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
          >
            <UploadCloud className="w-10 h-10 text-gray-400" />
          </motion.div>
          <p className="text-gray-500 mb-4">No recent uploads</p>
          <button onClick={() => navigate('/upload')} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
            Upload Your First PDF
          </button>
        </div>
      )}
    </div>
  );
}

function FeatureHighlights() {
  const features = [
    { icon: <Zap />, label: "AI Quiz Generation", color: "text-yellow-600" },
    { icon: <Trophy />, label: "Progress Tracking", color: "text-purple-600" },
    { icon: <TrendingUp />, label: "Smart Analytics", color: "text-green-600" },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl p-8 shadow-lg border border-gray-100 h-full">
      <h3 className="text-xl font-bold text-gray-900 mb-6">✨ Features</h3>
      <div className="space-y-4">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ x: 8 }}
            className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center ${feature.color}`}>
              {feature.icon}
            </div>
            <span className="font-semibold text-gray-800">{feature.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}