export const defaultUser = {
  id: "user-me",
  name: "Alex Morgan",
  username: "alexm",
  phone: "+91 98765 43210",
  email: "alex.morgan@example.com",
  bio: "Digital creator & explorer 📸 Living one photo at a time. Loving Blinker-a!",
  status: "Hey there! I am using Blinker-a.",
  statusEmoji: "✨",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
  discoverableByPhone: true,
  lastSeenPrivacy: "everyone",
  readReceipts: true
};

export const statusPresets = [
  { emoji: "✨", text: "Hey there! I am using Blinker-a." },
  { emoji: "🟢", text: "Available" },
  { emoji: "💼", text: "At work / In a meeting" },
  { emoji: "⚡", text: "Only urgent calls" },
  { emoji: "💻", text: "Coding something cool" },
  { emoji: "🎧", text: "Listening to music" },
  { emoji: "✈️", text: "Traveling / On vacation" },
  { emoji: "🏋️", text: "At the gym" },
  { emoji: "😴", text: "Sleeping, do not disturb" }
];

export const wallpaperPresets = [
  {
    id: "aurora",
    name: "Telegram Aurora",
    preview: "linear-gradient(135deg, #161b2b, #2b1f48)",
    bg: "radial-gradient(ellipse at 45% -20%, rgba(112, 91, 187, .25), transparent 60%), radial-gradient(ellipse at 95% 70%, rgba(60, 122, 168, .2), transparent 50%), #0d1118"
  },
  {
    id: "whatsapp-doodle",
    name: "WhatsApp Classic",
    preview: "#0b141a",
    bg: "#0b141a",
    pattern: "doodle"
  },
  {
    id: "whatsapp-emerald",
    name: "WhatsApp Emerald",
    preview: "linear-gradient(135deg, #062b21, #0a1f19)",
    bg: "radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.12), transparent 70%), #071712",
    pattern: "doodle"
  },
  {
    id: "amoled",
    name: "AMOLED Deep Black",
    preview: "#000000",
    bg: "#000000"
  },
  {
    id: "dots",
    name: "Subtle Dots",
    preview: "#141923",
    bg: "#10151f",
    pattern: "dots"
  },
  {
    id: "starry",
    name: "Starry Night",
    preview: "linear-gradient(135deg, #090e1a, #16243d)",
    bg: "radial-gradient(circle at 80% 20%, rgba(99, 102, 241, 0.18), transparent 50%), radial-gradient(circle at 20% 80%, rgba(56, 189, 248, 0.12), transparent 45%), #090e1a"
  },
  {
    id: "sunset",
    name: "Desert Sunset",
    preview: "linear-gradient(135deg, #2b1325, #141727)",
    bg: "radial-gradient(circle at 60% 0%, rgba(244, 63, 94, 0.16), transparent 55%), radial-gradient(circle at 10% 90%, rgba(249, 115, 22, 0.12), transparent 45%), #110e19"
  },
  {
    id: "nature-photo",
    name: "Misty Forest",
    preview: "url('https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=300&q=60')",
    bg: "url('https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1600&q=80')"
  },
  {
    id: "mountains-photo",
    name: "Alps Landscape",
    preview: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=60')",
    bg: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80')"
  }
];

export const starterStories = [
  {
    id: "story-sophie",
    userId: "sophie",
    userName: "Sophie Williams",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    color: "#c7a5fa",
    timestamp: "25m ago",
    seen: false,
    mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    caption: "Golden hour magic by the coast 🌅 Beautiful Sunday vibes!"
  },
  {
    id: "story-james",
    userId: "james",
    userName: "James Chen",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    color: "#81b4db",
    timestamp: "2h ago",
    seen: false,
    mediaUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80",
    caption: "Perfect espresso pour to kick off the project grind ☕✨"
  },
  {
    id: "story-maria",
    userId: "maria",
    userName: "Maria Garcia",
    userAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
    color: "#e49d76",
    timestamp: "4h ago",
    seen: true,
    mediaUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=80",
    caption: "Homemade tagliatelle with creamy truffle sauce 🍝 Chef mode on!"
  },
  {
    id: "story-noah",
    userId: "design",
    userName: "Design Buddies",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    color: "#efb5bd",
    timestamp: "6h ago",
    seen: true,
    mediaUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80",
    caption: "Cyber retro setup for our late-night hackathon 🚀"
  }
];

