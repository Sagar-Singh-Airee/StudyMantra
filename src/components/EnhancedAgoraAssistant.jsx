// src/components/EnhancedAgoraAssistant.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  X, Send, Sparkles, BookOpen, Lightbulb, Brain, 
  HelpCircle, CreditCard, Target, Volume2, Copy, Check,
  Maximize2, Minimize2, Download, Trash2, Zap,
  ChevronDown, ChevronUp, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function EnhancedAgoraAssistant({ 
  initialText = "", 
  onClose = () => {},
  position = "bottom-right" 
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  const modes = [
    { 
      id: "explain", 
      label: "Explain", 
      icon: <BookOpen className="w-4 h-4" />, 
      color: "from-blue-500 to-cyan-500",
      description: "Get detailed explanation"
    },
    { 
      id: "summarize", 
      label: "Summarize", 
      icon: <Target className="w-4 h-4" />, 
      color: "from-purple-500 to-pink-500",
      description: "Create concise summary"
    },
    { 
      id: "examples", 
      label: "Examples", 
      icon: <Lightbulb className="w-4 h-4" />, 
      color: "from-yellow-500 to-orange-500",
      description: "See practical examples"
    },
    { 
      id: "definition", 
      label: "Define", 
      icon: <HelpCircle className="w-4 h-4" />, 
      color: "from-green-500 to-emerald-500",
      description: "Get precise definition"
    },
    { 
      id: "simplify", 
      label: "Simplify", 
      icon: <Brain className="w-4 h-4" />, 
      color: "from-indigo-500 to-purple-500",
      description: "Simplify complex concepts"
    },
    { 
      id: "questions", 
      label: "Questions", 
      icon: <HelpCircle className="w-4 h-4" />, 
      color: "from-red-500 to-pink-500",
      description: "Generate study questions"
    },
    { 
      id: "flashcard", 
      label: "Flashcard", 
      icon: <CreditCard className="w-4 h-4" />, 
      color: "from-teal-500 to-cyan-500",
      description: "Create study flashcards"
    },
    { 
      id: "memory", 
      label: "Memory Tip", 
      icon: <Brain className="w-4 h-4" />, 
      color: "from-violet-500 to-purple-500",
      description: "Memory techniques"
    }
  ];

  // Initialize messages
  useEffect(() => {
    if (initialText) {
      setMessages([{
        id: Date.now(),
        role: "assistant",
        text: `I can help you with this text! Choose an action above or ask me anything.`,
        selectedText: initialText,
        timestamp: new Date()
      }]);
    } else {
      setMessages([{
        id: Date.now(),
        role: "assistant",
        text: "Hi! I'm your AI Study Companion. Select text from your material or ask me anything!",
        timestamp: new Date()
      }]);
    }
  }, [initialText]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: messages.length > 1 ? "smooth" : "auto",
      block: "end"
    });
  }, [messages, loading]);

  // Auto-focus input
  useEffect(() => {
    if (!isMinimized) {
      inputRef.current?.focus();
    }
  }, [isMinimized]);

  const simulateTyping = useCallback(async (text, callback) => {
    setTyping(true);
    const words = text.split(' ');
    let displayedText = '';
    
    for (let i = 0; i < words.length; i++) {
      displayedText += (i === 0 ? '' : ' ') + words[i];
      callback(displayedText + (i < words.length - 1 ? '...' : ''));
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    setTyping(false);
  }, []);

  const handleQuickAction = async (mode) => {
    if (!initialText && mode !== "explain") {
      setError("Please select some text first to use this feature");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setSelectedMode(mode);
    setLoading(true);
    setError(null);

    const modeLabels = {
      explain: "Explain this",
      summarize: "Summarize this",
      examples: "Give examples",
      definition: "Define this",
      simplify: "Simplify this",
      questions: "Generate questions",
      flashcard: "Create flashcard",
      memory: "Memory technique"
    };

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: modeLabels[mode],
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "",
          selectedText: initialText,
          mode: mode
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      const assistantMessageId = Date.now() + 1;
      const assistantMessage = {
        id: assistantMessageId,
        role: "assistant",
        text: "",
        mode: mode,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      await simulateTyping(
        data.reply || "Sorry, I couldn't process that.",
        (text) => {
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId ? { ...msg, text } : msg
          ));
        }
      );

    } catch (error) {
      console.error("Assistant error:", error);
      setError("Failed to get response. Please try again.");
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        text: "Sorry, there was an error. Please check your connection and try again.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      setSelectedMode(null);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      text: input.trim(),
      timestamp: new Date()
    };

    setInput("");
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.text,
          selectedText: initialText,
          mode: "explain"
        })
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      const assistantMessageId = Date.now() + 1;
      const assistantMessage = {
        id: assistantMessageId,
        role: "assistant",
        text: "",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      await simulateTyping(
        data.reply || "Sorry, I couldn't understand that.",
        (text) => {
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId ? { ...msg, text } : msg
          ));
        }
      );

    } catch (error) {
      setError("Connection error. Please check if the server is running.");
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: "assistant",
        text: "Connection error. Please check your internet connection and try again.",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) {
      setError("Text-to-speech not supported in your browser");
      return;
    }
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      setError("Failed to copy to clipboard");
    }
  };

  const clearConversation = () => {
    setMessages([{
      id: Date.now(),
      role: "assistant",
      text: "Conversation cleared. How can I help you?",
      timestamp: new Date()
    }]);
  };

  const exportConversation = () => {
    const conversation = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.text}`
    ).join('\n\n');
    
    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`fixed ${positionClasses[position]} z-50`}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-4 shadow-2xl cursor-pointer hover:shadow-2xl transition-all">
          <div className="flex items-center gap-3" onClick={() => setIsMinimized(false)}>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold">AI Study Companion</h3>
              <p className="text-xs opacity-80">Click to open</p>
            </div>
            <MessageSquare className="w-4 h-4 ml-2" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className={`fixed ${positionClasses[position]} w-[480px] max-w-[calc(100vw-48px)] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden`}
      style={{ 
        height: isExpanded ? 'calc(100vh - 100px)' : '600px',
        maxHeight: 'calc(100vh - 100px)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">AI Study Companion</h3>
            <p className="text-xs text-gray-600">Powered by GPT-4 • {messages.length} messages</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportConversation}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            title="Export conversation"
          >
            <Download className="w-4 h-4 text-gray-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearConversation}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4 text-gray-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4 text-gray-600" /> : <Maximize2 className="w-4 h-4 text-gray-600" />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMinimized(true)}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-4 h-4 text-gray-600" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </motion.button>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      {initialText && (
        <div className="border-b border-gray-100 bg-gray-50">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Quick Actions</span>
              {initialText && (
                <span className="text-xs text-gray-500 truncate max-w-[200px]">
                  "{initialText.slice(0, 50)}..."
                </span>
              )}
            </div>
            {showQuickActions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <AnimatePresence>
            {showQuickActions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-4"
              >
                <div className="grid grid-cols-4 gap-2">
                  {modes.map(mode => (
                    <motion.button
                      key={mode.id}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickAction(mode.id)}
                      disabled={loading}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl bg-white hover:shadow-md transition-all border border-gray-200 group relative ${
                        selectedMode === mode.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={mode.description}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mode.color} flex items-center justify-center text-white shadow-sm`}>
                        {mode.icon}
                      </div>
                      <span className="text-[10px] font-medium text-gray-700">{mode.label}</span>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex items-center gap-1 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-10">
                        {mode.description}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 relative ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* Message timestamp */}
                  <div className={`text-xs mt-2 ${
                    msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                {/* Message actions */}
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mt-2 ml-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => speak(msg.text)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-gray-500" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => copyToClipboard(msg.text, msg.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy text"
                    >
                      {copiedMessageId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                    className="w-2 h-2 bg-gray-400 rounded-full"
                  />
                </div>
                <span className="text-sm text-gray-500">
                  {selectedMode ? `Generating ${modes.find(m => m.id === selectedMode)?.label.toLowerCase()}...` : 'Thinking...'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about your study material..."
              disabled={loading}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm disabled:opacity-50 transition-all"
            />
            {input && (
              <button
                onClick={() => setInput('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-3 h-3 text-gray-500" />
              </button>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
        
        {/* Character count */}
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-xs text-gray-500">
            {input.length}/500 characters
          </span>
          <span className="text-xs text-gray-500">
            Press Enter to send
          </span>
        </div>
      </div>
    </motion.div>
  );
}