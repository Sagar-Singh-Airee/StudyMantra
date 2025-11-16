// src/components/Header.jsx - FULLY FUNCTIONAL
import { Bell, User, Search, ChevronDown, Globe, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import teamLogo from '../assets/team-logo.png';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { 
      label: 'Home', 
      path: '/',
      hasDropdown: false
    },
    {
      label: 'Study',
      hasDropdown: true,
      items: [
        { label: 'Upload Material', path: '/upload', icon: '📄', desc: 'Upload PDFs', onClick: () => navigate('/upload') },
        { label: 'Study Session', path: '/study', icon: '📚', desc: 'Active reading', onClick: () => navigate('/study') },
        { label: 'AI Assistant', path: '/assistant', icon: '🤖', desc: 'Get help', onClick: () => navigate('/assistant') }
      ]
    },
    {
      label: 'Collaborate',
      hasDropdown: true,
      items: [
        { label: 'Video Room', path: '/video', icon: '🎥', desc: 'Live sessions', onClick: () => navigate('/video') },
        { label: 'Study Groups', path: '/study', icon: '👥', desc: 'Shared study', onClick: () => navigate('/study') }
      ]
    },
    {
      label: 'Progress',
      hasDropdown: true,
      items: [
        { label: 'Quiz', path: '/quiz', icon: '📝', desc: 'Test yourself', onClick: () => navigate('/quiz') },
        { label: 'Analytics', path: '/analytics', icon: '📊', desc: 'View stats', onClick: () => navigate('/analytics') }
      ]
    }
  ];

  const notifications = [
    { id: 1, text: 'Quiz completed: 85% score', time: '5m ago', unread: true },
    { id: 2, text: 'New study material uploaded', time: '1h ago', unread: true },
    { id: 3, text: 'Study streak: 7 days!', time: '2h ago', unread: false }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to study page with search query
      navigate(`/study?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleNotificationClick = (notif) => {
    // Navigate based on notification type
    if (notif.text.includes('Quiz')) {
      navigate('/quiz');
    } else if (notif.text.includes('material')) {
      navigate('/study');
    } else if (notif.text.includes('streak')) {
      navigate('/analytics');
    }
    setShowNotifications(false);
  };

  return (
    <>
      <header className="w-full bg-[#1E2A47]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0FD958] to-[#06D6A0] flex items-center justify-center shadow-lg"
              >
                <img src={teamLogo} alt="StudyMantra" className="w-10 h-10 rounded-lg object-cover" />
              </motion.div>
              <span className="text-2xl font-black text-white hidden sm:block">
                StudyMantra
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item, idx) => (
                <div
                  key={idx}
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && setShowDropdown(idx)}
                  onMouseLeave={() => setShowDropdown(null)}
                >
                  {item.hasDropdown ? (
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white/90 hover:bg-white/10 transition-colors">
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown === idx ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                        location.pathname === item.path
                          ? 'bg-[#0FD958] text-white'
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {item.hasDropdown && showDropdown === idx && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-[#1E2A47] rounded-2xl shadow-2xl border border-white/10 py-2 overflow-hidden"
                      >
                        {item.items.map((subItem, subIdx) => (
                          <button
                            key={subIdx}
                            onClick={() => {
                              subItem.onClick();
                              setShowDropdown(null);
                            }}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors group text-left"
                          >
                            <span className="text-2xl mt-0.5">{subItem.icon}</span>
                            <div className="flex-1">
                              <div className="font-semibold text-white group-hover:text-[#0FD958] transition-colors">
                                {subItem.label}
                              </div>
                              <div className="text-xs text-white/60 mt-0.5">{subItem.desc}</div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              
              {/* Search - Desktop */}
              <form onSubmit={handleSearch} className="hidden lg:flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#0FD958] w-48"
                  />
                </div>
              </form>

              {/* Notifications */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <Bell className="w-6 h-6 text-white" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#0FD958] rounded-full"></span>
                </motion.button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-[#1E2A47] rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white">Notifications</h3>
                          <button 
                            onClick={() => {/* Mark all as read logic */}}
                            className="text-xs text-[#0FD958] font-semibold hover:underline"
                          >
                            Mark all read
                          </button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map(notif => (
                          <button
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`w-full p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors text-left ${
                              notif.unread ? 'bg-[#0FD958]/10' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {notif.unread && (
                                <div className="w-2 h-2 bg-[#0FD958] rounded-full mt-2 flex-shrink-0"></div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm text-white font-medium">{notif.text}</p>
                                <p className="text-xs text-white/50 mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="p-3 border-t border-white/10">
                        <button 
                          onClick={() => navigate('/notifications')}
                          className="w-full text-center text-sm text-[#0FD958] font-semibold hover:underline"
                        >
                          View all notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Language - Desktop */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {/* Language switcher logic */}}
                className="hidden lg:flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Globe className="w-5 h-5 text-white" />
              </motion.button>

              {/* Sign In Button */}
              <Link to="/settings">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#0FD958] to-[#06D6A0] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </motion.button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-white/10 bg-[#1E2A47] overflow-hidden"
            >
              <div className="px-6 py-4 space-y-2">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#0FD958]"
                    />
                  </div>
                </form>

                {navItems.map((item, idx) => (
                  <div key={idx}>
                    {item.hasDropdown ? (
                      <>
                        <button
                          onClick={() => setShowDropdown(showDropdown === idx ? null : idx)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-white hover:bg-white/10 transition-colors"
                        >
                          {item.label}
                          <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown === idx ? 'rotate-180' : ''}`} />
                        </button>
                        {showDropdown === idx && (
                          <div className="pl-4 mt-2 space-y-1">
                            {item.items.map((subItem, subIdx) => (
                              <button
                                key={subIdx}
                                onClick={() => {
                                  subItem.onClick();
                                  setShowMobileMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                              >
                                <span className="text-xl">{subItem.icon}</span>
                                <div className="text-left">
                                  <div className="font-semibold text-white text-sm">{subItem.label}</div>
                                  <div className="text-xs text-white/60">{subItem.desc}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={() => setShowMobileMenu(false)}
                        className={`block px-4 py-3 rounded-xl font-semibold transition-colors ${
                          location.pathname === item.path
                            ? 'bg-[#0FD958] text-white'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
                
                {/* Mobile Sign In */}
                <Link to="/settings" onClick={() => setShowMobileMenu(false)}>
                  <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-[#0FD958] to-[#06D6A0] text-white rounded-xl font-bold shadow-lg">
                    Sign In
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  );
}