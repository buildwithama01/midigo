export type Message = {
  id: string;
  from: "midigo" | "fan";
  type: "text" | "voice";
  content?: string;
  duration?: string;
  timestamp: string;
  read: boolean;
};

export type Conversation = {
  id: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  messages: Message[];
};

export const CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    preview: "I recorded something special just for you...",
    timestamp: "2h ago",
    unread: true,
    messages: [
      {
        id: "m1",
        from: "midigo",
        type: "text",
        content: "Hey, I saw you've been in almost every chat this week. That means a lot to me, genuinely.",
        timestamp: "Sep 17, 9:00 PM",
        read: true,
      },
      {
        id: "m2",
        from: "fan",
        type: "text",
        content: "I love what you've been building! The Tokyo Neon collection was absolutely stunning.",
        timestamp: "Sep 17, 9:04 PM",
        read: true,
      },
      {
        id: "m3",
        from: "midigo",
        type: "voice",
        duration: "0:38",
        timestamp: "Sep 17, 9:12 PM",
        read: true,
      },
      {
        id: "m4",
        from: "midigo",
        type: "text",
        content: "I recorded something special just for you. It's a sneak peek at the next collection concept — months before anyone else sees it.",
        timestamp: "Sep 17, 9:12 PM",
        read: false,
      },
    ],
  },
];
