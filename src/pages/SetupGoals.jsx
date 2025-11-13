import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function SetupGoals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState({
    dailyTime: 60,
    quizzesPerDay: 3,
    subject: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!goals.subject) {
      toast.error('Please enter a subject!');
      return;
    }

    // Save goals to localStorage
    localStorage.setItem('studyGoals', JSON.stringify(goals));
    toast.success('Goals saved! Let\'s upload your study material.');
    navigate('/upload');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          🎯 Set Your Study Goals
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Subject Name
            </label>
            <input
              type="text"
              value={goals.subject}
              onChange={(e) => setGoals({...goals, subject: e.target.value})}
              placeholder="e.g., Physics, Math, History"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Daily Study Time (minutes)
            </label>
            <input
              type="number"
              value={goals.dailyTime}
              onChange={(e) => setGoals({...goals, dailyTime: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Quizzes Per Day
            </label>
            <input
              type="number"
              value={goals.quizzesPerDay}
              onChange={(e) => setGoals({...goals, quizzesPerDay: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Continue →
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetupGoals;