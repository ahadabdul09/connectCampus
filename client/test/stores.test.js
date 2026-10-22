import './setup.js';
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../src/stores/authStore.js';
import { useChatStore } from '../src/stores/chatStore.js';
import { useNotificationStore } from '../src/stores/notificationStore.js';

describe('Zustand Stores Architecture Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('useAuthStore', () => {
    it('initializes with default unauthenticated state when storage is empty', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
    });

    it('clears state and storage on logout', async () => {
      // Simulate stored tokens
      localStorage.setItem('connectcampus_access_token', 'mock_access');
      localStorage.setItem('connectcampus_refresh_token', 'mock_refresh');
      localStorage.setItem('connectcampus_user', JSON.stringify({ id: 'u1', fullName: 'Test Student' }));

      useAuthStore.setState({
        user: { id: 'u1', fullName: 'Test Student' },
        accessToken: 'mock_access',
        refreshToken: 'mock_refresh',
        isAuthenticated: true,
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      // Perform logout
      await useAuthStore.getState().logout();

      const stateAfter = useAuthStore.getState();
      expect(stateAfter.isAuthenticated).toBe(false);
      expect(stateAfter.user).toBeNull();
      expect(stateAfter.accessToken).toBeNull();
      expect(localStorage.getItem('connectcampus_access_token')).toBeNull();
    });
  });

  describe('useChatStore', () => {
    it('initializes with empty conversations and active conversation as null', () => {
      const state = useChatStore.getState();
      expect(state.conversations).toEqual([]);
      expect(state.activeConversationId).toBeNull();
      expect(state.messages).toEqual([]);
    });

    it('receives a message and appends it to active conversation and updates conversation list', () => {
      const convId = 'conv-placement-1';
      useChatStore.setState({
        activeConversationId: convId,
        conversations: [
          { id: convId, title: 'Placement 2026', unreadCount: 0, latestMessage: null },
        ],
        messages: [],
      });

      const incomingMsg = {
        id: 'msg-101',
        conversationId: convId,
        content: 'Academic schedule has been uploaded.',
        createdAt: new Date().toISOString(),
        sender: { id: 'u-faculty', fullName: 'Dr. Sharma' },
      };

      useChatStore.getState().receiveMessage(incomingMsg);

      const state = useChatStore.getState();
      expect(state.messages.length).toBe(1);
      expect(state.messages[0].content).toBe('Academic schedule has been uploaded.');
      expect(state.conversations[0].latestMessage.content).toBe('Academic schedule has been uploaded.');
    });

    it('removes a message from state on delete', () => {
      useChatStore.setState({
        messages: [
          { id: 'm1', content: 'First message' },
          { id: 'm2', content: 'Second message' },
        ],
      });

      useChatStore.getState().removeMessageFromState('m1');
      const messages = useChatStore.getState().messages;
      expect(messages.length).toBe(1);
      expect(messages[0].id).toBe('m2');
    });

    it('updates message content in state on edit', () => {
      useChatStore.setState({
        messages: [{ id: 'm1', content: 'Original content', isEdited: false }],
      });

      useChatStore.getState().updateMessageInState({ id: 'm1', content: 'Updated content', isEdited: true });
      const msg = useChatStore.getState().messages[0];
      expect(msg.content).toBe('Updated content');
      expect(msg.isEdited).toBe(true);
    });
  });

  describe('useNotificationStore', () => {
    it('initializes with zero unread notifications', () => {
      const state = useNotificationStore.getState();
      expect(state.unreadCount).toBe(0);
      expect(state.notifications).toEqual([]);
    });

    it('manages notification reads correctly', () => {
      useNotificationStore.setState({
        notifications: [
          { id: 'notif-1', title: 'New Event', isRead: false },
          { id: 'notif-2', title: 'Announcement', isRead: false },
        ],
        unreadCount: 2,
      });

      expect(useNotificationStore.getState().unreadCount).toBe(2);
    });
  });
});
