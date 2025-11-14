// src/components/SharedNotes.jsx
import { MessageSquare, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SharedNotes({ notes, participants }) {
  const getParticipantName = (id) => {
    const participant = participants.find(p => p.id === id);
    return participant?.name || 'Unknown';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="flex-1 border-t border-gray-100 p-4 overflow-y-auto">
      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <MessageSquare className="w-4 h-4" />
        Shared Notes ({notes.length})
      </h3>

      <div className="space-y-3">
        {notes.map((note, index) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-3 bg-blue-50 border border-blue-100 rounded-xl"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="text-xs font-semibold text-blue-700">
                  {note.creatorName || getParticipantName(note.creatorId)}
                </div>
                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {formatTime(note.createdAt)}
                </div>
              </div>
              <div className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                Para {note.paraIndex + 1}
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {note.text}
            </p>
          </motion.div>
        ))}

        {notes.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No notes yet</p>
            <p className="text-xs mt-1">Add notes to share with everyone</p>
          </div>
        )}
      </div>
    </div>
  );
}