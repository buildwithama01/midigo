export type ChatterRole = "chatter" | "midigo" | "fan";

export type Priority = "standard" | "priority" | "urgent";

export type MessageSender = "fan" | "chatter" | "midigo";

export type ModerationStatus = "open" | "resolved";

export type ModerationAction =
  | "warned"
  | "message-deleted"
  | "timed-out"
  | "banned"
  | "resolved";

export type ChatterUser = {
  id: string;
  name: string;
  email: string;
  role: ChatterRole;
  online: boolean;
};

export type ChatterMessage = {
  id: string;
  from: MessageSender;
  content: string;
  timestamp: string;
  read: boolean;
  reported?: boolean;
};

export type Conversation = {
  id: string;
  fanName: string;
  avatar: string;
  online: boolean;
  unread: number;
  priority: Priority;
  preview: string;
  timestamp: string;
  messages: ChatterMessage[];
};

export type Participant = {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
  role: ChatterRole;
};

export type LiveMessage = {
  id: string;
  roomId: string;
  participantId: string;
  content: string;
  timestamp: string;
  reported?: boolean;
  severity?: "low" | "medium" | "high";
};

export type LiveRoom = {
  id: string;
  title: string;
  description: string;
  live: boolean;
  slowMode: boolean;
  locked: boolean;
  participants: Participant[];
  messages: LiveMessage[];
};

export type ModerationCase = {
  id: string;
  roomId: string;
  participantId: string;
  participantName: string;
  message: string;
  reason: string;
  severity: "low" | "medium" | "high";
  status: ModerationStatus;
  createdAt: string;
};

export type ModerationAuditEvent = {
  id: string;
  action: ModerationAction;
  target: string;
  details: string;
  timestamp: string;
};

export type CannedReply = {
  id: string;
  label: string;
  message: string;
};
