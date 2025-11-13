import { createContext, useContext, useState, useEffect } from 'react';

const StudySessionContext = createContext();

export function StudySessionProvider({ children }) {
  const [studyData, setStudyData] = useState(() => {
    const saved = localStorage.getItem('studyData');
    return saved ? JSON.parse(saved) : {
      quizHistory: [],
      totalStudyTime: 0,
      completedQuizzes: 0,
      averageScore: 0,
      currentStreak: 0,
      studyMaterial: '',
      pdfFileName: '',
    };
  });

  // Save to localStorage whenever studyData changes
  useEffect(() => {
    localStorage.setItem('studyData', JSON.stringify(studyData));
  }, [studyData]);

  const addQuizResult = (result) => {
    setStudyData(prev => {
      const newHistory = [...prev.quizHistory, result];
      const totalScore = newHistory.reduce((sum, quiz) => sum + quiz.score, 0);
      const avgScore = totalScore / newHistory.length;

      return {
        ...prev,
        quizHistory: newHistory,
        completedQuizzes: newHistory.length,
        averageScore: Math.round(avgScore),
      };
    });
  };

  const addStudyTime = (minutes) => {
    setStudyData(prev => ({
      ...prev,
      totalStudyTime: prev.totalStudyTime + minutes,
    }));
  };

  const setMaterial = (text, fileName) => {
    setStudyData(prev => ({
      ...prev,
      studyMaterial: text,
      pdfFileName: fileName,
    }));
  };

  const resetData = () => {
    setStudyData({
      quizHistory: [],
      totalStudyTime: 0,
      completedQuizzes: 0,
      averageScore: 0,
      currentStreak: 0,
      studyMaterial: '',
      pdfFileName: '',
    });
    localStorage.removeItem('studyData');
  };

  return (
    <StudySessionContext.Provider value={{
      studyData,
      addQuizResult,
      addStudyTime,
      setMaterial,
      resetData,
    }}>
      {children}
    </StudySessionContext.Provider>
  );
}

export function useStudySession() {
  const context = useContext(StudySessionContext);
  if (!context) {
    throw new Error('useStudySession must be used within StudySessionProvider');
  }
  return context;
}