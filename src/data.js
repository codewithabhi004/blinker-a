export const defaultUser = {
  id: "user-abhishek",
  name: "Abhishek Upadhyay",
  username: "abhishek_u",
  phone: "+91 98765 43210",
  email: "codewithabhi044@gmail.com",
  bio: "Software developer & creator from India 🇮🇳 ✨ Chai, Code & Cricket!",
  status: "✨ Proudly Made in India | Blinker-a",
  statusEmoji: "🇮🇳",
  avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
  coverUrl: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80",
  discoverableByPhone: true,
  lastSeenPrivacy: "everyone",
  readReceipts: true
};

export const statusPresets = [
  { emoji: "🇮🇳", text: "Proudly Made in India" },
  { emoji: "☕", text: "Chai break pe hoon!" },
  { emoji: "🏏", text: "Watching the match, do not disturb" },
  { emoji: "💻", text: "Coding something awesome" },
  { emoji: "🟢", text: "Available / Baat kar sakte ho" },
  { emoji: "💼", text: "Office meeting me hoon" },
  { emoji: "⚡", text: "Sirf urgent calls karein" },
  { emoji: "🚗", text: "Driving, call later" },
  { emoji: "😴", text: "So raha hoon / Sleeping" }
];

export const wallpaperPresets = [
  {
    id: "whatsapp-doodle",
    name: "WhatsApp Classic",
    preview: "#0b141a",
    bg: "#0b141a",
    pattern: "doodle"
  },
  {
    id: "whatsapp-emerald",
    name: "Desi WhatsApp Emerald",
    preview: "linear-gradient(135deg, #062b21, #0a1f19)",
    bg: "radial-gradient(circle at 50% 30%, rgba(16, 185, 129, 0.12), transparent 70%), #071712",
    pattern: "doodle"
  },
  {
    id: "aurora",
    name: "Telegram Aurora",
    preview: "linear-gradient(135deg, #161b2b, #2b1f48)",
    bg: "radial-gradient(ellipse at 45% -20%, rgba(112, 91, 187, .25), transparent 60%), radial-gradient(ellipse at 95% 70%, rgba(60, 122, 168, .2), transparent 50%), #0d1118"
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
    id: "himalayas",
    name: "Himalayas Mountains",
    preview: "url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=300&q=60')",
    bg: "url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80')"
  },
  {
    id: "taj",
    name: "Heritage Sunset",
    preview: "url('https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=300&q=60')",
    bg: "url('https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1600&q=80')"
  }
];

export const starterStories = [
  {
    id: "story-priya",
    userId: "priya",
    userName: "Priya Sharma",
    userAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    color: "#c7a5fa",
    timestamp: "15m ago",
    seen: false,
    mediaUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80",
    caption: "Diwali shopping & street lights in Delhi! Festive season vibes 🪔✨"
  },
  {
    id: "story-aarav",
    userId: "aarav",
    userName: "Aarav Patel",
    userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    color: "#81b4db",
    timestamp: "1h ago",
    seen: false,
    mediaUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80",
    caption: "Authentic South Indian Filter Coffee in Bengaluru ☕ Good morning!"
  },
  {
    id: "story-rohit",
    userId: "rohit",
    userName: "Rohit Verma",
    userAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
    color: "#e49d76",
    timestamp: "3h ago",
    seen: true,
    mediaUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1000&q=80",
    caption: "Stadium packed! Cheering for India at Wankhede Stadium 🇮🇳🏏"
  },
  {
    id: "story-neha",
    userId: "neha",
    userName: "Neha Gupta",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    color: "#efb5bd",
    timestamp: "5h ago",
    seen: true,
    mediaUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80",
    caption: "Garama-garam Samosa & Adrak Wali Chai on a rainy evening 🌧️☕"
  }
];

