import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check, ChevronRight, ContactRound, Image, Moon, Search, Shield, Sun, Users, X
} from "lucide-react";
import { io } from "socket.io-client";
import { Capacitor } from "@capacitor/core";
import { Contacts as NativeContacts } from "@capacitor-community/contacts";
import { API_BASE, apiRequest } from "./api.js";
import Avatar from "./components/Avatar.jsx";
import ChatSidebar from "./components/ChatSidebar.jsx";
import ChatWindow from "./components/ChatWindow.jsx";
import StatusViewer from "./components/StatusViewer.jsx";
import ProfileModal from "./components/ProfileModal.jsx";
import WallpaperModal from "./components/WallpaperModal.jsx";
import ContactsModal from "./components/ContactsModal.jsx";
import InstallAppModal from "./components/InstallAppModal.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import {
  avatarColors, wallpaperPresets
} from "./data.js";

const emptySettings = {
  theme: "dark",
  discoverable: false,
  countryCode: "+91"
};

const defaultWallpaperConfig = {
  type: "preset",
  id: "whatsapp-doodle",
  name: "WhatsApp Classic",
  bg: "#0b141a",
  pattern: "doodle",
  dim: 15,
  blur: 0
};

const formatMessageTime = (value) => new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

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

function mapMessage(message, userId) {
  const isMine = message.senderId === userId;
  return {
    id: message.id,
    from: isMine ? "me" : "them",
    sender: message.sender?.name,
    text: message.deletedAt ? "This message was deleted." : message.text ?? "",
    deleted: Boolean(message.deletedAt),
    time: formatMessageTime(message.createdAt),
    read: Boolean(message.receipts?.some((receipt) => receipt.userId !== userId && receipt.readAt)),
    delivered: Boolean(message.receipts?.some((receipt) => receipt.userId !== userId && receipt.deliveredAt)),
    reply: message.replyTo?.text,
    kind: message.kind?.toLowerCase() ?? "text",
    fileUrl: message.mediaUrl,
    fileName: message.mediaName,
    forwarded: Boolean(message.forwardedFromId),
    reactions: []
  };
}

