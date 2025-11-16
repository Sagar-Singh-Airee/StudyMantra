// src/App.jsx - UPDATED (No Sidebar)
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { StudySessionProvider } from './context/StudySessionContext';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Header from './components/Header';

// Pages
import Home from './pages/Home';
import SetupGoals from './pages/SetupGoals';
import UploadPDF from './pages/UploadPDF';
import StudySession from './pages/StudySession';
import Quiz from './pages/Quiz';
import Analytics from './pages/Analytics';
import VideoRoom from './pages/VideoRoom';
import AssistantPage from './pages/AssistantPage';
import JoinRoom from './pages/JoinRoom';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <StudySessionProvider>
        <Router>

          {/* Toast Notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />

          {/* Main Layout - NO SIDEBAR */}
          <div className="min-h-screen bg-gradient-to-br from-[#0F1C3F] via-[#1A2642] to-[#2D3E6F]">

            {/* Header */}
            <Header />

            {/* Page Content */}
            <main className="container mx-auto px-4 py-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/setup" element={<SetupGoals />} />
                <Route path="/upload" element={<UploadPDF />} />
                <Route path="/study" element={<StudySession />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/video" element={<VideoRoom />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/join/:roomId" element={<JoinRoom />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>

          </div>

        </Router>
      </StudySessionProvider>
    </AuthProvider>
  );
}

export default App;