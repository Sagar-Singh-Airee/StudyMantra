import jsPDF from 'jspdf';
import 'jspdf-autotable';

export function exportStudyReport(studyData) {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246);
  doc.text('StudyMantra Report', 20, 20);
  
  // Date
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
  
  // Summary Section
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text('Study Summary', 20, 45);
  
  doc.setFontSize(12);
  doc.text(`Total Quizzes Completed: ${studyData.completedQuizzes}`, 20, 55);
  doc.text(`Average Score: ${studyData.averageScore}%`, 20, 65);
  doc.text(`Total Study Time: ${studyData.totalStudyTime} minutes`, 20, 75);
  doc.text(`Current Streak: ${studyData.currentStreak} days`, 20, 85);
  
  // Quiz History Table
  if (studyData.quizHistory.length > 0) {
    doc.text('Quiz History', 20, 100);
    
    const tableData = studyData.quizHistory.slice(-10).map((quiz, index) => [
      index + 1,
      new Date(quiz.date).toLocaleDateString(),
      `${quiz.score}%`,
      `${quiz.correctAnswers}/${quiz.totalQuestions}`,
    ]);
    
    doc.autoTable({
      startY: 105,
      head: [['#', 'Date', 'Score', 'Correct/Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
    });
  }
  
  // Performance Insights
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 120;
  doc.setFontSize(16);
  doc.text('Performance Insights', 20, finalY + 10);
  
  doc.setFontSize(12);
  const avgScore = studyData.averageScore;
  let insight = '';
  
  if (avgScore >= 80) {
    insight = '🎉 Excellent performance! Keep up the great work!';
  } else if (avgScore >= 60) {
    insight = '👍 Good progress! Focus on weak areas to improve.';
  } else {
    insight = '💪 Keep practicing! Consistency is key to improvement.';
  }
  
  doc.text(insight, 20, finalY + 20);
  
  // Save
  doc.save('StudyMantra-Report.pdf');
}