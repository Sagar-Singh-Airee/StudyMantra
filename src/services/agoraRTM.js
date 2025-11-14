// src/services/agoraRTM.js
import AgoraRTM from 'agora-rtm-sdk';

class RTMService {
  constructor() {
    this.client = null;
    this.channel = null;
    this.isConnected = false;
    this.currentUserId = null;
    this.listeners = new Map();
  }

  /**
   * Initialize RTM client
   */
  async init(appId, userId) {
    if (this.client) {
      console.warn('RTM already initialized');
      return;
    }

    try {
      this.client = AgoraRTM.createInstance(appId);
      this.currentUserId = userId;

      // Setup global listeners
      this.client.on('ConnectionStateChanged', (state, reason) => {
        console.log('RTM Connection State:', state, reason);
        this.emit('connectionStateChanged', { state, reason });
      });

      this.client.on('MessageFromPeer', (message, peerId) => {
        this.emit('peerMessage', { message, peerId });
      });

      console.log('✅ RTM Client initialized');
    } catch (error) {
      console.error('RTM init error:', error);
      throw error;
    }
  }

  /**
   * Login to RTM
   */
  async login(token = null) {
    if (!this.client) throw new Error('RTM not initialized');
    
    try {
      await this.client.login({ token, uid: this.currentUserId });
      this.isConnected = true;
      console.log('✅ RTM logged in:', this.currentUserId);
    } catch (error) {
      console.error('RTM login error:', error);
      throw error;
    }
  }

  /**
   * Join a channel
   */
  async joinChannel(channelId) {
    if (!this.isConnected) throw new Error('Not logged in to RTM');

    try {
      this.channel = this.client.createChannel(channelId);
      await this.channel.join();

      // Channel event listeners
      this.channel.on('ChannelMessage', (message, memberId) => {
        try {
          const data = JSON.parse(message.text);
          this.emit('channelMessage', { ...data, senderId: memberId });
        } catch (err) {
          console.error('Failed to parse message:', err);
        }
      });

      this.channel.on('MemberJoined', (memberId) => {
        this.emit('memberJoined', { memberId });
      });

      this.channel.on('MemberLeft', (memberId) => {
        this.emit('memberLeft', { memberId });
      });

      console.log('✅ Joined channel:', channelId);
    } catch (error) {
      console.error('Channel join error:', error);
      throw error;
    }
  }

  /**
   * Send message to channel
   */
  async sendChannelMessage(data) {
    if (!this.channel) throw new Error('Not in a channel');

    try {
      const message = {
        ...data,
        senderId: this.currentUserId,
        timestamp: Date.now(),
      };

      await this.channel.sendMessage({ text: JSON.stringify(message) });
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  /**
   * Send peer-to-peer message
   */
  async sendPeerMessage(peerId, data) {
    if (!this.client) throw new Error('RTM not initialized');

    try {
      await this.client.sendMessageToPeer(
        { text: JSON.stringify(data) },
        peerId
      );
    } catch (error) {
      console.error('Send peer message error:', error);
    }
  }

  /**
   * Get channel members
   */
  async getMembers() {
    if (!this.channel) return [];

    try {
      const members = await this.channel.getMembers();
      return members;
    } catch (error) {
      console.error('Get members error:', error);
      return [];
    }
  }

  /**
   * Event listener management
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) callbacks.splice(index, 1);
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(callback => callback(data));
  }

  /**
   * Leave channel and cleanup
   */
  async leave() {
    try {
      if (this.channel) {
        await this.channel.leave();
        this.channel.removeAllListeners?.();
        this.channel = null;
      }

      if (this.client && this.isConnected) {
        await this.client.logout();
        this.isConnected = false;
      }

      this.listeners.clear();
      console.log('✅ RTM disconnected');
    } catch (error) {
      console.error('Leave error:', error);
    }
  }

  /**
   * Complete cleanup
   */
  async destroy() {
    await this.leave();
    this.client = null;
    this.currentUserId = null;
  }
}

// Singleton instance
const rtmService = new RTMService();
export default rtmService;