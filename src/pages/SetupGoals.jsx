import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  Target, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  ArrowRight,
  CheckCircle,
  Zap,
  Calendar,
  Award
} from 'lucide-react';

function SetupGoals() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [goals, setGoals] = useState({
    subject: '',
    dailyTime: 60,
    weeklyTarget: 5, // days per week
    quizzesPerDay: 3,
    difficulty: 'medium',
    studyMode: 'balanced'
  });

  const studyModes = [
    { id: 'intensive', name: '🚀 Intensive', desc: 'Fast-paced learning' },
    { id: 'balanced', name: '⚖️ Balanced', desc: 'Steady progress' },
    { id: 'relaxed', name: '🌱 Relaxed', desc: 'Learn at your own pace' }
  ];

  const difficulties = [
    { id: 'beginner', name: '🌱 Beginner' },
    { id: 'medium', name: '⚡ Intermediate' },
    { id: 'advanced', name: '🚀 Advanced' }
  ];

  // Load saved goals if they exist
  useEffect(() => {
    const savedGoals = localStorage.getItem('studyGoals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  const updateGoal = (key, value) => {
    setGoals(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const nextStep = () => {
    if (currentStep === 0 && !goals.subject.trim()) {
      toast.error('Please enter a subject to continue!');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!goals.subject.trim()) {
      toast.error('Please enter a subject!');
      setCurrentStep(0);
      return;
    }

    // Calculate study metrics
    const weeklyHours = (goals.dailyTime * goals.weeklyTarget) / 60;
    const monthlyQuizzes = goals.quizzesPerDay * goals.weeklyTarget * 4;

    const goalsWithMetrics = {
      ...goals,
      weeklyHours,
      monthlyQuizzes,
      createdAt: new Date().toISOString(),
      goalId: `goal_${Date.now()}`
    };

    // Save goals to localStorage
    localStorage.setItem('studyGoals', JSON.stringify(goalsWithMetrics));
    
    toast.success('🎯 Goals set successfully! Ready to learn?');
    
    // Add a small delay for better UX
    setTimeout(() => {
      navigate('/upload');
    }, 1500);
  };

  const steps = [
    {
      title: "What do you want to learn?",
      icon: BookOpen,
      fields: ['subject']
    },
    {
      title: "Set your study schedule",
      icon: Clock,
      fields: ['dailyTime', 'weeklyTarget']
    },
    {
      title: "Choose your learning style",
      icon: TrendingUp,
      fields: ['quizzesPerDay', 'difficulty', 'studyMode']
    },
    {
      title: "Review your goals",
      icon: Target,
      fields: []
    }
  ];

  const getStudyIntensity = (dailyTime, weeklyTarget) => {
    const weeklyMinutes = dailyTime * weeklyTarget;
    if (weeklyMinutes >= 420) return { level: 'High', color: 'text-red-500' };
    if (weeklyMinutes >= 210) return { level: 'Medium', color: 'text-yellow-500' };
    return { level: 'Low', color: 'text-green-500' };
  };

  const intensity = getStudyIntensity(goals.dailyTime, goals.weeklyTarget);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        {/* Progress Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <Target className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Set Your Study Goals
          </h1>
          <p className="text-gray-600 text-lg">
            Let's create a personalized learning plan for you
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Subject */}
              {currentStep === 0 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {steps[0].title}
                    </h2>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What subject are you focusing on?
                    </label>
                    <input
                      type="text"
                      value={goals.subject}
                      onChange={(e) => updateGoal('subject', e.target.value)}
                      placeholder="e.g., Machine Learning, Calculus, World History..."
                      className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                      autoFocus
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      This will help us personalize your study materials
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Schedule */}
              {currentStep === 1 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {steps[1].title}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Daily Study Time: <span className="text-blue-600 font-bold">{goals.dailyTime} minutes</span>
                      </label>
                      <div className="space-y-4">
                        <input
                          type="range"
                          min="15"
                          max="240"
                          step="15"
                          value={goals.dailyTime}
                          onChange={(e) => updateGoal('dailyTime', parseInt(e.target.value))}
                          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-purple-500"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>15 min</span>
                          <span>4 hours</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Days per Week: <span className="text-green-600 font-bold">{goals.weeklyTarget} days</span>
                      </label>
                      <div className="grid grid-cols-7 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7].map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => updateGoal('weeklyTarget', day)}
                            className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                              goals.weeklyTarget === day
                                ? 'bg-blue-500 text-white border-blue-500 shadow-lg scale-105'
                                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center gap-2 text-sm text-blue-700">
                        <Zap className="w-4 h-4" />
                        <span className="font-semibold">Study Intensity: </span>
                        <span className={intensity.color}>{intensity.level}</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        {goals.dailyTime * goals.weeklyTarget} total minutes per week
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Learning Style */}
              {currentStep === 2 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {steps[2].title}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Daily Quizzes: <span className="text-purple-600 font-bold">{goals.quizzesPerDay}</span>
                      </label>
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => updateGoal('quizzesPerDay', Math.max(1, goals.quizzesPerDay - 1))}
                          className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center text-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                          -
                        </button>
                        <div className="flex-1 text-center">
                          <span className="text-2xl font-bold text-gray-900">{goals.quizzesPerDay}</span>
                          <p className="text-sm text-gray-500">quizzes per day</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateGoal('quizzesPerDay', Math.min(10, goals.quizzesPerDay + 1))}
                          className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center text-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {difficulties.map(diff => (
                          <button
                            key={diff.id}
                            type="button"
                            onClick={() => updateGoal('difficulty', diff.id)}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${
                              goals.difficulty === diff.id
                                ? 'border-blue-500 bg-blue-50 shadow-md scale-105'
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium text-gray-900">{diff.name}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Study Mode
                      </label>
                      <div className="space-y-3">
                        {studyModes.map(mode => (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => updateGoal('studyMode', mode.id)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                              goals.studyMode === mode.id
                                ? 'border-green-500 bg-green-50 shadow-md'
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium text-gray-900">{mode.name}</div>
                            <div className="text-sm text-gray-600">{mode.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {currentStep === 3 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Award className="w-5 h-5 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {steps[3].title}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                      <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        {goals.subject}
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="font-medium">{goals.dailyTime} min/day</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">{goals.weeklyTarget} days/week</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-purple-600" />
                            <span className="font-medium">{goals.quizzesPerDay} quizzes/day</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-orange-600" />
                            <span className="font-medium capitalize">{goals.difficulty}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-white rounded-lg border">
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">Weekly Commitment: </span>
                          {(goals.dailyTime * goals.weeklyTarget / 60).toFixed(1)} hours
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>You're all set! Ready to start your learning journey?</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  currentStep === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                Back
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                >
                  Start Learning
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6 text-sm text-gray-500"
        >
          💡 Tip: You can always adjust these goals later in settings
        </motion.div>
      </motion.div>
    </div>
  );
}

export default SetupGoals;