import { prisma } from '../config/prisma.js';

export class ChatService {
  static async getConversations(userId) {
    const memberships = await prisma.conversationMember.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            department: { select: { id: true, name: true, code: true } },
            club: { select: { id: true, name: true, code: true } },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                    avatarUrl: true,
                    isOnline: true,
                    role: true,
                  },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              include: {
                sender: { select: { id: true, fullName: true } },
              },
            },
          },
        },
      },
      orderBy: {
        conversation: {
          lastMessageAt: 'desc',
        },
      },
    });

    return memberships.map((membership) => {
      const conv = membership.conversation;
      const latestMsg = conv.messages[0] || null;
      const isUnread = latestMsg ? new Date(latestMsg.createdAt) > new Date(membership.lastReadAt) : false;

      let displayTitle = conv.title;
      let peerUser = null;

      if (conv.type === 'DIRECT') {
        const otherMember = conv.members.find((m) => m.userId !== userId);
        if (otherMember) {
          displayTitle = otherMember.user.fullName;
          peerUser = otherMember.user;
        }
      }

      return {
        id: conv.id,
        title: displayTitle,
        type: conv.type,
        department: conv.department,
        club: conv.club,
        membersCount: conv.members.length,
        members: conv.members.map((m) => m.user),
        peerUser,
        latestMessage: latestMsg
          ? {
              id: latestMsg.id,
              content: latestMsg.content,
              senderName: latestMsg.sender.fullName,
              senderId: latestMsg.sender.id,
              createdAt: latestMsg.createdAt,
            }
          : null,
        lastMessageAt: conv.lastMessageAt,
        isUnread,
        lastReadAt: membership.lastReadAt,
        myRole: membership.role,
      };
    });
  }

  static async getConversationDetails(conversationId, userId) {
    const member = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!member) {
      throw new Error('You do not have access to this conversation.');
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        department: true,
        club: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
                isOnline: true,
                role: true,
                batch: true,
              },
            },
          },
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found.');
    }

    let displayTitle = conversation.title;
    if (conversation.type === 'DIRECT') {
      const otherMember = conversation.members.find((m) => m.userId !== userId);
      if (otherMember) {
        displayTitle = otherMember.user.fullName;
      }
    }

    return {
      ...conversation,
      displayTitle,
    };
  }

  static async getMessages(conversationId, userId, limit = 50, cursor) {
    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!membership) {
      throw new Error('You are not a member of this conversation.');
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: { select: { id: true, fullName: true } },
          },
        },
        reactions: {
          include: {
            user: { select: { id: true, fullName: true } },
          },
        },
        attachments: true,
      },
    });

    await prisma.conversationMember.update({
      where: {
        conversationId_userId: { conversationId, userId },
      },
      data: { lastReadAt: new Date() },
    });

    return messages;
  }

  static async sendMessage(conversationId, userId, data) {
    const membership = await prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: { conversationId, userId },
      },
    });

    if (!membership) {
      throw new Error('You are not a member of this conversation.');
    }

    const now = new Date();

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: data.content,
        type: data.type || (data.attachment ? 'FILE' : 'TEXT'),
        replyToId: data.replyToId || null,
        attachments: data.attachment
          ? {
              create: {
                fileName: data.attachment.fileName,
                fileUrl: data.attachment.fileUrl,
                fileType: data.attachment.fileType,
                fileSize: data.attachment.fileSize,
              },
            }
          : undefined,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: { select: { id: true, fullName: true } },
          },
        },
        reactions: {
          include: {
            user: { select: { id: true, fullName: true } },
          },
        },
        attachments: true,
      },
    });

    await prisma.$transaction([
      prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: now },
      }),
      prisma.conversationMember.update({
        where: {
          conversationId_userId: { conversationId, userId },
        },
        data: { lastReadAt: now },
      }),
    ]);

    return message;
  }

  static async editMessage(messageId, userId, content) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found.');
    }

    if (message.senderId !== userId) {
      throw new Error('You can only edit your own messages.');
    }

    return prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
      },
      include: {
        sender: {
          select: { id: true, fullName: true, avatarUrl: true, role: true },
        },
        reactions: true,
        attachments: true,
      },
    });
  }

  static async deleteMessage(messageId, userId, userRole) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found.');
    }

    if (message.senderId !== userId && userRole !== 'SUPER_ADMIN') {
      throw new Error('You do not have permission to delete this message.');
    }

    await prisma.message.delete({
      where: { id: messageId },
    });

    return { id: messageId, conversationId: message.conversationId };
  }

  static async togglePin(messageId, userId) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            members: { where: { userId } },
          },
        },
      },
    });

    if (!message || message.conversation.members.length === 0) {
      throw new Error('Message or conversation access denied.');
    }

    return prisma.message.update({
      where: { id: messageId },
      data: { isPinned: !message.isPinned },
      include: {
        sender: { select: { id: true, fullName: true } },
      },
    });
  }

  static async addReaction(messageId, userId, emoji) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        conversation: {
          include: {
            members: { where: { userId } },
          },
        },
      },
    });

    if (!message || message.conversation.members.length === 0) {
      throw new Error('Access denied.');
    }

    return prisma.messageReaction.upsert({
      where: {
        messageId_userId_emoji: { messageId, userId, emoji },
      },
      create: { messageId, userId, emoji },
      update: {},
      include: {
        user: { select: { id: true, fullName: true } },
      },
    });
  }

  static async removeReaction(messageId, userId, emoji) {
    await prisma.messageReaction
      .delete({
        where: {
          messageId_userId_emoji: { messageId, userId, emoji },
        },
      })
      .catch(() => {});

    return { messageId, userId, emoji };
  }

  static async markAsRead(conversationId, userId) {
    await prisma.conversationMember
      .update({
        where: {
          conversationId_userId: { conversationId, userId },
        },
        data: { lastReadAt: new Date() },
      })
      .catch(() => {});

    return true;
  }

  static async createConversation(creatorId, data) {
    const allUserIds = Array.from(new Set([creatorId, ...data.participantIds]));

    if (data.type === 'DIRECT' && allUserIds.length === 2) {
      const existingDM = await prisma.conversation.findFirst({
        where: {
          type: 'DIRECT',
          AND: [
            { members: { some: { userId: allUserIds[0] } } },
            { members: { some: { userId: allUserIds[1] } } },
          ],
        },
      });

      if (existingDM) {
        return existingDM;
      }
    }

    return prisma.conversation.create({
      data: {
        title: data.title || (data.type === 'DIRECT' ? null : 'New Campus Conversation'),
        type: data.type,
        departmentId: data.departmentId || null,
        clubId: data.clubId || null,
        members: {
          create: allUserIds.map((userId) => ({
            userId,
            role: userId === creatorId ? 'ADMIN' : 'MEMBER',
          })),
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
          },
        },
      },
    });
  }
}
