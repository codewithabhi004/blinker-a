import { Router } from "express";
import { randomBytes } from "node:crypto";
import { prisma } from "../db.js";
import { requireAuth } from "../auth.js";

export const chatRouter = Router();
chatRouter.use(requireAuth);

chatRouter.get("/", async (req, res, next) => {
  try {
    const chats = await prisma.chat.findMany({
      where: { members: { some: { userId: req.userId } } },
      include: {
        members: { include: { user: { select: { id: true, name: true, username: true, avatarUrl: true } } } },
        group: true,
        pinnedMessage: true,
        messages: {
          where: { deletedAt: null, hiddenFor: { none: { userId: req.userId } } },
          orderBy: { createdAt: "desc" },
          take: 50,
          include: { receipts: { select: { userId: true, deliveredAt: true, readAt: true } } }
        }
      },
      orderBy: { updatedAt: "desc" }
    });
    return res.json({ chats });
  } catch (error) {
    return next(error);
  }
});

chatRouter.get("/public", async (req, res, next) => {
  try {
    const chats = await prisma.chat.findMany({
      where: {
        type: { in: ["GROUP", "CHANNEL"] },
        isPublic: true,
        ...(typeof req.query.search === "string" && req.query.search.trim()
          ? { title: { contains: req.query.search.trim(), mode: "insensitive" } }
          : {})
      },
      select: { id: true, title: true, username: true, description: true },
      orderBy: { title: "asc" },
      take: 50
    });
    return res.json({ chats });
  } catch (error) {
    return next(error);
  }
});

chatRouter.post("/", async (req, res, next) => {
  try {
    const { type, title, memberIds } = req.body ?? {};
    const supported = ["PRIVATE", "GROUP", "CHANNEL"].includes(type);
    if (!supported || !Array.isArray(memberIds) || memberIds.length > 200 ||
        (type !== "PRIVATE" && (typeof title !== "string" || !title.trim()))) {
      return res.status(400).json({ error: "Provide a chat type, valid members, and a title for groups or channels." });
    }
    if (type === "PRIVATE" && memberIds.length !== 1) {
      return res.status(400).json({ error: "A private chat needs exactly one other member." });
    }
    const ids = [...new Set([req.userId, ...memberIds.filter((id) => typeof id === "string")])];
    const isPublic = type !== "PRIVATE" && req.body?.isPublic === true;
    const username = isPublic
      ? `${title.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 25) || "channel"}_${randomBytes(3).toString("hex")}`
      : null;
    const chat = await prisma.chat.create({
      data: {
        type,
        title: title?.trim() || null,
        isPublic,
        username,
        ...(type === "PRIVATE" ? {} : { group: { create: {} } }),
        members: {
          create: ids.map((userId) => ({ userId, role: userId === req.userId ? "OWNER" : "MEMBER" }))
        }
      },
      include: { members: true }
    });
    return res.status(201).json({ chat });
  } catch (error) {
    if (error.code === "P2003") return res.status(400).json({ error: "One or more members do not exist." });
    return next(error);
  }
});

chatRouter.post("/public/:chatId/join", async (req, res, next) => {
  try {
    const chat = await prisma.chat.findFirst({
      where: { id: req.params.chatId, type: { in: ["GROUP", "CHANNEL"] }, isPublic: true },
      select: { id: true }
    });
    if (!chat) return res.status(404).json({ error: "Public channel not found." });
    const member = await prisma.chatMember.upsert({
      where: { chatId_userId: { chatId: chat.id, userId: req.userId } },
      create: { chatId: chat.id, userId: req.userId },
      update: {}
    });
    const io = req.app.get("io");
    await io.in(`user:${req.userId}`).socketsJoin(`chat:${chat.id}`);
    io.to(`user:${req.userId}`).emit("chat:added", { chatId: chat.id });
    return res.status(200).json({ member });
  } catch (error) {
    return next(error);
  }
});

chatRouter.post("/:chatId/members", async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const targetId = req.body?.userId;
    const [actor, chat] = await Promise.all([
      prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId: req.userId } } }),
      prisma.chat.findUnique({ where: { id: chatId }, include: { group: true } })
    ]);
    if (!actor || !chat || chat.type === "PRIVATE" ||
        (!["OWNER", "ADMIN"].includes(actor.role) && !chat.group?.membersCanInvite)) {
      return res.status(403).json({ error: "Only chat admins can add members." });
    }
    if (typeof targetId !== "string") return res.status(400).json({ error: "A member user ID is required." });
    const member = await prisma.chatMember.upsert({
      where: { chatId_userId: { chatId, userId: targetId } },
      create: { chatId, userId: targetId, role: "MEMBER" },
      update: {}
    });
    const io = req.app.get("io");
    await io.in(`user:${targetId}`).socketsJoin(`chat:${chatId}`);
    io.to(`user:${targetId}`).emit("chat:added", { chatId });
    return res.status(201).json({ member });
  } catch (error) {
    if (error.code === "P2003") return res.status(400).json({ error: "That user does not exist." });
    return next(error);
  }
});

chatRouter.patch("/:chatId/settings", async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const actor = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId: req.userId } } });
    const chat = await prisma.chat.findUnique({ where: { id: chatId }, select: { type: true } });
    if (!actor || actor.role !== "OWNER" || !chat || chat.type === "PRIVATE") {
      return res.status(403).json({ error: "Only the group owner can change group permissions." });
    }
    const data = {};
    if (typeof req.body?.membersCanInvite === "boolean") data.membersCanInvite = req.body.membersCanInvite;
    if (typeof req.body?.membersCanPin === "boolean") data.membersCanPin = req.body.membersCanPin;
    const group = await prisma.group.update({ where: { chatId }, data });
    return res.json({ group });
  } catch (error) {
    return next(error);
  }
});

chatRouter.patch("/:chatId/members/:userId", async (req, res, next) => {
  try {
    const { chatId, userId } = req.params;
    const role = req.body?.role;
    const actor = await prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId: req.userId } } });
    if (!actor || actor.role !== "OWNER" || !["ADMIN", "MEMBER"].includes(role) || userId === req.userId) {
      return res.status(403).json({ error: "Only the chat owner can change another member's role." });
    }
    const member = await prisma.chatMember.update({
      where: { chatId_userId: { chatId, userId } },
      data: { role }
    });
    return res.json({ member });
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "Member not found." });
    return next(error);
  }
});

chatRouter.delete("/:chatId/members/:userId", async (req, res, next) => {
  try {
    const { chatId, userId } = req.params;
    const [actor, target] = await Promise.all([
      prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId: req.userId } } }),
      prisma.chatMember.findUnique({ where: { chatId_userId: { chatId, userId } } })
    ]);
    if (!actor || !target || (!["OWNER", "ADMIN"].includes(actor.role)) ||
        (target.role === "OWNER" && actor.role !== "OWNER") || userId === req.userId) {
      return res.status(403).json({ error: "You do not have permission to remove this member." });
    }
    await prisma.chatMember.delete({ where: { chatId_userId: { chatId, userId } } });
    const io = req.app.get("io");
    const userSockets = await io.in(`user:${userId}`).fetchSockets();
    await Promise.all(userSockets.map((socket) => socket.leave(`chat:${chatId}`)));
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});
