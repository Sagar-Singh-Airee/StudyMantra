// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { StudySessionProvider } from './context/StudySessionContext';
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Home from './pages/Home';
import SetupGoals from './pages/SetupGoals';
import UploadPDF from './pages/UploadPDF';
import StudySession from './pages/StudySession';
import Quiz from './pages/Quiz';
import Analytics from './pages/Analytics';
import VideoRoom from './pages/VideoRoom';

// New/Additional Pages
import AssistantPage from './pages/AssistantPage';
import JoinRoom from './pages/JoinRoom';
import Settings from './pages/Settings'; // <-- ADDED: Settings page

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

          {/* Main Layout */}
          <div className="min-h-screen flex bg-[var(--google-bg)]">

            {/* Sidebar */}
            <Sidebar />

            {/* Main Area */}
            <div className="flex-1 p-6">
              <Header />

              {/* Page Content */}
              <main className="mt-4">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/setup" element={<SetupGoals />} />
                  <Route path="/upload" element={<UploadPDF />} />
                  <Route path="/study" element={<StudySession />} />
                  <Route path="/quiz" element={<Quiz />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/video" element={<VideoRoom />} />

                  {/* Assistant & Join Room */}
                  <Route path="/assistant" element={<AssistantPage />} />
                  <Route path="/join/:roomId" element={<JoinRoom />} />

                  {/* Settings */}
                  <Route path="/settings" element={<Settings />} />

                  {/* Optional: fallback 404 route (uncomment if you add a NotFound page) */}
                  {/* <Route path="*" element={<NotFound />} /> */}
                </Routes>
              </main>

            </div>
          </div>

        </Router>
      </StudySessionProvider>
    </AuthProvider>
  );
}

export default App;
