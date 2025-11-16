// src/pages/Home.jsx - FIXED
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, UploadCloud, BarChart2, Sparkles, Trophy, Clock, ArrowRight, Zap, Target, TrendingUp, Video, Play, Brain, FileText, Rocket, Lightbulb, Globe, MessageSquare, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ streak: 0, points: 0, rank: 0 });
  const [material, setMaterial] = useState(null);

  useEffect(() => {
    const savedStats = JSON.parse(localStorage.getItem('userStats') || '{"streak": 7, "points": 2450, "rank": 12}');
    setStats(savedStats);
    
    const fileName = localStorage.getItem('pdfFileName');
    if (fileName) setMaterial(fileName);
  }, []);

  // small reusable variant used by several motion blocks
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.48, 0.15, 0.25, 0.96] } }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Template Design */}
      <section className="organic-bg min-h-[85vh] flex items-center relative overflow-hidden">
        {/* Floating decorative elements using Lucide Icons */}
        <motion.div
          className="floating-element absolute top-20 left-10 text-white/30"
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          <Globe className="w-16 h-16" />
        </motion.div>

        <motion.div
          className="floating-element absolute bottom-32 right-20 text-white/30"
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          <Rocket className="w-20 h-20" />
        </motion.div>

        <motion.div
          className="floating-element absolute top-1/3 left-1/4 text-white/30"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Lightbulb className="w-12 h-12" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl lg:text-7xl font-black text-white leading-tight mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Unleash the potential of{' '}
              <span className="text-[#0FD958]">AI</span> and{' '}
              <span className="text-[#FFD166]">machine learning</span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-300 mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              StudyMantra uses advanced AI algorithms to transform your study materials into interactive learning experiences. Upload PDFs, generate smart quizzes, and collaborate in real-time.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={() => navigate('/upload')}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 text-lg hover:scale-105"
              >
                <UploadCloud className="w-6 h-6" />
                Get Started
              </button>

              <button
                onClick={() => navigate('/video')}
                className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-3 text-lg backdrop-blur-sm"
              >
                <Play className="w-5 h-5" />
                Watch Intro Video
              </button>
            </motion.div>

            {/* Stats badges */}
            <motion.div
              className="flex items-center gap-6 mt-12 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <div className="glass-card px-6 py-3 rounded-full">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-bold">Rank #{stats.rank}</span>
                </div>
              </div>

              <div className="glass-card px-6 py-3 rounded-full">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#0FD958]" />
                  <span className="text-white font-bold">{stats.streak} Day Streak</span>
                </div>
              </div>

              <div className="glass-card px-6 py-3 rounded-full">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#FFD166]" />
                  <span className="text-white font-bold">{stats.points} Points</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - AI Mascot */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 flex items-center justify-center"
            >
              <div className="relative">
                <div className="w-80 h-80 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-sm border-4 border-white/30 shadow-2xl">
                  <Brain className="w-48 h-48 text-white" strokeWidth={1.5} />
                </div>

                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 backdrop-blur-sm shadow-lg flex items-center justify-center"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute bottom-12 left-12 w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 backdrop-blur-sm shadow-lg flex items-center justify-center"
                >
                  <BookOpen className="w-6 h-6 text-white" />
                </motion.div>
              </div>
            </motion.div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500 rounded-full opacity-20 blur-3xl animate-pulse" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-green-500 rounded-full opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="wave-divider absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path
              fill="#F8F9FA"
              d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[#F8F9FA] py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Powerful AI-Powered Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for effective studying in one intelligent platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI Quiz Generation"
              description="Automatically generate smart quizzes from any PDF or study material using advanced AI"
              gradient="from-blue-500 to-cyan-500"
              onClick={() => navigate('/upload')}
            />
            <FeatureCard
              icon={<Video className="w-8 h-8" />}
              title="Real-Time Collaboration"
              description="Study together with friends using Agora-powered video rooms and shared notes"
              gradient="from-purple-500 to-pink-500"
              onClick={() => navigate('/video')}
            />
            <FeatureCard
              icon={<BarChart2 className="w-8 h-8" />}
              title="Smart Analytics"
              description="Track your progress with beautiful charts and insights to improve your learning"
              gradient="from-orange-500 to-red-500"
              onClick={() => navigate('/analytics')}
            />
            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="PDF Processing"
              description="Upload any PDF and extract text instantly for quiz generation and study sessions"
              gradient="from-green-500 to-emerald-500"
              onClick={() => navigate('/upload')}
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="AI Study Assistant"
              description="Get instant explanations and answers about your material with AI-powered Agora"
              gradient="from-indigo-500 to-purple-500"
              onClick={() => navigate('/assistant')}
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Focus Timer"
              description="Stay productive with Pomodoro timer and automatic session tracking"
              gradient="from-pink-500 to-rose-500"
              onClick={() => navigate('/study')}
            />
          </div>

          {material && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-enhanced p-8 mb-20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Clock className="w-7 h-7 text-blue-600" />
                  Continue Your Studies
                </h3>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg mb-2">{material}</h4>
                    <p className="text-sm text-gray-600 mb-4">Last accessed today • 15 min left</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate('/study')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition shadow-md"
                      >
                        Continue Reading
                      </button>
                      <button
                        onClick={() => navigate('/quiz')}
                        className="px-6 py-3 bg-white border-2 border-blue-200 text-gray-700 rounded-xl font-semibold hover:border-blue-400 transition"
                      >
                        Take Quiz
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-12 text-center text-white"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-4xl font-black mb-4">Ready to Transform Your Learning?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">Join thousands of students using AI-powered tools to study smarter, not harder</p>
              <button onClick={() => navigate('/upload')} className="inline-flex items-center gap-3 bg-white text-purple-600 px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105">
                Start Learning Now
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-dark py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black text-white mb-4">Trusted by Students Worldwide</h2>
            <p className="text-xl text-gray-300 mb-12">Making learning more effective and enjoyable</p>
            <div className="grid md:grid-cols-4 gap-8">
              <StatCard icon={<Users />} value="10K+" label="Active Students" />
              <StatCard icon={<FileText />} value="50K+" label="PDFs Processed" />
              <StatCard icon={<Brain />} value="1M+" label="Quizzes Generated" />
              <StatCard icon={<Trophy />} value="95%" label="Success Rate" />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description, gradient, onClick }) {
  return (
    <motion.div whileHover={{ y: -12, scale: 1.02 }} onClick={onClick} className="card-enhanced p-8 cursor-pointer group">
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{title}</h3>
      <p className="text-gray-600 leading-relaxed mb-4">{description}</p>
      <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
        Learn more <ArrowRight className="w-4 h-4 ml-2" />
      </div>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ icon, value, label }) {
  // safe guard: icon might be an element or a component
  const iconElement = React.isValidElement(icon) ? React.cloneElement(icon, { className: "w-12 h-12" }) : icon;
  return (
    <motion.div whileHover={{ scale: 1.05, y: -4 }} className="glass-card-dark p-8 rounded-2xl text-center">
      <div className="flex justify-center mb-4 text-[#0FD958]">{iconElement}</div>
      <div className="text-4xl font-black text-white mb-2">{value}</div>
      <div className="text-sm text-gray-300 font-medium">{label}</div>
    </motion.div>
  );
}
