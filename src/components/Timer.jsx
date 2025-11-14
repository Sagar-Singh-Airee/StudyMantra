// src/components/Timer.jsx
import { Play, Pause, RotateCcw, Coffee, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimer } from '../hooks/useTimer';
import { useState, useEffect } from 'react';

function Timer({ onComplete }) {
  const { minutes, seconds, isRunning, start, pause, reset, timeLeft } = useTimer(25);
  const [mode, setMode] = useState('focus');
  const [showCelebration, setShowCelebration] = useState(false);

  const totalSeconds = 25 * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  useEffect(() => {
    if (timeLeft === 0 && onComplete) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
      onComplete();
    }
  }, [timeLeft, onComplete]);

  const toggleMode = () => {
    setMode(mode === 'focus' ? 'break' : 'focus');
    reset();
  };

  return (
    <div className="relative">
      {/* Celebration Confetti Effect */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              exit={{ scale: 0 }}
              className="text-8xl"
            >
              🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
        
        {/* Mode Toggle */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {mode === 'focus' ? (
                <><Brain className="w-6 h-6 text-blue-600" /> Focus Time</>
              ) : (
                <><Coffee className="w-6 h-6 text-green-600" /> Break Time</>
              )}
            </h3>
            <button
              onClick={toggleMode}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors"
            >
              Switch Mode
            </button>
          </div>

          {/* Progress Ring */}
          <div className="relative flex items-center justify-center mb-6">
            <svg className="transform -rotate-90 w-64 h-64">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-gray-200"
              />
              <motion.circle
                cx="128"
                cy="128"
                r="120"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="transparent"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                style={{
                  strokeDasharray: 2 * Math.PI * 120,
                  strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100)
                }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={mode === 'focus' ? '#3B82F6' : '#10B981'} />
                  <stop offset="100%" stopColor={mode === 'focus' ? '#8B5CF6' : '#059669'} />
                </linearGradient>
              </defs>
            </svg>

            {/* Timer Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                key={`${minutes}-${seconds}`}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className={`text-6xl font-black ${mode === 'focus' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-green-600 to-emerald-600'} bg-clip-text text-transparent`}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-500 font-medium mt-2">
                  {isRunning ? 'In Progress' : 'Paused'}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="relative z-10 flex gap-3 justify-center">
          {!isRunning ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={start}
              className={`p-6 rounded-full ${mode === 'focus' ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-gradient-to-br from-green-500 to-emerald-500'} text-white shadow-2xl hover:shadow-3xl transition-all`}
            >
              <Play className="w-8 h-8" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={pause}
              className="p-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-2xl hover:shadow-3xl transition-all"
            >
              <Pause className="w-8 h-8" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="p-6 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-2xl hover:shadow-3xl transition-all"
          >
            <RotateCcw className="w-8 h-8" />
          </motion.button>
        </div>

        {/* Session Info */}
        <div className="relative z-10 mt-6 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Session</div>
              <div className="text-lg font-bold text-gray-900">25 min</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Remaining</div>
              <div className="text-lg font-bold text-gray-900">{minutes}:{String(seconds).padStart(2, '0')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Timer;