import type {
  CannedReply,
  ChatterUser,
  Conversation,
  LiveMessage,
  LiveRoom,
  ModerationAuditEvent,
  ModerationCase,
  Participant,
} from "./chatterTypes";

export const CHATTER_USER: ChatterUser = {
  id: "chatter-1",
  name: "Avery Lane",
  email: "avery.lane@midigo.example",
  role: "chatter",
  online: true,
};

export const CANNED_REPLIES: CannedReply[] = [
  {
    id: "welcome",
    label: "Welcome",
    message: "Welcome to Midigo! I'm happy to help you find your way around the community.",
  },
  {
    id: "gallery",
    label: "Gallery help",
    message: "The latest editorial drop is available in your private gallery. Let me know if you need help unlocking it.",
  },
  {
    id: "live",
    label: "Live room",
    message: "The live room is open now. You can join from the Live Rooms tab whenever you're ready.",
  },
  {
    id: "thanks",
    label: "Thank you",
    message: "Thank you for being part of the Midigo community. Your support means a lot.",
  },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: "conversation-1",
    fanName: "Nia Morgan",
    avatar: "NM",
    online: true,
    unread: 2,
    priority: "urgent",
    preview: "I can't find the Tokyo collection...",
    timestamp: "2m ago",
    messages: [
      {
        id: "conversation-1-message-1",
        from: "fan",
        content: "Hey! I can't find the Tokyo collection in my gallery.",
        timestamp: "9:42 PM",
        read: true,
      },
      {
        id: "conversation-1-message-2",
        from: "fan",
        content: "I thought it was included with my Insider membership.",
        timestamp: "9:43 PM",
        read: true,
      },
    ],
  },
  {
    id: "conversation-2",
    fanName: "Eli Carter",
    avatar: "EC",
    online: false,
    unread: 1,
    priority: "priority",
    preview: "Will the live Q&A be recorded?",
    timestamp: "18m ago",
    messages: [
      {
        id: "conversation-2-message-1",
        from: "fan",
        content: "Will tonight's live Q&A be recorded for members who miss it?",
        timestamp: "9:25 PM",
        read: true,
      },
    ],
  },
  {
    id: "conversation-3",
    fanName: "Sofia Reed",
    avatar: "SR",
    online: true,
    unread: 0,
    priority: "standard",
    preview: "The new renders are beautiful.",
    timestamp: "1h ago",
    messages: [
      {
        id: "conversation-3-message-1",
        from: "fan",
        content: "The new renders are beautiful. The neon lighting is perfect.",
        timestamp: "8:51 PM",
        read: true,
      },
      {
        id: "conversation-3-message-2",
        from: "chatter",
        content: "I'll pass that along to the creative team. Thank you for sharing it.",
        timestamp: "8:54 PM",
        read: true,
      },
    ],
  },
];

const roomParticipants: Participant[] = [
  {
    id: "participant-1",
    name: "Nia Morgan",
    avatar: "NM",
    online: true,
    role: "fan",
  },
  {
    id: "participant-2",
    name: "Eli Carter",
    avatar: "EC",
    online: true,
    role: "fan",
  },
  {
    id: "participant-3",
    name: "Sofia Reed",
    avatar: "SR",
    online: true,
    role: "fan",
  },
  {
    id: "participant-4",
    name: "Midigo",
    avatar: "MD",
    online: true,
    role: "midigo",
  },
  {
    id: "participant-5",
    name: "Avery Lane",
    avatar: "AL",
    online: true,
    role: "chatter",
  },
];

const otherParticipants: Participant[] = [
  {
    id: "participant-6",
    name: "Mina Park",
    avatar: "MP",
    online: true,
    role: "fan",
  },
  {
    id: "participant-7",
    name: "Jordan Lee",
    avatar: "JL",
    online: false,
    role: "fan",
  },
  {
    id: "participant-8",
    name: "Rin Sato",
    avatar: "RS",
    online: true,
    role: "fan",
  },
];

