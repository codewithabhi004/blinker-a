import jwt from "jsonwebtoken";

export function createToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ error: "Authentication required." });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    return next();
  } catch {
    return res.status(401).json({ error: "Session expired. Please sign in again." });
  }
}

export function authenticateSocket(socket, next) {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required."));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.sub;
    return next();
  } catch {
    return next(new Error("Session expired."));
  }
}
