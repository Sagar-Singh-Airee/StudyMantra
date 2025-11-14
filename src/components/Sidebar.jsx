// src/components/Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { Home, UploadCloud, BookOpen, BarChart2, Video, Settings, Sparkles, Trophy, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import teamLogo from '../assets/team-logo.png';
import agoraLogo from '../assets/agora-logo.png';

export default function Sidebar() {
  const { pathname } = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const navItems = [
    { to: '/', icon: Home, label: 'Home', badge: null },
    { to: '/upload', icon: UploadCloud, label: 'Upload Material', badge: null },
    { to: '/study', icon: BookOpen, label: 'Study Session', badge: null },
    { to: '/video', icon: Video, label: 'Video Room', badge: 'New' },
    { to: '/quiz', icon: BookOpen, label: 'Quiz', badge: null },
    { to: '/analytics', icon: BarChart2, label: 'Analytics', badge: null },
    { to: '/settings', icon: Settings, label: 'Settings', badge: null },
  ];

  const NavItem = ({ to, icon: Icon, label, badge }) => {
    const active = pathname === to;
    const isHovered = hoveredItem === to;

    return (
      <Link
        to={to}
        onMouseEnter={() => setHoveredItem(to)}
        onMouseLeave={() => setHoveredItem(null)}
        className="relative group"
      >
        <motion.div
          initial={false}
          animate={{
            x: active ? 4 : 0,
            scale: isHovered ? 1.02 : 1
          }}
          transition={{ duration: 0.2 }}
          className={`flex items-center gap-3 px-4 py-4 rounded-2xl transition-all ${
            active
              ? 'bg-white/20 backdrop-blur-sm shadow-lg'
              : 'hover:bg-white/10'
          }`}
        >
          {/* Active Indicator */}
          <motion.div
            initial={false}
            animate={{
              width: active ? 4 : 0,
              opacity: active ? 1 : 0
            }}
            className="absolute left-0 h-8 bg-white rounded-r-full"
          />

          {/* Icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            active ? 'bg-white/20' : 'bg-white/10'
          }`}>
            <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-white/80'}`} />
          </div>

          {/* Label */}
          <span className={`font-semibold flex-1 ${active ? 'text-white' : 'text-white/90'}`}>
            {label}
          </span>

          {/* Badge */}
          {badge && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full"
            >
              {badge}
            </motion.span>
          )}

          {/* Hover Arrow */}
          <motion.div
            initial={false}
            animate={{
              x: isHovered ? 4 : 0,
              opacity: isHovered ? 1 : 0
            }}
          >
            <ChevronRight className="w-5 h-5 text-white/60" />
          </motion.div>
        </motion.div>
      </Link>
    );
  };

  return (
    <aside className="w-80 bg-gradient-to-b from-indigo-700 via-indigo-600 to-purple-600 text-white min-h-screen p-6 hidden lg:flex flex-col relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10 flex flex-col h-full">
        {/* Brand Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl flex items-center justify-center overflow-hidden"
            >
              <img src={teamLogo} alt="Team Logo" className="w-12 h-12 rounded-lg object-cover" />
            </motion.div>
            <div>
              <div className="text-2xl font-black flex items-center gap-2">
                StudyMantra
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </div>
              <div className="text-sm text-white/80 font-medium">AI-Powered Learning</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <Trophy className="w-5 h-5 mb-2 text-yellow-300" />
              <div className="text-xs text-white/80">Rank</div>
              <div className="text-lg font-bold">#12</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20"
            >
              <Sparkles className="w-5 h-5 mb-2 text-blue-300" />
              <div className="text-xs text-white/80">Points</div>
              <div className="text-lg font-bold">2.4K</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2 flex-1"
        >
          {navItems.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <NavItem {...item} />
            </motion.div>
          ))}
        </motion.nav>

        {/* Agora Branding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-auto pt-6"
        >
          <div className="text-xs text-white/60 mb-3 font-medium">Powered by</div>

          <motion.div
            whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}
            className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 cursor-pointer"
          >
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
              <img src={agoraLogo} alt="Agora" className="w-14 object-contain" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">Agora</div>
              <div className="text-xs text-white/80">Real-time SDK</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-300 font-medium">Active</span>
              </div>
            </div>
          </motion.div>

          {/* Version Info */}
          <div className="mt-4 text-center">
            <div className="text-xs text-white/40">
              Version 1.0.0 • Hackathon Build
            </div>
          </div>
        </motion.div>
      </div>
    </aside>
  );
}