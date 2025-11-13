// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { Home, UploadCloud, BookOpen, BarChart2, Video, Settings } from 'lucide-react';

// Import your images
import teamLogo from '../assets/team-logo.png';
import agoraLogo from '../assets/agora-logo.png';

export default function Sidebar() {
  const { pathname } = useLocation();

  const NavItem = ({ to, icon, label }) => {
    const active = pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition 
        ${active ? 'bg-white/20 font-semibold' : 'hover:bg-white/5'}`}
      >
        <span className="text-white/90">{icon}</span>
        <span className="text-white">{label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-indigo-700 to-indigo-600 text-white min-h-screen p-6 hidden lg:block">
      
      {/* Top Brand Section */}
      <div className="flex items-center gap-3 mb-6">
        <img src={teamLogo} alt="Team Logo" className="w-10 h-10 rounded-md object-cover" />
        <div>
          <div className="text-lg font-bold">StudyMantra</div>
          <div className="text-sm text-white/80">Hackathon Build</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        <NavItem to="/" icon={<Home className="w-5 h-5" />} label="Home" />
        <NavItem to="/upload" icon={<UploadCloud className="w-5 h-5" />} label="Upload Material" />
        <NavItem to="/study" icon={<BookOpen className="w-5 h-5" />} label="Study Session" />
        <NavItem to="/video" icon={<Video className="w-5 h-5" />} label="Video Room" />
        <NavItem to="/quiz" icon={<BookOpen className="w-5 h-5" />} label="Quiz" />
        <NavItem to="/analytics" icon={<BarChart2 className="w-5 h-5" />} label="Analytics" />
        <NavItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" />
      </nav>

      {/* Agora Branding */}
      <div className="mt-auto pt-6">
        <div className="text-xs text-white/80 mb-3">Powered by</div>

        <div className="flex items-center justify-between gap-3 bg-white/10 p-3 rounded-lg">
          <img src={agoraLogo} alt="Agora" className="w-20 object-contain" />
          <div>
            <div className="text-sm font-semibold">Agora</div>
            <div className="text-xs text-white/80">Realtime SDK</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
