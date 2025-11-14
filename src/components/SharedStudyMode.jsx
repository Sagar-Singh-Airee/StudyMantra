// src/components/SharedStudyMode.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Copy, Check, UserPlus, Crown, Volume2, 
  MessageSquare, Bookmark, X, Radio, Link2, QrCode 
} from 'lucide-react';
import toast from 'react-hot-toast';
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

  const scrollSyncRef = useRef(null);
  const lastScrollTimeRef = useRef(0);

  // Initialize RTM connection
  useEffect(() => {
    let mounted = true;

    const initRTM = async () => {
      try {
        const appId = import.meta.env.VITE_AGORA_APP_ID;
        if (!appId) {
          toast.error('Agora App ID not configured');
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
        toast.success('Connected to study room!');

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
        toast.error('Failed to connect to room');
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

  // Setup event listeners
  const setupEventListeners = () => {
    // User joined
    rtmService.on('channelMessage', handleChannelMessage);
    rtmService.on('memberJoined', handleMemberJoined);
    rtmService.on('memberLeft', handleMemberLeft);
  };

  const handleChannelMessage = async (data) => {
    const { type, senderId } = data;

    switch (type) {
      case 'join':
        // Add participant
        setParticipants(prev => {
          if (prev.find(p => p.id === data.user.id)) return prev;
          return [...prev, data.user];
        });
        
        // Send current state if host
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
        toast(`${data.payload.presenterName} is now presenting`, {
          icon: '👨‍🏫',
        });
        break;

      case 'state_snapshot':
        // Received state from host
        setSharedHighlights(data.highlights || []);
        setSharedBookmarks(new Set(data.bookmarks || []));
        setSharedNotes(data.notes || []);
        setPresenter(data.presenter);
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
    toast(`A participant left`, { icon: '👋' });
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
      if (now - lastScrollTimeRef.current < 100) return; // Throttle to 10Hz
      
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

    toast.success('Note added!');
  };

  // Set presenter
  const setAsPresenter = async (userId) => {
    if (!isHost) {
      toast.error('Only host can change presenter');
      return;
    }

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
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white">
              {connected ? (
                <Radio className="w-6 h-6" />
              ) : (
                <Users className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Shared Study Mode
                {connected && (
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
              </h2>
              <p className="text-sm text-gray-600">
                {participants.length} participant{participants.length !== 1 ? 's' : ''} • Room: {roomId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyShareUrl}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Share Link'}
            </motion.button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6" onScroll={handleLocalScroll} ref={scrollSyncRef}>
            <div className="max-w-3xl mx-auto space-y-4">
              {material.split('\n\n').map((para, i) => (
                <div
                  key={i}
                  data-paragraph={i}
                  className={`p-4 rounded-xl transition-all ${
                    sharedBookmarks.has(i)
                      ? 'bg-yellow-50 border-2 border-yellow-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <p className="text-gray-700 leading-relaxed">{para}</p>
                  
                  {/* Paragraph Actions */}
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => toggleBookmark(i)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        sharedBookmarks.has(i)
                          ? 'bg-yellow-100 text-yellow-600'
                          : 'bg-gray-100 text-gray-400 hover:bg-yellow-50'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Show notes for this paragraph */}
                  {sharedNotes.filter(n => n.paraIndex === i).map(note => (
                    <div
                      key={note.id}
                      className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="text-xs text-blue-600 font-semibold mb-1">
                        {note.creatorName}
                      </div>
                      <div className="text-sm text-gray-700">{note.text}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-gray-100 flex flex-col">
            <ParticipantsList
              participants={participants}
              presenter={presenter}
              isHost={isHost}
              currentUser={currentUser}
              onSetPresenter={setAsPresenter}
            />

            <div className="p-4 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={followingPresenter}
                  onChange={(e) => setFollowingPresenter(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Follow presenter
                </span>
              </label>
            </div>

            <SharedNotes notes={sharedNotes} participants={participants} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}