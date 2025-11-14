// src/components/EnhancedAgoraAssistant.jsx
import { useState, useEffect, useRef } from "react";
import { 
  X, Send, Sparkles, BookOpen, Lightbulb, Brain, 
  HelpCircle, CreditCard, Target, Volume2, Copy, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export default function EnhancedAgoraAssistant({ initialText = "", onClose = () => {} }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState(null);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);

  const modes = [
    { id: "explain", label: "Explain", icon: <BookOpen className="w-4 h-4" />, color: "from-blue-500 to-cyan-500" },
    { id: "summarize", label: "Summarize", icon: <Target className="w-4 h-4" />, color: "from-purple-500 to-pink-500" },
    { id: "examples", label: "Examples", icon: <Lightbulb className="w-4 h-4" />, color: "from-yellow-500 to-orange-500" },
    { id: "definition", label: "Define", icon: <HelpCircle className="w-4 h-4" />, color: "from-green-500 to-emerald-500" },
    { id: "simplify", label: "Simplify", icon: <Brain className="w-4 h-4" />, color: "from-indigo-500 to-purple-500" },
    { id: "questions", label: "Questions", icon: <HelpCircle className="w-4 h-4" />, color: "from-red-500 to-pink-500" },
    { id: "flashcard", label: "Flashcard", icon: <CreditCard className="w-4 h-4" />, color: "from-teal-500 to-cyan-500" },
    { id: "memory", label: "Memory Tip", icon: <Brain className="w-4 h-4" />, color: "from-violet-500 to-purple-500" }
  ];

  useEffect(() => {
    if (initialText) {
      setMessages([{
        role: "assistant",
        text: `I can help you with this text! Choose an action above or ask me anything.`,
        selectedText: initialText
      }]);
    } else {
      setMessages([{
        role: "assistant",
        text: "Hi! I'm your AI Study Companion. Select text from your material or ask me anything!"
      }]);
    }
  }, [initialText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleQuickAction = async (mode) => {
    if (!initialText && mode !== "explain") return;
    
    setSelectedMode(mode);
    setLoading(true);

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

    setMessages(prev => [...prev, {
      role: "user",
      text: modeLabels[mode]
    }]);

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

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: "assistant",
        text: data.reply || "Sorry, I couldn't process that.",
        mode: mode
      }]);
    } catch (error) {
      console.error("Assistant error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "Sorry, there was an error. Please try again."
      }]);
    } finally {
      setLoading(false);
      setSelectedMode(null);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          selectedText: initialText,
          mode: "explain"
        })
      });

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: "assistant",
        text: data.reply || "Sorry, I couldn't understand that."
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "Connection error. Please check if the server is running."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="fixed bottom-6 right-6 w-[480px] max-w-[calc(100vw-48px)] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col z-50"
      style={{ maxHeight: 'calc(100vh - 100px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">AI Study Companion</h3>
            <p className="text-xs text-gray-600">Powered by GPT-4</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/50 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Quick Actions */}
      {initialText && (
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-semibold text-gray-600 mb-2">Quick Actions:</p>
          <div className="grid grid-cols-4 gap-2">
            {modes.map(mode => (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction(mode.id)}
                disabled={loading}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl bg-white hover:shadow-md transition-all border border-gray-200 ${
                  selectedMode === mode.id ? 'ring-2 ring-blue-500' : ''
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mode.color} flex items-center justify-center text-white`}>
                  {mode.icon}
                </div>
                <span className="text-[10px] font-medium text-gray-700">{mode.label}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ minHeight: '300px', maxHeight: '400px' }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-2' : ''}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
                
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mt-2 ml-2">
                    <button
                      onClick={() => speak(msg.text)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Read aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-gray-500" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(msg.text)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
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
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask anything..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm disabled:opacity-50"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}