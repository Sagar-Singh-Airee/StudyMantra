// src/components/ParticipantsList.jsx
import { Crown, Volume2, VolumeX, User, MoreVertical, Mic, MicOff, Video, VideoOff, Mail, Phone, Shield, UserPlus, Star, Pin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

export default function ParticipantsList({ 
  participants, 
  presenter, 
  isHost, 
  currentUser,
  onSetPresenter,
  onMuteParticipant,
  onRemoveParticipant,
  onSendMessage,
  onToggleVideo,
  onPromoteToHost
}) {
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'role', 'status'
  const [expandedUser, setExpandedUser] = useState(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter and sort participants
  const filteredAndSortedParticipants = participants
    .filter(participant => 
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'role':
          return (a.role || 'Participant').localeCompare(b.role || 'Participant');
        case 'status':
          return getStatusPriority(b) - getStatusPriority(a);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const isPresenter = (userId) => userId === presenter;
  const isCurrentUser = (userId) => userId === currentUser.id;

  const getStatusPriority = (participant) => {
    if (isPresenter(participant.id)) return 4;
    if (participant.isHost) return 3;
    if (participant.isSpeaking) return 2;
    if (participant.isOnline) return 1;
    return 0;
  };

  const getStatusColor = (participant) => {
    if (!participant.isOnline) return 'bg-gray-400';
    if (participant.isSpeaking) return 'bg-green-500';
    if (isPresenter(participant.id)) return 'bg-purple-500';
    return 'bg-blue-500';
  };

  const getConnectionQuality = (participant) => {
    const quality = participant.connectionQuality || 100;
    if (quality >= 80) return 'bg-green-500';
    if (quality >= 60) return 'bg-yellow-500';
    if (quality >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const handleMenuAction = (action, participantId) => {
    switch (action) {
      case 'makePresenter':
        onSetPresenter?.(participantId);
        break;
      case 'mute':
        onMuteParticipant?.(participantId, true);
        break;
      case 'unmute':
        onMuteParticipant?.(participantId, false);
        break;
      case 'remove':
        onRemoveParticipant?.(participantId);
        break;
      case 'message':
        onSendMessage?.(participantId);
        break;
      case 'promoteToHost':
        onPromoteToHost?.(participantId);
        break;
      case 'call':
        // Handle call action
        break;
    }
    setActiveMenu(null);
  };

  const ParticipantCard = ({ participant, index }) => (
    <motion.div
      key={participant.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.03 }}
      className={`p-4 rounded-xl border-2 transition-all cursor-pointer group ${
        isPresenter(participant.id)
          ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-sm'
          : participant.isHost
          ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200'
          : 'bg-white border-gray-100 hover:border-gray-200'
      } ${expandedUser === participant.id ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => setExpandedUser(expandedUser === participant.id ? null : participant.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar with Status */}
          <div className="relative">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
              isPresenter(participant.id)
                ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                : participant.isHost
                ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                : 'bg-gradient-to-br from-gray-600 to-gray-700'
            }`}>
              {participant.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            
            {/* Status Indicator */}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(participant)}`} />
            
            {/* Connection Quality */}
            {participant.connectionQuality && (
              <div className="absolute -top-1 -right-1 flex gap-0.5">
                {[1, 2, 3].map((bar) => (
                  <div
                    key={bar}
                    className={`w-1 rounded-full ${
                      participant.connectionQuality >= bar * 33 ? getConnectionQuality(participant) : 'bg-gray-300'
                    }`}
                    style={{ height: `${bar * 2}px` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Participant Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-900 truncate">
                {participant.name}
              </span>
              
              {/* Badges */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {isCurrentUser(participant.id) && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full whitespace-nowrap">
                    You
                  </span>
                )}
                {isPresenter(participant.id) && (
                  <Crown className="w-4 h-4 text-purple-600 fill-current" />
                )}
                {participant.isHost && !isPresenter(participant.id) && (
                  <Shield className="w-4 h-4 text-blue-600" />
                )}
                {participant.isPinned && (
                  <Pin className="w-4 h-4 text-orange-500" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{participant.role || 'Participant'}</span>
              
              {/* Media Status */}
              <div className="flex items-center gap-1">
                {participant.isMuted ? (
                  <MicOff className="w-3 h-3 text-red-500" />
                ) : (
                  <Mic className="w-3 h-3 text-green-500" />
                )}
                {participant.hasVideo ? (
                  <Video className="w-3 h-3 text-green-500" />
                ) : (
                  <VideoOff className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </div>

            {/* Additional Info */}
            {expandedUser === participant.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 space-y-1 text-xs text-gray-600"
              >
                {participant.email && (
                  <div>Email: {participant.email}</div>
                )}
                {participant.department && (
                  <div>Department: {participant.department}</div>
                )}
                <div>Joined: {new Date(participant.joinTime).toLocaleDateString()}</div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Actions */}
          {isHost && !isCurrentUser(participant.id) && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMenuAction(participant.isMuted ? 'unmute' : 'mute', participant.id);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  participant.isMuted 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                }`}
              >
                {participant.isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSendMessage?.(participant.id);
                }}
                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Menu Button */}
          {(isHost || isCurrentUser(participant.id)) && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === participant.id ? null : participant.id);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {activeMenu === participant.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-20 min-w-[200px] py-2"
                  >
                    {isHost && !isCurrentUser(participant.id) && (
                      <>
                        {!isPresenter(participant.id) && (
                          <button
                            onClick={() => handleMenuAction('makePresenter', participant.id)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-3 text-gray-700"
                          >
                            <Crown className="w-4 h-4 text-purple-600" />
                            Make Presenter
                          </button>
                        )}
                        <button
                          onClick={() => handleMenuAction(participant.isMuted ? 'unmute' : 'mute', participant.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                        >
                          {participant.isMuted ? (
                            <Mic className="w-4 h-4 text-green-600" />
                          ) : (
                            <MicOff className="w-4 h-4 text-red-600" />
                          )}
                          {participant.isMuted ? 'Unmute Participant' : 'Mute Participant'}
                        </button>
                        <button
                          onClick={() => handleMenuAction('promoteToHost', participant.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                        >
                          <Shield className="w-4 h-4 text-blue-600" />
                          Make Co-host
                        </button>
                        <button
                          onClick={() => handleMenuAction('remove', participant.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-600"
                        >
                          <UserPlus className="w-4 h-4" />
                          Remove Participant
                        </button>
                      </>
                    )}
                    
                    {isCurrentUser(participant.id) && (
                      <button
                        onClick={() => handleMenuAction('message', participant.id)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                      >
                        <Mail className="w-4 h-4" />
                        View Profile
                      </button>
                    )}

                    <div className="border-t border-gray-100 my-1" />
                    
                    <button
                      onClick={() => handleMenuAction('call', participant.id)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                    >
                      <Phone className="w-4 h-4" />
                      Start Private Call
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/30">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Participants ({participants.length})
          </h3>
          
          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="role">Sort by Role</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Participants List */}
      <div className="p-4 space-y-3">
        <AnimatePresence>
          {filteredAndSortedParticipants.map((participant, index) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              index={index}
            />
          ))}
        </AnimatePresence>

        {filteredAndSortedParticipants.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 text-gray-400"
          >
            <User className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-500 mb-2">
              {searchTerm ? 'No matching participants' : 'No participants yet'}
            </p>
            <p className="text-sm">
              {searchTerm ? 'Try adjusting your search' : 'Participants will appear here when they join'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-100 bg-white/50">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span>Speaking</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full" />
            <span>Presenter</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}