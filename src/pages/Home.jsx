import { useNavigate } from 'react-router-dom';
import { BookOpen, Brain, Trophy, Users } from 'lucide-react';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-white mb-4">
            📚 StudyMantra
          </h1>
          <p className="text-xl text-white/80">
            Your AI-Powered Study Companion
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <FeatureCard 
            icon={<Brain className="w-8 h-8" />}
            title="AI Quizzes"
            description="Generate smart quizzes from your PDFs"
          />
          <FeatureCard 
            icon={<Trophy className="w-8 h-8" />}
            title="Track Progress"
            description="Visual analytics of your learning journey"
          />
          <FeatureCard 
            icon={<BookOpen className="w-8 h-8" />}
            title="Study Sessions"
            description="Focused study time with Pomodoro timer"
          />
          <FeatureCard 
            icon={<Users className="w-8 h-8" />}
            title="Collaborate"
            description="Study with friends in real-time"
          />
        </div>

        <button
          onClick={() => navigate('/setup')}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-transform"
        >
          Start Learning 🚀
        </button>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
      <div className="mb-3">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </div>
  );
}

export default Home;