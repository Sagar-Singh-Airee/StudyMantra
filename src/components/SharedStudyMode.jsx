// src/components/SharedStudyMode.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Copy, Check, UserPlus, Crown, Volume2, 
  MessageSquare, Bookmark, X, Radio, Link2, QrCode,
  Eye, EyeOff, Share2, Mic, MicOff, Video, VideoOff,
  Monitor, MonitorOff, Settings, MoreVertical
} from 'lucide-react';
import rtmService from '../services/agoraRTM';
import ParticipantsList from './ParticipantsList';
import SharedNotes from './SharedNotes';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function SharedStudyMode({ 
  roomId, 
  isHost, 
  onClose,
  currentUser,
  material 
}) {
  const [participants, setParticipants] = useState([]);
  const [sharedHighlights, setSharedHighlights] = useState([]);
  const [sharedBookmarks, setSharedBookmarks] = useState(new Set());
  const [sharedNotes, setSharedNotes] = useState([]);
  const [followingPresenter, setFollowingPresenter] = useState(false);
  const [presenter, setPresenter] = useState(isHost ? currentUser.id : null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMaterial, setFilteredMaterial] = useState([]);

  const scrollSyncRef = useRef(null);
  const lastScrollTimeRef = useRef(0);

  // Initialize RTM connection
  useEffect(() => {
    let mounted = true;

    const initRTM = async () => {
      try {
        const appId = import.meta.env.VITE_AGORA_APP_ID;
        if (!appId) {
          console.error('Agora App ID not configured');
          return;
        }

        // Initialize RTM
        await rtmService.init(appId, currentUser.id);

        // Get RTM token from backend
        const response = await fetch(`${API_BASE}/api/rooms/${roomId}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id }),
        });

        const { rtmToken } = await response.json();

        // Login and join channel
        await rtmService.login(rtmToken);
        await rtmService.joinChannel(roomId);

        if (!mounted) return;

        setConnected(true);

        // Setup event listeners
        setupEventListeners();

        // Send join event
        await rtmService.sendChannelMessage({
          type: 'join',
          user: currentUser,
        });

        // Request current state
        await rtmService.sendChannelMessage({
          type: 'request_state',
        });

      } catch (error) {
        console.error('RTM init error:', error);
      }
    };

    initRTM();

    return () => {
      mounted = false;
      rtmService.leave();
    };
  }, [roomId, currentUser]);

  // Generate share URL
  useEffect(() => {
    const url = `${window.location.origin}/join/${roomId}`;
    setShareUrl(url);
  }, [roomId]);

  // Filter material based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredMaterial(material.split('\n\n'));
    } else {
      const filtered = material.split('\n\n').filter(para => 
        para.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMaterial(filtered);
    }
  }, [searchTerm, material]);

  // Setup event listeners
  const setupEventListeners = () => {
    rtmService.on('channelMessage', handleChannelMessage);
    rtmService.on('memberJoined', handleMemberJoined);
    rtmService.on('memberLeft', handleMemberLeft);
  };

  const handleChannelMessage = async (data) => {
    const { type, senderId } = data;

    switch (type) {
      case 'join':
        setParticipants(prev => {
          if (prev.find(p => p.id === data.user.id)) return prev;
          return [...prev, data.user];
        });
        
        if (isHost) {
          await rtmService.sendPeerMessage(senderId, {
            type: 'state_snapshot',
            highlights: sharedHighlights,
            bookmarks: Array.from(sharedBookmarks),
            notes: sharedNotes,
            presenter,
          });
        }
        break;

      case 'leave':
        setParticipants(prev => prev.filter(p => p.id !== senderId));
        break;

      case 'scroll':
        if (followingPresenter && senderId === presenter) {
          handleRemoteScroll(data.payload);
        }
        break;

      case 'highlight_create':
        setSharedHighlights(prev => [...prev, data.payload]);
        break;

      case 'highlight_remove':
        setSharedHighlights(prev => 
          prev.filter(h => h.id !== data.payload.id)
        );
        break;

      case 'bookmark_toggle':
        setSharedBookmarks(prev => {
          const newSet = new Set(prev);
          if (data.payload.action === 'add') {
            newSet.add(data.payload.paraIndex);
          } else {
            newSet.delete(data.payload.paraIndex);
          }
          return newSet;
        });
        break;

      case 'note_create':
        setSharedNotes(prev => [...prev, data.payload]);
        break;

      case 'note_delete':
        setSharedNotes(prev => prev.filter(n => n.id !== data.payload.id));
        break;

      case 'presenter_set':
        setPresenter(data.payload.presenterId);
        break;

      case 'state_snapshot':
        setSharedHighlights(data.highlights || []);
        setSharedBookmarks(new Set(data.bookmarks || []));
        setSharedNotes(data.notes || []);
        setPresenter(data.presenter);
        break;

      case 'audio_toggle':
        // Handle audio state changes
        break;

      case 'video_toggle':
        // Handle video state changes
        break;

      default:
        console.log('Unknown message type:', type);
    }
  };

  const handleMemberJoined = async ({ memberId }) => {
    console.log('Member joined:', memberId);
  };

  const handleMemberLeft = ({ memberId }) => {
    setParticipants(prev => prev.filter(p => p.id !== memberId));
  };

  // Handle remote scroll
  const handleRemoteScroll = (scrollData) => {
    if (!scrollSyncRef.current) return;
    
    const { paragraphIndex, pixelOffset } = scrollData;
    const paragraphs = scrollSyncRef.current.querySelectorAll('[data-paragraph]');
    
    if (paragraphs[paragraphIndex]) {
      paragraphs[paragraphIndex].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Send scroll event (throttled)
  const handleLocalScroll = (e) => {
    if (!followingPresenter && presenter === currentUser.id) {
      const now = Date.now();
      if (now - lastScrollTimeRef.current < 100) return;
      
      lastScrollTimeRef.current = now;

      const scrollTop = e.target.scrollTop;
      const scrollHeight = e.target.scrollHeight;
      const normalized = scrollTop / scrollHeight;

      rtmService.sendChannelMessage({
        type: 'scroll',
        payload: {
          scrollTop,
          normalized,
          timestamp: now,
        },
      });
    }
  };

  // Create highlight
  const createHighlight = async (text, range, color) => {
    const highlight = {
      id: `highlight-${Date.now()}`,
      text,
      range,
      color,
      creatorId: currentUser.id,
      createdAt: Date.now(),
    };

    setSharedHighlights(prev => [...prev, highlight]);

    await rtmService.sendChannelMessage({
      type: 'highlight_create',
      payload: highlight,
    });
  };

  // Toggle bookmark
  const toggleBookmark = async (paraIndex) => {
    const action = sharedBookmarks.has(paraIndex) ? 'remove' : 'add';
    
    setSharedBookmarks(prev => {
      const newSet = new Set(prev);
      action === 'add' ? newSet.add(paraIndex) : newSet.delete(paraIndex);
      return newSet;
    });

    await rtmService.sendChannelMessage({
      type: 'bookmark_toggle',
      payload: { paraIndex, action, userId: currentUser.id },
    });
  };

  // Add note
  const addNote = async (paraIndex, text) => {
    const note = {
      id: `note-${Date.now()}`,
      paraIndex,
      text,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      createdAt: Date.now(),
    };

    setSharedNotes(prev => [...prev, note]);

    await rtmService.sendChannelMessage({
      type: 'note_create',
      payload: note,
    });
  };

  // Delete note
  const deleteNote = async (noteId) => {
    setSharedNotes(prev => prev.filter(n => n.id !== noteId));

    await rtmService.sendChannelMessage({
      type: 'note_delete',
      payload: { id: noteId },
    });
  };

  // Set presenter
  const setAsPresenter = async (userId) => {
    if (!isHost) return;

    setPresenter(userId);

    await rtmService.sendChannelMessage({
      type: 'presenter_set',
      payload: {
        presenterId: userId,
        presenterName: participants.find(p => p.id === userId)?.name || 'Unknown',
      },
    });
  };

  // Copy share URL
  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle audio/video
  const toggleAudio = async () => {
    setAudioEnabled(!audioEnabled);
    await rtmService.sendChannelMessage({
      type: 'audio_toggle',
      payload: { userId: currentUser.id, enabled: !audioEnabled },
    });
  };

  const toggleVideo = async () => {
    setVideoEnabled(!videoEnabled);
    await rtmService.sendChannelMessage({
      type: 'video_toggle',
      payload: { userId: currentUser.id, enabled: !videoEnabled },
    });
  };

  const toggleScreenShare = async () => {
    setIsScreenSharing(!isScreenSharing);
  };

  // Quick actions for paragraphs
  const QuickActions = ({ paraIndex }) => (
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => toggleBookmark(paraIndex)}
        className={`p-1.5 rounded-lg transition-colors ${
          sharedBookmarks.has(paraIndex)
            ? 'bg-yellow-100 text-yellow-600'
            : 'bg-gray-100 text-gray-400 hover:bg-yellow-50'
        }`}
        title="Bookmark"
      >
        <Bookmark className="w-3 h-3" />
      </button>
      <button
        className="p-1.5 rounded-lg bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        title="Add Note"
        onClick={() => {
          const text = prompt('Add a note for this paragraph:');
          if (text) addNote(paraIndex, text);
        }}
      >
        <MessageSquare className="w-3 h-3" />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col"
      >
        {/* Enhanced Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${
              connected 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                : 'bg-gradient-to-br from-gray-400 to-gray-600'
            }`}>
              {connected ? <Radio className="w-6 h-6" /> : <Users className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Collaborative Study Session
                {connected && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Live
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-600">
                {participants.length} {participants.length === 1 ? 'person' : 'people'} studying • Room: {roomId}
                {presenter && ` • Presenter: ${participants.find(p => p.id === presenter)?.name || 'You'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search material..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MessageSquare className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            {/* Media Controls */}
            <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200">
              <button
                onClick={toggleAudio}
                className={`p-2 rounded-lg transition-colors ${
                  audioEnabled ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}
                title={audioEnabled ? 'Mute' : 'Unmute'}
              >
                {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-2 rounded-lg transition-colors ${
                  videoEnabled ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}
                title={videoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {videoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleScreenShare}
                className={`p-2 rounded-lg transition-colors ${
                  isScreenSharing ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}
                title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
              >
                {isScreenSharing ? <MonitorOff className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              </button>
            </div>

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyShareUrl}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Invite'}
            </motion.button>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Navigation Tabs */}
          <div className="w-64 border-r border-gray-100 bg-gray-50 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                    activeTab === 'content' 
                      ? 'bg-white shadow-sm border border-gray-200 text-blue-600 font-semibold' 
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  📚 Study Material
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                    activeTab === 'notes' 
                      ? 'bg-white shadow-sm border border-gray-200 text-blue-600 font-semibold' 
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  📝 Shared Notes
                </button>
                <button
                  onClick={() => setActiveTab('highlights')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                    activeTab === 'highlights' 
                      ? 'bg-white shadow-sm border border-gray-200 text-blue-600 font-semibold' 
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  🎯 Highlights
                </button>
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                    activeTab === 'bookmarks' 
                      ? 'bg-white shadow-sm border border-gray-200 text-blue-600 font-semibold' 
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  🔖 Bookmarks
                </button>
              </div>
            </div>

            {/* Participants Section */}
            <div className="flex-1 overflow-hidden">
              <ParticipantsList
                participants={participants}
                presenter={presenter}
                isHost={isHost}
                currentUser={currentUser}
                onSetPresenter={setAsPresenter}
              />
            </div>

            {/* Follow Presenter Toggle */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-10 h-6 rounded-full transition-colors relative ${
                  followingPresenter ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    followingPresenter ? 'transform translate-x-5' : 'transform translate-x-1'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Follow Presenter</div>
                  <div className="text-xs text-gray-500">Sync your view with the presenter</div>
                </div>
                {followingPresenter ? <Eye className="w-4 h-4 text-blue-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
              </label>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === 'content' && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full overflow-y-auto p-6"
                    onScroll={handleLocalScroll}
                    ref={scrollSyncRef}
                  >
                    <div className="max-w-4xl mx-auto space-y-6">
                      {filteredMaterial.map((para, i) => (
                        <div
                          key={i}
                          data-paragraph={i}
                          className={`group p-6 rounded-2xl transition-all duration-300 ${
                            sharedBookmarks.has(i)
                              ? 'bg-yellow-50 border-2 border-yellow-200 shadow-sm'
                              : 'bg-white border border-gray-200 hover:shadow-md hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-gray-700 leading-relaxed text-lg flex-1">{para}</p>
                            <QuickActions paraIndex={i} />
                          </div>
                          
                          {/* Shared Notes for this paragraph */}
                          {sharedNotes.filter(n => n.paraIndex === i).map(note => (
                            <motion.div
                              key={note.id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {note.creatorName.charAt(0)}
                                    </div>
                                    <span className="text-sm font-semibold text-blue-700">
                                      {note.creatorName}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {new Date(note.createdAt).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <div className="text-gray-700">{note.text}</div>
                                </div>
                                {(note.creatorId === currentUser.id || isHost) && (
                                  <button
                                    onClick={() => deleteNote(note.id)}
                                    className="p-1 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'notes' && (
                  <motion.div
                    key="notes"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full p-6"
                  >
                    <SharedNotes 
                      notes={sharedNotes} 
                      participants={participants}
                      onDeleteNote={deleteNote}
                      currentUser={currentUser}
                      isHost={isHost}
                    />
                  </motion.div>
                )}

                {activeTab === 'highlights' && (
                  <motion.div
                    key="highlights"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full p-6"
                  >
                    <div className="max-w-4xl mx-auto">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Shared Highlights</h3>
                      {sharedHighlights.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No highlights yet. Select text to create highlights.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {sharedHighlights.map(highlight => (
                            <div key={highlight.id} className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {participants.find(p => p.id === highlight.creatorId)?.name?.charAt(0) || '?'}
                                </div>
                                <span className="text-sm font-semibold text-yellow-700">
                                  {participants.find(p => p.id === highlight.creatorId)?.name || 'Unknown'}
                                </span>
                              </div>
                              <p className="text-gray-700">{highlight.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'bookmarks' && (
                  <motion.div
                    key="bookmarks"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="h-full p-6"
                  >
                    <div className="max-w-4xl mx-auto">
                      <h3 className="text-2xl font-bold text-gray-900 mb-6">Bookmarked Sections</h3>
                      {sharedBookmarks.size === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No bookmarks yet. Click the bookmark icon to save important sections.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {Array.from(sharedBookmarks).map(paraIndex => (
                            <div key={paraIndex} className="p-6 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3 mb-3">
                                <Bookmark className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                <span className="font-semibold text-gray-900">Paragraph {paraIndex + 1}</span>
                              </div>
                              <p className="text-gray-700 leading-relaxed">
                                {material.split('\n\n')[paraIndex].substring(0, 200)}...
                              </p>
                              <button
                                onClick={() => {
                                  const element = scrollSyncRef.current?.querySelector(`[data-paragraph="${paraIndex}"]`);
                                  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  setActiveTab('content');
                                }}
                                className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                Jump to section →
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}