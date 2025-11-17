// src/pages/Quiz.jsx
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  Loader, 
  Trophy, 
  Star, 
  TrendingUp,
  Zap,
  Brain,
  Clock,
  BarChart3,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuizFromText } from '../utils/quizGenerator';
import { useStudySession } from '../context/StudySessionContext';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

function Quiz() {
  const navigate = useNavigate();
  const { studyData, addQuizResult } = useStudySession();
  const { width, height } = useWindowSize();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizDifficulty, setQuizDifficulty] = useState('medium');
  const [useAI, setUseAI] = useState(true);
  const [timePerQuestion, setTimePerQuestion] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState(null);
  const [quizStats, setQuizStats] = useState({
    totalTime: 0,
    averageTime: 0,
    fastestAnswer: Infinity,
    slowestAnswer: 0
  });

  // Enhanced quiz generation with better error handling
  useEffect(() => {
    const material = localStorage.getItem('studyMaterial');
    if (!material) {
      navigate('/upload');
      return;
    }

    const generateQuiz = async () => {
      setLoading(true);
      setError(null);

      try {
        if (useAI) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000);

          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/generate-quiz`,
              {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                  text: material,
                  numQuestions: 10,
                  difficulty: quizDifficulty,
                  questionTypes: ['multiple_choice', 'true_false']
                }),
                signal: controller.signal
              }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
              throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.questions && data.questions.length > 0) {
              setQuestions(data.questions.map(q => ({
                ...q,
                id: Math.random().toString(36).substr(2, 9)
              })));
              setStartTime(Date.now());
              return;
            } else {
              throw new Error('No questions returned from AI');
            }
          } catch (fetchError) {
            clearTimeout(timeoutId);
            if (fetchError.name === 'AbortError') {
              throw new Error('AI generation timed out. Please try again.');
            }
            throw fetchError;
          }
        }

        // Fallback to local generation
        const quiz = generateQuizFromText(material, 10, quizDifficulty);
        setQuestions(quiz.map(q => ({
          ...q,
          id: Math.random().toString(36).substr(2, 9)
        })));
        setStartTime(Date.now());
        
      } catch (error) {
        console.error('Quiz generation failed:', error);
        setError(error.message);
        // Don't navigate immediately, show error state first
      } finally {
        setLoading(false);
      }
    };

    generateQuiz();
  }, [navigate, quizDifficulty, useAI]);

  // Timer effect
  useEffect(() => {
    if (!startTime || showResult) return;

    const interval = setInterval(() => {
      setTimePerQuestion(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, showResult]);

  const handleAnswerSelect = useCallback((answer) => {
    if (isCorrect !== null) return;
    
    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);

    // Update timing stats
    setQuizStats(prev => ({
      ...prev,
      totalTime: prev.totalTime + timePerQuestion,
      fastestAnswer: Math.min(prev.fastestAnswer, timePerQuestion),
      slowestAnswer: Math.max(prev.slowestAnswer, timePerQuestion)
    }));
  }, [isCorrect, questions, currentQuestion, timePerQuestion]);

  const handleNextQuestion = useCallback(() => {
    const correct = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newAnswers = [...answers, { 
      question: questions[currentQuestion].question,
      selected: selectedAnswer, 
      correct: questions[currentQuestion].correctAnswer,
      isCorrect: correct,
      timeSpent: timePerQuestion,
      questionId: questions[currentQuestion].id
    }];
    
    setAnswers(newAnswers);
    if (correct) setScore(score + 1);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowExplanation(false);
      setTimePerQuestion(0);
    } else {
      const finalScore = Math.round((score / questions.length) * 100);
      const totalQuizTime = Math.round((Date.now() - startTime) / 1000);
      
      const result = {
        date: new Date().toISOString(),
        score: finalScore,
        correctAnswers: score,
        totalQuestions: questions.length,
        timeSpent: totalQuizTime,
        difficulty: quizDifficulty,
        answers: newAnswers,
        stats: {
          ...quizStats,
          averageTime: Math.round(quizStats.totalTime / questions.length)
        }
      };

      addQuizResult(result);
      
      if (finalScore >= 80) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      setShowResult(true);
    }
  }, [
    selectedAnswer, questions, currentQuestion, answers, score, 
    startTime, quizDifficulty, quizStats, addQuizResult
  ]);

  const retryQuizGeneration = () => {
    setError(null);
    setLoading(true);
    // Trigger regeneration by changing a dependency
    setQuizDifficulty(quizDifficulty);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity }
            }}
            className="mb-6"
          >
            <div className="relative">
              <Brain className="w-20 h-20 text-blue-600" />
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0"
              >
                <Zap className="w-20 h-20 text-purple-600" />
              </motion.div>
            </div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-800 mb-3"
          >
            Crafting Your Quiz
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <p className="text-gray-600">
              {useAI ? '🤖 AI is generating personalized questions...' : '📚 Building your quiz...'}
            </p>
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mx-auto">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-red-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Quiz Generation Failed
            </h2>
            
            <p className="text-gray-600 mb-6">
              {error}
            </p>
            
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={retryQuizGeneration}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-2xl font-bold shadow-lg"
              >
                Try Again
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUseAI(false)}
                className="w-full bg-white border-2 border-gray-200 text-gray-800 py-3 rounded-2xl font-bold"
              >
                Use Local Generator
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/study')}
                className="w-full bg-gray-100 text-gray-600 py-3 rounded-2xl font-bold"
              >
                Back to Study
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (showResult) {
    const finalScore = Math.round((score / questions.length) * 100);
    const performanceLevel = finalScore >= 80 ? 'excellent' : 
                           finalScore >= 60 ? 'good' : 'needs-improvement';
    
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        {showConfetti && <Confetti width={width} height={height} recycle={false} />}
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex items-center justify-center p-4 min-h-screen"
        >
          <div className="max-w-4xl w-full">
            {/* Performance Banner */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`text-center mb-8 p-6 rounded-3xl ${
                performanceLevel === 'excellent' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : performanceLevel === 'good'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  : 'bg-gradient-to-r from-red-500 to-pink-500'
              } text-white shadow-2xl`}
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                {performanceLevel === 'excellent' ? '🏆' : 
                 performanceLevel === 'good' ? '⭐' : '💪'}
              </motion.div>
              
              <h2 className="text-4xl font-black mb-2">
                {performanceLevel === 'excellent' ? 'Outstanding!' : 
                 performanceLevel === 'good' ? 'Great Job!' : 'Keep Practicing!'}
              </h2>
              <p className="text-xl opacity-90">
                {performanceLevel === 'excellent' ? 'You mastered this material!' : 
                 performanceLevel === 'good' ? 'Solid understanding!' : 'Review and try again!'}
              </p>
            </motion.div>

            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              {/* Score Overview */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="relative mb-8"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-20" />
                <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    className="text-8xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
                  >
                    {finalScore}%
                  </motion.div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{score}</div>
                      <div className="text-gray-600">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800">{questions.length - score}</div>
                      <div className="text-gray-600">Incorrect</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard 
                  icon={<Trophy className="w-6 h-6" />} 
                  label="Score" 
                  value={`${finalScore}%`} 
                  color="from-yellow-400 to-orange-500" 
                />
                <StatCard 
                  icon={<Clock className="w-6 h-6" />} 
                  label="Time" 
                  value={`${Math.round(quizStats.totalTime / 60)}m`} 
                  color="from-blue-400 to-cyan-500" 
                />
                <StatCard 
                  icon={<BarChart3 className="w-6 h-6" />} 
                  label="Avg Time/Q" 
                  value={`${quizStats.averageTime}s`} 
                  color="from-green-400 to-emerald-500" 
                />
                <StatCard 
                  icon={<TrendingUp className="w-6 h-6" />} 
                  label="Accuracy" 
                  value={`${Math.round((score/questions.length)*100)}%`} 
                  color="from-purple-400 to-pink-500" 
                />
              </div>

              {/* Answer Review with Enhanced UX */}
              <div className="mb-8">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-blue-600" />
                  Detailed Review
                </h3>
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {answers.map((answer, index) => (
                    <AnswerReviewCard 
                      key={answer.questionId} 
                      answer={answer} 
                      index={index} 
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/analytics')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition flex items-center justify-center gap-3"
                >
                  <TrendingUp className="w-5 h-5" />
                  View Analytics
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-white border-2 border-gray-200 text-gray-800 py-4 rounded-2xl font-bold hover:border-blue-400 transition flex items-center justify-center gap-3"
                >
                  <Brain className="w-5 h-5" />
                  Retry Quiz
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/study')}
                  className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-200 transition"
                >
                  Back to Study
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full"
      >
        <div className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
          {/* Enhanced Quiz Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 p-4 bg-gray-50 rounded-2xl gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Difficulty:</label>
                <select 
                  value={quizDifficulty}
                  onChange={(e) => setQuizDifficulty(e.target.value)}
                  className="text-sm border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={currentQuestion > 0}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">AI Mode:</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="sr-only peer"
                    disabled={currentQuestion > 0}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{timePerQuestion}s</span>
              </div>
              <div className={`px-3 py-1 rounded-full border text-xs font-medium ${
                useAI 
                  ? 'bg-purple-50 text-purple-700 border-purple-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {useAI ? '🤖 AI Powered' : '📚 Local'}
              </div>
            </div>
          </div>

          {/* Progress and Score */}
          <div className="mb-8">
            <div className="flex justify-between text-sm font-semibold mb-3">
              <span className="text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-blue-600">
                Score: {score}/{currentQuestion}
              </span>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-8"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {currentQuestion + 1}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight flex-1">
                  {question.question}
                </h2>
              </div>

              {/* Answers */}
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer = option === question.correctAnswer;
                  const showCorrect = showExplanation && isCorrectAnswer;
                  const showWrong = showExplanation && isSelected && !isCorrectAnswer;

                  return (
                    <AnswerButton
                      key={index}
                      option={option}
                      index={index}
                      isSelected={isSelected}
                      showCorrect={showCorrect}
                      showWrong={showWrong}
                      showExplanation={showExplanation}
                      onSelect={handleAnswerSelect}
                    />
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mt-6 p-5 rounded-2xl ${
                      isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect ? (
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      )}
                      <div>
                        <h4 className={`font-bold mb-1 ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                          {isCorrect ? 'Correct! 🎉' : 'Incorrect - Better luck next time!'}
                        </h4>
                        <p className="text-sm text-gray-700">{question.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* Next Button */}
          <motion.button
            whileHover={{ scale: selectedAnswer ? 1.02 : 1 }}
            whileTap={{ scale: selectedAnswer ? 0.98 : 1 }}
            onClick={handleNextQuestion}
            disabled={!selectedAnswer}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
              selectedAnswer
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl hover:shadow-2xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentQuestion + 1 === questions.length ? (
              <>
                <Trophy className="w-5 h-5" />
                Finish Quiz
              </>
            ) : (
              <>
                Next Question
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// Enhanced Stat Card Component
function StatCard({ icon, label, value, color }) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05, y: -2 }}
      className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white text-center shadow-lg hover:shadow-xl transition-shadow`}
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-2xl font-black mb-1">{value}</div>
      <div className="text-xs font-medium opacity-90">{label}</div>
    </motion.div>
  );
}

// New Answer Button Component
function AnswerButton({ option, index, isSelected, showCorrect, showWrong, showExplanation, onSelect }) {
  return (
    <motion.button
      whileHover={!showExplanation ? { 
        x: 4, 
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        scale: 1.01
      } : {}}
      whileTap={!showExplanation ? { scale: 0.98 } : {}}
      onClick={() => onSelect(option)}
      disabled={showExplanation}
      className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
        showCorrect
          ? 'border-green-500 bg-green-50 shadow-lg'
          : showWrong
          ? 'border-red-500 bg-red-50 shadow-lg'
          : isSelected
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
      } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <span className={`text-lg font-bold ${
            showCorrect ? 'text-green-600' :
            showWrong ? 'text-red-600' :
            isSelected ? 'text-blue-600' : 'text-gray-400'
          }`}>
            {String.fromCharCode(65 + index)}
          </span>
          <span className="font-medium text-gray-800 text-left">{option}</span>
        </div>
        {showCorrect && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <CheckCircle className="w-6 h-6 text-green-600" />
          </motion.div>
        )}
        {showWrong && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <XCircle className="w-6 h-6 text-red-600" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

// New Answer Review Card Component
function AnswerReviewCard({ answer, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`p-4 rounded-2xl border-2 ${
        answer.isCorrect 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      } hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start gap-3">
        {answer.isCorrect ? (
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <p className="font-semibold text-gray-800">Question {index + 1}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {answer.timeSpent}s
            </div>
          </div>
          {!answer.isCorrect && (
            <p className="text-red-700 mb-2 text-sm">
              <span className="font-medium">Your answer:</span> {answer.selected}
            </p>
          )}
          <p className="text-green-700 text-sm">
            <span className="font-medium">Correct answer:</span> {answer.correct}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
export default Quiz;
