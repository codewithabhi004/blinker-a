import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell, Check, ChevronRight, Moon, Phone, Search, Shield, Sun, Users, X
} from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { Contacts } from "@capacitor-community/contacts";
import { io } from "socket.io-client";
import Avatar from "./components/Avatar.jsx";
import ChatSidebar from "./components/ChatSidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import CallModal from "./components/CallModal.jsx";
import StatusViewer from "./components/StatusViewer.jsx";
import ProfileModal from "./components/ProfileModal.jsx";
import WallpaperModal from "./components/WallpaperModal.jsx";
import {
  avatarColors, defaultUser, starterChats, starterStories, wallpaperPresets
} from "./data.js";

const API = import.meta.env.VITE_API_URL ?? "";
const emptySettings = {
  theme: "dark",
  notifications: true,
  discoverable: true,
  countryCode: ""
};

const defaultWallpaperConfig = {
  type: "preset",
  id: "aurora",
  name: "Telegram Aurora",
  bg: "radial-gradient(ellipse at 45% -20%, rgba(112, 91, 187, .25), transparent 60%), radial-gradient(ellipse at 95% 70%, rgba(60, 122, 168, .2), transparent 50%), #0d1118",
  dim: 20,
  blur: 0
};

const nowLabel = () => new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date());

