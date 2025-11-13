import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight, Loader } from 'lucide-react';
import { generateQuizFromText } from '../utils/quizGenerator';
import { useStudySession } from '../context/StudySessionContext';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    const material = localStorage.getItem('studyMaterial');
    if (!material) {
      toast.error('No study material found!');
      navigate('/upload');
      return;
    }

    try {
      const quiz = generateQuizFromText(material, 10);
      setQuestions(quiz);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to generate quiz!');
      navigate('/study');
    }
  }, [navigate]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newAnswers = [...answers, { 
      question: questions[currentQuestion].question,
      selected: selectedAnswer, 
      correct: questions[currentQuestion].correctAnswer,
      isCorrect 
    }];
    
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setScore(score + 1);
    }

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Quiz complete
      const finalScore = Math.round(((score + (isCorrect ? 1 : 0)) / questions.length) * 100);
      
      addQuizResult({
        date: new Date().toISOString(),
        score: finalScore,
        correctAnswers: score + (isCorrect ? 1 : 0),
        totalQuestions: questions.length,
      });
      
      setShowResult(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (showResult) {
    const finalScore = Math.round((score / questions.length) * 100);
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {finalScore >= 80 ? '🎉' : finalScore >= 60 ? '👍' : '💪'}
            </div>
            <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
            <p className="text-gray-600">Here's how you did</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {finalScore}%
              </div>
              <p className="text-gray-600">
                {score} out of {questions.length} correct
              </p>
            </div>
          </div>

          {/* Answer Review */}
          <div className="mb-6 max-h-60 overflow-y-auto">
            <h3 className="font-bold mb-3">Review Answers:</h3>
            {answers.map((answer, index) => (
              <div key={index} className="flex items-start gap-2 mb-2 p-3 bg-gray-50 rounded-lg">
                {answer.isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                )}
                <div className="text-sm">
                  <p className="font-medium">Q{index + 1}</p>
                  {!answer.isCorrect && (
                    <p className="text-red-600">Your answer: {answer.selected}</p>
                  )}
                  <p className="text-green-600">Correct: {answer.correct}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/analytics')}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              View Analytics
            </button>
            <button
              onClick={() => navigate('/study')}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Study Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl p-8 shadow-2xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>Score: {score}/{currentQuestion}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            {question.question}
          </h2>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full p-4 rounded-lg border-2 text-left transition ${
                selectedAnswer === option
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNextQuestion}
          disabled={!selectedAnswer}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
        >
          {currentQuestion + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default Quiz;