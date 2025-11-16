// src/pages/StudySession.jsx - CLEAN & PROPORTIONAL
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, ArrowRight, Users, Clock,
  Download, MessageSquare, Sparkles, Bookmark, Volume2, Brain,
  Search, RotateCcw, Play, Pause, FileText, Highlighter
} from 'lucide-react';
import { useStudySession } from '../context/StudySessionContext';
import EnhancedAgoraAssistant from '../components/EnhancedAgoraAssistant';

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
  
  const [selectedText, setSelectedText] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);
  const [selectionButton, setSelectionButton] = useState({ visible: false, x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMaterial, setFilteredMaterial] = useState([]);
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [autoRead, setAutoRead] = useState(false);

  const selectionRef = useRef(null);

  // Font sizes
  const fontSizes = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-relaxed',
    xl: 'text-xl leading-relaxed'
  };

  // Load material
  useEffect(() => {
    if (studyData?.content) {
      setMaterial(studyData.content);
    } else {
      const savedMaterial = localStorage.getItem('studyMaterial');
      setMaterial(savedMaterial || 'No study material found. Please upload a PDF or document to get started.');
    }
  }, [studyData]);

  // Filter material
  useEffect(() => {
    if (!material) return;

    const paragraphs = material.split('\n\n').filter(para => para.trim());
    
    let filtered = paragraphs;
    
    if (searchTerm) {
      filtered = filtered.filter(para => 
        para.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (showOnlyBookmarked) {
      filtered = filtered.filter((_, index) => bookmarkedParagraphs.has(index));
    }
    
    setFilteredMaterial(filtered);
    
    const totalParagraphs = paragraphs.length;
    const readParagraphs = Array.from(bookmarkedParagraphs).length;
    setReadingProgress(totalParagraphs > 0 ? (readParagraphs / totalParagraphs) * 100 : 0);
  }, [material, searchTerm, showOnlyBookmarked, bookmarkedParagraphs]);

  // Update clock
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Calculate elapsed time
  const elapsedMs = currentTime - sessionStartTime;
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000);
  const displayTime = `${elapsedMinutes}:${elapsedSeconds.toString().padStart(2, '0')}`;

  // Text-to-speech
  const speakText = useCallback((text) => {
    if (!('speechSynthesis' in window)) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setAutoRead(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [isSpeaking]);

  // Text selection handler
  const handleTextSelection = useCallback(() => {
    try {
      const sel = window.getSelection();
      const text = sel?.toString().trim() || '';
      
      if (text.length > 5) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/40 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6"
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {studyData?.title || 'Study Material'}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredMaterial.length} sections • {material ? material.split(' ').length : 0} words
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                  <Users className="w-4 h-4" />
                  Study Room
                </button>

                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors">
                  <Brain className="w-4 h-4" />
                  Start Quiz
                </button>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Font Size */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
                  {['sm', 'base', 'lg', 'xl'].map(size => (
                    <button
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        fontSize === size 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {size === 'base' ? 'M' : size[0].toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                  />
                </div>

                {/* Bookmark Filter */}
                <button
                  onClick={() => setShowOnlyBookmarked(!showOnlyBookmarked)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    showOnlyBookmarked
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${showOnlyBookmarked ? 'fill-amber-500' : ''}`} />
                  Bookmarks
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAutoRead}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
                    autoRead
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {autoRead ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  Auto Read
                </button>

                <button
                  onClick={resetSession}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>

                <button
                  onClick={exportNotes}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 text-sm hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 font-medium">{displayTime}</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(readingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${readingProgress}%` }}
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
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
                className={`${fontSizes[fontSize]} text-gray-700 space-y-6 max-h-[60vh] overflow-y-auto pr-4`}
              >
                {filteredMaterial.map((para, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`relative group p-4 rounded-xl border transition-colors ${
                      bookmarkedParagraphs.has(i)
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="leading-relaxed">{para}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{para.split(' ').length} words</span>
                          <span>•</span>
                          <span>{Math.ceil(para.split(' ').length / 200)} min read</span>
                        </div>
                      </div>
                      
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
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
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats & Assistant */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          >
            <h3 className="font-semibold text-gray-900 mb-4">Session Overview</h3>
            <div className="space-y-4">
              <StatItem 
                icon={<Bookmark className="w-4 h-4" />}
                label="Bookmarks"
                value={bookmarkedParagraphs.size}
              />
              <StatItem 
                icon={<FileText className="w-4 h-4" />}
                label="Sections"
                value={filteredMaterial.length}
              />
              <StatItem 
                icon={<BookOpen className="w-4 h-4" />}
                label="Words"
                value={material ? material.split(' ').length : 0}
              />
            </div>
          </motion.div>

          {/* AI Assistant Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl p-6 shadow-sm md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm opacity-90">AI Assistant</div>
                <div className="text-lg font-semibold">Study Assistant</div>
              </div>
            </div>

            <p className="text-white/80 text-sm mb-4">
              Select text and ask questions about your study material.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAssistant(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/20 hover:bg-white/30 border border-white/20 text-sm font-medium transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Open Assistant
              </button>

              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-blue-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                <Highlighter className="w-4 h-4" />
                Quick Summary
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Ask Assistant
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Assistant */}
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
    </div>
  );
}

// Stat Item Component
function StatItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-600">{label}</div>
        <div className="text-lg font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}