function mapChat(chat, userId) {
  const peer = chat.members?.find((member) => member.userId !== userId)?.user;
  const messages = [...(chat.messages ?? [])]
    .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt))
    .map((message) => mapMessage(message, userId));
  const type = chat.type?.toLowerCase();
  return {
    id: chat.id,
    name: chat.title || peer?.name || "Conversation",
    username: peer?.username ? `@${peer.username}` : "",
    avatarUrl: peer?.avatarUrl,
    color: AvatarColor((chat.id?.length ?? 0) % avatarColors.length),
    peerId: peer?.id,
    type,
    group: type === "group",
    channel: type === "channel",
    membersCount: chat.members?.length ?? 0,
    unread: messages.filter((message) => message.from === "them" && !message.read).length,
    pinned: chat.pinnedMessage?.text ?? "",
    messages
  };
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("blinker-token"));
  const [chats, setChats] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [mobileTab, setMobileTab] = useState("chats");
  const [settings, setSettings] = useState(() => loadStored("blinker-settings", emptySettings));
  const [user, setUser] = useState(null);
  const [wallpaperConfig, setWallpaperConfig] = useState(() => loadStored("blinker-wallpaper", defaultWallpaperConfig));
  const [stories, setStories] = useState([]);

  // Modals
  const [showProfile, setShowProfile] = useState(false);
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [showStories, setShowStories] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [storyFeed, setStoryFeed] = useState("others");
  const [showSettings, setShowSettings] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Messaging state
  const [replyTo, setReplyTo] = useState(null);
  const [typing, setTyping] = useState(false);
  const [editDraft, setEditDraft] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [toast, setToast] = useState("");

  const typingTimer = useRef(null);
  const activeChatRef = useRef(activeId);
  activeChatRef.current = activeId;

  const chat = useMemo(() => chats.find((item) => item.id === activeId), [chats, activeId]);
  const myStories = stories.filter((story) => story.userId === user?.id);
  const otherStories = stories.filter((story) => story.userId !== user?.id);

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("blinker-settings", JSON.stringify(settings));
      localStorage.setItem("blinker-wallpaper", JSON.stringify(wallpaperConfig));
    } catch {
      setToast("App preferences could not be saved on this device.");
    }
  }, [settings, wallpaperConfig]);

  useEffect(() => {
    document.documentElement.dataset.theme = settings.theme;
  }, [settings]);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setChats([]);
      return undefined;
    }

    let cancelled = false;
    Promise.all([
      apiRequest("/api/auth/me", { token }),
      apiRequest("/api/chats", { token })
    ]).then(([account, result]) => {
      if (cancelled) return;
      setUser(account.user);
      const loadedChats = result.chats.map((item) => mapChat(item, account.user.id));
      setChats(loadedChats);
      setActiveId((current) => loadedChats.some((item) => item.id === current) ? current : loadedChats[0]?.id ?? null);
      setSettings((current) => ({ ...current, discoverable: account.user.discoverableByPhone }));
    }).catch((error) => {
      if (cancelled) return;
      localStorage.removeItem("blinker-token");
      setToken(null);
      setToast(error.message);
    });

    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (!token || !user?.id) return undefined;
    const client = io(API_BASE || window.location.origin, { auth: { token }, transports: ["websocket", "polling"] });
    setSocket(client);
    client.on("connect_error", (error) => setToast(error.message || "Live chat connection failed."));
    client.on("presence:snapshot", ({ userIds }) => {
      const online = new Set(userIds);
      setChats((items) => items.map((item) => item.peerId ? { ...item, online: online.has(item.peerId) } : item));
    });
    client.on("message:new", (message) => {
      const incoming = message.senderId !== user.id;
      if (incoming && activeChatRef.current === message.chatId) {
        client.emit("message:read", { chatId: message.chatId }, (result) => {
          if (result?.error) setToast(result.error);
        });
      }
      setChats((items) => items.map((item) => {
        if (item.id !== message.chatId) return item;
        const alreadyReceived = item.messages.some((old) => old.id === message.id);
        return {
          ...item,
          unread: incoming && !alreadyReceived && activeChatRef.current !== message.chatId ? item.unread + 1 : item.unread,
          messages: [...item.messages.filter((old) => old.id !== message.id), mapMessage(message, user.id)]
        };
      }));
    });
    client.on("message:updated", (message) => {
      setChats((items) => items.map((item) => item.id !== message.chatId ? item : ({
        ...item,
        messages: item.messages.map((old) => old.id === message.id ? mapMessage(message, user.id) : old)
      })));
    });
    client.on("message:deleted", ({ messageId, forEveryone }) => {
      setChats((items) => items.map((item) => ({
        ...item,
        messages: forEveryone
          ? item.messages.map((old) => old.id === messageId ? { ...old, deleted: true, text: "This message was deleted." } : old)
          : item.messages.filter((old) => old.id !== messageId)
      })));
    });
    client.on("chat:added", async () => {
      try {
        const result = await apiRequest("/api/chats", { token });
        setChats(result.chats.map((item) => mapChat(item, user.id)));
      } catch (error) {
        setToast(error.message);
      }
    });
    client.on("presence:online", ({ userId }) => {
      setChats((items) => items.map((item) => item.peerId === userId ? { ...item, online: true } : item));
    });
    client.on("presence:offline", ({ userId }) => {
      setChats((items) => items.map((item) => item.peerId === userId ? { ...item, online: false } : item));
    });
    client.on("typing:start", ({ chatId }) => {
      if (activeChatRef.current === chatId) setTyping(true);
    });
    client.on("typing:stop", ({ chatId }) => {
      if (activeChatRef.current === chatId) setTyping(false);
    });
    client.on("receipt:read", ({ messageIds }) => {
      const readIds = new Set(messageIds);
      setChats((items) => items.map((item) => ({
        ...item,
        messages: item.messages.map((message) => readIds.has(message.id) ? { ...message, read: true } : message)
      })));
    });
    client.on("receipt:delivered", ({ messageId }) => {
      setChats((items) => items.map((item) => ({
        ...item,
        messages: item.messages.map((message) => message.id === messageId ? { ...message, delivered: true } : message)
      })));
    });
    client.on("chat:pinned", ({ chatId, message }) => {
      setChats((items) => items.map((item) => item.id === chatId
        ? { ...item, pinned: message.text || "Shared attachment" }
        : item));
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
    if (socket?.connected) {
      socket.emit("message:read", { chatId: id }, (result) => {
        if (result?.error) setToast(result.error);
      });
    }
    setShowDetails(false);
    setReplyTo(null);
  }

  async function handleSelectContact(contact) {
    const peerId = contact.userId || contact.id;
    if (!peerId || contact.isOnBlinker === false) {
      setToast("This number is not linked to a Blinker-a account yet.");
      return;
    }

    try {
      let existingChat = chats.find((item) => item.peerId === peerId && !item.group && !item.channel);
      if (!existingChat) {
        const result = await apiRequest("/api/chats", {
          token,
          method: "POST",
          body: JSON.stringify({ type: "PRIVATE", memberIds: [peerId] })
        });
        existingChat = mapChat(result.chat, user.id);
        setChats((items) => [existingChat, ...items]);
        socket?.emit("chat:join", { chatId: existingChat.id });
      }
      setActiveId(existingChat.id);
      setMobileOpen(true);
      setShowContacts(false);
      setToast(`Chat opened with ${contact.name}`);
    } catch (error) {
      setToast(error.message);
    }
  }

  function handleAddContact(newContact) {
    setContacts((items) => [newContact, ...items]);
    setToast("Contact saved on this device. They can be messaged after joining Blinker-a.");
  }

  async function searchUsername(username) {
    const result = await apiRequest(`/api/contacts/search?username=${encodeURIComponent(username)}`, { token });
    return {
      id: result.user.id,
      userId: result.user.id,
      name: result.user.name,
      phone: "",
      username: `@${result.user.username}`,
      bio: result.user.bio,
      avatarUrl: result.user.avatarUrl,
      color: AvatarColor(result.user.id.length),
      online: false,
      isOnBlinker: true
    };
  }

  async function importPhoneContacts() {
    if (!Capacitor.isNativePlatform()) {
      setToast("Phone contact sync is available in the installed Android app.");
      return;
    }

    try {
      let permission = await NativeContacts.checkPermissions();
      if (permission.contacts !== "granted" && permission.contacts !== "limited") {
        permission = await NativeContacts.requestPermissions();
      }
      if (permission.contacts !== "granted" && permission.contacts !== "limited") {
        setToast("Contacts permission was not granted.");
        return;
      }

      const { contacts: deviceContacts } = await NativeContacts.getContacts({
        projection: { name: true, phones: true }
      });
      const normalizedPhones = (deviceContacts ?? []).flatMap((deviceContact) =>
        (deviceContact.phones ?? []).map(({ number }) => {
          if (!number) return null;
          const digits = number.replace(/\D/g, "");
          const international = number.trim().startsWith("+")
            ? `+${digits}`
            : number.trim().startsWith("00")
              ? `+${digits.slice(2)}`
              : `${settings.countryCode}${digits.replace(/^0+/, "")}`;
          return /^\+[1-9]\d{7,14}$/.test(international)
            ? {
              phone: international,
              localName: deviceContact.name?.display?.trim() || deviceContact.name?.given?.trim()
            }
            : null;
        }).filter(Boolean)
      );
      const localNames = new Map(normalizedPhones.map(({ phone, localName }) => [phone, localName]));
      const uniquePhones = [...new Set(normalizedPhones.map(({ phone }) => phone))];
      const matchedUsers = [];
      for (let index = 0; index < uniquePhones.length; index += 500) {
        const result = await apiRequest("/api/contacts/match", {
          token,
          method: "POST",
          body: JSON.stringify({
            phoneNumbers: uniquePhones.slice(index, index + 500),
            countryCallingCode: settings.countryCode
          })
        });
        matchedUsers.push(...result.contacts);
      }

      const matchedContacts = matchedUsers.map((matchedUser, index) => ({
        id: matchedUser.id,
        userId: matchedUser.id,
        name: localNames.get(matchedUser.phone) || matchedUser.name,
        profileName: matchedUser.name,
        phone: matchedUser.phone,
        username: matchedUser.username ? `@${matchedUser.username}` : "",
        bio: matchedUser.bio,
        avatarUrl: matchedUser.avatarUrl,
        color: AvatarColor(index),
        online: false,
        isOnBlinker: true
      }));
      setContacts(matchedContacts);
      setToast(`${matchedContacts.length} Blinker-a contact${matchedContacts.length === 1 ? "" : "s"} found.`);
    } catch (error) {
      setToast(error.message);
    }
  }

  function sendMessage({ text }) {
    if (!chat) return;

    if (editingId) {
      if (!socket?.connected) {
        setToast("Connect to live chat before editing a message.");
        return;
      }
      socket.emit("message:edit", { messageId: editingId, text }, (result) => {
        if (result?.error) {
          setToast(result.error);
          return;
        }
        setEditingId(null);
        setEditDraft(null);
        setReplyTo(null);
      });
      return;
    }

    if (!socket?.connected) {
      setToast("Live chat is disconnected. Your message was not sent.");
      return;
    }

    socket.emit("message:send", {
      chatId: chat.id,
      text,
      ...(replyTo?.id ? { replyToId: replyTo.id } : {})
    }, (result) => {
      if (result?.error) {
        setToast(result.error);
        return;
      }
      setReplyTo(null);
    });
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
    if (!socket?.connected) {
      setToast("Connect to live chat before deleting a message.");
      return;
    }
    socket.emit("message:delete", { messageId: message.id, forEveryone }, (result) => {
      if (result?.error) setToast(result.error);
    });
  }

  function pinMessage(message) {
    if (!message) return;
    if (!socket?.connected) {
      setToast("Connect to live chat before pinning a message.");
      return;
    }
    socket.emit("message:pin", { chatId: chat.id, messageId: message.id }, (result) => {
      if (result?.error) setToast(result.error);
      else {
        updateChat(chat.id, (item) => ({ ...item, pinned: message.text || "Shared attachment" }));
        setToast("Message pinned.");
      }
    });
  }

  function forwardMessage(message) {
    const candidates = chats.filter((item) => item.id !== chat.id);
    const choices = candidates.map((item, index) => `${index + 1}. ${item.name}`).join("\n");
    const selected = Number(window.prompt(`Forward to which chat?\n${choices}`));
    const target = candidates[selected - 1];
    if (!target) return;
    if (!socket?.connected) {
      setToast("Connect to live chat before forwarding a message.");
      return;
    }
    socket.emit("message:forward", { messageId: message.id, chatId: target.id }, (result) => {
      if (result?.error) setToast(result.error);
      else setToast(`Forwarded to ${target.name}.`);
    });
  }

  function handleOpenStory(index) {
    setStoryFeed("others");
    setStoryIndex(index);
    setShowStories(true);
  }

  function handleOpenMyStatus() {
    setStoryFeed("mine");
    setStoryIndex(myStories.length ? 0 : -1);
    setShowStories(true);
  }

  function handleAddStory(newStory) {
    setStories((items) => [newStory, ...items]);
    setToast("Status saved to My Status on this device only.");
  }

  async function createGroup() {
    const name = window.prompt("Name your Indian group or channel (e.g. Friends Adda, College Buddies):");
    if (!name?.trim()) return;
    const requestedType = window.prompt("Create a group or channel? Enter 'group' or 'channel'.", "group");
    if (!requestedType) return;
    const choice = requestedType.trim().toLowerCase();
    const isChannel = choice === "channel";
    try {
      const result = await apiRequest("/api/chats", {
        token,
        method: "POST",
        body: JSON.stringify({ type: isChannel ? "CHANNEL" : "GROUP", title: name.trim(), memberIds: [] })
      });
      const created = mapChat(result.chat, user.id);
      setChats((items) => [created, ...items]);
      setActiveId(created.id);
      setMobileOpen(true);
      socket?.emit("chat:join", { chatId: created.id });
      setToast(`${isChannel ? "Channel" : "Group"} created.`);
    } catch (error) {
      setToast(error.message);
    }
  }

  async function handleUpdateUser(updated) {
    try {
      const result = await apiRequest("/api/auth/me", {
        token,
        method: "PATCH",
        body: JSON.stringify({
          name: updated.name,
          username: updated.username,
          bio: updated.bio,
          avatarUrl: updated.avatarUrl,
          discoverableByPhone: updated.discoverableByPhone
        })
      });
      setUser((current) => ({ ...current, ...result.user }));
      setSettings((current) => ({ ...current, discoverable: result.user.discoverableByPhone }));
      setToast("Profile updated.");
      return true;
    } catch (error) {
      setToast(error.message);
      return false;
    }
  }

  async function updatePhoneDiscovery(discoverableByPhone) {
    setSettings((current) => ({ ...current, discoverable: discoverableByPhone }));
    try {
      const result = await apiRequest("/api/auth/me", {
        token,
        method: "PATCH",
        body: JSON.stringify({ discoverableByPhone })
      });
      setUser((current) => ({ ...current, ...result.user }));
    } catch (error) {
      setSettings((current) => ({ ...current, discoverable: !discoverableByPhone }));
      setToast(error.message);
    }
  }

  function signOut() {
    localStorage.removeItem("blinker-token");
    setToken(null);
    setUser(null);
    setChats([]);
    setContacts([]);
    setStories([]);
    setShowStories(false);
    setStoryFeed("others");
    setActiveId(null);
    setShowProfile(false);
    setToast("");
  }

  if (!token || !user) {
    return (
      <AuthScreen
        onAuthenticated={({ token: nextToken, user: nextUser }) => {
          localStorage.setItem("blinker-token", nextToken);
          setChats([]);
          setContacts([]);
          setActiveId(null);
          setUser(nextUser);
          setSettings((current) => ({ ...current, discoverable: nextUser.discoverableByPhone }));
          setToken(nextToken);
        }}
      />
    );
  }

  return (
    <main className={`app-shell${mobileOpen ? " mobile-open" : ""}`}>
      {/* Sidebar with Telegram folders, WhatsApp Stories, Contacts button, Android FAB and Navigation */}
      <ChatSidebar
        chats={chats}
        activeId={activeId}
        onSelect={selectChat}
        query={query}
        onQuery={setQuery}
        filter={filter}
        onFilter={setFilter}
        onNewChat={createGroup}
        onSettings={() => setShowSettings(true)}
        onProfile={() => setShowProfile(true)}
        user={user}
        stories={otherStories}
        hasMyStatus={myStories.length > 0}
        onOpenStory={handleOpenStory}
        onOpenStatusCreator={handleOpenMyStatus}
        mobileTab={mobileTab}
        onSetMobileTab={(tab) => {
          setMobileTab(tab);
          if (tab === "status") {
            if (otherStories.length) handleOpenStory(0);
            else handleOpenMyStatus();
          }
          if (tab === "profile") setShowProfile(true);
          if (tab === "settings") setShowSettings(true);
        }}
        onOpenInstall={!Capacitor.isNativePlatform() ? () => setShowInstall(true) : undefined}
      />

      {/* Main conversation with wallpaper, search, and text messaging */}
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
        onOpenWallpaper={() => setShowWallpaper(true)}
        wallpaperConfig={wallpaperConfig}
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
              <span className="details-encryption"><Shield size={13} /> Private Blinker-a chat</span>
            </div>

            <div className="details-section">
              <div className="section-label">ACTIONS</div>
              <div className="details-action-buttons">
                <button type="button" className="action-pill" onClick={() => setShowWallpaper(true)}>
                  <Image size={15} /> Wallpaper
                </button>
              </div>
            </div>

            {chat.group && (
              <div className="details-section">
                <div className="section-label">MEMBERS ({chat.membersCount || 2})</div>
                <div className="member-row">
                  <Avatar name={user?.name || "Abhishek"} color="#9088e8" photo={user?.avatarUrl} small />
                  <span>{user?.name || "Abhishek Upadhyay"}</span>
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

      {/* Indian Phone Contacts Book Modal */}
      {showContacts && (
        <ContactsModal
          contacts={contacts}
          onSelectContact={handleSelectContact}
          onSearchUsername={searchUsername}
          onAddContact={handleAddContact}
          onImportDeviceContacts={importPhoneContacts}
          onClose={() => setShowContacts(false)}
        />
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

      {/* WhatsApp Status / Telegram Stories Viewer */}
      {showStories && (
        <StatusViewer
          stories={storyFeed === "mine" ? myStories : otherStories}
          currentStoryIndex={storyIndex}
          user={user}
          onClose={() => setShowStories(false)}
          onAddStory={handleAddStory}
        />
      )}

      {/* App Install / Download Modal */}
      {showInstall && !Capacitor.isNativePlatform() && (
        <InstallAppModal
          onClose={() => setShowInstall(false)}
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
              <h3>Theme</h3>
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
                <span className="settings-option-label"><Image size={16} /> Configure WhatsApp Wallpaper & Dimming</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="settings-block">
              <h3>Phone Directory & Contacts</h3>
              <button className="wallpaper-open-btn" onClick={() => { setShowSettings(false); setShowContacts(true); }}>
                <span className="settings-option-label"><ContactRound size={16} /> Open Indian Phone Contacts (+91)</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="settings-block">
              <h3>Privacy & Security</h3>
              <label className="setting-row">
                <span><Users size={16} /> Let contacts find me by phone (+91)</span>
                <input
                  type="checkbox"
                  checked={settings.discoverable}
                  onChange={(e) => updatePhoneDiscovery(e.target.checked)}
                />
              </label>
            </div>

            <div className="modal-footer">
              <button className="primary-button" onClick={() => setShowSettings(false)}>
                <Check size={16} /> Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
