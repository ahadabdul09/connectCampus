import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  Paperclip,
  Smile,
  Pin,
  Reply,
  Edit2,
  Trash2,
  Check,
  CheckCheck,
  Users,
  Info,
  X,
  FileText,
  File,
  Plus,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore.js';
import { useChatStore } from '../stores/chatStore.js';
import { chatService } from '../services/chatService.js';
import { socketService } from '../services/socket.js';
import { Avatar } from '../components/Avatar.jsx';
import { Badge } from '../components/Badge.jsx';
import { Button } from '../components/Button.jsx';
import { Modal } from '../components/Modal.jsx';
import { Input } from '../components/Input.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ChatSkeleton } from '../components/LoadingSkeleton.jsx';
import { formatTimeAgo, formatDateTime } from '../utils/formatDate.js';
import { formatFileSize } from '../utils/formatFileSize.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { cn } from '../utils/cn.js';

export function ChatPage() {
  usePageTitle('Messages');
  const { user } = useAuthStore();
  const {
    conversations,
    activeConversationId,
    activeConversation,
    messages,
    isLoadingConversations,
    isLoadingMessages,
    fetchConversations,
    selectConversation,
    sendMessage,
    typingUsers,
    onlineUserIds,
  } = useChatStore();

  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, GROUPS, DIRECT
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showRightDrawer, setShowRightDrawer] = useState(true);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState('');
  const [newChatType, setNewChatType] = useState('DIRECT');
  const [campusUsers, setCampusUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Select first conversation if none active
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      selectConversation(conversations[0].id);
    }
  }, [activeConversationId, conversations, selectConversation]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessageInput(val);

    const socket = socketService.getSocket();
    if (!socket || !activeConversationId) return;

    socket.emit('typing:start', { conversationId: activeConversationId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing:stop', { conversationId: activeConversationId });
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversationId) return;

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('typing:stop', { conversationId: activeConversationId });
    }

    if (editingMessage) {
      try {
        await chatService.editMessage(editingMessage.id, messageInput.trim());
        setEditingMessage(null);
        setMessageInput('');
      } catch (err) {
        console.error('Failed to edit message:', err);
      }
      return;
    }

    await sendMessage(messageInput.trim(), replyingTo?.id || null);
    setMessageInput('');
    setReplyingTo(null);
  };

  const handleTogglePin = async (messageId) => {
    try {
      await chatService.togglePin(messageId);
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  };

  const handleAddReaction = async (messageId, emoji) => {
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('reaction:add', { messageId, emoji });
    } else {
      await chatService.addReaction(messageId, emoji);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('message:delete', { messageId });
    } else {
      await chatService.deleteMessage(messageId);
    }
  };

  const openNewChatModal = async () => {
    try {
      const users = await chatService.getConversations(); // preload
      setIsNewChatModalOpen(true);
    } catch {}
  };

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterType === 'DIRECT') return matchesSearch && c.type === 'DIRECT';
    if (filterType === 'GROUPS') return matchesSearch && c.type !== 'DIRECT';
    return matchesSearch;
  });

  const activeTyping = activeConversationId ? typingUsers[activeConversationId] || [] : [];
  const otherTyping = activeTyping.filter((t) => t.userId !== user?.id);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden bg-campus-surface">
      {/* 1. Left Column: Conversation Navigation */}
      <div className="w-80 shrink-0 border-r border-campus-border flex flex-col bg-campus-secondary/20">
        <div className="p-3.5 border-b border-campus-border flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-campus-text-primary text-base">
              Conversations
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => alert('New conversations are created directly via batch channels, communities, and faculty groups.')}
              className="p-1.5 h-7 w-7"
              title="Start direct conversation"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-campus-text-muted" />
            <input
              type="text"
              placeholder="Filter channels or peers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-campus-surface border border-campus-border rounded-input text-xs text-campus-text-primary placeholder:text-campus-text-muted focus:outline-none focus:border-campus-primary"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-[11px] font-medium">
            <button
              onClick={() => setFilterType('ALL')}
              className={cn(
                'px-2.5 py-1 rounded transition-colors',
                filterType === 'ALL'
                  ? 'bg-campus-primary text-white font-semibold'
                  : 'text-campus-text-secondary hover:bg-campus-secondary'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('GROUPS')}
              className={cn(
                'px-2.5 py-1 rounded transition-colors',
                filterType === 'GROUPS'
                  ? 'bg-campus-primary text-white font-semibold'
                  : 'text-campus-text-secondary hover:bg-campus-secondary'
              )}
            >
              Groups & Channels
            </button>
            <button
              onClick={() => setFilterType('DIRECT')}
              className={cn(
                'px-2.5 py-1 rounded transition-colors',
                filterType === 'DIRECT'
                  ? 'bg-campus-primary text-white font-semibold'
                  : 'text-campus-text-secondary hover:bg-campus-secondary'
              )}
            >
              Direct
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-campus-border/60">
          {isLoadingConversations ? (
            <div className="p-4 flex flex-col gap-3">
              <div className="h-12 bg-campus-secondary/60 rounded animate-pulse" />
              <div className="h-12 bg-campus-secondary/60 rounded animate-pulse" />
              <div className="h-12 bg-campus-secondary/60 rounded animate-pulse" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-campus-text-secondary">
              No matching conversations.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === activeConversationId;
              const isUserOnline = conv.peerUser
                ? onlineUserIds.has(conv.peerUser.id) || conv.peerUser.isOnline
                : false;

              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv.id)}
                  className={cn(
                    'p-3 cursor-pointer flex items-start gap-3 transition-colors',
                    isSelected
                      ? 'bg-campus-primary-light/70 border-r-2 border-campus-primary'
                      : 'hover:bg-campus-secondary/40'
                  )}
                >
                  <Avatar
                    name={conv.title}
                    size="md"
                    isOnline={isUserOnline}
                    showStatus={conv.type === 'DIRECT'}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span
                        className={cn(
                          'text-xs truncate font-medium',
                          conv.isUnread ? 'font-bold text-campus-text-primary' : 'text-campus-text-primary'
                        )}
                      >
                        {conv.title}
                      </span>
                      <span className="text-[10px] text-campus-text-muted shrink-0">
                        {formatTimeAgo(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[11px] text-campus-text-secondary truncate">
                        {conv.latestMessage
                          ? `${conv.latestMessage.senderName}: ${conv.latestMessage.content}`
                          : 'No messages yet'}
                      </p>
                      {conv.isUnread && (
                        <span className="w-2 h-2 rounded-full bg-campus-accent shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Center Column: Conversation Stream */}
      <div className="flex-1 flex flex-col justify-between bg-campus-surface min-w-0">
        {activeConversation ? (
          <>
            {/* Conversation Header */}
            <div className="h-14 border-b border-campus-border px-5 flex items-center justify-between shrink-0 bg-campus-surface">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  name={activeConversation.displayTitle}
                  size="sm"
                  isOnline={
                    activeConversation.type === 'DIRECT' &&
                    onlineUserIds.has(activeConversation.members.find((m) => m.userId !== user?.id)?.userId)
                  }
                  showStatus={activeConversation.type === 'DIRECT'}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-campus-text-primary truncate">
                      {activeConversation.displayTitle}
                    </h2>
                    <Badge variant="neutral" className="text-[10px]">
                      {activeConversation.type}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-campus-text-secondary truncate">
                    {activeConversation.type === 'DIRECT'
                      ? 'Academic direct message'
                      : `${activeConversation.members?.length || 0} participants enrolled`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowRightDrawer((prev) => !prev)}
                  className={cn(
                    'p-1.5 rounded text-campus-text-secondary hover:text-campus-text-primary hover:bg-campus-secondary transition-colors',
                    showRightDrawer && 'bg-campus-secondary text-campus-text-primary'
                  )}
                  title="Toggle conversation details"
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Pinned Messages Bar */}
            {messages.some((m) => m.isPinned) && (
              <div className="bg-[#FAF8F5] border-b border-campus-border px-4 py-1.5 flex items-center justify-between text-xs text-campus-text-secondary">
                <div className="flex items-center gap-2 truncate">
                  <Pin className="w-3.5 h-3.5 text-campus-accent shrink-0 rotate-45" />
                  <span className="font-semibold text-campus-text-primary">Pinned:</span>
                  <span className="truncate">
                    {messages.find((m) => m.isPinned)?.content}
                  </span>
                </div>
              </div>
            )}

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-3">
              {isLoadingMessages ? (
                <ChatSkeleton />
              ) : messages.length === 0 ? (
                <EmptyState
                  icon={MessageSquare}
                  title="No messages yet"
                  description="Start this academic conversation by sending the first message."
                />
              ) : (
                messages.map((msg, index) => {
                  const isMine = msg.senderId === user?.id;

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'group flex flex-col text-xs leading-relaxed max-w-[85%] sm:max-w-[70%]',
                        isMine ? 'self-end items-end' : 'self-start items-start'
                      )}
                    >
                      {/* Sender metadata for group chats */}
                      {!isMine && (
                        <span className="text-[11px] font-semibold text-campus-text-secondary mb-1 ml-1">
                          {msg.sender?.fullName}
                        </span>
                      )}

                      {/* Replying banner */}
                      {msg.replyTo && (
                        <div className="mb-1 p-1.5 rounded bg-campus-secondary/70 border-l-2 border-campus-primary text-[11px] text-campus-text-secondary max-w-full truncate">
                          <span className="font-semibold text-campus-text-primary">
                            {msg.replyTo.sender?.fullName}:{' '}
                          </span>
                          {msg.replyTo.content}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={cn(
                          'relative rounded-card px-3.5 py-2.5 transition-colors',
                          isMine
                            ? 'bg-campus-primary text-white rounded-tr-none'
                            : 'bg-campus-secondary/60 text-campus-text-primary rounded-tl-none border border-campus-border/60'
                        )}
                      >
                        <div className="whitespace-pre-wrap break-words">{msg.content}</div>

                        {/* File Attachments */}
                        {msg.attachments?.map((att) => (
                          <div
                            key={att.id}
                            className="mt-2 p-2 rounded bg-campus-surface/90 text-campus-text-primary flex items-center justify-between gap-2 border border-campus-border/60"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="w-4 h-4 text-campus-primary shrink-0" />
                              <div className="truncate">
                                <p className="text-xs font-semibold truncate">{att.fileName}</p>
                                <p className="text-[10px] text-campus-text-muted">{formatFileSize(att.fileSize)}</p>
                              </div>
                            </div>
                            <a
                              href={att.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-campus-primary hover:underline shrink-0"
                            >
                              Download
                            </a>
                          </div>
                        ))}

                        {/* Timestamp & Status */}
                        <div
                          className={cn(
                            'flex items-center justify-end gap-1.5 mt-1 text-[10px]',
                            isMine ? 'text-white/70' : 'text-campus-text-muted'
                          )}
                        >
                          {msg.isEdited && <span>(edited)</span>}
                          <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {isMine && <CheckCheck className="w-3 h-3 text-white/90" />}
                        </div>

                        {/* Floating Action Menu on Hover */}
                        <div
                          className={cn(
                            'absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity bg-campus-surface border border-campus-border rounded-btn shadow-subtle p-0.5 flex items-center gap-1 z-10',
                            isMine ? 'right-full mr-1.5' : 'left-full ml-1.5'
                          )}
                        >
                          <button
                            onClick={() => handleAddReaction(msg.id, '👍')}
                            className="p-1 hover:bg-campus-secondary rounded text-xs"
                            title="React thumbs up"
                          >
                            👍
                          </button>
                          <button
                            onClick={() => handleAddReaction(msg.id, '🎯')}
                            className="p-1 hover:bg-campus-secondary rounded text-xs"
                            title="React target"
                          >
                            🎯
                          </button>
                          <button
                            onClick={() => setReplyingTo(msg)}
                            className="p-1 hover:bg-campus-secondary rounded text-campus-text-secondary"
                            title="Reply"
                          >
                            <Reply className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleTogglePin(msg.id)}
                            className="p-1 hover:bg-campus-secondary rounded text-campus-text-secondary"
                            title="Toggle pin"
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          {isMine && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingMessage(msg);
                                  setMessageInput(msg.content);
                                }}
                                className="p-1 hover:bg-campus-secondary rounded text-campus-text-secondary"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-1 hover:bg-campus-secondary rounded text-campus-state-error"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Reactions bar */}
                      {msg.reactions?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {msg.reactions.map((r, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-campus-secondary border border-campus-border text-[11px] font-medium"
                            >
                              <span>{r.emoji}</span>
                              <span className="text-campus-text-secondary text-[10px]">
                                {r.user?.fullName?.split(' ')[0]}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {otherTyping.length > 0 && (
              <div className="px-5 py-1 text-[11px] text-campus-text-muted italic flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-campus-primary animate-ping" />
                <span>
                  {otherTyping.map((t) => t.fullName).join(', ')}{' '}
                  {otherTyping.length === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            )}

            {/* Replying or Editing Banner */}
            {(replyingTo || editingMessage) && (
              <div className="px-4 py-2 bg-campus-secondary/70 border-t border-campus-border flex items-center justify-between text-xs">
                <div className="truncate">
                  {editingMessage ? (
                    <span className="font-semibold text-campus-primary">
                      Editing message: "{editingMessage.content.slice(0, 50)}..."
                    </span>
                  ) : (
                    <span>
                      Replying to{' '}
                      <span className="font-semibold text-campus-text-primary">
                        {replyingTo.sender?.fullName}
                      </span>
                      : "{replyingTo.content.slice(0, 50)}..."
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setEditingMessage(null);
                    setMessageInput('');
                  }}
                  className="p-1 text-campus-text-secondary hover:text-campus-text-primary"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Message Input Box */}
            <div className="p-3.5 border-t border-campus-border bg-campus-surface">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Message #${activeConversation.displayTitle}...`}
                  value={messageInput}
                  onChange={handleInputChange}
                  className="flex-1 bg-campus-secondary/40 border border-campus-border rounded-input px-3.5 py-2 text-xs text-campus-text-primary placeholder:text-campus-text-muted focus:bg-campus-surface focus:border-campus-primary focus:outline-none transition-colors"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!messageInput.trim()}
                  className="px-4"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <EmptyState
              icon={MessageSquare}
              title="No Conversation Selected"
              description="Choose a conversation from the left navigation panel to view message history and discuss."
            />
          </div>
        )}
      </div>

      {/* 3. Right Column: Conversation Information Drawer */}
      {showRightDrawer && activeConversation && (
        <div className="hidden lg:flex w-72 shrink-0 border-l border-campus-border bg-campus-secondary/20 flex-col overflow-y-auto">
          <div className="p-4 border-b border-campus-border">
            <h3 className="font-semibold text-sm text-campus-text-primary mb-1">
              Conversation Details
            </h3>
            <p className="text-xs text-campus-text-secondary">
              Academic group context & members
            </p>
          </div>

          <div className="p-4 flex flex-col gap-5 text-xs">
            {/* Title & Metadata */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-campus-text-muted">
                Group Title
              </span>
              <p className="text-sm font-semibold text-campus-text-primary mt-1">
                {activeConversation.displayTitle}
              </p>
              {activeConversation.department && (
                <Badge variant="primary" className="mt-1.5">
                  {activeConversation.department.name}
                </Badge>
              )}
            </div>

            {/* Participants */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-campus-text-muted">
                  Members ({activeConversation.members?.length || 0})
                </span>
              </div>
              <div className="divide-y divide-campus-border/60 border border-campus-border/60 rounded-card overflow-hidden bg-campus-surface">
                {activeConversation.members?.map((m) => (
                  <div key={m.userId} className="p-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <Avatar
                        name={m.user?.fullName}
                        size="sm"
                        isOnline={onlineUserIds.has(m.userId) || m.user?.isOnline}
                        showStatus
                      />
                      <div className="truncate">
                        <p className="text-xs font-medium text-campus-text-primary truncate">
                          {m.user?.fullName}
                        </p>
                        <p className="text-[10px] text-campus-text-muted truncate">
                          {m.user?.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Institutional Integrity Reminder */}
            <div className="p-3 rounded-card bg-campus-surface border border-campus-border text-[11px] text-campus-text-secondary leading-relaxed">
              <span className="font-semibold text-campus-text-primary block mb-1">
                Academic Conduct:
              </span>
              Institutional communication guidelines apply in all channels. Shared files are scanned and indexed for verified course reference.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
