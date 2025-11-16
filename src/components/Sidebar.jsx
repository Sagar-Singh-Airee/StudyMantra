// src/components/Sidebar.jsx - COMPLETE TEMPLATE REDESIGN
import { Link, useLocation } from 'react-router-dom';
import { Home, UploadCloud, BookOpen, BarChart2, Video, Settings, Sparkles, Trophy, MessageSquare, Brain, ChevronRight, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import teamLogo from '../assets/team-logo.png';
import agoraLogo from '../assets/agora-logo.png';

export default function Sidebar() {
  const { pathname } = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);
  
  const navItems = [
    { to: '/', icon: Home, label: 'Home', badge: null, color: 'from-blue-500 to-cyan-500' },
    { to: '/upload', icon: UploadCloud, label: 'Upload Material', badge: null, color: 'from-purple-500 to-pink-500' },
    { to: '/study', icon: BookOpen, label: 'Study Session', badge: null, color: 'from-green-500 to-emerald-500' },
    { to: '/video', icon: Video, label: 'Video Room', badge: 'Live', color: 'from-red-500 to-orange-500' },
    { to: '/quiz', icon: Brain, label: 'Quiz', badge: null, color: 'from-indigo-500 to-purple-500' },
    { to: '/analytics', icon: BarChart2, label: 'Analytics', badge: null, color: 'from-orange-500 to-yellow-500' },
    { to: '/assistant', icon: MessageSquare, label: 'AI Assistant', badge: 'AI', color: 'from-pink-500 to-rose-500' },
  ];

  const quickStats = [
    { icon: Trophy, label: 'Rank', value: '#12', color: 'text-yellow-400' },
    { icon: Zap, label: 'Streak', value: '7', color: 'text-green-400' },
    { icon: Target, label: 'Points', value: '2.4K', color: 'text-blue-400' }
  ];

  const NavItem = ({ to, icon: Icon, label, badge, color }) => {
    const active = pathname === to;
    const isHovered = hoveredItem === to;
    
    return (
      <Link
        to={to}
        onMouseEnter={() => setHoveredItem(to)}
        onMouseLeave={() => setHoveredItem(null)}
        className="relative group block"
      >
        <motion.div
          initial={false}
          animate={{
            x: active || isHovered ? 8 : 0,
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
          {active && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute left-0 w-1 h-12 bg-white rounded-r-full"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
          
          {/* Icon with gradient background */}
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
            active ? `bg-gradient-to-br ${color}` : 'bg-white/10'
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
              className={`px-2 py-1 text-xs font-bold rounded-full ${
                badge === 'Live' 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : badge === 'AI'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-white/20 text-white'
              }`}
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
    <aside className="w-80 min-h-screen bg-gradient-to-b from-[#0F1C3F] via-[#1A2642] to-[#2D3E6F] text-white p-6 hidden lg:flex flex-col relative overflow-hidden">
      
      {/* Animated Background Blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#0FD958]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#06D6A0]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Brand Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl flex items-center justify-center overflow-hidden border-2 border-white/30"
            >
              <img src={teamLogo} alt="Team Logo" className="w-12 h-12 rounded-lg object-cover" />
            </motion.div>
            <div>
              <div className="text-2xl font-black flex items-center gap-2">
                StudyMantra
                <Sparkles className="w-5 h-5 text-[#FFD166]" />
              </div>
              <div className="text-sm text-white/70 font-medium">AI-Powered Learning</div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            {quickStats.map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05, y: -4 }}
                className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-center cursor-pointer"
              >
                <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                <div className="text-xs text-white/70 mb-1">{stat.label}</div>
                <div className="text-lg font-bold">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-2 flex-1 overflow-y-auto custom-scrollbar"
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
          
          {/* Separator */}
          <div className="my-4 h-px bg-white/10" />
          
          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: navItems.length * 0.05 }}
          >
            <NavItem to="/settings" icon={Settings} label="Settings" color="from-gray-500 to-gray-700" />
          </motion.div>
        </motion.nav>
        
        {/* Agora Branding */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-auto pt-6"
        >
          <div className="text-xs text-white/50 mb-3 font-medium uppercase tracking-wider">Powered by</div>
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="flex items-center gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 cursor-pointer group"
          >
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
              <img src={agoraLogo} alt="Agora" className="w-14 object-contain" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-white group-hover:text-[#0FD958] transition-colors">Agora</div>
              <div className="text-xs text-white/70">Real-time SDK</div>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-[#0FD958] rounded-full animate-pulse" />
                <span className="text-xs text-[#0FD958] font-medium">Active</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
          </motion.div>
          
          {/* Version Info */}
          <div className="mt-4 text-center">
            <div className="text-xs text-white/30 mb-2">
              Version 1.0.0 • Hackathon Build
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-white/40">
              <span>Made with</span>
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                className="text-red-400"
              >
                ❤️
              </motion.span>
              <span>for students</span>
            </div>
          </div>
        </motion.div>
        
      </div>
    </aside>
  );
}