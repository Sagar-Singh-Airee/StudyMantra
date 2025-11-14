// src/pages/StudySession.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowRight, Users, Zap, Target, Trophy, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Timer from '../components/Timer';
import toast from 'react-hot-toast';
import { useStudySession } from '../context/StudySessionContext';

export default function StudySession() {
  const navigate = useNavigate();
  const { studyData, addStudyTime } = useStudySession();
  const [material, setMaterial] = useState('');
  const [sessionStartTime] = useState(Date.now());
  const [showHighlight, setShowHighlight] = useState(false);

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
    const mins = Math.floor((Date.now() - sessionStartTime) / 60000);
    addStudyTime(mins);
    navigate('/quiz');
  };

  const handleTextSelection = () => {
    const selection = window.getSelection().toString();
    if (selection.length > 10) {
      setShowHighlight(true);
      setTimeout(() => setShowHighlight(false), 3000);
    }
  };

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
      className="grid lg:grid-cols-3 gap-6"
    >
      {/* Main Study Area */}
      <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
        {/* Material Header */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Study Material</h2>
                  <p className="text-sm text-gray-600">{studyData.pdfFileName || 'No file name'}</p>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={startQuizNow}
              className="px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-lg flex items-center gap-2"
            >
              Start Quiz Now
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Material Content */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden"
        >
          {/* Highlight Tooltip */}
          <AnimatePresence>
            {showHighlight && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-4 py-2 rounded-xl shadow-lg text-sm font-semibold z-10"
              >
                ✨ Highlighted for review!
              </motion.div>
            )}
          </AnimatePresence>

          <div
            onMouseUp={handleTextSelection}
            className="prose prose-lg max-w-none max-h-[650px] overflow-y-auto text-gray-800 leading-relaxed custom-scrollbar"
          >
            {material ? (
              material.split('\n\n').map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="mb-6 text-gray-700 hover:bg-blue-50 p-3 rounded-lg transition-colors cursor-text"
                >
                  {para}
                </motion.p>
              ))
            ) : (
              <p className="text-gray-400 text-center py-12">No material loaded.</p>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Sidebar */}
      <motion.div variants={itemVariants} className="space-y-6">
        {/* Timer */}
        <Timer onComplete={handleTimerComplete} />

        {/* Stats Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Your Stats
          </h3>

          <div className="space-y-3">
            <StatItem
              icon={<Target />}
              label="Quizzes Completed"
              value={studyData.completedQuizzes}
              color="from-blue-500 to-cyan-500"
            />
            <StatItem
              icon={<Zap />}
              label="Average Score"
              value={`${studyData.averageScore}%`}
              color="from-green-500 to-emerald-500"
            />
            <StatItem
              icon={<Clock />}
              label="Total Study Time"
              value={`${studyData.totalStudyTime} min`}
              color="from-purple-500 to-pink-500"
            />
          </div>
        </div>

        {/* Study Room CTA */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 cursor-pointer shadow-xl"
          onClick={() => navigate('/video')}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Study Together</h3>
            </div>
            
            <p className="text-white/90 text-sm mb-4">
              Join an Agora-powered real-time study room and collaborate with peers
            </p>

            <motion.button
              whileHover={{ x: 4 }}
              className="w-full py-3 bg-white text-purple-600 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              Join Study Room
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Study Tips */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6 border border-blue-100">
          <h3 className="text-lg font-bold mb-3 text-gray-900 flex items-center gap-2">
            💡 Study Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {[
              'Take regular breaks every 25 minutes',
              'Highlight important concepts',
              'Test yourself with quizzes',
              'Study in focused sessions'
            ].map((tip, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-2"
              >
                <span className="text-blue-600 font-bold">•</span>
                <span>{tip}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatItem({ icon, label, value, color }) {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center justify-between p-4 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-100 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
        <span className="text-gray-700 font-medium">{label}</span>
      </div>
      <span className="font-black text-gray-900 text-lg">{value}</span>
    </motion.div>
  );
}