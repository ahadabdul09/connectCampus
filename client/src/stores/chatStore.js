import { create } from 'zustand';
import { chatService } from '../services/chatService.js';
import { socketService } from '../services/socket.js';

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversationId: null,
  activeConversation: null,
  messages: [],
  isLoadingConversations: false,
  isLoadingMessages: false,
  typingUsers: {}, // { conversationId: [ { userId, fullName } ] }
  onlineUserIds: new Set(),

  fetchConversations: async () => {
    set({ isLoadingConversations: true });
    try {
      const data = await chatService.getConversations();
      set({ conversations: data, isLoadingConversations: false });
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      set({ isLoadingConversations: false });
    }
  },

  selectConversation: async (conversationId) => {
    const socket = socketService.getSocket();
    const prevId = get().activeConversationId;

    if (prevId && socket) {
      socket.emit('conversation:leave', { conversationId: prevId });
    }

    set({
      activeConversationId: conversationId,
      isLoadingMessages: true,
      messages: [],
    });

    if (socket) {
      socket.emit('conversation:join', { conversationId });
      socket.emit('message:read', { conversationId });
    }

    try {
      const [details, msgs] = await Promise.all([
        chatService.getConversationDetails(conversationId),
        chatService.getMessages(conversationId),
      ]);

      set({
        activeConversation: details,
        messages: msgs,
        isLoadingMessages: false,
      });

      // Update unread in conversations list
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId ? { ...c, isUnread: false } : c
        ),
      }));
    } catch (err) {
      console.error('Failed to load conversation details:', err);
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (content, replyToId = null, attachment = null) => {
    const activeId = get().activeConversationId;
    if (!activeId) return;

    const socket = socketService.getSocket();
    if (socket && socket.connected) {
      socket.emit('message:send', {
        conversationId: activeId,
        content,
        replyToId,
        attachment,
      });
    } else {
      // Fallback to REST API
      const msg = await chatService.sendMessage(activeId, {
        content,
        replyToId,
        attachment,
      });
      get().receiveMessage(msg);
    }
  },

  receiveMessage: (message) => {
    const { activeConversationId, messages, conversations } = get();

    if (message.conversationId === activeConversationId) {
      // Append if not already in messages list
      if (!messages.some((m) => m.id === message.id)) {
        set({ messages: [...messages, message] });
      }
    }

    // Update conversation preview and lastMessageAt in list
    set({
      conversations: conversations.map((conv) => {
        if (conv.id === message.conversationId) {
          return {
            ...conv,
            latestMessage: {
              id: message.id,
              content: message.content,
              senderName: message.sender.fullName,
              senderId: message.sender.id,
              createdAt: message.createdAt,
            },
            lastMessageAt: message.createdAt,
            isUnread: conv.id !== activeConversationId,
          };
        }
        return conv;
      }),
    });
  },

  updateMessageInState: (updatedMessage) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === updatedMessage.id ? { ...m, ...updatedMessage } : m
      ),
    }));
  },

  removeMessageFromState: (messageId) => {
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== messageId),
    }));
  },

  updateReactionInState: (reaction) => {
    set((state) => ({
      messages: state.messages.map((m) => {
        if (m.id === reaction.messageId) {
          const exists = m.reactions?.some(
            (r) => r.userId === reaction.userId && r.emoji === reaction.emoji
          );
          if (exists) return m;
          return {
            ...m,
            reactions: [...(m.reactions || []), reaction],
          };
        }
        return m;
      }),
    }));
  },

  removeReactionFromState: ({ messageId, userId, emoji }) => {
    set((state) => ({
      messages: state.messages.map((m) => {
        if (m.id === messageId) {
          return {
            ...m,
            reactions: (m.reactions || []).filter(
              (r) => !(r.userId === userId && r.emoji === emoji)
            ),
          };
        }
        return m;
      }),
    }));
  },

  setTyping: (conversationId, userObj, isTyping) => {
    set((state) => {
      const current = state.typingUsers[conversationId] || [];
      const filtered = current.filter((u) => u.userId !== userObj.userId);
      const updated = isTyping ? [...filtered, userObj] : filtered;
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: updated,
        },
      };
    });
  },

  setUserPresence: (userId, isOnline) => {
    set((state) => {
      const nextSet = new Set(state.onlineUserIds);
      if (isOnline) {
        nextSet.add(userId);
      } else {
        nextSet.delete(userId);
      }
      return { onlineUserIds: nextSet };
    });
  },
}));
