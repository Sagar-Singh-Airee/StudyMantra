// src/components/SharedNotes.jsx
import { MessageSquare, Clock, Edit, Trash2, Pin, Search, Filter, User, Reply } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useRef } from 'react';

export default function SharedNotes({ notes, participants, currentUser, onEditNote, onDeleteNote, onReplyToNote }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUser, setFilteredUser] = useState('all');
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editText, setEditText] = useState('');
  const [replyingToNoteId, setReplyingToNoteId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const searchInputRef = useRef(null);

  // Filter and search notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = searchTerm === '' || 
        note.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (note.creatorName || getParticipantName(note.creatorId)).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesUser = filteredUser === 'all' || note.creatorId === filteredUser;
      const matchesPinned = !pinnedOnly || note.pinned;
      
      return matchesSearch && matchesUser && matchesPinned;
    });
  }, [notes, searchTerm, filteredUser, pinnedOnly]);

  const getParticipantName = (id) => {
    const participant = participants.find(p => p.id === id);
    return participant?.name || 'Unknown';
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const handleEditStart = (note) => {
    setEditingNoteId(note.id);
    setEditText(note.text);
  };

  const handleEditSave = () => {
    if (editText.trim() && onEditNote) {
      onEditNote(editingNoteId, editText.trim());
    }
    setEditingNoteId(null);
    setEditText('');
  };

  const handleEditCancel = () => {
    setEditingNoteId(null);
    setEditText('');
  };

  const handleReplyStart = (note) => {
    setReplyingToNoteId(note.id);
    setReplyText('');
  };

  const handleReplySend = () => {
    if (replyText.trim() && onReplyToNote) {
      onReplyToNote(replyingToNoteId, replyText.trim());
    }
    setReplyingToNoteId(null);
    setReplyText('');
  };

  const handleReplyCancel = () => {
    setReplyingToNoteId(null);
    setReplyText('');
  };

  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDeleteNote?.(noteId);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const getNoteColor = (creatorId) => {
    const colors = [
      'bg-blue-50 border-blue-200',
      'bg-green-50 border-green-200',
      'bg-purple-50 border-purple-200',
      'bg-orange-50 border-orange-200',
      'bg-pink-50 border-pink-200'
    ];
    const participantIndex = participants.findIndex(p => p.id === creatorId);
    return colors[participantIndex % colors.length] || 'bg-gray-50 border-gray-200';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex-1 border-t border-gray-100 p-4 overflow-y-auto bg-gray-50/30">
      {/* Header with Search and Filters */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Shared Notes ({notes.length})
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPinnedOnly(!pinnedOnly)}
              className={`p-2 rounded-lg transition-all ${
                pinnedOnly 
                  ? 'bg-yellow-100 text-yellow-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Show pinned notes only"
            >
              <Pin className={`w-4 h-4 ${pinnedOnly ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        {/* User Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setFilteredUser('all')}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filteredUser === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Filter className="w-3 h-3" />
            All
          </button>
          {participants.map(participant => (
            <button
              key={participant.id}
              onClick={() => setFilteredUser(participant.id)}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                filteredUser === participant.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <User className="w-3 h-3" />
              {participant.name}
            </button>
          ))}
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 border rounded-xl relative group ${getNoteColor(note.creatorId)} ${
                note.pinned ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              {/* Note Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(note.creatorName || getParticipantName(note.creatorId))}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {note.creatorName || getParticipantName(note.creatorId)}
                      {note.creatorId === currentUser?.id && (
                        <span className="ml-2 text-xs text-blue-600 font-normal">(You)</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(note.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {note.pinned && (
                    <Pin className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                  <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-medium">
                    Para {note.paraIndex + 1}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {note.creatorId === currentUser?.id && (
                      <>
                        <button
                          onClick={() => handleEditStart(note)}
                          className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                          title="Edit note"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleReplyStart(note)}
                      className="p-1 hover:bg-green-100 rounded text-green-600 transition-colors"
                      title="Reply to note"
                    >
                      <Reply className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Note Content */}
              {editingNoteId === note.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditSave}
                      className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {note.text}
                </p>
              )}

              {/* Replies */}
              {note.replies && note.replies.length > 0 && (
                <div className="mt-3 space-y-2">
                  {note.replies.map((reply) => (
                    <div key={reply.id} className="pl-4 border-l-2 border-gray-300">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-xs font-semibold text-gray-700">
                          {reply.creatorName || getParticipantName(reply.creatorId)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(reply.createdAt)}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {reply.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Input */}
              {replyingToNoteId === note.id && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    rows="2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleReplySend}
                      disabled={!replyText.trim()}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Send
                    </button>
                    <button
                      onClick={handleReplyCancel}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredNotes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 text-gray-400"
          >
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium text-gray-500 mb-2">
              {searchTerm || filteredUser !== 'all' || pinnedOnly ? 'No matching notes found' : 'No notes yet'}
            </p>
            <p className="text-sm">
              {searchTerm || filteredUser !== 'all' || pinnedOnly 
                ? 'Try adjusting your search or filters' 
                : 'Be the first to add a note!'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}