// src/pages/Quiz.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Loader, Trophy, Star, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuizFromText } from '../utils/quizGenerator';
import { useStudySession } from '../context/StudySessionContext';

function Quiz() {
  const navigate = useNavigate();
  const { studyData, addQuizResult } = useStudySession();
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

  useEffect(() => {
    const material = localStorage.getItem('studyMaterial');
    if (!material) {
      navigate('/upload');
      return;
    }

    const generateQuiz = async () => {
      if (useAI) {
        try {
          setLoading(true);
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'}/api/generate-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: material,
              numQuestions: 10,
              difficulty: quizDifficulty
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (data.questions && data.questions.length > 0) {
            setQuestions(data.questions);
            setLoading(false);
            return;
          } else {
            throw new Error('No questions returned from AI');
          }
        } catch (error) {
          console.error('AI quiz failed, falling back to local:', error);
        }
      }

      // Fallback to local generation
      try {
        const quiz = generateQuizFromText(material, 10);
        setQuestions(quiz);
        setLoading(false);
      } catch (error) {
        navigate('/study');
      }
    };

    generateQuiz();
  }, [navigate, quizDifficulty, useAI]);

  const handleAnswerSelect = (answer) => {
    if (isCorrect !== null) return;
    setSelectedAnswer(answer);
    const correct = answer === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    const correct = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newAnswers = [...answers, { 
      question: questions[currentQuestion].question,
      selected: selectedAnswer, 
      correct: questions[currentQuestion].correctAnswer,
      isCorrect: correct 
    }];
    
    setAnswers(newAnswers);
    if (correct) setScore(score + 1);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setShowExplanation(false);
    } else {
      const finalScore = Math.round(((score + (correct ? 1 : 0)) / questions.length) * 100);
      addQuizResult({
        date: new Date().toISOString(),
        score: finalScore,
        correctAnswers: score + (correct ? 1 : 0),
        totalQuestions: questions.length,
      });
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <Loader className="w-16 h-16 text-blue-600" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-600 text-lg"
          >
            {useAI ? 'Generating AI Quiz...' : 'Generating Quiz...'}
          </motion.p>
        </div>
      </div>
    );
  }

  if (showResult) {
    const finalScore = Math.round((score / questions.length) * 100);
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      >
        <div className="max-w-3xl w-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="text-8xl mb-4"
            >
              {finalScore >= 80 ? '🎉' : finalScore >= 60 ? '👍' : '💪'}
            </motion.div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Quiz Complete!
            </h2>
            <p className="text-gray-600 text-lg">Here's how you performed</p>
          </motion.div>

          <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.4 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-30" />
              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="text-7xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3"
                >
                  {finalScore}%
                </motion.div>
                <p className="text-gray-700 text-lg font-semibold">
                  {score} out of {questions.length} correct
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard icon={<Trophy />} label="Score" value={`${finalScore}%`} color="from-yellow-400 to-orange-500" />
              <StatCard icon={<CheckCircle />} label="Correct" value={score} color="from-green-400 to-emerald-500" />
              <StatCard icon={<TrendingUp />} label="Accuracy" value={`${Math.round((score/questions.length)*100)}%`} color="from-blue-400 to-purple-500" />
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Answer Review
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {answers.map((answer, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-2xl border-2 ${
                      answer.isCorrect 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {answer.isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                      )}
                      <div className="flex-1 text-sm">
                        <p className="font-semibold mb-1">Question {index + 1}</p>
                        {!answer.isCorrect && (
                          <p className="text-red-700 mb-1">
                            <span className="font-medium">Your answer:</span> {answer.selected}
                          </p>
                        )}
                        <p className="text-green-700">
                          <span className="font-medium">Correct:</span> {answer.correct}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/analytics')}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-5 h-5" />
                View Analytics
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/study')}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-800 py-4 rounded-2xl font-bold hover:border-blue-400 transition"
              >
                Study Again
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
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
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
          {/* Quiz Settings Bar */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Difficulty:</label>
                <select 
                  value={quizDifficulty}
                  onChange={(e) => setQuizDifficulty(e.target.value)}
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">AI Generation:</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border">
              {useAI ? '🤖 AI Powered' : '📚 Local'}
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-sm font-semibold mb-3">
              <span className="text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-blue-600">
                Score: {score}/{currentQuestion + (isCorrect ? 1 : 0)}
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

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-8"
            >
              <div className="flex items-start gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {currentQuestion + 1}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight flex-1">
                  {question.question}
                </h2>
              </div>

              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrectAnswer = option === question.correctAnswer;
                  const showCorrect = showExplanation && isCorrectAnswer;
                  const showWrong = showExplanation && isSelected && !isCorrectAnswer;

                  return (
                    <motion.button
                      key={index}
                      whileHover={!showExplanation ? { x: 4, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" } : {}}
                      whileTap={!showExplanation ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showExplanation}
                      className={`w-full p-5 rounded-2xl border-2 text-left transition-all duration-300 ${
                        showCorrect
                          ? 'border-green-500 bg-green-50'
                          : showWrong
                          ? 'border-red-500 bg-red-50'
                          : isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      } ${showExplanation ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <span className="text-lg font-bold text-gray-400">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="font-medium text-gray-800">{option}</span>
                        </div>
                        {showCorrect && <CheckCircle className="w-6 h-6 text-green-600" />}
                        {showWrong && <XCircle className="w-6 h-6 text-red-600" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

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
                          {isCorrect ? 'Correct! 🎉' : 'Incorrect'}
                        </h4>
                        <p className="text-sm text-gray-700">{question.explanation}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNextQuestion}
            disabled={!selectedAnswer}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
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

function StatCard({ icon, label, value, color }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white text-center shadow-lg`}
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-2xl font-black mb-1">{value}</div>
      <div className="text-xs font-medium opacity-90">{label}</div>
    </motion.div>
  );
}

export default Quiz;