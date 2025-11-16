// src/components/Header.jsx - ENHANCED VERSION
import { Bell, User, Search, ChevronDown, Globe, Menu, X, LogOut, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import teamLogo from '../assets/team-logo.png';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Assuming you have auth context
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Enhanced navigation structure
  const navItems = [
    { 
      label: 'Home', 
      path: '/',
      hasDropdown: false,
      icon: '🏠'
    },
    {
      label: 'Study',
      hasDropdown: true,
      icon: '📖',
      items: [
        { 
          label: 'Upload Material', 
          path: '/upload', 
          icon: '📄', 
          desc: 'Upload PDFs & Documents',
          badge: 'New',
          onClick: () => navigate('/upload')
        },
        { 
          label: 'Study Session', 
          path: '/study', 
          icon: '📚', 
          desc: 'Active reading mode',
          onClick: () => navigate('/study')
        },
        { 
          label: 'AI Assistant', 
          path: '/assistant', 
          icon: '🤖', 
          desc: '24/7 Learning support',
          onClick: () => navigate('/assistant')
        },
        { 
          label: 'Flashcards', 
          path: '/flashcards', 
          icon: '🎴', 
          desc: 'Create & review cards',
          onClick: () => navigate('/flashcards')
        }
      ]
    },
    {
      label: 'Collaborate',
      hasDropdown: true,
      icon: '👥',
      items: [
        { 
          label: 'Video Room', 
          path: '/video', 
          icon: '🎥', 
          desc: 'Live study sessions',
          onClick: () => navigate('/video')
        },
        { 
          label: 'Study Groups', 
          path: '/groups', 
          icon: '👥', 
          desc: 'Join study communities',
          onClick: () => navigate('/groups')
        },
        { 
          label: 'Shared Notes', 
          path: '/shared-notes', 
          icon: '📝', 
          desc: 'Collaborative editing',
          onClick: () => navigate('/shared-notes')
        }
      ]
    },
    {
      label: 'Progress',
      hasDropdown: true,
      icon: '📊',
      items: [
        { 
          label: 'Quizzes', 
          path: '/quiz', 
          icon: '📝', 
          desc: 'Test your knowledge',
          onClick: () => navigate('/quiz')
        },
        { 
          label: 'Analytics', 
          path: '/analytics', 
          icon: '📈', 
          desc: 'Detailed insights',
          onClick: () => navigate('/analytics')
        },
        { 
          label: 'Achievements', 
          path: '/achievements', 
          icon: '🏆', 
          desc: 'Your learning journey',
          onClick: () => navigate('/achievements')
        }
      ]
    }
  ];

  // Enhanced notifications with real data structure
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      text: 'Quiz completed: 85% score in Biology', 
      time: '5m ago', 
      unread: true,
      type: 'quiz',
      action: '/quiz/results/1'
    },
    { 
      id: 2, 
      text: 'New study material uploaded: Chemistry Notes', 
      time: '1h ago', 
      unread: true,
      type: 'material',
      action: '/study?material=chem-notes'
    },
    { 
      id: 3, 
      text: 'Study streak: 7 days! Keep going!', 
      time: '2h ago', 
      unread: false,
      type: 'achievement',
      action: '/achievements'
    },
    { 
      id: 4, 
      text: 'Study group session starting in 30 minutes', 
      time: '3h ago', 
      unread: false,
      type: 'reminder',
      action: '/video/group-123'
    }
  ]);

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Enhanced search with debouncing
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/study?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  }, [searchQuery, navigate]);

  // Enhanced notification handling
  const handleNotificationClick = useCallback((notification) => {
    // Mark as read
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notification.id ? { ...notif, unread: false } : notif
      )
    );
    
    // Navigate based on notification type
    navigate(notification.action);
    setIsNotificationsOpen(false);
  }, [navigate]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, unread: false })));
    setUnreadCount(0);
  }, []);

  // Update unread count when notifications change
  useEffect(() => {
    const unread = notifications.filter(notif => notif.unread).length;
    setUnreadCount(unread);
  }, [notifications]);

  // User menu options
  const userMenuItems = [
    { label: 'Profile', path: '/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Logout', action: logout, icon: LogOut }
  ];

  return (
    <>
      <header 
        className={`w-full bg-[#1E2A47]/95 backdrop-blur-md border-b transition-all duration-300 sticky top-0 z-50 shadow-lg ${
          scrolled 
            ? 'border-white/20 shadow-2xl' 
            : 'border-white/10 shadow-lg'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo Section */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#0FD958] to-[#06D6A0] flex items-center justify-center shadow-lg group-hover:shadow-xl"
              >
                <img 
                  src={teamLogo} 
                  alt="StudyMantra" 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover"
                />
              </motion.div>
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xl sm:text-2xl font-black text-white hidden sm:block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
              >
                StudyMantra
              </motion.span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
              {navItems.map((item, index) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.hasDropdown && setActiveDropdown(index)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  {item.hasDropdown ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white/90 hover:bg-white/10 transition-all duration-200"
                    >
                      <span className="text-sm mr-1">{item.icon}</span>
                      {item.label}
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          activeDropdown === index ? 'rotate-180' : ''
                        }`} 
                      />
                    </motion.button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                        location.pathname === item.path
                          ? 'bg-[#0FD958] text-white shadow-lg'
                          : 'text-white/90 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className="text-sm">{item.icon}</span>
                      {item.label}
                    </Link>
                  )}

                  {/* Enhanced Dropdown Menu */}
                  <AnimatePresence>
                    {item.hasDropdown && activeDropdown === index && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-72 bg-[#1E2A47] rounded-2xl shadow-2xl border border-white/10 backdrop-blur-lg overflow-hidden z-50"
                      >
                        <div className="p-2">
                          {item.items.map((subItem, subIndex) => (
                            <motion.button
                              key={subIndex}
                              whileHover={{ scale: 1.02, x: 4 }}
                              onClick={() => {
                                subItem.onClick();
                                setActiveDropdown(null);
                              }}
                              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all duration-200 group text-left"
                            >
                              <span className="text-2xl mt-0.5 flex-shrink-0">{subItem.icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <div className="font-semibold text-white group-hover:text-[#0FD958] transition-colors truncate">
                                    {subItem.label}
                                  </div>
                                  {subItem.badge && (
                                    <span className="px-1.5 py-0.5 text-xs bg-[#0FD958] text-white rounded-full font-bold">
                                      {subItem.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-white/60 mt-0.5 truncate">
                                  {subItem.desc}
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Enhanced Search */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <div className="relative">
                  <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <motion.input
                    whileFocus={{ width: 280 }}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search notes, quizzes, materials..."
                    className="pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#0FD958] w-48 transition-all duration-300"
                  />
                </div>
              </form>

              {/* Enhanced Notifications */}
              <div className="relative" ref={notificationsRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 rounded-xl hover:bg-white/10 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0FD958] rounded-full"
                    />
                  )}
                </motion.button>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1E2A47] rounded-2xl shadow-2xl border border-white/10 backdrop-blur-lg overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white text-lg">Notifications</h3>
                          {unreadCount > 0 && (
                            <button 
                              onClick={markAllAsRead}
                              className="text-sm text-[#0FD958] font-semibold hover:underline transition-colors"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(notification => (
                            <motion.button
                              key={notification.id}
                              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                              onClick={() => handleNotificationClick(notification)}
                              className={`w-full p-4 border-b border-white/5 cursor-pointer transition-all text-left ${
                                notification.unread ? 'bg-[#0FD958]/10' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                  notification.unread ? 'bg-[#0FD958]' : 'bg-transparent'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white font-medium leading-relaxed">
                                    {notification.text}
                                  </p>
                                  <p className="text-xs text-white/50 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </motion.button>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
                            <p className="text-white/60 text-sm">No notifications yet</p>
                          </div>
                        )}
                      </div>
                      <div className="p-3 border-t border-white/10 bg-white/5">
                        <button 
                          onClick={() => {
                            navigate('/notifications');
                            setIsNotificationsOpen(false);
                          }}
                          className="w-full text-center text-sm text-[#0FD958] font-semibold hover:underline transition-colors"
                        >
                          View all notifications
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveDropdown('user')}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#0FD958] to-[#06D6A0] rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-medium hidden sm:block text-sm">
                    {user?.name || 'Account'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-white/60" />
                </motion.button>

                <AnimatePresence>
                  {activeDropdown === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-[#1E2A47] rounded-xl shadow-2xl border border-white/10 backdrop-blur-lg overflow-hidden z-50"
                    >
                      {userMenuItems.map((item, index) => (
                        item.action ? (
                          <button
                            key={item.label}
                            onClick={item.action}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left text-white"
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </button>
                        ) : (
                          <Link
                            key={item.label}
                            to={item.path}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-white"
                          >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        )
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileMenuRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-white/10 bg-[#1E2A47]/95 backdrop-blur-md overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#0FD958]"
                    />
                  </div>
                </form>

                {navItems.map((item, index) => (
                  <div key={item.label}>
                    {item.hasDropdown ? (
                      <>
                        <button
                          onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-white hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{item.icon}</span>
                            {item.label}
                          </div>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                            activeDropdown === index ? 'rotate-180' : ''
                          }`} />
                        </button>
                        <AnimatePresence>
                          {activeDropdown === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pl-6 mt-1 space-y-1 overflow-hidden"
                            >
                              {item.items.map((subItem, subIndex) => (
                                <button
                                  key={subIndex}
                                  onClick={() => {
                                    subItem.onClick();
                                    setIsMobileMenuOpen(false);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
                                >
                                  <span className="text-xl">{subItem.icon}</span>
                                  <div className="text-left">
                                    <div className="font-semibold text-white text-sm">
                                      {subItem.label}
                                    </div>
                                    <div className="text-xs text-white/60">
                                      {subItem.desc}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : (
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-colors ${
                          location.pathname === item.path
                            ? 'bg-[#0FD958] text-white'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        <span className="text-sm">{item.icon}</span>
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Enhanced Overlay for dropdowns */}
      <AnimatePresence>
        {(activeDropdown !== null || isNotificationsOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={() => {
              setActiveDropdown(null);
              setIsNotificationsOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}