import { useEffect } from 'react';
import { socketService } from '../services/socket.js';
import { useAuthStore } from '../stores/authStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { useNotificationStore } from '../stores/notificationStore.js';

export function useSocket() {
  const { isAuthenticated } = useAuthStore();
  const {
    receiveMessage,
    updateMessageInState,
    removeMessageFromState,
    updateReactionInState,
    removeReactionFromState,
    setTyping,
    setUserPresence,
  } = useChatStore();
  const { fetchNotifications } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = socketService.connect();
    if (!socket) return;

    const handleNewMessage = (message) => {
      receiveMessage(message);
    };

    const handleUpdateMessage = (message) => {
      updateMessageInState(message);
    };

    const handleDeleteMessage = ({ messageId }) => {
      removeMessageFromState(messageId);
    };

    const handleReactionAdd = (reaction) => {
      updateReactionInState(reaction);
    };

    const handleReactionRemove = (data) => {
      removeReactionFromState(data);
    };

    const handleTypingStart = ({ conversationId, userId, fullName }) => {
      setTyping(conversationId, { userId, fullName }, true);
    };

    const handleTypingStop = ({ conversationId, userId }) => {
      setTyping(conversationId, { userId }, false);
    };

    const handlePresenceOnline = ({ userId }) => {
      setUserPresence(userId, true);
    };

    const handlePresenceOffline = ({ userId }) => {
      setUserPresence(userId, false);
    };

    const handleNewNotification = () => {
      fetchNotifications();
    };

    socket.on('message:new', handleNewMessage);
    socket.on('message:update', handleUpdateMessage);
    socket.on('message:delete', handleDeleteMessage);
    socket.on('reaction:add', handleReactionAdd);
    socket.on('reaction:remove', handleReactionRemove);
    socket.on('typing:start', handleTypingStart);
    socket.on('typing:stop', handleTypingStop);
    socket.on('presence:online', handlePresenceOnline);
    socket.on('presence:offline', handlePresenceOffline);
    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('message:update', handleUpdateMessage);
      socket.off('message:delete', handleDeleteMessage);
      socket.off('reaction:add', handleReactionAdd);
      socket.off('reaction:remove', handleReactionRemove);
      socket.off('typing:start', handleTypingStart);
      socket.off('typing:stop', handleTypingStop);
      socket.off('presence:online', handlePresenceOnline);
      socket.off('presence:offline', handlePresenceOffline);
      socket.off('notification:new', handleNewNotification);
    };
  }, [
    isAuthenticated,
    receiveMessage,
    updateMessageInState,
    removeMessageFromState,
    updateReactionInState,
    removeReactionFromState,
    setTyping,
    setUserPresence,
    fetchNotifications,
  ]);
}