const roomOneMessages: LiveMessage[] = [
  {
    id: "room-1-message-1",
    roomId: "room-1",
    participantId: "participant-1",
    content: "The Tokyo Streetwear concept is my favorite so far.",
    timestamp: "9:48 PM",
  },
  {
    id: "room-1-message-2",
    roomId: "room-1",
    participantId: "participant-2",
    content: "Can we get a closer look at the jacket render?",
    timestamp: "9:49 PM",
  },
  {
    id: "room-1-message-3",
    roomId: "room-1",
    participantId: "participant-3",
    content: "This room has the best energy tonight.",
    timestamp: "9:50 PM",
    reported: true,
    severity: "low",
  },
  {
    id: "room-1-message-4",
    roomId: "room-1",
    participantId: "participant-4",
    content: "The full collection reveal is almost ready.",
    timestamp: "9:51 PM",
  },
];

const roomTwoMessages: LiveMessage[] = [
  {
    id: "room-2-message-1",
    roomId: "room-2",
    participantId: "participant-6",
    content: "The lo-fi set is exactly what I needed tonight.",
    timestamp: "9:40 PM",
  },
  {
    id: "room-2-message-2",
    roomId: "room-2",
    participantId: "participant-8",
    content: "Please keep the chat spoiler-free until the drop.",
    timestamp: "9:44 PM",
    reported: true,
    severity: "medium",
  },
];

export const LIVE_ROOMS: LiveRoom[] = [
  {
    id: "room-1",
    title: "Wardrobe Vote: Next Gala",
    description: "Help Midigo choose the final details for the upcoming virtual gala.",
    live: true,
    slowMode: false,
    locked: false,
    participants: roomParticipants,
    messages: roomOneMessages,
  },
  {
    id: "room-2",
    title: "Lo-Fi & Chill with Midigo",
    description: "A relaxed listening room for the community to unwind together.",
    live: true,
    slowMode: true,
    locked: false,
    participants: [...otherParticipants, roomParticipants[3], roomParticipants[4]],
    messages: roomTwoMessages,
  },
  {
    id: "room-3",
    title: "Behind the Pixels: Neon Collection",
    description: "A behind-the-scenes look at the newest Midigo editorial series.",
    live: false,
    slowMode: false,
    locked: true,
    participants: [roomParticipants[3], roomParticipants[4]],
    messages: [],
  },
];

export const MODERATION_CASES: ModerationCase[] = [
  {
    id: "case-1",
    roomId: "room-1",
    participantId: "participant-3",
    participantName: "Sofia Reed",
    message: "This room has the best energy tonight.",
    reason: "Message flagged by a community member",
    severity: "low",
    status: "open",
    createdAt: "4m ago",
  },
  {
    id: "case-2",
    roomId: "room-2",
    participantId: "participant-8",
    participantName: "Rin Sato",
    message: "Please keep the chat spoiler-free until the drop.",
    reason: "Possible spoiler in a live room",
    severity: "medium",
    status: "open",
    createdAt: "11m ago",
  },
  {
    id: "case-3",
    roomId: "room-1",
    participantId: "participant-2",
    participantName: "Eli Carter",
    message: "Can we get a closer look at the jacket render?",
    reason: "Repeated message after Chatter guidance",
    severity: "low",
    status: "resolved",
    createdAt: "26m ago",
  },
];

export const INITIAL_AUDIT: ModerationAuditEvent[] = [
  {
    id: "audit-1",
    action: "resolved",
    target: "Eli Carter",
    details: "Reviewed the repeated message and closed the case.",
    timestamp: "24m ago",
  },
  {
    id: "audit-2",
    action: "warned",
    target: "Rin Sato",
    details: "Sent a reminder about the room spoiler policy.",
    timestamp: "10m ago",
  },
];

export const getParticipant = (
  roomId: string,
  participantId: string,
): Participant | undefined => {
  const room = LIVE_ROOMS.find((item) => item.id === roomId);
  return room?.participants.find((participant) => participant.id === participantId);
};

export const getRoomTitle = (roomId: string): string => {
  return LIVE_ROOMS.find((room) => room.id === roomId)?.title ?? "Unknown room";
};

export const createMessageId = (prefix: string): string => {
  return `${prefix}-${Date.now()}`;
};
