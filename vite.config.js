import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function mockApiPlugin() {
  return {
    name: "blinker-mock-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url.startsWith("/api/")) return next();

        res.setHeader("Content-Type", "application/json");

        if (req.url === "/api/health") {
          return res.end(JSON.stringify({ status: "ok" }));
        }

        if (req.url === "/api/auth/request-otp" && req.method === "POST") {
          let body = "";
          req.on("data", chunk => { body += chunk; });
          req.on("end", () => {
            const data = body ? JSON.parse(body) : {};
            console.log(`[Blinker-a] Dev OTP requested for ${data.identifier}: 123456`);
            return res.end(JSON.stringify({ message: "If the address can receive a code, it will arrive shortly." }));
          });
          return;
        }

        if (req.url === "/api/auth/verify-otp" && req.method === "POST") {
          let body = "";
          req.on("data", chunk => { body += chunk; });
          req.on("end", () => {
            const data = body ? JSON.parse(body) : {};
            const name = data.identifier?.includes("@") ? data.identifier.split("@")[0] : "Alex Morgan";
            return res.end(JSON.stringify({
              token: "blinker-mock-token-" + Date.now(),
              user: {
                id: "user-demo",
                name,
                username: name.toLowerCase().replace(/[^a-z0-9]/g, ""),
                avatarUrl: null,
                bio: "Using Blinker-a",
                discoverableByPhone: false
              }
            }));
          });
          return;
        }

        if (req.url === "/api/auth/me") {
          return res.end(JSON.stringify({
            user: {
              id: "user-demo",
              name: "Alex Morgan",
              username: "alexm",
              avatarUrl: null,
              bio: "Using Blinker-a",
              discoverableByPhone: false
            }
          }));
        }

        if (req.url.startsWith("/api/chats") && req.method === "GET") {
          return res.end(JSON.stringify({
            chats: [
              {
                id: "c-sophie",
                title: "Sophie Williams",
                type: "PRIVATE",
                members: [{ userId: "other-1", user: { id: "other-1", name: "Sophie Williams", username: "sophiew" } }],
                messages: [
                  { id: "m-1", senderId: "other-1", text: "Hey Alex! Welcome back to Blinker-a.", createdAt: new Date().toISOString(), receipts: [] }
                ]
              }
            ]
          }));
        }

        if (req.url.startsWith("/api/chats") && req.method === "POST") {
          let body = "";
          req.on("data", chunk => { body += chunk; });
          req.on("end", () => {
            const data = body ? JSON.parse(body) : {};
            return res.end(JSON.stringify({
              chat: {
                id: "chat-" + Date.now(),
                title: data.title || "New Conversation",
                type: data.type || "GROUP",
                members: [],
                messages: []
              }
            }));
          });
          return;
        }

        if (req.url === "/api/contacts/match") {
          return res.end(JSON.stringify({ contacts: [] }));
        }

        return next();
      });
    }
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), mockApiPlugin()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  }
});

