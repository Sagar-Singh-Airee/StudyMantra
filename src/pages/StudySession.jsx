import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ArrowRight,
  Users,
  Zap,
  Target,
  Trophy,
  Clock,
  Download,
  MessageSquare,
  Sparkles,
  Bookmark,
  Volume2,
  Brain,
  X,
  Send,
  Highlighter
} from 'lucide-react';

export default function StudySession() {
  const [material] = useState(`Understanding Quantum Computing

Quantum computing represents a revolutionary approach to information processing that leverages the principles of quantum mechanics. Unlike classical computers that use bits (0 or 1), quantum computers use quantum bits or qubits that can exist in multiple states simultaneously through a phenomenon called superposition.

The Power of Superposition

Superposition allows qubits to perform multiple calculations at once. When you measure a qubit, it collapses into either 0 or 1, but before measurement, it exists in a probability cloud of both states. This is fundamentally different from classical bits which must be definitively 0 or 1 at any given moment.

Quantum Entanglement

Another key principle is entanglement, where qubits become correlated in such a way that the state of one instantly influences the state of another, regardless of distance. Einstein famously called this "spooky action at a distance." This property enables quantum computers to solve certain problems exponentially faster than classical computers.

Current Applications

Today's quantum computers are being explored for optimization problems, drug discovery, cryptography, and machine learning. Companies like IBM, Google, and startups are racing to achieve "quantum supremacy" - the point where quantum computers can solve problems no classical computer can solve in a reasonable timeframe.

Challenges Ahead

Despite their promise, quantum computers face significant challenges. Qubits are extremely fragile and require near absolute-zero temperatures to function. Environmental noise can cause "decoherence," destroying the quantum state. Error correction in quantum systems is also far more complex than in classical computing.`);

  const [sessionStartTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [fontSize, setFontSize] = useState('base');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bookmarkedParagraphs, setBookmarkedParagraphs] = useState(new Set());
  
  // Selection & Assistant state
  const [selectedText, setSelectedText] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);
  const [selectionButton, setSelectionButton] = useState({ visible: false, x: 0, y: 0 });
  const [assistantMessages, setAssistantMessages] = useState([]);
  const [assistantInput, setAssistantInput] = useState('');
  const selectionRef = useRef(null);

  // Study stats
  const [stats] = useState({
    completedQuizzes: 12,
    averageScore: 87,
    totalStudyTime: 340,
    currentStreak: 7
  });

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate elapsed time
  const elapsedMs = currentTime - sessionStartTime;
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000);
  const displayTime = elapsedMinutes > 59 
    ? `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`
    : `${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, '0')}`;

  const fontSizes = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed',
    xl: 'text-xl leading-relaxed'
  };

  // Text-to-speech
  const speakText = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [isSpeaking]);

  // Text selection handler
  const handleTextSelection = useCallback(() => {
    try {
      const sel = window.getSelection();
      const text = sel?.toString().trim() || '';
      
      if (text.length > 10) {
        setSelectedText(text);
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setSelectionButton({
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
      } else {
        setSelectionButton(s => ({ ...s, visible: false }));
      }
    } catch (err) {
      setSelectionButton(s => ({ ...s, visible: false }));
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleTextSelection);
    return () => {
      document.removeEventListener('mouseup', handleTextSelection);
      window.speechSynthesis?.cancel();
    };
  }, [handleTextSelection]);

  const toggleBookmark = (index) => {
    setBookmarkedParagraphs(prev => {
      const newSet = new Set(prev);
      newSet.has(index) ? newSet.delete(index) : newSet.add(index);
      return newSet;
    });
  };

  const openAssistant = () => {
    setShowAssistant(true);
    setSelectionButton(s => ({ ...s, visible: false }));
    if (selectedText && !assistantMessages.some(m => m.text === selectedText)) {
      setAssistantMessages(prev => [...prev, { 
        role: 'user', 
        text: `Explain this: "${selectedText}"` 
      }]);
    }
  };

  const sendAssistantMessage = () => {
    if (!assistantInput.trim()) return;
    
    setAssistantMessages(prev => [...prev, { role: 'user', text: assistantInput }]);
    
    // Simulate AI response
    setTimeout(() => {
      setAssistantMessages(prev => [...prev, { 
        role: 'assistant', 
        text: `I'd be happy to help explain that! ${assistantInput.includes('quantum') ? 'Quantum computing uses the principles of quantum mechanics to process information in fundamentally different ways than classical computers.' : 'Let me break that down for you in simpler terms.'}`
      }]);
    }, 1000);
    
    setAssistantInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAIN CONTENT - 2/3 width */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      Quantum Computing Basics
                    </h1>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Select text to ask questions
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
                >
                  <Brain className="w-4 h-4" />
                  Start Quiz
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Reading Controls */}
            <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-gray-200 shadow-sm">
                    <span className="text-xs text-gray-600 font-medium">Size:</span>
                    {['sm', 'base', 'lg', 'xl'].map(size => (
                      <button
                        key={size}
                        onClick={() => setFontSize(size)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          fontSize === size 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {size === 'base' ? 'M' : size[0].toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => speakText(material)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${
                      isSpeaking 
                        ? 'bg-red-50 border-red-300 text-red-600' 
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    {isSpeaking ? 'Stop' : 'Read'}
                  </button>
                </div>

                <button
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Reading Content */}
            <div className="p-6">
              <div
                ref={selectionRef}
                className={`${fontSizes[fontSize]} text-gray-700 space-y-4 max-h-[600px] overflow-y-auto pr-2`}
                style={{ scrollbarWidth: 'thin' }}
              >
                {material.split('\n\n').map((para, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`relative group p-4 rounded-xl transition-all ${
                      bookmarkedParagraphs.has(i)
                        ? 'bg-amber-50 border border-amber-200'
                        : 'hover:bg-blue-50/40'
                    }`}
                  >
                    <p>{para}</p>
                    
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button
                        onClick={() => toggleBookmark(i)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          bookmarkedParagraphs.has(i)
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-white text-gray-400 hover:bg-amber-50 hover:text-amber-600'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${bookmarkedParagraphs.has(i) ? 'fill-current' : ''}`} />
                      </button>
                      
                      <button
                        onClick={() => speakText(para)}
                        className="p-1.5 rounded-lg bg-white text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* SIDEBAR - 1/3 width */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Simple Clock Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Study Time</div>
                  <div className="text-2xl font-bold text-gray-900 tabular-nums">
                    {displayTime}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Progress</h3>
              <div className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                Streak: <span className="font-semibold text-gray-700">{stats.currentStreak}d</span>
              </div>
            </div>

            <div className="space-y-3">
              <StatItem 
                icon={<Target className="w-4 h-4" />} 
                label="Quizzes" 
                value={stats.completedQuizzes} 
                color="from-blue-500 to-cyan-500"
              />
              <StatItem 
                icon={<Zap className="w-4 h-4" />} 
                label="Avg Score" 
                value={`${stats.averageScore}%`} 
                color="from-green-500 to-emerald-500"
              />
              <StatItem 
                icon={<Trophy className="w-4 h-4" />} 
                label="Total Time" 
                value={`${stats.totalStudyTime}m`} 
                color="from-purple-500 to-pink-500"
              />
            </div>
          </motion.div>

          {/* AI Assistant Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs opacity-90">AI Assistant</div>
                  <div className="text-lg font-bold">Agora</div>
                </div>
              </div>

              <p className="text-white/80 text-sm mb-4">
                Get instant explanations and answers about your study material.
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowAssistant(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 border border-white/20 text-sm font-medium transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open Assistant
                </button>

                <button
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-600 font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow"
                >
                  <Users className="w-4 h-4" />
                  Study Room
                </button>
              </div>
            </div>
          </motion.div>

          {/* Study Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100"
          >
            <h4 className="text-base font-bold text-gray-900 mb-3">Study Tips</h4>
            <div className="space-y-2.5">
              <TipItem 
                icon={<Clock className="w-4 h-4" />}
                title="Pomodoro Method"
                description="25 min focus, 5 min break"
              />
              <TipItem 
                icon={<Highlighter className="w-4 h-4" />}
                title="Active Recall"
                description="Test yourself frequently"
              />
              <TipItem 
                icon={<Brain className="w-4 h-4" />}
                title="Spaced Repetition"
                description="Review at intervals"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Selection Button */}
      <AnimatePresence>
        {selectionButton.visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: 'fixed',
              left: selectionButton.x,
              top: selectionButton.y,
              transform: 'translate(-50%, -100%)',
              zIndex: 100
            }}
          >
            <button
              onClick={openAssistant}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium border border-white/20"
            >
              <MessageSquare className="w-4 h-4" />
              Ask Agora
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant Dialog */}
      <AnimatePresence>
        {showAssistant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAssistant(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[600px] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Agora Assistant</h3>
                    <p className="text-sm text-gray-500">Ask anything about your study material</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAssistant(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {assistantMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-gray-500 text-sm">
                      {selectedText 
                        ? "I'll explain the selected text. You can also ask me anything!"
                        : "Select text or ask me anything about quantum computing!"}
                    </p>
                  </div>
                ) : (
                  assistantMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={assistantInput}
                    onChange={(e) => setAssistantInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendAssistantMessage()}
                    placeholder="Ask a question..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                  />
                  <button
                    onClick={sendAssistantMessage}
                    disabled={!assistantInput.trim()}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/15 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

function StatItem({ icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
      <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-sm`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-600">{label}</div>
        <div className="text-base font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function TipItem({ icon, title, description }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gradient-to-br from-gray-50/50 to-blue-50/30 border border-gray-100 hover:border-blue-200 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <div className="text-xs text-gray-600 mt-0.5">{description}</div>
      </div>
    </div>
  );
}