export const indianContacts = [
  {
    id: "priya",
    name: "Priya Sharma",
    phone: "+91 98112 34567",
    city: "New Delhi",
    status: "Busy in a shoot 📷",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    color: "#c7a5fa",
    online: true
  },
  {
    id: "aarav",
    name: "Aarav Patel",
    phone: "+91 98223 45678",
    city: "Bengaluru",
    status: "Building apps 🚀",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    color: "#81b4db",
    online: true
  },
  {
    id: "neha",
    name: "Neha Gupta",
    phone: "+91 98334 56789",
    city: "Mumbai",
    status: "Chai over everything ☕",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    color: "#e49d76",
    online: false
  },
  {
    id: "rohit",
    name: "Rohit Verma",
    phone: "+91 98445 67890",
    city: "Pune",
    status: "Cricket & Code 🏏",
    avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80",
    color: "#86c7ab",
    online: true
  },
  {
    id: "ananya",
    name: "Ananya Iyer",
    phone: "+91 98556 78901",
    city: "Chennai",
    status: "Music lover 🎵",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    color: "#dd9dbb",
    online: false
  },
  {
    id: "vikram",
    name: "Vikram Singh Rathore",
    phone: "+91 98667 89012",
    city: "Jaipur",
    status: "Royal Jaipur vibes 🏰",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    color: "#e6b85f",
    online: true
  },
  {
    id: "pooja",
    name: "Pooja Malhotra",
    phone: "+91 98778 90123",
    city: "Chandigarh",
    status: "Available on Blinker-a",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=300&q=80",
    color: "#9088e8",
    online: false
  },
  {
    id: "karan",
    name: "Karan Mehra",
    phone: "+91 98889 01234",
    city: "Lucknow",
    status: "Muskuraiye, aap Lucknow me hain ✨",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    color: "#84a9ff",
    online: true
  }
];

