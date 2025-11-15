// src/pages/StudySession.jsx - ENHANCED VERSION
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ArrowRight, Users, Zap, Target, Trophy, Clock,
  Download, MessageSquare, Sparkles, Bookmark, Volume2, Brain,
  X, Send, Highlighter, Loader, FileText, Search, Filter,
  Eye, EyeOff, Share, RotateCcw, Play, Pause
} from 'lucide-react';
import { useStudySession } from '../context/StudySessionContext';
import EnhancedAgoraAssistant from '../components/EnhancedAgoraAssistant';
import SharedStudyMode from '../components/SharedStudyMode';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function StudySession() {
  const { studyData } = useStudySession();
  const [material, setMaterial] = useState('');
  const [sessionStartTime] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [fontSize, setFontSize] = useState('base');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bookmarkedParagraphs, setBookmarkedParagraphs] = useState(new Set());
  const [readingProgress, setReadingProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Selection & Assistant state
  const [selectedText, setSelectedText] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);
  const [selectionButton, setSelectionButton] = useState({ visible: false, x: 0, y: 0 });
  const selectionRef = useRef(null);

  // Enhanced features
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMaterial, setFilteredMaterial] = useState([]);
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [autoRead, setAutoRead] = useState(false);

  // Shared session state
  const [sharedMode, setSharedMode] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  
  // Initialize currentUser
  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('sharedStudyUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user:', e);
      }
    }
    
    const newUser = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Guest User',
      role: 'host'
    };
    
    try {
      localStorage.setItem('sharedStudyUser', JSON.stringify(newUser));
    } catch (e) {
      console.error('Failed to save user:', e);
    }
    
    return newUser;
  });

  // Load material from context or localStorage
  useEffect(() => {
    const loadMaterial = () => {
      // Priority 1: Study context data
      if (studyData?.content) {
        setMaterial(studyData.content);
        return;
      }

      // Priority 2: Local storage
      const savedMaterial = localStorage.getItem('studyMaterial');
      if (savedMaterial) {
        setMaterial(savedMaterial);
        return;
      }

      // Priority 3: Fallback to empty state
      setMaterial('No study material found. Please upload a PDF or document to get started.');
    };

    loadMaterial();
  }, [studyData]);

  // Filter material based on search and bookmarks
  useEffect(() => {
    if (!material) return;

    const paragraphs = material.split('\n\n').filter(para => para.trim());
    
    let filtered = paragraphs;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(para => 
        para.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply bookmark filter
    if (showOnlyBookmarked) {
      filtered = filtered.filter((_, index) => bookmarkedParagraphs.has(index));
    }
    
    setFilteredMaterial(filtered);
    
    // Calculate reading progress
    const totalParagraphs = paragraphs.length;
    const readParagraphs = Array.from(bookmarkedParagraphs).length;
    setReadingProgress(totalParagraphs > 0 ? (readParagraphs / totalParagraphs) * 100 : 0);
  }, [material, searchTerm, showOnlyBookmarked, bookmarkedParagraphs]);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setCurrentTime(Date.now());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Auto-read functionality
  useEffect(() => {
    if (autoRead && filteredMaterial.length > 0 && currentParagraph < filteredMaterial.length) {
      const timer = setTimeout(() => {
        speakText(filteredMaterial[currentParagraph]);
        setCurrentParagraph(prev => prev + 1);
      }, 3000); // 3 seconds per paragraph

      return () => clearTimeout(timer);
    }
  }, [autoRead, currentParagraph, filteredMaterial]);

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
    if (!('speechSynthesis' in window)) {
      console.error('Text-to-speech not supported');
      return;
    }
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setAutoRead(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (autoRead && currentParagraph >= filteredMaterial.length - 1) {
        setAutoRead(false);
        setCurrentParagraph(0);
      }
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      setAutoRead(false);
      console.error('Speech synthesis failed');
    };
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [isSpeaking, autoRead, currentParagraph, filteredMaterial.length]);

  // Text selection handler
  const handleTextSelection = useCallback(() => {
    try {
      const sel = window.getSelection();
      const text = sel?.toString().trim() || '';
      
      if (text.length > 5) { // Reduced minimum length for better UX
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

  // Shared session function
  const startSharedSession = async () => {
    if (isCreatingRoom) return;

    if (!currentUser || !currentUser.id || !currentUser.name) {
      console.error('User information missing');
      return;
    }

    if (!API_BASE) {
      console.error('API configuration missing');
      return;
    }

    setIsCreatingRoom(true);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_BASE}/api/rooms/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          docName: 'Study Session',
          hostId: currentUser.id,
          hostName: currentUser.name,
          isPrivate: false,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create room');
      }

      const data = await response.json();
      
      if (!data.success || !data.roomId) {
        throw new Error('Invalid response from server');
      }
      
      setRoomInfo({
        roomId: data.roomId,
        shareUrl: data.shareUrl,
        channelName: data.channelName,
        isHost: true,
      });
      
      setSharedMode(true);

    } catch (error) {
      console.error('Create room error:', error);
    } finally {
      setIsCreatingRoom(false);
    }
  };

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
  };

  const exportNotes = () => {
    if (!material) return;
    
    const blob = new Blob([material], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `study-notes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const toggleAutoRead = () => {
    setAutoRead(!autoRead);
    if (!autoRead) {
      setCurrentParagraph(0);
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const resetSession = () => {
    setBookmarkedParagraphs(new Set());
    setReadingProgress(0);
    setCurrentParagraph(0);
    setAutoRead(false);
    setIsSpeaking(false);
    window.speechSynthesis.cancel();
  };

  const scrollToParagraph = (index) => {
    const element = document.querySelector(`[data-paragraph="${index}"]`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAIN CONTENT - 2/3 width */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {studyData?.title || 'Study Material'}
                    </h1>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Select text to ask questions • {filteredMaterial.length} sections
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <motion.button
                    whileHover={!isCreatingRoom ? { scale: 1.02 } : {}}
                    whileTap={!isCreatingRoom ? { scale: 0.98 } : {}}
                    onClick={startSharedSession}
                    disabled={isCreatingRoom}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all ${
                      isCreatingRoom
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {isCreatingRoom ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        Start Shared Session
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.href = '/quiz'}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Brain className="w-4 h-4" />
                    Start Quiz
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Enhanced Reading Controls */}
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Font Size Controls */}
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
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

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                    />
                  </div>

                  {/* Bookmark Filter */}
                  <button
                    onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                      showOnlyBookmarked
                        ? 'bg-amber-50 border-amber-300 text-amber-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${showOnlyBookmarked ? 'fill-amber-500' : ''}`} />
                    Bookmarks
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Auto Read */}
                  <button
                    onClick={toggleAutoRead}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                      autoRead
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {autoRead ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    Auto Read
                  </button>

                  {/* Reset Session */}
                  <button
                    onClick={resetSession}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>

                  <button
                    onClick={exportNotes}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Reading Progress</span>
                  <span>{Math.round(readingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${readingProgress}%` }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Reading Content */}
            <div className="p-6">
              {!material ? (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No study material found.</p>
                  <p className="text-sm">Please upload a PDF to get started.</p>
                </div>
              ) : filteredMaterial.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No content matches your search.</p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setShowOnlyBookmarked(false);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div
                  ref={selectionRef}
                  className={`${fontSizes[fontSize]} text-gray-700 space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar`}
                >
                  {filteredMaterial.map((para, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      data-paragraph={i}
                      className={`relative group p-6 rounded-2xl transition-all duration-300 border ${
                        bookmarkedParagraphs.has(i)
                          ? 'bg-amber-50 border-amber-200 shadow-sm'
                          : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
                      } ${autoRead && currentParagraph === i ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="leading-relaxed">{para}</p>
                          
                          {/* Word count and reading time */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span>{para.split(' ').length} words</span>
                            <span>•</span>
                            <span>{Math.ceil(para.split(' ').length / 200)} min read</span>
                          </div>
                        </div>
                        
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => toggleBookmark(i)}
                            className={`p-2 rounded-lg transition-colors ${
                              bookmarkedParagraphs.has(i)
                                ? 'bg-amber-100 text-amber-600'
                                : 'bg-white text-gray-400 hover:bg-amber-50 hover:text-amber-600'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${bookmarkedParagraphs.has(i) ? 'fill-current' : ''}`} />
                          </button>
                          
                          <button
                            onClick={() => speakText(para)}
                            className={`p-2 rounded-lg transition-colors ${
                              isSpeaking 
                                ? 'bg-red-100 text-red-600' 
                                : 'bg-white text-gray-400 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => scrollToParagraph(i)}
                            className="p-2 rounded-lg bg-white text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ENHANCED SIDEBAR - 1/3 width */}
        <div className="lg:col-span-1 space-y-5">
          
          {/* Enhanced Clock Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
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
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`p-2 rounded-lg transition-colors ${
                  isPaused 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-xs text-gray-500">
              {isPaused ? 'Timer paused' : 'Timer running'}
            </div>
          </motion.div>

          {/* Quick Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">Session Stats</h3>
              <div className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                Progress: <span className="font-semibold text-gray-700">{Math.round(readingProgress)}%</span>
              </div>
            </div>

            <div className="space-y-3">
              <StatItem 
                icon={<Bookmark className="w-4 h-4" />} 
                label="Bookmarks" 
                value={bookmarkedParagraphs.size} 
                color="from-amber-500 to-orange-500"
              />
              <StatItem 
                icon={<FileText className="w-4 h-4" />} 
                label="Sections" 
                value={filteredMaterial.length} 
                color="from-blue-500 to-cyan-500"
              />
              <StatItem 
                icon={<Target className="w-4 h-4" />} 
                label="Words" 
                value={material ? material.split(' ').length : 0} 
                color="from-green-500 to-emerald-500"
              />
            </div>
          </motion.div>

          {/* Enhanced AI Assistant Card */}
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
                  onClick={startSharedSession}
                  disabled={isCreatingRoom}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-shadow ${
                    isCreatingRoom
                      ? 'bg-white/50 cursor-not-allowed'
                      : 'bg-white text-purple-600 hover:shadow-xl'
                  }`}
                >
                  {isCreatingRoom ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4" />
                      Study Room
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Study Tips */}
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
                action={() => setIsPaused(!isPaused)}
                actionText={isPaused ? 'Resume' : 'Pause'}
              />
              <TipItem 
                icon={<Highlighter className="w-4 h-4" />}
                title="Active Recall"
                description="Test yourself frequently"
                action={() => window.location.href = '/quiz'}
                actionText="Take Quiz"
              />
              <TipItem 
                icon={<Brain className="w-4 h-4" />}
                title="Spaced Repetition"
                description="Review at intervals"
                action={() => setAutoRead(!autoRead)}
                actionText={autoRead ? 'Stop Auto' : 'Auto Read'}
              />
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-100"
          >
            <h4 className="text-base font-bold text-gray-900 mb-3">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={resetSession}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors flex flex-col items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={exportNotes}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors flex flex-col items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors flex flex-col items-center gap-1"
              >
                <Bookmark className="w-4 h-4" />
                Bookmarks
              </button>
              <button
                onClick={toggleAutoRead}
                className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium transition-colors flex flex-col items-center gap-1"
              >
                {autoRead ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                Auto Read
              </button>
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

      {/* Enhanced AI Assistant Component */}
      <AnimatePresence>
        {showAssistant && (
          <EnhancedAgoraAssistant 
            initialText={selectedText} 
            onClose={() => { 
              setShowAssistant(false); 
              setSelectedText(''); 
            }} 
          />
        )}
      </AnimatePresence>

      {/* Shared Study Mode Component */}
      <AnimatePresence>
        {sharedMode && roomInfo && (
          <SharedStudyMode
            roomId={roomInfo.roomId}
            isHost={roomInfo.isHost}
            currentUser={currentUser}
            material={material}
            onClose={() => {
              setSharedMode(false);
              setRoomInfo(null);
            }}
          />
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

function TipItem({ icon, title, description, action, actionText }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gradient-to-br from-gray-50/50 to-blue-50/30 border border-gray-100 hover:border-blue-200 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <div className="text-xs text-gray-600 mt-0.5">{description}</div>
      </div>
      {action && (
        <button
          onClick={action}
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}