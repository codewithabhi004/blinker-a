import { Router } from "express";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { prisma } from "../db.js";
import { createToken, requireAuth } from "../auth.js";

export const authRouter = Router();

function normalizeIdentifier(value) {
  if (typeof value !== "string") return null;
  const identifier = value.trim().toLowerCase();
  if (identifier.includes("@")) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier) ? identifier : null;
  }
  const phone = `+${identifier.replace(/\D/g, "")}`;
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
}

const hashCode = (code) => createHash("sha256").update(code).digest("hex");

authRouter.post("/request-otp", async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(503).json({ error: "OTP delivery is not configured. Connect an SMS/email provider before enabling production sign-in." });
    }
    const identifier = normalizeIdentifier(req.body?.identifier);
    if (!identifier) return res.status(400).json({ error: "Enter a valid email address or international phone number." });
    const code = String(randomInt(100000, 1000000));
    await prisma.loginCode.upsert({
      where: { identifier },
      create: { identifier, codeHash: hashCode(code), expiresAt: new Date(Date.now() + 5 * 60_000) },
      update: { codeHash: hashCode(code), expiresAt: new Date(Date.now() + 5 * 60_000), attempts: 0 }
    });
    if (process.env.NODE_ENV !== "production") {
      console.info(`Development OTP for ${identifier}: ${code}`);
    }
    return res.status(202).json({ message: "If the address can receive a code, it will arrive shortly." });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/verify-otp", async (req, res, next) => {
  try {
    const identifier = normalizeIdentifier(req.body?.identifier);
    const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
    if (!identifier || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: "Enter the identifier and six-digit code." });
    }
    const loginCode = await prisma.loginCode.findUnique({ where: { identifier } });
    if (!loginCode || loginCode.expiresAt < new Date() || loginCode.attempts >= 5 ||
        !timingSafeEqual(Buffer.from(loginCode.codeHash), Buffer.from(hashCode(code)))) {
      if (loginCode) {
        await prisma.loginCode.update({
          where: { identifier },
          data: { attempts: { increment: 1 } }
        });
      }
      return res.status(401).json({ error: "That code is invalid or expired. Request a new one." });
    }

    const isPhone = identifier.startsWith("+");
    const where = isPhone ? { phone: identifier } : { email: identifier };
    const user = await prisma.user.upsert({
      where,
      create: {
        ...where,
        name: isPhone ? "New Blinker" : identifier.split("@")[0]
      },
      update: {}
    });
    await prisma.loginCode.delete({ where: { identifier } });
    return res.json({
      token: createToken(user),
      user: { id: user.id, name: user.name, username: user.username, avatarUrl: user.avatarUrl, bio: user.bio }
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, username: true, avatarUrl: true, bio: true, discoverableByPhone: true }
    });
    if (!user) return res.status(404).json({ error: "Account not found." });
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
});

authRouter.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const data = {};
    if (typeof req.body?.discoverableByPhone === "boolean") data.discoverableByPhone = req.body.discoverableByPhone;
    if (typeof req.body?.name === "string" && req.body.name.trim()) data.name = req.body.name.trim().slice(0, 80);
    if (typeof req.body?.bio === "string") data.bio = req.body.bio.trim().slice(0, 160);
    if (typeof req.body?.avatarUrl === "string") {
      const avatarUrl = req.body.avatarUrl.trim();
      if (avatarUrl) {
        if (avatarUrl.length > 2048) return res.status(400).json({ error: "Avatar URL must be 2048 characters or fewer." });
        try {
          const parsed = new URL(avatarUrl);
          if (parsed.protocol !== "https:") throw new Error("Avatar URL must use HTTPS.");
          data.avatarUrl = parsed.toString().slice(0, 2048);
        } catch {
          return res.status(400).json({ error: "Enter a valid HTTPS avatar URL." });
        }
      } else {
        data.avatarUrl = null;
      }
    }
    if (typeof req.body?.username === "string") {
      const username = req.body.username.trim().replace(/^@/, "").toLowerCase();
      if (username && !/^[a-z0-9_]{3,32}$/.test(username)) {
        return res.status(400).json({ error: "Username must be 3–32 letters, numbers, or underscores." });
      }
      data.username = username || null;
    }
    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: { id: true, name: true, username: true, avatarUrl: true, bio: true, discoverableByPhone: true }
    });
    return res.json({ user });
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ error: "That username is already taken." });
    return next(error);
  }
});