function loadStored(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function AvatarColor(index) {
  return avatarColors[index % avatarColors.length];
}

export default function App() {
  const [chats, setChats] = useState(() => loadStored("blinker-chats", starterChats));
  const [activeId, setActiveId] = useState(() => loadStored("blinker-active", "sophie"));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [mobileTab, setMobileTab] = useState("chats");
  const [settings, setSettings] = useState(() => loadStored("blinker-settings", emptySettings));
  const [user, setUser] = useState(() => loadStored("blinker-user", defaultUser));
  const [wallpaperConfig, setWallpaperConfig] = useState(() => loadStored("blinker-wallpaper", defaultWallpaperConfig));
  const [stories, setStories] = useState(() => loadStored("blinker-stories", starterStories));

  // Modals
  const [showProfile, setShowProfile] = useState(false);
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [showStories, setShowStories] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Messaging state
  const [replyTo, setReplyTo] = useState(null);
  const [typing, setTyping] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [login, setLogin] = useState({ identifier: "", code: "", sent: false, busy: false, error: "" });
  const [token, setToken] = useState(() => localStorage.getItem("blinker-token"));
  const [socket, setSocket] = useState(null);
  const [contactMatches, setContactMatches] = useState([]);
  const [toast, setToast] = useState("");

  const typingTimer = useRef(null);
  const activeChatRef = useRef(activeId);
  activeChatRef.current = activeId;

  const chat = useMemo(() => chats.find((item) => item.id === activeId), [chats, activeId]);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem("blinker-chats", JSON.stringify(chats));
      localStorage.setItem("blinker-active", JSON.stringify(activeId));
      localStorage.setItem("blinker-settings", JSON.stringify(settings));
      localStorage.setItem("blinker-user", JSON.stringify(user));
      localStorage.setItem("blinker-wallpaper", JSON.stringify(wallpaperConfig));
      localStorage.setItem("blinker-stories", JSON.stringify(stories));
    } catch {
      // Local storage full
    }
  }, [chats, activeId, settings, user, wallpaperConfig, stories]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings]);

  // Socket.io integration if connected
  useEffect(() => {
    if (!token) return undefined;
    const client = io(API || window.location.origin, { auth: { token }, transports: ["websocket", "polling"] });
    setSocket(client);
    client.on("connect_error", () => {});
    client.on("message:new", (message) => {
      setChats((items) => items.map((item) => item.id !== message.chatId ? item : {
        ...item,
        messages: [...item.messages.filter((old) => old.id !== message.id), {
          id: message.id,
          from: message.senderId === user?.id ? "me" : "them",
          sender: message.sender?.name,
          text: message.text ?? "",
          time: new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
          read: false
        }]
      }));
    });
    return () => {
      client.disconnect();
      setSocket(null);
    };
  }, [token, user?.id]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function updateChat(id, updater) {
    setChats((items) => items.map((item) => item.id === id ? updater(item) : item));
  }

  function selectChat(id) {
    setActiveId(id);
    setMobileOpen(true);
    updateChat(id, (item) => ({ ...item, unread: 0 }));
    setShowDetails(false);
    setReplyTo(null);
  }

  function sendMessage({ text, file, kind, voiceDuration, waveform }) {
    if (!chat) return;

    if (editingId) {
      updateChat(chat.id, (item) => ({
        ...item,
        messages: item.messages.map((entry) => entry.id === editingId ? { ...entry, text, edited: true } : entry)
      }));
      setEditingId(null);
      setEditDraft(null);
      setReplyTo(null);
      return;
    }

    const fileUrl = file ? URL.createObjectURL(file) : null;
    const isImage = file?.type.startsWith("image/");
    const isVideo = file?.type.startsWith("video/");
    const isAudio = file?.type.startsWith("audio/") || kind === "audio";

    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      from: "me",
      text: text || (file ? `Shared ${file.name}` : ""),
      time: nowLabel(),
      read: true,
      delivered: true,
      reply: replyTo?.text,
      fileName: file?.name,
      fileUrl,
      kind: isImage ? "image" : isVideo ? "video" : isAudio ? "audio" : file ? "file" : "text",
      voiceDuration: voiceDuration || (isAudio ? "0:08" : undefined),
      waveform: waveform || (isAudio ? [30, 60, 90, 70, 40, 80, 100, 75, 45, 60, 85, 40, 30, 60, 90, 50, 30] : undefined),
      reactions: []
    };

    updateChat(chat.id, (item) => ({
      ...item,
      messages: [...item.messages, message]
    }));
    setReplyTo(null);

    // Simulated responsive reply for interactive feel
    if (!chat.group && !chat.channel && chat.id === "sophie") {
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          const replyText = text.toLowerCase().includes("photo") || text.toLowerCase().includes("camera")
            ? "That sounds amazing! I can bring along my 35mm lens too 📸"
            : text.toLowerCase().includes("hi") || text.toLowerCase().includes("hey")
            ? "Hey Alex! How's your project coming along?"
            : "Got it! Thanks for sharing ✨ Let's catch up more soon.";
          
          updateChat(chat.id, (c) => ({
            ...c,
            messages: [
              ...c.messages,
              {
                id: `reply-${Date.now()}`,
                from: "them",
                text: replyText,
                time: nowLabel(),
                read: false,
                reactions: [{ emoji: "❤️", count: 1, mine: false }]
              }
            ]
          }));
        }, 1600);
      }, 1000);
    }
  }

  function startTyping() {
    if (socket && chat) {
      socket.emit("typing:start", { chatId: chat.id });
      window.clearTimeout(typingTimer.current);
      typingTimer.current = window.setTimeout(() => socket.emit("typing:stop", { chatId: chat.id }), 900);
    }
  }

  function replyToMessage(message) {
    setReplyTo(message ? { id: message.id, text: message.text || "Attachment" } : null);
  }

  function editMessage(message) {
    if (message.from !== "me") return;
    setEditingId(message.id);
    setEditDraft(message.text);
    setReplyTo(null);
  }

  function deleteMessage(message) {
    const forEveryone = message.from === "me" && window.confirm("Delete this message for everyone? Choose Cancel to delete it only for yourself.");
    if (forEveryone) {
      updateChat(chat.id, (item) => ({
        ...item,
        messages: item.messages.map((entry) => entry.id === message.id ? { ...entry, deleted: true, text: "" } : entry)
      }));
    } else {
      updateChat(chat.id, (item) => ({
        ...item,
        messages: item.messages.filter((entry) => entry.id !== message.id)
      }));
    }
  }

  function pinMessage(message) {
    if (!message) return;
    updateChat(chat.id, (item) => ({ ...item, pinned: message.text || "Shared attachment" }));
    setToast("Pinned message updated.");
  }

  function forwardMessage(message) {
    const candidates = chats.filter((item) => item.id !== chat.id);
    const choices = candidates.map((item, index) => `${index + 1}. ${item.name}`).join("\n");
    const selected = Number(window.prompt(`Forward to which chat?\n${choices}`));
    const target = candidates[selected - 1];
    if (!target) return;
    updateChat(target.id, (item) => ({
      ...item,
      messages: [
        ...item.messages,
        {
          ...message,
          id: `fwd-${Date.now()}`,
          from: "me",
          sender: undefined,
          time: nowLabel(),
          forwarded: true
        }
      ]
    }));
    setToast(`Forwarded to ${target.name}.`);
  }

  function handleReact(messageId, emoji) {
    if (!chat) return;
    updateChat(chat.id, (item) => ({
      ...item,
      messages: item.messages.map((msg) => {
        if (msg.id !== messageId) return msg;
        const currentReactions = msg.reactions ? [...msg.reactions] : [];
        const existing = currentReactions.find((r) => r.emoji === emoji);

        if (existing) {
          if (existing.mine) {
            existing.mine = false;
            existing.count = Math.max(existing.count - 1, 0);
          } else {
            existing.mine = true;
            existing.count += 1;
          }
        } else {
          currentReactions.push({ emoji, count: 1, mine: true });
        }

        return {
          ...msg,
          reactions: currentReactions.filter((r) => r.count > 0)
        };
      })
    }));
  }

  function handleStartCall(isVideo) {
    if (!chat) return;
    setIsVideoCall(isVideo);
    setShowCall(true);
  }

  function handleOpenStory(index) {
    setStoryIndex(index);
    setShowStories(true);
  }

  function handleAddStory(newStory) {
    setStories([newStory, ...stories]);
    setToast("Your status update is live for 24 hours!");
  }

  function handleReplyStory(story, text) {
    const targetChat = chats.find((c) => c.id === story.userId) || chats[0];
    if (targetChat) {
      updateChat(targetChat.id, (c) => ({
        ...c,
        messages: [
          ...c.messages,
          {
            id: `story-reply-${Date.now()}`,
            from: "me",
            reply: `Replying to status: "${story.caption}"`,
            text,
            time: nowLabel(),
            read: true
          }
        ]
      }));
      setToast(`Reply sent to ${story.userName}!`);
    }
    setShowStories(false);
  }

  async function createGroup() {
    const name = window.prompt("Name your group or channel:");
    if (!name?.trim()) return;
    const requestedType = window.prompt("Create a group or channel? Enter 'group' or 'channel'.", "group");
    if (!requestedType) return;
    const choice = requestedType.trim().toLowerCase();
    const isChannel = choice === "channel";

    const created = {
      id: `chat-${Date.now()}`,
      name: name.trim(),
      username: isChannel ? `@${name.toLowerCase().replace(/[^a-z0-9]/g, "")}` : "1 member",
      color: AvatarColor(chats.length),
      avatar: name.slice(0, 2).toUpperCase(),
      group: !isChannel,
      channel: isChannel,
      type: isChannel ? "channel" : "group",
      unread: 0,
      messages: [
        {
          id: `welcome-${Date.now()}`,
          from: "them",
          sender: "System",
          text: isChannel ? `Channel "${name.trim()}" created. Broadcast updates to your subscribers.` : `Group "${name.trim()}" created. Add members and start chatting.`,
          time: nowLabel()
        }
      ]
    };

    setChats([created, ...chats]);
    setActiveId(created.id);
    setMobileOpen(true);
    setToast(`${isChannel ? "Channel" : "Group"} created!`);
  }

  function handleUpdateUser(updated) {
    setUser(updated);
    setToast("Profile and bio updated successfully!");
  }

  function signOut() {
    localStorage.removeItem("blinker-token");
    setToken(null);
    setUser(defaultUser);
    setShowProfile(false);
    setToast("Signed out. Default profile restored.");
  }

  return (
    <main className={`app-shell${mobileOpen ? " mobile-open" : ""}`}>
      {/* Sidebar with Telegram folders, WhatsApp Stories, Android FAB and Navigation */}
      <ChatSidebar
        chats={chats}
        activeId={activeId}
        onSelect={selectChat}
        query={query}
        onQuery={setQuery}
        filter={filter}
        onFilter={setFilter}
        onNewChat={createGroup}
        onContacts={() => setShowContacts(true)}
        onSettings={() => setShowSettings(true)}
        onProfile={() => setShowProfile(true)}
        user={user}
        stories={stories}
        onOpenStory={handleOpenStory}
        onOpenStatusCreator={() => {
          setStoryIndex(0);
          setShowStories(true);
        }}
        mobileTab={mobileTab}
        onSetMobileTab={setMobileTab}
        onStartCall={() => handleStartCall(false)}
      />

      {/* Main Conversation Window with custom wallpaper, in-chat search, voice notes and reactions */}
      <ChatWindow
        chat={chat}
        onBack={() => setMobileOpen(false)}
        onSend={sendMessage}
        onTyping={startTyping}
        onReply={replyToMessage}
        onEdit={editMessage}
        onDelete={deleteMessage}
        onForward={forwardMessage}
        onPin={pinMessage}
        onDetails={() => setShowDetails((prev) => !prev)}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        typing={typing}
        editText={editDraft}
        onCancelEdit={() => { setEditingId(null); setEditDraft(null); }}
        onError={setToast}
        onStartCall={handleStartCall}
        onOpenWallpaper={() => setShowWallpaper(true)}
        wallpaperConfig={wallpaperConfig}
        onReact={handleReact}
      />

      {/* Chat Details Side Panel */}
      <aside className={`details-panel${showDetails ? " open" : ""}`} aria-label="Chat details">
        <button className="icon-button details-close" onClick={() => setShowDetails(false)} aria-label="Close details">
          <X size={18} />
        </button>
        {chat && (
          <div className="details-body">
            <div className="details-heading">Contact Information</div>
            <div className="details-card">
              <Avatar name={chat.name} color={chat.color} online={chat.online} photo={chat.avatarUrl} />
              <strong>{chat.name}</strong>
              <small>{chat.username || "@username"}</small>
              {chat.phone && <p className="details-phone">{chat.phone}</p>}
              {chat.bio && <p className="details-bio">"{chat.bio}"</p>}
              <span className="details-encryption"><Shield size={13} /> End-to-end encrypted</span>
            </div>

            <div className="details-section">
              <div className="section-label">ACTIONS</div>
              <div className="details-action-buttons">
                <button type="button" className="action-pill" onClick={() => handleStartCall(false)}>
                  <Phone size={15} /> Voice Call
                </button>
                <button type="button" className="action-pill" onClick={() => setShowWallpaper(true)}>
                  Wallpaper
                </button>
              </div>
            </div>

            <div className="details-section">
              <div className="section-label">SHARED MEDIA</div>
              <div className="shared-media">
                <span>🌊</span>
                <span>🌿</span>
                <span>☀️</span>
                <span>☕</span>
              </div>
            </div>

            {chat.group && (
              <div className="details-section">
                <div className="section-label">MEMBERS ({chat.membersCount || 2})</div>
                <div className="member-row">
                  <Avatar name={user?.name || "You"} color="#9088e8" photo={user?.avatarUrl} small />
                  <span>{user?.name || "You"}</span>
                  <small>you</small>
                </div>
                <div className="member-row">
                  <Avatar name={chat.name} color={chat.color} small />
                  <span>{chat.name.split(" ")[0]}</span>
                  <small>admin</small>
                </div>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Toast Notification */}
      {toast && (
        <motion.div className="toast" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} role="status">
          <span>{toast}</span>
          <button onClick={() => setToast("")} aria-label="Dismiss"><X size={14} /></button>
        </motion.div>
      )}

      {/* Modern Profile Modal */}
      {showProfile && (
        <ProfileModal
          user={user}
          onUpdateUser={handleUpdateUser}
          onClose={() => setShowProfile(false)}
          onSignOut={signOut}
        />
      )}

      {/* WhatsApp Custom Chat Wallpaper Modal */}
      {showWallpaper && (
        <WallpaperModal
          wallpaperConfig={wallpaperConfig}
          onSave={setWallpaperConfig}
          onClose={() => setShowWallpaper(false)}
        />
      )}

      {/* Simulated Audio/Video Calling Screen */}
      {showCall && chat && (
        <CallModal
          contact={chat}
          isVideo={isVideoCall}
          onClose={() => setShowCall(false)}
        />
      )}

      {/* WhatsApp Status / Telegram Stories Viewer */}
      {showStories && (
        <StatusViewer
          stories={stories}
          currentStoryIndex={storyIndex}
          onClose={() => setShowStories(false)}
          onAddStory={handleAddStory}
          onReplyStory={handleReplyStory}
        />
      )}

      {/* General Settings Modal */}
      {showSettings && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setShowSettings(false)}>
          <div className="modal settings-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">PREFERENCES</span>
                <h2>Settings</h2>
              </div>
              <button className="icon-button" onClick={() => setShowSettings(false)}><X size={18} /></button>
            </div>

            <div className="settings-block">
              <h3>Appearance</h3>
              <div className="theme-picker">
                <button
                  className={settings.theme === "dark" ? "selected" : ""}
                  onClick={() => setSettings((v) => ({ ...v, theme: "dark" }))}
                >
                  <Moon size={16} /> Dark
                </button>
                <button
                  className={settings.theme === "light" ? "selected" : ""}
                  onClick={() => setSettings((v) => ({ ...v, theme: "light" }))}
                >
                  <Sun size={16} /> Light
                </button>
              </div>
            </div>

            <div className="settings-block">
              <h3>Chat Background</h3>
              <button className="wallpaper-open-btn" onClick={() => { setShowSettings(false); setShowWallpaper(true); }}>
                Configure WhatsApp Wallpaper & Dimming <ChevronRight size={16} />
              </button>
            </div>

            <div className="settings-block">
              <h3>Privacy & Security</h3>
              <label className="setting-row">
                <span><Bell size={16} /> Push Notifications</span>
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => setSettings((v) => ({ ...v, notifications: e.target.checked }))}
                />
              </label>
              <label className="setting-row">
                <span><Users size={16} /> Phone Number Discoverability</span>
                <input
                  type="checkbox"
                  checked={settings.discoverable}
                  onChange={(e) => setSettings((v) => ({ ...v, discoverable: e.target.checked }))}
                />
              </label>
            </div>

            <div className="modal-footer">
              <button className="primary-button" onClick={() => setShowSettings(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