export const starterChats = [
  {
    id: "sophie",
    name: "Sophie Williams",
    username: "@sophiew",
    phone: "+91 98112 34567",
    bio: "Photographer & travel enthusiast 📷 Living life in frames.",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    color: "#c7a5fa",
    online: true,
    statusText: "online now",
    type: "direct",
    unread: 2,
    pinned: "Maybe we could do a little photo walk sometime?",
    messages: [
      { id: "s1", from: "them", text: "Hey Alex! How's your week going?", time: "10:32", reactions: [{ emoji: "👋", count: 1, mine: false }] },
      { id: "s2", from: "me", text: "Pretty good so far! Finally got around to exploring that new camera I told you about.", time: "10:35", read: true, reactions: [{ emoji: "❤️", count: 1, mine: true }] },
      { id: "s3", from: "them", text: "Oh that's exciting! Have you taken it out for a spin yet?", time: "10:36" },
      { id: "s4", from: "me", text: "Just last weekend! Took it down to the coast and got some shots I'm actually proud of for once 😄", time: "10:38", read: true },
      {
        id: "s5",
        from: "them",
        kind: "audio",
        voiceDuration: "0:18",
        time: "10:41",
        text: "Voice note (0:18)",
        waveform: [20, 45, 70, 90, 60, 40, 80, 100, 75, 50, 65, 85, 40, 30, 60, 95, 70, 40, 20],
        reactions: [{ emoji: "🔥", count: 1, mine: false }]
      },
      {
        id: "s6",
        from: "me",
        kind: "image",
        fileUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
        fileName: "coast-golden-hour.jpg",
        text: "Here is one of my favorites from sunset! Golden hour did all the heavy lifting.",
        time: "10:44",
        read: true,
        reactions: [{ emoji: "❤️", count: 2, mine: true }, { emoji: "😍", count: 1, mine: false }]
      },
      { id: "s7", from: "them", text: "Wow, Alex! This is stunning. The colors are unreal 💛", time: "10:46" },
      { id: "s8", from: "me", text: "Thanks! I've been trying to be more intentional about slowing down and noticing little things.", time: "10:49", read: true },
      { id: "s9", from: "them", text: "I love that. I've been meaning to get outside more too. Maybe we could do a little photo walk sometime?", time: "10:53", reactions: [{ emoji: "👍", count: 1, mine: false }] },
      { id: "s10", from: "me", text: "I'd love that! There's a botanical garden I keep meaning to visit. It'd be a great place to practice.", time: "10:56", read: true },
      { id: "s11", from: "them", text: "That sounds like a perfect plan! Let me know which Saturday works best for you ✨", time: "10:58" }
    ]
  },
  {
    id: "design",
    name: "Design Buddies",
    username: "@designbuddies",
    bio: "Product designers, artists & creative minds collaborating daily.",
    avatarUrl: null,
    avatar: "✦",
    color: "#efb5bd",
    group: true,
    type: "group",
    membersCount: 12,
    unread: 3,
    messages: [
      { id: "d1", from: "them", sender: "Noah", text: "Hey team, dropped the new mockups in Figma — take a look when you get a sec!", time: "9:32", reactions: [{ emoji: "🚀", count: 3, mine: false }] },
      { id: "d2", from: "them", sender: "Priya", text: "These look great! The new onboarding flow is much clearer 🙌", time: "9:36" },
      { id: "d3", from: "me", text: "Agreed. The spacing on the profile cards feels much better too.", time: "9:39", read: true, reactions: [{ emoji: "💯", count: 2, mine: true }] },
      { id: "d4", from: "them", sender: "Noah", text: "Thanks! Updated all the components so they match the modern tokens.", time: "9:41" }
    ]
  },
  {
    id: "telegram-channel",
    name: "Tech & AI Pulse",
    username: "@techpulse",
    bio: "Official channel for the latest news in web development, AI, mobile & gadgets.",
    avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    color: "#84a9ff",
    channel: true,
    type: "channel",
    membersCount: 48200,
    unread: 1,
    pinned: "Welcome to Tech & AI Pulse! Pin this channel for daily updates.",
    messages: [
      {
        id: "tc1",
        from: "them",
        sender: "TechPulse Admin",
        kind: "image",
        fileUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80",
        fileName: "tech-future.jpg",
        text: "⚡ Big Announcement: Modern mobile web apps can now run offline with native-grade performance and custom shaders. What are you building this year?",
        time: "8:15",
        reactions: [{ emoji: "🔥", count: 84, mine: false }, { emoji: "👏", count: 42, mine: false }]
      }
    ]
  },
  {
    id: "james",
    name: "James Chen",
    username: "@jameschen",
    phone: "+91 98223 45678",
    bio: "Software engineer & coffee nerd ☕ Building the future.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    color: "#81b4db",
    online: true,
    statusText: "online now",
    type: "direct",
    unread: 0,
    messages: [
      { id: "j1", from: "them", text: "Did you catch the game last night?", time: "Yesterday" },
      { id: "j2", from: "me", text: "Just the highlights this morning. What a finish!", time: "Yesterday", read: true },
      { id: "j3", from: "them", text: "Right? We should catch the next one together.", time: "Yesterday", reactions: [{ emoji: "🤝", count: 1, mine: false }] },
      { id: "j4", from: "me", text: "haha exactly what I was thinking! Next Friday for sure.", time: "Yesterday", read: true }
    ]
  },
  {
    id: "maria",
    name: "Maria Garcia",
    username: "@mariag",
    phone: "+91 98334 56789",
    bio: "Food blogger & traveler 🍝 Always in search of great food.",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
    color: "#e49d76",
    online: false,
    statusText: "last seen today at 11:20 AM",
    type: "direct",
    unread: 0,
    messages: [
      { id: "m1", from: "them", text: "I found that pasta recipe you asked about last week!", time: "Yesterday" },
      {
        id: "m2",
        from: "them",
        kind: "image",
        fileUrl: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80",
        fileName: "pasta-recipe.jpg",
        text: "Here's the result! The key is slow-roasting the cherry tomatoes.",
        time: "Yesterday",
        reactions: [{ emoji: "😋", count: 1, mine: true }]
      },
      { id: "m3", from: "me", text: "Looks mouthwatering! Definitely trying this over the weekend.", time: "Yesterday", read: true }
    ]
  },
  {
    id: "weekend",
    name: "Weekend Plans 🎉",
    username: "@weekendplans",
    bio: "Friends group for trips, dinners and weekend getaways.",
    avatar: "☀",
    color: "#e6b85f",
    group: true,
    type: "group",
    membersCount: 6,
    unread: 0,
    messages: [
      { id: "w1", from: "them", sender: "Jess", text: "Brunch on Saturday? I found a cute place downtown with outdoor seating.", time: "Tuesday" },
      { id: "w2", from: "me", text: "11 works for me! Count me in.", time: "Tuesday", read: true, reactions: [{ emoji: "🎉", count: 3, mine: true }] }
    ]
  }
];

export const avatarColors = ["#c7a5fa", "#81b4db", "#e49d76", "#86c7ab", "#e6b85f", "#dd9dbb", "#9088e8", "#f472b6"];
