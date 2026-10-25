import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../auth.js";

export const contactRouter = Router();

contactRouter.post("/match", requireAuth, async (req, res, next) => {
  try {
    if (!Array.isArray(req.body?.phoneNumbers) || req.body.phoneNumbers.length > 500) {
      return res.status(400).json({ error: "Send up to 500 phone numbers." });
    }
    const countryCallingCode = typeof req.body.countryCallingCode === "string"
      ? req.body.countryCallingCode.trim()
      : "";
    if (countryCallingCode && !/^\+[1-9]\d{0,3}$/.test(countryCallingCode)) {
      return res.status(400).json({ error: "Country calling code must look like +91." });
    }
    const phoneNumbers = [...new Set(req.body.phoneNumbers
      .filter((phone) => typeof phone === "string")
      .map((phone) => {
        const raw = phone.trim();
        const digits = raw.replace(/\D/g, "");
        const international = raw.startsWith("+") ? `+${digits}` : raw.startsWith("00")
          ? `+${digits.slice(2)}`
          : countryCallingCode
            ? `${countryCallingCode}${digits.replace(/^0+/, "")}`
            : "";
        return /^\+[1-9]\d{7,14}$/.test(international) ? international : null;
      })
      .filter(Boolean))];
    const matches = await prisma.user.findMany({
      where: {
        phone: { in: phoneNumbers },
        discoverableByPhone: true,
        id: { not: req.userId }
      },
      select: { id: true, name: true, username: true, avatarUrl: true, bio: true }
    });
    return res.json({ contacts: matches });
  } catch (error) {
    return next(error);
  }
});
