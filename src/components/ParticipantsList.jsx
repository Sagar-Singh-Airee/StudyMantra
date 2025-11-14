// src/components/ParticipantsList.jsx
import { Crown, Volume2, User, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function ParticipantsList({ 
  participants, 
  presenter, 
  isHost, 
  currentUser,
  onSetPresenter 
}) {
  const [activeMenu, setActiveMenu] = useState(null);

  const isPresenter = (userId) => userId === presenter;
  const isCurrentUser = (userId) => userId === currentUser.id;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <User className="w-4 h-4" />
        Participants ({participants.length})
      </h3>

      <div className="space-y-2">
        {participants.map((participant, index) => (
          <motion.div
            key={participant.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-3 rounded-xl border-2 transition-all ${
              isPresenter(participant.id)
                ? 'bg-purple-50 border-purple-200'
                : 'bg-white border-gray-100 hover:border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  isPresenter(participant.id)
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                    : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                }`}>
                  {participant.name?.charAt(0)?.toUpperCase() || '?'}
                </div>

                {/* Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                      {participant.name}
                    </span>
                    {isCurrentUser(participant.id) && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                    {isPresenter(participant.id) && (
                      <Crown className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {participant.role || 'Participant'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {isHost && !isCurrentUser(participant.id) && (
                <div className="relative">
                  <button
                    onClick={() => setActiveMenu(
                      activeMenu === participant.id ? null : participant.id
                    )}
                    className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenu === participant.id && (
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[150px]">
                      <button
                        onClick={() => {
                          onSetPresenter(participant.id);
                          setActiveMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Crown className="w-4 h-4" />
                        Make Presenter
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {participants.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <User className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No participants yet</p>
          </div>
        )}
      </div>
    </div>
  );
}