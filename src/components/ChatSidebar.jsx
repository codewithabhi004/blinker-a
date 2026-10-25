import { motion } from "framer-motion";
import {
  Archive, BellOff, Check, CheckCheck, CircleHelp, ContactRound, Download, Github, MessageCircle,
  MoreHorizontal, Phone, Plus, Radio, Search, Settings2, Sparkles, User, Users, X
} from "lucide-react";
import Avatar from "./Avatar.jsx";

export default function ChatSidebar({
  chats, activeId, onSelect, query, onQuery, filter, onFilter, onNewChat,
  onContacts, onSettings, onProfile, user, stories, onOpenStory, onOpenStatusCreator,
  mobileTab, onSetMobileTab, onStartCall, onOpenInstall
}) {
  // Telegram-style folder filtering
  const filtered = chats.filter((chat) => {
    let matchesFolder = true;
    if (filter === "unread") matchesFolder = (chat.unread || 0) > 0;
    else if (filter === "direct") matchesFolder = !chat.group && !chat.channel;
    else if (filter === "groups") matchesFolder = Boolean(chat.group);
    else if (filter === "channels") matchesFolder = Boolean(chat.channel);

    const needle = query.toLowerCase().trim();
    if (!needle) return matchesFolder;

    const messages = chat.messages.map((message) => message.text ?? "").join(" ");
    const matchesQuery = `${chat.name} ${chat.username || ""} ${messages}`.toLowerCase().includes(needle);
    return matchesFolder && matchesQuery;
  });

  const unreadCount = chats.filter((c) => (c.unread || 0) > 0).length;

  return (
    <aside className="sidebar">
      {/* Brand row and header */}
      <div className="sidebar-head">
        <div className="brand-row">
          <div className="brand-left">
            <a className="brand" href="#" aria-label="Blinker-a home">
              <span className="brand-icon"><MessageCircle size={18} fill="currentColor" /></span>
              <span>Blinker<span className="brand-dash">-a</span></span>
            </a>
          </div>

          <div className="brand-actions">
            <button className="icon-button install-app-btn" onClick={onOpenInstall} title="Download / Install App" aria-label="Install app">
              <Download size={18} />
            </button>
            <button className="icon-button" onClick={onNewChat} title="Create Group or Channel" aria-label="New chat">
              <Plus size={19} />
            </button>
            <button className="icon-button" onClick={onProfile} title="My Profile" aria-label="Profile">
              <User size={18} />
            </button>
          </div>
        </div>

        {/* In-App Download / Install Banner for Android */}
        <div className="sidebar-app-banner" onClick={onOpenInstall} role="button" tabIndex="0">
          <span className="banner-flag">🇮🇳</span>
          <div className="banner-copy">
            <strong>Blinker-a for Android</strong>
            <small>Install app on your phone</small>
          </div>
          <span className="banner-install-tag">Install 📱</span>
        </div>

        {/* Search input with Indian symbol */}
        <label className="search-box">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search messages, people or channels"
          />
          {query ? (
            <button type="button" className="clear-search-btn" onClick={() => onQuery("")}><X size={14} /></button>
          ) : (
            <span className="india-search-symbol" title="Bharat 🇮🇳 (+91)">🇮🇳 +91</span>
          )}
        </label>

        {/* WhatsApp & Instagram style Stories / Status bar */}
        <div className="stories-tray">
          {/* User's Own Status button */}
          <div className="story-item my-story" onClick={onOpenStatusCreator}>
            <div className="story-ring has-add">
              <Avatar name={user?.name || "You"} photo={user?.avatarUrl} color="#9088e8" small />
              <span className="add-story-badge"><Plus size={11} strokeWidth={3} /></span>
            </div>
            <span className="story-name">My Status</span>
          </div>

          {/* Friends' Stories */}
          {stories.map((story, index) => (
            <div
              key={story.id}
              className={`story-item ${story.seen ? "seen" : "unseen"}`}
              onClick={() => onOpenStory(index)}
            >
              <div className="story-ring">
                <Avatar name={story.userName} photo={story.userAvatar} color={story.color} small />
              </div>
              <span className="story-name">{story.userName.split(" ")[0]}</span>
            </div>
          ))}
        </div>

        {/* Telegram-style chat folder tabs */}
        <div className="sidebar-tabs" role="tablist" aria-label="Chat folders">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => onFilter("all")}
            role="tab"
            aria-selected={filter === "all"}
          >
            All <span>{chats.length}</span>
          </button>
          <button
            className={filter === "direct" ? "active" : ""}
            onClick={() => onFilter("direct")}
            role="tab"
            aria-selected={filter === "direct"}
          >
            Direct
          </button>
          <button
            className={filter === "groups" ? "active" : ""}
            onClick={() => onFilter("groups")}
            role="tab"
            aria-selected={filter === "groups"}
          >
            Groups
          </button>
          <button
            className={filter === "channels" ? "active" : ""}
            onClick={() => onFilter("channels")}
            role="tab"
            aria-selected={filter === "channels"}
          >
            Channels
          </button>
          {unreadCount > 0 && (
            <button
              className={filter === "unread" ? "active" : ""}
              onClick={() => onFilter("unread")}
              role="tab"
              aria-selected={filter === "unread"}
            >
              Unread <span className="tab-unread-dot">{unreadCount}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Chat List */}
      <div className="chat-list" role="list" aria-label="Conversations">
        {filtered.map((chat, index) => {
          const latest = chat.messages.at(-1);
          return (
            <motion.button
              key={chat.id}
              className={`chat-item${chat.id === activeId ? " selected" : ""}`}
              onClick={() => onSelect(chat.id)}
              role="listitem"
              aria-current={chat.id === activeId ? "true" : undefined}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.12) }}
            >
              <div className="chat-avatar-wrap">
                <Avatar
                  name={chat.name}
                  color={chat.color}
                  online={chat.online}
                  photo={chat.avatarUrl}
                />
                {chat.channel && <span className="channel-badge"><Radio size={10} /></span>}
                {chat.group && <span className="group-badge"><Users size={10} /></span>}
              </div>

              <span className="chat-copy">
                <span className="chat-topline">
                  <strong>{chat.name}</strong>
                  <time>{latest?.time ?? "now"}</time>
                </span>

                <span className="chat-bottomline">
                  <span className="chat-preview">
                    {latest?.from === "me" && (
                      <span className="sent-check">
                        {latest.read ? <CheckCheck size={14} className="blue-ticks" /> : <Check size={14} />}
                      </span>
                    )}
                    {latest?.kind === "audio" ? "🎵 Voice message" : latest?.kind === "image" ? "📷 Photo" : latest?.text ?? "Start a conversation"}
                  </span>
                  {chat.unread > 0 && (
                    <span className="unread-badge">{chat.unread}</span>
                  )}
                </span>
              </span>
            </motion.button>
          );
        })}
        {!filtered.length && (
          <div className="empty-state">
            <p>No conversations in this folder.</p>
            <button className="text-button" onClick={() => onFilter("all")}>Show all chats</button>
          </div>
        )}
      </div>

      {/* Android-style Floating Action Button (FAB) for New Chat */}
      <button
        type="button"
        className="mobile-fab"
        onClick={onNewChat}
        title="New Chat or Group"
        aria-label="New chat"
      >
        <Plus size={24} />
      </button>

      {/* Bottom Profile Bar */}
      <div className="sidebar-bottom-bar">
        <button className="profile-button" onClick={onProfile}>
          <Avatar
            name={user?.name || "Alex Morgan"}
            color="#9088e8"
            online
            photo={user?.avatarUrl}
          />
          <span className="profile-copy">
            <strong>{user?.name || "Alex Morgan"}</strong>
            <small>{user?.statusEmoji || "✨"} {user?.status || "Hey there! I am using Blinker-a"}</small>
          </span>
          <MoreHorizontal size={18} className="profile-arrow" />
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar (WhatsApp & Telegram style) */}
      <nav className="mobile-bottom-nav">
        <button
          className={`nav-tab ${mobileTab === "chats" ? "active" : ""}`}
          onClick={() => {
            onSetMobileTab("chats");
            onFilter("all");
          }}
        >
          <MessageCircle size={20} />
          <span>Chats</span>
          {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
        </button>

        <button
          className={`nav-tab ${mobileTab === "status" ? "active" : ""}`}
          onClick={() => {
            onSetMobileTab("status");
            onOpenStory(0);
          }}
        >
          <Sparkles size={20} />
          <span>Updates</span>
        </button>

        <button
          className={`nav-tab ${mobileTab === "calls" ? "active" : ""}`}
          onClick={() => {
            onSetMobileTab("calls");
            onStartCall(false);
          }}
        >
          <Phone size={20} />
          <span>Calls</span>
        </button>

        <button
          className={`nav-tab ${mobileTab === "profile" ? "active" : ""}`}
          onClick={onProfile}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </nav>
    </aside>
  );
}
