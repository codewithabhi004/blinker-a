import { Router } from "express";
import { createHash, randomBytes, randomInt, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { prisma } from "../db.js";
import { createToken, requireAuth } from "../auth.js";

export const authRouter = Router();

const scrypt = promisify(scryptCallback);

function normalizePhone(value) {
  if (typeof value !== "string") return null;
  const phone = `+${value.trim().replace(/\D/g, "")}`;
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
}

function normalizeUsername(value) {
  if (typeof value !== "string") return null;
  const username = value.trim().replace(/^@/, "").toLowerCase();
  return /^[a-z0-9_]{3,32}$/.test(username) ? username : null;
}

const hashCode = (code) => createHash("sha256").update(code).digest("hex");

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

async function verifyPassword(password, storedHash) {
  const [saltHex, keyHex] = storedHash.split(":");
  if (!/^[\da-f]{32}$/.test(saltHex) || !/^[\da-f]{128}$/.test(keyHex)) return false;
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), 64);
  return timingSafeEqual(actual, Buffer.from(keyHex, "hex"));
}

async function sendSms(phone, code) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    return { configured: false };
  }

  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
  const body = new URLSearchParams({
    To: phone,
    From: TWILIO_FROM_NUMBER,
    Body: `Your Blinker-a verification code is ${code}. It expires in 5 minutes. Never share this code.`
  });
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(TWILIO_ACCOUNT_SID)}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    }
  );
  if (!response.ok) {
    console.error("SMS provider rejected a verification message", { status: response.status });
    return { configured: true, sent: false };
  }
  return { configured: true, sent: true };
}

