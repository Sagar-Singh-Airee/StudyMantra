import PageWrapper from "../components/PageWrapper";

export default function About() {
  return (
    <PageWrapper>
      <div className="card p-8 shadow-lg max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-4 text-[var(--google-blue)]">
          StudyMantra × Agora
        </h1>

        <p className="text-gray-300 mb-4">
          StudyMantra is an AI-powered smart study platform that enables 
          students to upload study materials, generate quizzes automatically, 
          track progress, and collaborate in real-time using Agora RTC.
        </p>

        <h2 className="text-xl font-bold mt-6 mb-2">🚀 Key Features</h2>
        <ul className="text-gray-300 list-disc ml-6 space-y-1">
          <li>AI-generated quizzes from any PDF</li>
          <li>Smart analytics dashboard</li>
          <li>Focus timer with tracking</li>
          <li>Agora-powered real-time study rooms</li>
          <li>Beautiful dashboard UI inspired by Google</li>
        </ul>

        <h2 className="text-xl font-bold mt-6 mb-2">🧠 Why Agora?</h2>
        <p className="text-gray-300">
          Agora enables us to deliver real-time collaborative learning.  
          Students can study together, discuss, share ideas, and make 
          learning more interactive & engaging.
        </p>

        <h2 className="text-xl font-bold mt-6 mb-2">👨‍💻 Built With</h2>
        <ul className="text-gray-300 list-disc ml-6 space-y-1">
          <li>React + Vite</li>
          <li>TailwindCSS</li>
          <li>Agora RTC SDK</li>
          <li>Framer Motion</li>
          <li>PDF.js</li>
          <li>Custom AI Quiz Generator</li>
        </ul>
      </div>
    </PageWrapper>
  );
}
