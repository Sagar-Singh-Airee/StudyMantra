// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, UploadCloud, BarChart2, Sparkles, Trophy, Clock, ArrowRight, Zap, Target, TrendingUp, Video, Play, Brain, FileText, Rocket, Lightbulb, Globe, MessageSquare, Users, CheckCircle } from 'lucide-react';
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

  return (
    <div className="min-h-screen">
      {/* Hero Section - Template Design */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#0FD958]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#FFD166]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

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
              className="text-xl text-white/80 mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Machine learning algorithms build a model based on sample data, known as training data, in order to make predictions or decisions...
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                onClick={() => navigate('/upload')}
                className="px-8 py-4 bg-gradient-to-r from-[#0FD958] to-[#06D6A0] text-white rounded-2xl font-bold shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3 text-lg hover:scale-105"
              >
                Get Started
                <Play className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigate('/video')}
                className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-3 text-lg backdrop-blur-sm"
              >
                Watch Intro Video
              </button>
            </motion.div>
          </motion.div>

          {/* Right Content - Robot Mascot */}
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
              {/* Robot Mascot Container */}
              <div className="relative w-full max-w-lg">
                {/* Main Robot Circle */}
                <div className="relative w-80 h-80 mx-auto">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0FD958]/30 to-[#06D6A0]/20 rounded-full blur-3xl" />
                  
                  {/* Robot Face */}
                  <div className="relative w-full h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-full border-4 border-white/20 flex items-center justify-center shadow-2xl">
                    {/* Using Emoji Robot (replace with image if you have robot-mascot.png) */}
                    <div className="text-9xl">🤖</div>
                    
                    {/* Alternative: Use image if you have it */}
                    {/* <img src={robotMascot} alt="AI Robot" className="w-64 h-64 object-contain" /> */}
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-4 right-4 w-16 h-16 rounded-full bg-gradient-to-br from-[#FFD166] to-[#FF8C42] backdrop-blur-sm shadow-lg flex items-center justify-center"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>

                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-8 left-8 w-12 h-12 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] backdrop-blur-sm shadow-lg flex items-center justify-center"
                  >
                    <Brain className="w-6 h-6 text-white" />
                  </motion.div>

                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute top-20 left-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#0FD958] to-[#06D6A0] backdrop-blur-sm shadow-lg flex items-center justify-center"
                  >
                    <Lightbulb className="w-5 h-5 text-white" />
                  </motion.div>
                </div>

                {/* Additional Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#0FD958] rounded-full opacity-20 blur-3xl -z-10" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/5 backdrop-blur-sm py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Powerful AI-Powered Features
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need for effective studying in one intelligent platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <FeatureCard
              icon={<Brain className="w-8 h-8" />}
              title="AI Quiz Generation"
              description="Automatically generate smart quizzes from any PDF or study material using advanced AI"
              gradient="from-[#667eea] to-[#764ba2]"
              onClick={() => navigate('/upload')}
            />
            <FeatureCard
              icon={<Video className="w-8 h-8" />}
              title="Real-Time Collaboration"
              description="Study together with friends using Agora-powered video rooms and shared notes"
              gradient="from-[#f093fb] to-[#f5576c]"
              onClick={() => navigate('/video')}
            />
            <FeatureCard
              icon={<BarChart2 className="w-8 h-8" />}
              title="Smart Analytics"
              description="Track your progress with beautiful charts and insights to improve your learning"
              gradient="from-[#4facfe] to-[#00f2fe]"
              onClick={() => navigate('/analytics')}
            />
            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="PDF Processing"
              description="Upload any PDF and extract text instantly for quiz generation and study sessions"
              gradient="from-[#43e97b] to-[#38f9d7]"
              onClick={() => navigate('/upload')}
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              title="AI Study Assistant"
              description="Get instant explanations and answers about your material with AI-powered Agora"
              gradient="from-[#fa709a] to-[#fee140]"
              onClick={() => navigate('/assistant')}
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Focus Timer"
              description="Stay productive with Pomodoro timer and automatic session tracking"
              gradient="from-[#30cfd0] to-[#330867]"
              onClick={() => navigate('/study')}
            />
          </div>

          {/* Continue Studies Card */}
          {material && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass p-8 mb-20 hover-lift"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Clock className="w-7 h-7 text-[#0FD958]" />
                  Continue Your Studies
                </h3>
              </div>

              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#0FD958] to-[#06D6A0] flex items-center justify-center text-white shadow-lg">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-lg mb-2">{material}</h4>
                    <p className="text-sm text-white/60 mb-4">Last accessed today • 15 min left</p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate('/study')}
                        className="px-6 py-3 bg-gradient-to-r from-[#0FD958] to-[#06D6A0] text-white rounded-xl font-semibold hover:shadow-lg transition shadow-md"
                      >
                        Continue Reading
                      </button>
                      <button
                        onClick={() => navigate('/quiz')}
                        className="px-6 py-3 bg-white/10 border-2 border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition"
                      >
                        Take Quiz
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] p-12 text-center"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white mb-4">Ready to Transform Your Learning?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands of students using AI-powered tools to study smarter, not harder
              </p>
              <button 
                onClick={() => navigate('/upload')} 
                className="inline-flex items-center gap-3 bg-white text-[#764ba2] px-10 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all hover:scale-105"
              >
                Start Learning Now
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-black text-white mb-4">Trusted by Students Worldwide</h2>
            <p className="text-xl text-white/70 mb-12">Making learning more effective and enjoyable</p>
            
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
    <motion.div 
      whileHover={{ y: -12, scale: 1.02 }} 
      onClick={onClick} 
      className="glass p-8 cursor-pointer group hover-lift"
    >
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#0FD958] transition-colors">
        {title}
      </h3>
      <p className="text-white/70 leading-relaxed mb-4">{description}</p>
      <div className="flex items-center text-[#0FD958] font-semibold group-hover:translate-x-2 transition-transform">
        Learn more <ArrowRight className="w-4 h-4 ml-2" />
      </div>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ icon, value, label }) {
  const iconElement = React.isValidElement(icon) 
    ? React.cloneElement(icon, { className: "w-12 h-12" }) 
    : icon;
    
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -4 }} 
      className="glass p-8 rounded-2xl text-center"
    >
      <div className="flex justify-center mb-4 text-[#0FD958]">{iconElement}</div>
      <div className="text-4xl font-black text-white mb-2">{value}</div>
      <div className="text-sm text-white/70 font-medium">{label}</div>
    </motion.div>
  );
}