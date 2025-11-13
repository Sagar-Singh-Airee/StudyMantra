// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { StudySessionProvider } from './context/StudySessionContext';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import SetupGoals from './pages/SetupGoals';
import UploadPDF from './pages/UploadPDF';
import StudySession from './pages/StudySession';
import Quiz from './pages/Quiz';
import Analytics from './pages/Analytics';
import VideoRoom from './pages/VideoRoom'; // NEW

function App() {
  return (
    <AuthProvider>
      <StudySessionProvider>
        <Router>
          <div className="min-h-screen">
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
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/setup" element={<SetupGoals />} />
              <Route path="/upload" element={<UploadPDF />} />
              <Route path="/study" element={<StudySession />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/video" element={<VideoRoom />} /> {/* NEW */}
            </Routes>
          </div>
        </Router>
      </StudySessionProvider>
    </AuthProvider>
  );
}

export default App;
