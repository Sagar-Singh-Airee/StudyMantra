// src/components/Header.jsx
import { Bell, User, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import teamLogo from '../assets/team-logo.png';

export default function Header() {
  return (
    <header className="w-full bg-transparent p-4 flex items-center justify-between gap-4">
      
      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden md:flex items-center bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
      >
        <Search className="w-5 h-5 text-gray-400" />
        <input
          placeholder="Search your notes, PDFs, sessions..."
          className="bg-transparent ml-3 placeholder:text-gray-400 outline-none text-gray-700 w-64"
        />
      </motion.div>

      {/* Right Section */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3"
      >

        {/* Notifications */}
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-3 rounded-2xl hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-6 h-6 text-gray-700" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </motion.button>

        {/* Profile */}
        <Link to="/settings">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-2xl transition-colors"
          >
            <img
              src={teamLogo}
              alt="profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 shadow-md"
            />
            <span className="text-gray-800 font-semibold hidden md:block">Profile</span>
          </motion.div>
        </Link>

      </motion.div>
    </header>
  );
}