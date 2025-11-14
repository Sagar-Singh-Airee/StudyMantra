// src/pages/AssistantPage.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Sparkles, BookOpen, Brain, Lightbulb, 
  HelpCircle, CreditCard, Target, MessageSquare, Zap,
  TrendingUp, Clock, Star, CheckCircle, Copy
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import EnhancedAgoraAssistant from "../components/EnhancedAgoraAssistant";

export default function AssistantPage() {
  const navigate = useNavigate();
  const [showAssistant, setShowAssistant] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [recentQueries] = useState([
    { query: "Explain quantum entanglement", time: "2 mins ago", category: "Physics" },
    { query: "Summarize Chapter 5", time: "15 mins ago", category: "Biology" },
    { query: "Create flashcards for photosynthesis", time: "1 hour ago", category: "Biology" }
  ]);

  const quickPrompts = [
    {
      icon: <Target className="w-5 h-5" />,
      title: "Summarize",
      prompt: "Summarize the selected paragraph in simple terms",
      color: "from-blue-500 to-cyan-500",
      description: "Get concise summaries"
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Explain Like I'm 5",
      prompt: "Explain this concept in the simplest way possible",
      color: "from-purple-500 to-pink-500",
      description: "Simple explanations"
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      title: "Quiz Questions",
      prompt: "Create 5 quiz questions based on this content",
      color: "from-green-500 to-emerald-500",
      description: "Test your knowledge"
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: "Flashcards",
      prompt: "Create flashcards for the key concepts in this text",
      color: "from-yellow-500 to-orange-500",
      description: "Study cards"
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Examples",
      prompt: "Give me 3 real-world examples of this concept",
      color: "from-red-500 to-pink-500",
      description: "Practical examples"
    },
    {
      icon: <BookOpen className="w-5 h-5" />,
      title: "Deep Dive",
      prompt: "Provide a detailed explanation with all important details",
      color: "from-indigo-500 to-purple-500",
      description: "Comprehensive info"
    }
  ];

  const features = [
    { icon: <Sparkles />, title: "AI-Powered", desc: "GPT-4 intelligence" },
    { icon: <Zap />, title: "Instant Answers", desc: "Real-time responses" },
    { icon: <Brain />, title: "Smart Context", desc: "Understands your material" },
    { icon: <Target />, title: "8 Modes", desc: "Multiple learning styles" }
  ];

  const handleQuickPrompt = (prompt) => {
    setSelectedPrompt(prompt);
    setShowAssistant(true);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, x: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="p-3 rounded-2xl hover:bg-gray-100 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </motion.button>
              
              <div>
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg"
                  >
                    <Sparkles className="w-6 h-6" />
                  </motion.div>
                  <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      AI Study Companion
                    </h1>
                    <p className="text-sm text-gray-600">
                      Your personal AI tutor • Powered by GPT-4
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAssistant(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              Open Assistant
            </motion.button>
          </div>
        </motion.div>

        {/* Hero Section */}
        <motion.div variants={itemVariants} className="grid lg:grid-cols-3 gap-6">
          {/* Main Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-4"
              >
                <Star className="w-4 h-4 text-yellow-300" />
                <span className="text-sm font-semibold">AI-Powered Learning</span>
              </motion.div>

              <h2 className="text-4xl font-black mb-3">
                Learn Smarter, Not Harder
              </h2>
              <p className="text-white/90 text-lg mb-6 max-w-xl">
                Get instant explanations, summaries, examples, and more. Your AI companion understands your study material and helps you master any topic.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      {feature.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{feature.title}</div>
                      <div className="text-xs text-white/80">{feature.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-4">
            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">1,247</div>
                  <div className="text-sm text-gray-600">Questions Answered</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">94%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-black text-gray-900">&lt;2s</div>
                  <div className="text-sm text-gray-600">Average Response</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Prompts */}
        <motion.div variants={itemVariants}>
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
            <p className="text-gray-600">Choose a prompt to get started instantly</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickPrompts.map((item, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuickPrompt(item.prompt)}
                className="group relative bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-left hover:shadow-2xl transition-all overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Queries & How to Use */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Queries */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Queries</h3>
                <span className="text-sm text-gray-500">{recentQueries.length} total</span>
              </div>

              <div className="space-y-3">
                {recentQueries.map((query, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-100 cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{query.query}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">{query.time}</span>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {query.category}
                        </span>
                      </div>
                    </div>
                    <Copy className="w-4 h-4 text-gray-400" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* How to Use */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 h-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">How to Use</h3>
              
              <div className="space-y-4">
                <StepItem
                  number="1"
                  title="Select Text"
                  description="Highlight any text in your study material"
                />
                <StepItem
                  number="2"
                  title="Ask Agora"
                  description="Click the floating button that appears"
                />
                <StepItem
                  number="3"
                  title="Get Instant Help"
                  description="Choose from 8 AI-powered learning modes"
                />
              </div>

              <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">Pro Tip</p>
                    <p className="text-xs text-gray-600">
                      Use keyboard shortcut <kbd className="px-2 py-1 bg-white rounded border text-xs font-mono">Ctrl+K</kbd> to open the assistant anywhere!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Capabilities Grid */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Can the AI Do?</h2>
          
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: <BookOpen />, title: "Explain", desc: "Clear explanations" },
              { icon: <Target />, title: "Summarize", desc: "Quick summaries" },
              { icon: <Lightbulb />, title: "Examples", desc: "Real-world cases" },
              { icon: <HelpCircle />, title: "Define", desc: "Term definitions" },
              { icon: <Brain />, title: "Simplify", desc: "Easy language" },
              { icon: <MessageSquare />, title: "Questions", desc: "Generate Q&A" },
              { icon: <CreditCard />, title: "Flashcards", desc: "Study cards" },
              { icon: <Sparkles />, title: "Memory Tips", desc: "Mnemonics" }
            ].map((capability, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -4 }}
                className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-blue-600 mx-auto mb-3">
                  {capability.icon}
                </div>
                <h4 className="font-bold text-gray-900 text-sm mb-1">{capability.title}</h4>
                <p className="text-xs text-gray-600">{capability.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Assistant Widget */}
      <AnimatePresence>
        {showAssistant && (
          <EnhancedAgoraAssistant
            initialText={selectedPrompt}
            onClose={() => {
              setShowAssistant(false);
              setSelectedPrompt("");
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAssistant(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white z-40 hover:shadow-3xl transition-shadow"
      >
        <MessageSquare className="w-7 h-7" />
      </motion.button>
    </div>
  );
}

function StepItem({ number, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
        <p className="text-xs text-gray-600 mt-0.5">{description}</p>
      </div>
    </div>
  );
}