export const starterChats = [
  {
    id: "priya",
    name: "Priya Sharma",
    username: "@priyasharma",
    phone: "+91 98112 34567",
    bio: "Photographer & travel enthusiast 📷 Delhi to anywhere.",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    color: "#c7a5fa",
    online: true,
    statusText: "online now",
    type: "direct",
    unread: 2,
    pinned: "Weekend pe Connaught Place me photo walk karein?",
    messages: [
      { id: "s1", from: "them", text: "Hey Abhishek! Weekend kaisa raha tumhara?", time: "10:32", reactions: [{ emoji: "👋", count: 1, mine: false }] },
      { id: "s2", from: "me", text: "Bahut badhiya! Naya camera test karne gaya tha kal subah.", time: "10:35", read: true, reactions: [{ emoji: "❤️", count: 1, mine: true }] },
      { id: "s3", from: "them", text: "Arre waah! Kaisi aayi photos? Mujhe bhi dikhao na!", time: "10:36" },
      { id: "s4", from: "me", text: "India Gate aur Lodhi Garden ke kuch mast golden hour shots liye hain 😄", time: "10:38", read: true },
      {
        id: "s5",
        from: "them",
        kind: "audio",
        voiceDuration: "0:14",
        time: "10:41",
        text: "Voice note (0:14)",
        waveform: [25, 45, 75, 95, 60, 40, 80, 100, 75, 50, 65, 85, 40, 30, 60, 95, 70, 40, 20],
        reactions: [{ emoji: "🔥", count: 1, mine: false }]
      },
      {
        id: "s6",
        from: "me",
        kind: "image",
        fileUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80",
        fileName: "delhi-monuments.jpg",
        text: "Ye dekho! Shaam ka light bohot pyara tha 🌇",
        time: "10:44",
        read: true,
        reactions: [{ emoji: "❤️", count: 2, mine: true }, { emoji: "😍", count: 1, mine: false }]
      },
      { id: "s7", from: "them", text: "Kya baat hai Abhishek! Ekdum professional click hai 💛", time: "10:46" },
      { id: "s8", from: "me", text: "Shukriya Priya! Next weekend chalte hain saath me photoshoot ke liye.", time: "10:49", read: true },
      { id: "s9", from: "them", text: "Done! CP me pehle mast adrak chai piyenge fir clicks karenge ☕✨", time: "10:53", reactions: [{ emoji: "👍", count: 1, mine: false }] }
    ]
  },
  {
    id: "goa-group",
    name: "Goa Trip 2026 🏖️🍹",
    username: "@goatrip2026",
    bio: "College doston ka Goa trip group! Train vs Flight discussion chal raha hai.",
    avatarUrl: null,
    avatar: "🏖️",
    color: "#86c7ab",
    group: true,
    type: "group",
    membersCount: 6,
    unread: 4,
    messages: [
      { id: "g1", from: "them", sender: "Rohit Verma", text: "Bhai log tickets confirm hui kya? Dates batao jaldi!", time: "9:15", reactions: [{ emoji: "🚀", count: 3, mine: false }] },
      { id: "g2", from: "them", sender: "Neha Gupta", text: "North Goa me villa dekh liya maine, swimming pool bhi hai 🌊", time: "9:20" },
      { id: "g3", from: "me", text: "Haan Rohit, Friday night train ka plan freeze karte hain!", time: "9:25", read: true, reactions: [{ emoji: "💯", count: 3, mine: true }] },
      { id: "g4", from: "them", sender: "Aarav Patel", text: "Scooty pehle se book kar lenge Calangute se.", time: "9:30" }
    ]
  },
  {
    id: "cricket-channel",
    name: "Cricket Fever India 🇮🇳🏏",
    username: "@cricketindia",
    bio: "Official Indian Cricket live updates, match analysis, and team India news.",
    avatarUrl: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=300&q=80",
    color: "#84a9ff",
    channel: true,
    type: "channel",
    membersCount: 154200,
    unread: 1,
    pinned: "Team India squad announced for the upcoming tournament! Check full lineup below.",
    messages: [
      {
        id: "cc1",
        from: "them",
        sender: "Cricket India Admin",
        kind: "image",
        fileUrl: "https://images.unsplash.com/photo-1531415074868-036b1c57e329?auto=format&fit=crop&w=1200&q=80",
        fileName: "match-announcement.jpg",
        text: "⚡ MATCH DAY: India takes the field today in a high-voltage clash at Wankhede! Who is hitting the match-winning fifty today? Drop your predictions! 🇮🇳🔥",
        time: "8:00",
        reactions: [{ emoji: "🔥", count: 420, mine: false }, { emoji: "🇮🇳", count: 890, mine: true }]
      }
    ]
  },
  {
    id: "aarav",
    name: "Aarav Patel",
    username: "@aaravpatel",
    phone: "+91 98223 45678",
    bio: "Tech entrepreneur & developer in Bengaluru ☕",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    color: "#81b4db",
    online: true,
    statusText: "online now",
    type: "direct",
    unread: 0,
    messages: [
      { id: "a1", from: "them", text: "Abhishek bhai, naya app kaisa chal raha hai?", time: "Yesterday" },
      { id: "a2", from: "me", text: "Sab mast Aarav! WhatsApp aur Telegram ke saare top features daal diye hain isme.", time: "Yesterday", read: true },
      { id: "a3", from: "them", text: "Ek number! Phone contacts integration aur custom wallpapers bhi chal rahe hain?", time: "Yesterday", reactions: [{ emoji: "🔥", count: 1, mine: false }] },
      { id: "a4", from: "me", text: "Bilkul! 100% Indian app feel aa rahi hai ab.", time: "Yesterday", read: true }
    ]
  },
  {
    id: "parivaar",
    name: "Parivaar ❤️ (Family)",
    username: "@parivaar",
    bio: "Hamara pyara parivaar. Subah ki chai aur shaam ki baatein.",
    avatar: "❤️",
    color: "#f43f5e",
    group: true,
    type: "group",
    membersCount: 8,
    unread: 0,
    messages: [
      { id: "p1", from: "them", sender: "Mummy", text: "Subah ka naashta kar liya sabne? Abhishek beta time pe khaana kha lena.", time: "8:30" },
      { id: "p2", from: "me", text: "Haan Mummy, sab ho gaya! Aap dhyan rakhna.", time: "8:45", read: true, reactions: [{ emoji: "❤️", count: 4, mine: true }] }
    ]
  },
  {
    id: "neha",
    name: "Neha Gupta",
    username: "@nehagupta",
    phone: "+91 98334 56789",
    bio: "Food blogger & architecture student in Mumbai 🌊",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    color: "#e49d76",
    online: false,
    statusText: "last seen today at 11:20 AM",
    type: "direct",
    unread: 0,
    messages: [
      { id: "n1", from: "them", text: "Marine Drive pe chai peene ka mann kar raha hai aaj!", time: "Yesterday" },
      { id: "n2", from: "me", text: "Mausam toh bohot shaandar hai Mumbai me abhi.", time: "Yesterday", read: true }
    ]
  }
];

export const avatarColors = ["#c7a5fa", "#81b4db", "#e49d76", "#86c7ab", "#e6b85f", "#dd9dbb", "#9088e8", "#f472b6"];
