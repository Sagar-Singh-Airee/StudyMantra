// src/components/Header.jsx
import { Bell, User, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import your team profile image
import teamLogo from '../assets/team-logo.png';

export default function Header() {
  return (
    <header className="w-full bg-transparent p-4 flex items-center justify-between gap-4">
      
      {/* Search Bar */}
      <div className="hidden md:flex items-center bg-white rounded-lg px-3 py-2 shadow-md">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          placeholder="Search your notes, PDFs, sessions..."
          className="bg-transparent ml-2 placeholder:text-gray-400 outline-none text-gray-700 w-64"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {/* Notifications */}
        <button className="p-2 rounded-lg hover:bg-gray-200 transition">
          <Bell className="w-6 h-6 text-gray-700" />
        </button>

        {/* Profile */}
        <Link to="/settings" className="flex items-center gap-2 hover:bg-gray-200 p-2 rounded-lg transition">
          <img
            src={teamLogo}
            alt="profile"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-gray-700 font-medium hidden md:block">Profile</span>
        </Link>

      </div>
    </header>
  );
}
