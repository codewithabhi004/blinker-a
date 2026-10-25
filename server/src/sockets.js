import { prisma } from "./db.js";

const roomForChat = (chatId) => `chat:${chatId}`;
const roomForUser = (userId) => `user:${userId}`;
const isText = (value, max = 4000) => typeof value === "string" && value.trim().length > 0 && value.length <= max;

async function isMember(chatId, userId) {
  return Boolean(await prisma.chatMember.findUnique({
    where: { chatId_userId: { chatId, userId } },
    select: { chatId: true }
  }));
}

export function attachChatSockets(io) {
  const onlineUsers = new Set();
  io.on("connection", async (socket) => {
    socket.join(roomForUser(socket.userId));
    let memberships;
    try {
      memberships = await prisma.chatMember.findMany({
        where: { userId: socket.userId },
        select: { chatId: true }
      });
      onlineUsers.add(socket.userId);
      for (const { chatId } of memberships) {
        socket.join(roomForChat(chatId));
        socket.to(roomForChat(chatId)).emit("presence:online", { userId: socket.userId });
      }
      const peers = await prisma.chatMember.findMany({
        where: { chatId: { in: memberships.map(({ chatId }) => chatId) }, userId: { not: socket.userId } },
        select: { userId: true },
        distinct: ["userId"]
      });
      socket.emit("presence:snapshot", {
        userIds: peers.map(({ userId }) => userId).filter((userId) => onlineUsers.has(userId))
      });
      const pendingMessages = await prisma.message.findMany({
        where: {
          chatId: { in: memberships.map(({ chatId }) => chatId) },
          senderId: { not: socket.userId },
          deletedAt: null,
          receipts: { none: { userId: socket.userId } }
        },
        select: { id: true, chatId: true }
      });
      const deliveredAt = new Date();
      for (const message of pendingMessages) {
        await prisma.messageReceipt.create({
          data: { messageId: message.id, userId: socket.userId, deliveredAt }
        });
        io.to(roomForChat(message.chatId)).emit("receipt:delivered", { messageId: message.id, userIds: [socket.userId] });
      }
    } catch (error) {
      console.error("socket initialization failed", error);
      onlineUsers.delete(socket.userId);
      socket.disconnect(true);
      return;
    }

    socket.on("chat:join", async ({ chatId } = {}, acknowledge = () => {}) => {
      if (typeof chatId !== "string" || !await isMember(chatId, socket.userId)) {
        return acknowledge({ error: "Chat not found." });
      }
      socket.join(roomForChat(chatId));
      return acknowledge({ ok: true });
    });

    socket.on("message:send", async (payload = {}, acknowledge = () => {}) => {
      try {
        if (typeof payload.chatId !== "string" || !isText(payload.text) ||
            !await isMember(payload.chatId, socket.userId)) {
          return acknowledge({ error: "Message or chat is invalid." });
        }
        if (payload.replyToId !== undefined && payload.replyToId !== null) {
          const reply = await prisma.message.findUnique({
            where: { id: payload.replyToId },
            select: { chatId: true, deletedAt: true }
          });
          if (!reply || reply.chatId !== payload.chatId || reply.deletedAt) {
            return acknowledge({ error: "The replied-to message is unavailable." });
          }
        }
        const message = await prisma.message.create({
          data: {
            chatId: payload.chatId,
            senderId: socket.userId,
            text: payload.text.trim(),
            replyToId: typeof payload.replyToId === "string" ? payload.replyToId : null
          },
          include: { sender: { select: { id: true, name: true, avatarUrl: true } } }
        });
        const recipients = await prisma.chatMember.findMany({
          where: { chatId: payload.chatId, userId: { not: socket.userId } },
          select: { userId: true }
        });
        const deliveredAt = new Date();
        const deliveredIds = [];
        for (const recipient of recipients) {
          if ((await io.in(roomForUser(recipient.userId)).fetchSockets()).length > 0) {
            await prisma.messageReceipt.upsert({
              where: { messageId_userId: { messageId: message.id, userId: recipient.userId } },
              create: { messageId: message.id, userId: recipient.userId, deliveredAt },
              update: { deliveredAt }
            });
            deliveredIds.push(recipient.userId);
          }
        }
        await prisma.chat.update({ where: { id: payload.chatId }, data: { updatedAt: new Date() } });
        const deliveredMessage = await prisma.message.findUnique({
          where: { id: message.id },
          include: { sender: { select: { id: true, name: true, avatarUrl: true } } }
        });
        io.to(roomForChat(payload.chatId)).emit("message:new", deliveredMessage);
        if (deliveredIds.length) io.to(roomForChat(payload.chatId)).emit("receipt:delivered", { messageId: message.id, userIds: deliveredIds });
        return acknowledge({ ok: true, message: deliveredMessage });
      } catch (error) {
        console.error("message:send failed", error);
        return acknowledge({ error: "Message could not be sent." });
      }
    });

    for (const event of ["typing:start", "typing:stop"]) {
      socket.on(event, async ({ chatId } = {}) => {
        if (typeof chatId === "string" && await isMember(chatId, socket.userId)) {
          socket.to(roomForChat(chatId)).emit(event, { chatId, userId: socket.userId });
        }
      });
    }

    socket.on("message:read", async ({ chatId } = {}, acknowledge = () => {}) => {
      try {
        if (typeof chatId !== "string" || !await isMember(chatId, socket.userId)) {
          return acknowledge({ error: "Chat not found." });
        }
        const unread = await prisma.message.findMany({
          where: { chatId, senderId: { not: socket.userId }, deletedAt: null },
          select: { id: true }
        });
        const now = new Date();
        await prisma.$transaction(unread.map(({ id }) => prisma.messageReceipt.upsert({
          where: { messageId_userId: { messageId: id, userId: socket.userId } },
          create: { messageId: id, userId: socket.userId, deliveredAt: now, readAt: now },
          update: { deliveredAt: now, readAt: now }
        })));
        io.to(roomForChat(chatId)).emit("receipt:read", { chatId, userId: socket.userId, messageIds: unread.map(({ id }) => id) });
        return acknowledge({ ok: true });
      } catch (error) {
        console.error("message:read failed", error);
        return acknowledge({ error: "Read receipt could not be saved." });
      }
    });

    socket.on("message:edit", async ({ messageId, text } = {}, acknowledge = () => {}) => {
      try {
        if (typeof messageId !== "string" || !isText(text)) return acknowledge({ error: "Message is invalid." });
        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (!message || message.senderId !== socket.userId || message.deletedAt ||
            !await isMember(message.chatId, socket.userId)) return acknowledge({ error: "Message cannot be edited." });
        const updated = await prisma.message.update({
          where: { id: messageId },
          data: { text: text.trim(), editedAt: new Date() }
        });
        io.to(roomForChat(message.chatId)).emit("message:updated", updated);
        return acknowledge({ ok: true, message: updated });
      } catch (error) {
        console.error("message:edit failed", error);
        return acknowledge({ error: "Message could not be edited." });
      }
    });

    socket.on("message:delete", async ({ messageId, forEveryone = false } = {}, acknowledge = () => {}) => {
      try {
        const message = await prisma.message.findUnique({ where: { id: messageId } });
        if (!message || !await isMember(message.chatId, socket.userId) ||
            (forEveryone && message.senderId !== socket.userId)) {
          return acknowledge({ error: "Message cannot be deleted." });
        }
        if (forEveryone) {
          await prisma.message.update({ where: { id: messageId }, data: { deletedAt: new Date(), text: null, mediaUrl: null } });
          io.to(roomForChat(message.chatId)).emit("message:deleted", { messageId, forEveryone: true });
        } else {
          await prisma.hiddenMessage.upsert({
            where: { messageId_userId: { messageId, userId: socket.userId } },
            create: { messageId, userId: socket.userId },
            update: {}
          });
          socket.emit("message:deleted", { messageId, forEveryone: false });
        }
        return acknowledge({ ok: true });
      } catch (error) {
        console.error("message:delete failed", error);
        return acknowledge({ error: "Message could not be deleted." });
      }
    });

    socket.on("message:forward", async ({ messageId, chatId } = {}, acknowledge = () => {}) => {
      try {
        const source = await prisma.message.findUnique({ where: { id: messageId } });
        if (!source || source.deletedAt || typeof chatId !== "string" ||
            !await isMember(source.chatId, socket.userId) || !await isMember(chatId, socket.userId)) {
          return acknowledge({ error: "Message cannot be forwarded." });
        }
        const forwarded = await prisma.message.create({
          data: {
            chatId,
            senderId: socket.userId,
            text: source.text,
            mediaUrl: source.mediaUrl,
            mediaName: source.mediaName,
            kind: source.kind,
            forwardedFromId: source.id
          },
          include: { sender: { select: { id: true, name: true, avatarUrl: true } } }
        });

        socket.on("message:pin", async ({ chatId, messageId } = {}, acknowledge = () => {}) => {
          try {
            const [actor, chat, message] = await Promise.all([
              prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId: socket.userId } } }),
              prisma.chat.findUnique({ where: { id: chatId }, include: { group: true } }),
              prisma.message.findUnique({ where: { id: messageId } })
            ]);
            if (!actor || !chat || !message || message.chatId !== chatId || message.deletedAt ||
                (chat.type !== "PRIVATE" && !["OWNER", "ADMIN"].includes(actor.role) && !chat.group?.membersCanPin)) {
              return acknowledge({ error: "You do not have permission to pin that message." });
            }
            await prisma.chat.update({ where: { id: chatId }, data: { pinnedMessageId: messageId } });
            io.to(roomForChat(chatId)).emit("chat:pinned", { chatId, message });
            return acknowledge({ ok: true });
          } catch (error) {
            console.error("message:pin failed", error);
            return acknowledge({ error: "Message could not be pinned." });
          }
        });
        io.to(roomForChat(chatId)).emit("message:new", forwarded);
        return acknowledge({ ok: true, message: forwarded });
      } catch (error) {
        console.error("message:forward failed", error);
        return acknowledge({ error: "Message could not be forwarded." });
      }
    });

    socket.on("disconnect", async () => {
      try {
        if ((await io.in(roomForUser(socket.userId)).fetchSockets()).length) return;
        onlineUsers.delete(socket.userId);
        const userChats = await prisma.chatMember.findMany({
          where: { userId: socket.userId },
          select: { chatId: true }
        });
        for (const { chatId } of userChats) {
          io.to(roomForChat(chatId)).emit("presence:offline", { userId: socket.userId });
        }
      } catch (error) {
        console.error("presence disconnect update failed", error);
      }
    });
  });
}
