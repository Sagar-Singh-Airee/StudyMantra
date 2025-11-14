// server/routes/rooms.js
import express from 'express';
import pkg from 'agora-access-token';
const { RtcTokenBuilder, RtcRole } = pkg;
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// In-memory room storage (use database in production)
const rooms = new Map();

// Environment variables
const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;

// Room expiration time (24 hours)
const ROOM_EXPIRATION_MS = 24 * 60 * 60 * 1000;

/**
 * Create a new study room
 * POST /api/rooms
 */
router.post('/create', (req, res) => {
  try {
    const { docName, hostId, hostName, isPrivate = false } = req.body;

    // Generate room ID and channel name
    const roomId = uuidv4();
    const channelName = `studymantra-${roomId}`;

    // Create room object
    const room = {
      roomId,
      channelName,
      docName,
      hostId,
      hostName,
      isPrivate,
      createdAt: Date.now(),
      expiresAt: Date.now() + ROOM_EXPIRATION_MS,
      participants: [],
    };

    // Store room
    rooms.set(roomId, room);

    // Generate share URL
    const shareUrl = `${req.headers.origin || 'http://localhost:5173'}/join/${roomId}`;

    console.log('✅ Room created:', roomId);

    res.json({
      success: true,
      roomId,
      channelName,
      shareUrl,
      room,
    });

  } catch (error) {
    console.error('Room creation error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

/**
 * Get room information
 * GET /api/rooms/:roomId
 */
router.get('/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const room = rooms.get(roomId);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Check if room expired
    if (Date.now() > room.expiresAt) {
      rooms.delete(roomId);
      return res.status(410).json({ error: 'Room expired' });
    }

    res.json(room);

  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: 'Failed to get room' });
  }
});

/**
 * Generate Agora tokens for a room
 * POST /api/rooms/:roomId/token
 */
router.post('/:roomId/token', (req, res) => {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;

    const room = rooms.get(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!AGORA_APP_ID || !AGORA_APP_CERTIFICATE) {
      return res.status(500).json({ 
        error: 'Agora credentials not configured',
        message: 'Set AGORA_APP_ID and AGORA_APP_CERTIFICATE in .env'
      });
    }

    // Generate RTC token
    const uid = 0; // 0 means generate token for an integer UID; you can return the UID you want clients to use
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600; // 1 hour
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const rtcToken = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERTIFICATE,
      room.channelName,
      uid,
      role,
      privilegeExpiredTs
    );

    // For RTM, we'll use the same token (in production, generate separate RTM token)
    const rtmToken = rtcToken;

    console.log('✅ Tokens generated for room:', roomId);

    res.json({
      success: true,
      rtcToken,
      rtmToken,
      uid,
      channelName: room.channelName,
    });

  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate tokens',
      details: error.message 
    });
  }
});

/**
 * Delete a room (host only)
 * DELETE /api/rooms/:roomId
 */
router.delete('/:roomId', (req, res) => {
  try {
    const { roomId } = req.params;
    const { hostId } = req.body;

    const room = rooms.get(roomId);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    // Verify host
    if (room.hostId !== hostId) {
      return res.status(403).json({ error: 'Only host can delete room' });
    }

    rooms.delete(roomId);
    console.log('✅ Room deleted:', roomId);

    res.json({ success: true, message: 'Room deleted' });

  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

/**
 * List active rooms (optional - for dashboard)
 * GET /api/rooms
 */
router.get('/', (req, res) => {
  try {
    const now = Date.now();
    const activeRooms = Array.from(rooms.values())
      .filter(room => room.expiresAt > now)
      .map(room => ({
        roomId: room.roomId,
        docName: room.docName,
        hostName: room.hostName,
        participants: room.participants.length,
        createdAt: room.createdAt,
      }));

    res.json({ rooms: activeRooms });

  } catch (error) {
    console.error('List rooms error:', error);
    res.status(500).json({ error: 'Failed to list rooms' });
  }
});

/**
 * Cleanup expired rooms (run periodically)
 */
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;

  for (const [roomId, room] of rooms.entries()) {
    if (room.expiresAt < now) {
      rooms.delete(roomId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired rooms`);
  }
}, 60 * 60 * 1000); // Run every hour

export default router;
