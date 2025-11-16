// src/components/Header.jsx - COMPLETE TEMPLATE REDESIGN
import { Bell, User, Search, ChevronDown, Globe, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import teamLogo from '../assets/team-logo.png';

export default function Header() {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
        { label: 'Upload Material', path: '/upload', icon: '📄', desc: 'Upload PDFs' },
        { label: 'Study Session', path: '/study', icon: '📚', desc: 'Active reading' },
        { label: 'AI Assistant', path: '/assistant', icon: '🤖', desc: 'Get help' }
      ]
    },
    {
      label: 'Collaborate',
      hasDropdown: true,
      items: [
        { label: 'Video Room', path: '/video', icon: '🎥', desc: 'Live sessions' },
        { label: 'Study Groups', path: '/study', icon: '👥', desc: 'Shared study' }
      ]
    },
    {
      label: 'Progress',
      hasDropdown: true,
      items: [
        { label: 'Quiz', path: '/quiz', icon: '📝', desc: 'Test yourself' },
        { label: 'Analytics', path: '/analytics', icon: '📊', desc: 'View stats' }
      ]
    }
  ];

  const notifications = [
    { id: 1, text: 'Quiz completed: 85% score', time: '5m ago', unread: true },
    { id: 2, text: 'New study material uploaded', time: '1h ago', unread: true },
    { id: 3, text: 'Study streak: 7 days!', time: '2h ago', unread: false }
  ];

  return (
    <>
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg"
              >
                <img src={teamLogo} alt="StudyMantra" className="w-10 h-10 rounded-lg object-cover" />
              </motion.div>
              <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
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
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                      {item.label}
                      <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown === idx ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                        location.pathname === item.path
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:bg-gray-100'
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
                        className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden"
                      >
                        {item.items.map((subItem, subIdx) => (
                          <Link
                            key={subIdx}
                            to={subItem.path}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
                          >
                            <span className="text-2xl mt-0.5">{subItem.icon}</span>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {subItem.label}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5">{subItem.desc}</div>
                            </div>
                          </Link>
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <Search className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600">Search...</span>
              </motion.button>

              {/* Notifications */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Bell className="w-6 h-6 text-gray-700" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </motion.button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-gray-900">Notifications</h3>
                          <button className="text-xs text-blue-600 font-semibold">Mark all read</button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map(notif => (
                          <div
                            key={notif.id}
                            className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                              notif.unread ? 'bg-blue-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              {notif.unread && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 font-medium">{notif.text}</p>
                                <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t border-gray-100">
                        <button className="w-full text-center text-sm text-blue-600 font-semibold hover:text-blue-700">
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
                className="hidden lg:flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Globe className="w-5 h-5 text-gray-700" />
              </motion.button>

              {/* Sign In Button */}
              <Link to="/settings">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hidden sm:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  <User className="w-4 h-4" />
                  Signin
                </motion.button>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6 text-gray-700" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-700" />
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
              className="md:hidden border-t border-gray-100 bg-white overflow-hidden"
            >
              <div className="px-6 py-4 space-y-2">
                {navItems.map((item, idx) => (
                  <div key={idx}>
                    {item.hasDropdown ? (
                      <>
                        <button
                          onClick={() => setShowDropdown(showDropdown === idx ? null : idx)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          {item.label}
                          <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown === idx ? 'rotate-180' : ''}`} />
                        </button>
                        {showDropdown === idx && (
                          <div className="pl-4 mt-2 space-y-1">
                            {item.items.map((subItem, subIdx) => (
                              <Link
                                key={subIdx}
                                to={subItem.path}
                                onClick={() => setShowMobileMenu(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                              >
                                <span className="text-xl">{subItem.icon}</span>
                                <div>
                                  <div className="font-semibold text-gray-900 text-sm">{subItem.label}</div>
                                  <div className="text-xs text-gray-500">{subItem.desc}</div>
                                </div>
                              </Link>
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
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
                
                {/* Mobile Sign In */}
                <Link to="/settings" onClick={() => setShowMobileMenu(false)}>
                  <button className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg">
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