authRouter.post("/request-otp", async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body?.phone ?? req.body?.identifier);
    if (!phone) return res.status(400).json({ error: "Enter a valid phone number in international format, such as +919876543210." });
    const existing = await prisma.user.findUnique({ where: { phone }, select: { passwordHash: true } });
    if (existing?.passwordHash) {
      return res.status(409).json({ error: "An account already uses this phone. Sign in with your password." });
    }
    if (process.env.NODE_ENV === "production" &&
        (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_FROM_NUMBER)) {
      return res.status(503).json({ error: "SMS verification is not configured. Add the Twilio account SID, auth token, and sender number to the API environment." });
    }

    const code = String(randomInt(100000, 1000000));
    await prisma.loginCode.upsert({
      where: { identifier: phone },
      create: { identifier: phone, codeHash: hashCode(code), expiresAt: new Date(Date.now() + 5 * 60_000) },
      update: { codeHash: hashCode(code), expiresAt: new Date(Date.now() + 5 * 60_000), attempts: 0 }
    });

    if (process.env.NODE_ENV !== "production") {
      console.info(`Development OTP for ${phone}: ${code}`);
    } else {
      const delivery = await sendSms(phone, code);
      if (!delivery.configured) {
        return res.status(503).json({ error: "SMS verification is not configured." });
      }
      if (!delivery.sent) {
        return res.status(502).json({ error: "The SMS provider could not send the verification code. Check its configuration and try again." });
      }
    }
    return res.status(202).json({ message: "If the number can receive a code, it will arrive shortly." });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/verify-otp", async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body?.phone ?? req.body?.identifier);
    const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";
    const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!phone || !/^\d{6}$/.test(code) || name.length < 2 || name.length > 80 ||
        password.length < 12 || password.length > 128) {
      return res.status(400).json({ error: "Enter your phone, six-digit SMS code, name, and a password of 12–128 characters." });
    }

    const loginCode = await prisma.loginCode.findUnique({ where: { identifier: phone } });
    const matches = loginCode && timingSafeEqual(Buffer.from(loginCode.codeHash), Buffer.from(hashCode(code)));
    if (!loginCode || loginCode.expiresAt < new Date() || loginCode.attempts >= 5 || !matches) {
      if (loginCode) {
        await prisma.loginCode.update({
          where: { identifier: phone },
          data: { attempts: { increment: 1 } }
        });
      }
      return res.status(401).json({ error: "That code is invalid or expired. Request a new one." });
    }

    const existing = await prisma.user.findUnique({ where: { phone }, select: { id: true, passwordHash: true } });
    if (existing?.passwordHash) {
      return res.status(409).json({ error: "An account already uses this phone. Sign in with your password." });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.$transaction(async (transaction) => {
      const created = await transaction.user.upsert({
        where: { phone },
        create: { phone, name, passwordHash, phoneVerifiedAt: new Date() },
        update: { name, passwordHash, phoneVerifiedAt: new Date() }
      });
      await transaction.loginCode.delete({ where: { identifier: phone } });
      return created;
    });

    return res.status(201).json({
      token: createToken(user),
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        discoverableByPhone: user.discoverableByPhone
      }
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/signup", async (req, res, next) => {
  try {
    const username = normalizeUsername(req.body?.username);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!username || password.length < 12 || password.length > 128) {
      return res.status(400).json({ error: "Choose a username (3–32 letters, numbers, or underscores) and a password of 12–128 characters." });
    }

    const existing = await prisma.user.findUnique({ where: { username }, select: { id: true } });
    if (existing) return res.status(409).json({ error: "That username is already taken." });

    const user = await prisma.user.create({
      data: {
        username,
        name: username,
        passwordHash: await hashPassword(password),
        discoverableByPhone: false
      }
    });
    return res.status(201).json({
      token: createToken(user),
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        discoverableByPhone: user.discoverableByPhone
      }
    });
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ error: "That username is already taken." });
    return next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const legacyPhoneLogin = typeof req.body?.phone === "string" &&
      typeof req.body?.identifier !== "string" && typeof req.body?.username !== "string";
    const identifier = legacyPhoneLogin
      ? req.body.phone
      : typeof req.body?.identifier === "string"
        ? req.body.identifier
        : req.body?.username;
    const looksLikePhone = legacyPhoneLogin || (typeof identifier === "string" && /^\s*(?:\+|00)/.test(identifier));
    const phone = looksLikePhone ? normalizePhone(identifier) : null;
    const username = looksLikePhone ? null : normalizeUsername(identifier);
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if ((!phone && !username) || !password || password.length > 128) {
      return res.status(400).json({ error: "Enter a valid username or international phone number and password." });
    }
    const user = await prisma.user.findUnique({ where: phone ? { phone } : { username } });
    if (!user?.passwordHash || (phone && !user.phoneVerifiedAt) || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: "Username or password is incorrect." });
    }
    return res.json({
      token: createToken(user),
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        discoverableByPhone: user.discoverableByPhone
      }
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, phone: true, name: true, username: true, avatarUrl: true, bio: true, discoverableByPhone: true }
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
    if (req.body?.discoverableByPhone === true) {
      const currentUser = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { phone: true, phoneVerifiedAt: true }
      });
      if (!currentUser?.phone || !currentUser.phoneVerifiedAt) {
        return res.status(400).json({ error: "Verify a phone number before enabling contact discovery." });
      }
      data.discoverableByPhone = true;
    } else if (req.body?.discoverableByPhone === false) {
      data.discoverableByPhone = false;
    }
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
      if (!username) {
        const currentUser = await prisma.user.findUnique({
          where: { id: req.userId },
          select: { phoneVerifiedAt: true }
        });
        if (!currentUser?.phoneVerifiedAt) {
          return res.status(400).json({ error: "A username is required while your phone number is unverified." });
        }
      }
      data.username = username || null;
    }
    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: { id: true, phone: true, name: true, username: true, avatarUrl: true, bio: true, discoverableByPhone: true }
    });
    return res.json({ user });
  } catch (error) {
    if (error.code === "P2002") return res.status(409).json({ error: "That username is already taken." });
    return next(error);
  }
});
