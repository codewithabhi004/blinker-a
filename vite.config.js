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

        if (req.url === "/api/github/push" && req.method === "POST") {
          let body = "";
          req.on("data", chunk => { body += chunk; });
          req.on("end", async () => {
            try {
              const { exec } = await import("node:child_process");
              const data = body ? JSON.parse(body) : {};
              const token = data.token ? data.token.trim() : "";
              if (!token) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: "Please enter your GitHub token." }));
              }
              exec(`git push https://${token}@github.com/codewithabhi004/blinker-a.git main`, (err, stdout, stderr) => {
                if (err) {
                  res.statusCode = 500;
                  return res.end(JSON.stringify({ error: stderr || err.message }));
                }
                return res.end(JSON.stringify({
                  success: true,
                  message: "Successfully pushed to GitHub!",
                  repoUrl: "https://github.com/codewithabhi004/blinker-a",
                  pagesUrl: "https://codewithabhi004.github.io/blinker-a/"
                }));
              });
            } catch (e) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: e.message }));
            }
          });
          return;
        }

        return next();
      });
    }
  };
}

export default defineConfig({
  base: "/blinker-a/",
  plugins: [react(), mockApiPlugin()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: true,
  }
});
