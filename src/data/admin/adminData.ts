export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  membership: string;
  status: "Active" | "Pending" | "Suspended";
  lastActive: string;
};

export type AdminFan = {
  id: string;
  name: string;
  handle: string;
  membership: string;
  engagement: string;
  status: "Active" | "VIP" | "At risk";
  joined: string;
};

export type AdminChatter = {
  id: string;
  name: string;
  queue: string;
  presence: "Online" | "Away" | "Offline";
  conversations: string;
  responseTime: string;
  status: "Available" | "Busy" | "Offline";
};

export type AdminMedia = {
  id: string;
  title: string;
  category: string;
  visibility: "Public" | "Members" | "VIP";
  status: "Published" | "Draft" | "Locked";
  updated: string;
};

export type AdminLiveRoom = {
  id: string;
  title: string;
  host: string;
  participants: string;
  status: "Live" | "Upcoming" | "Ended";
  started: string;
};

export type AdminConversation = {
  id: string;
  fan: string;
  subject: string;
  assignee: string;
  messages: string;
  status: "Open" | "Waiting" | "Resolved";
  updated: string;
};

export type AdminContent = {
  id: string;
  title: string;
  type: string;
  category: string;
  status: "Published" | "Draft" | "Scheduled";
  author: string;
  updated: string;
};

export type AdminMembership = {
  id: string;
  member: string;
  plan: string;
  amount: string;
  status: "Active" | "Past due" | "Cancelled";
  renewal: string;
};

export type AdminModerationCase = {
  id: string;
  target: string;
  reason: string;
  severity: "Low" | "Medium" | "High";
  status: "Open" | "In review" | "Resolved";
  reporter: string;
  updated: string;
};

export type AdminAuditEvent = {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  outcome: "Success" | "Denied" | "Warning";
};

export type AdminRole = {
  id: string;
  name: string;
  description: string;
  members: string;
  permissions: string[];
};

export const adminUsers: AdminUser[] = [
  { id: "USR-1001", name: "Ava Morgan", email: "ava@example.com", role: "Administrator", membership: "Founding", status: "Active", lastActive: "2 min ago" },
  { id: "USR-1002", name: "Noah Williams", email: "noah@example.com", role: "Moderator", membership: "VIP", status: "Active", lastActive: "18 min ago" },
  { id: "USR-1003", name: "Mia Chen", email: "mia@example.com", role: "Chatter", membership: "Creator", status: "Pending", lastActive: "1 hr ago" },
  { id: "USR-1004", name: "Liam Patel", email: "liam@example.com", role: "Editor", membership: "Standard", status: "Active", lastActive: "Yesterday" },
  { id: "USR-1005", name: "Sofia Reed", email: "sofia@example.com", role: "Analyst", membership: "VIP", status: "Suspended", lastActive: "3 days ago" },
  { id: "USR-1006", name: "Ethan Brooks", email: "ethan@example.com", role: "Support", membership: "Standard", status: "Active", lastActive: "4 days ago" },
];

export const adminFans: AdminFan[] = [
  { id: "FAN-2041", name: "Elena Stone", handle: "@elena", membership: "VIP", engagement: "High", status: "VIP", joined: "Jan 2026" },
  { id: "FAN-2042", name: "Marcus Lee", handle: "@marcus", membership: "Standard", engagement: "Medium", status: "Active", joined: "Feb 2026" },
  { id: "FAN-2043", name: "Nora James", handle: "@nora", membership: "VIP", engagement: "High", status: "VIP", joined: "Mar 2026" },
  { id: "FAN-2044", name: "Owen King", handle: "@owen", membership: "Standard", engagement: "Low", status: "At risk", joined: "Apr 2026" },
  { id: "FAN-2045", name: "Priya Shah", handle: "@priya", membership: "Founding", engagement: "High", status: "Active", joined: "May 2026" },
  { id: "FAN-2046", name: "Lucas Martin", handle: "@lucas", membership: "Standard", engagement: "Medium", status: "Active", joined: "Jun 2026" },
];

export const adminChatters: AdminChatter[] = [
  { id: "CHT-001", name: "Mia Chen", queue: "General", presence: "Online", conversations: "14", responseTime: "42 sec", status: "Available" },
  { id: "CHT-002", name: "Noah Williams", queue: "VIP", presence: "Online", conversations: "8", responseTime: "51 sec", status: "Busy" },
  { id: "CHT-003", name: "Sofia Reed", queue: "Support", presence: "Away", conversations: "3", responseTime: "1 min", status: "Available" },
  { id: "CHT-004", name: "Ethan Brooks", queue: "General", presence: "Offline", conversations: "0", responseTime: "—", status: "Offline" },
  { id: "CHT-005", name: "Liam Patel", queue: "Moderation", presence: "Online", conversations: "6", responseTime: "38 sec", status: "Available" },
];

export const adminMedia: AdminMedia[] = [
  { id: "MED-301", title: "Midnight editorial", category: "Photoshoot", visibility: "VIP", status: "Published", updated: "Today" },
  { id: "MED-302", title: "Studio diary 04", category: "Video", visibility: "Members", status: "Published", updated: "Yesterday" },
  { id: "MED-303", title: "Behind the render", category: "Gallery", visibility: "Public", status: "Draft", updated: "Jul 18" },
  { id: "MED-304", title: "Velvet collection", category: "Photoshoot", visibility: "VIP", status: "Locked", updated: "Jul 16" },
  { id: "MED-305", title: "Neon welcome", category: "Campaign", visibility: "Public", status: "Published", updated: "Jul 12" },
  { id: "MED-306", title: "Private preview", category: "Video", visibility: "VIP", status: "Locked", updated: "Jul 09" },
];

export const adminLiveRooms: AdminLiveRoom[] = [
  { id: "ROOM-101", title: "Midnight lounge", host: "Midigo", participants: "128", status: "Live", started: "12 min ago" },
  { id: "ROOM-102", title: "Creator Q&A", host: "Midigo", participants: "84", status: "Live", started: "31 min ago" },
  { id: "ROOM-103", title: "Studio session", host: "Midigo", participants: "—", status: "Upcoming", started: "Today, 8 PM" },
  { id: "ROOM-104", title: "VIP listening room", host: "Midigo", participants: "42", status: "Live", started: "1 hr ago" },
  { id: "ROOM-105", title: "Community hangout", host: "Moderator", participants: "67", status: "Ended", started: "Yesterday" },
  { id: "ROOM-106", title: "New member welcome", host: "Midigo", participants: "—", status: "Upcoming", started: "Tomorrow" },
];

export const adminConversations: AdminConversation[] = [
  { id: "MSG-501", fan: "Elena Stone", subject: "Membership access", assignee: "Mia Chen", messages: "12", status: "Open", updated: "2 min ago" },
  { id: "MSG-502", fan: "Marcus Lee", subject: "Room invitation", assignee: "Noah Williams", messages: "8", status: "Waiting", updated: "14 min ago" },
  { id: "MSG-503", fan: "Nora James", subject: "VIP content", assignee: "Mia Chen", messages: "21", status: "Open", updated: "26 min ago" },
  { id: "MSG-504", fan: "Owen King", subject: "Account question", assignee: "Unassigned", messages: "4", status: "Waiting", updated: "1 hr ago" },
  { id: "MSG-505", fan: "Priya Shah", subject: "Feedback", assignee: "Liam Patel", messages: "9", status: "Resolved", updated: "Yesterday" },
  { id: "MSG-506", fan: "Lucas Martin", subject: "Payment help", assignee: "Ethan Brooks", messages: "6", status: "Open", updated: "Yesterday" },
];

export const adminContent: AdminContent[] = [
  { id: "CNT-701", title: "Summer drop announcement", type: "News", category: "Announcements", status: "Published", author: "Liam Patel", updated: "Today" },
  { id: "CNT-702", title: "Meet the Midigo muse", type: "Editorial", category: "Stories", status: "Scheduled", author: "Mia Chen", updated: "Yesterday" },
  { id: "CNT-703", title: "How to join a live room", type: "Guide", category: "Help", status: "Published", author: "Ethan Brooks", updated: "Jul 17" },
  { id: "CNT-704", title: "VIP preview notes", type: "Draft", category: "Internal", status: "Draft", author: "Noah Williams", updated: "Jul 15" },
  { id: "CNT-705", title: "Community spotlight", type: "News", category: "Community", status: "Scheduled", author: "Liam Patel", updated: "Jul 12" },
  { id: "CNT-706", title: "Membership changes", type: "Update", category: "Announcements", status: "Draft", author: "Sofia Reed", updated: "Jul 10" },
];

export const adminMemberships: AdminMembership[] = [
  { id: "PAY-801", member: "Elena Stone", plan: "VIP monthly", amount: "$24.00", status: "Active", renewal: "Aug 01" },
  { id: "PAY-802", member: "Marcus Lee", plan: "Standard monthly", amount: "$12.00", status: "Past due", renewal: "Jul 28" },
  { id: "PAY-803", member: "Nora James", plan: "VIP annual", amount: "$240.00", status: "Active", renewal: "Jan 15" },
  { id: "PAY-804", member: "Owen King", plan: "Standard monthly", amount: "$12.00", status: "Cancelled", renewal: "—" },
  { id: "PAY-805", member: "Priya Shah", plan: "Founding", amount: "$49.00", status: "Active", renewal: "Sep 01" },
  { id: "PAY-806", member: "Lucas Martin", plan: "Standard monthly", amount: "$12.00", status: "Active", renewal: "Aug 12" },
];

export const adminModerationCases: AdminModerationCase[] = [
  { id: "MOD-901", target: "Message #4821", reason: "Spam", severity: "Low", status: "Open", reporter: "System", updated: "4 min ago" },
  { id: "MOD-902", target: "Room: Midnight lounge", reason: "Reported behavior", severity: "High", status: "In review", reporter: "Elena S.", updated: "12 min ago" },
  { id: "MOD-903", target: "Profile @owen", reason: "Profile content", severity: "Medium", status: "Open", reporter: "Nora J.", updated: "38 min ago" },
  { id: "MOD-904", target: "Comment #1940", reason: "Harassment", severity: "High", status: "Resolved", reporter: "Marcus L.", updated: "Yesterday" },
  { id: "MOD-905", target: "Message #4798", reason: "Links", severity: "Low", status: "In review", reporter: "System", updated: "Yesterday" },
  { id: "MOD-906", target: "Room: Creator Q&A", reason: "Room safety", severity: "Medium", status: "Open", reporter: "Noah W.", updated: "2 days ago" },
];

export const adminAuditEvents: AdminAuditEvent[] = [
  { id: "AUD-001", actor: "Ava Morgan", action: "Updated role", target: "Moderator", timestamp: "Today, 10:42 AM", outcome: "Success" },
  { id: "AUD-002", actor: "Noah Williams", action: "Resolved case", target: "MOD-904", timestamp: "Today, 09:18 AM", outcome: "Success" },
  { id: "AUD-003", actor: "System", action: "Flagged message", target: "Message #4821", timestamp: "Today, 08:56 AM", outcome: "Warning" },
  { id: "AUD-004", actor: "Liam Patel", action: "Published article", target: "Summer drop announcement", timestamp: "Yesterday, 06:20 PM", outcome: "Success" },
  { id: "AUD-005", actor: "Sofia Reed", action: "Attempted export", target: "Payment report", timestamp: "Yesterday, 04:11 PM", outcome: "Denied" },
  { id: "AUD-006", actor: "Mia Chen", action: "Changed room status", target: "ROOM-101", timestamp: "Yesterday, 02:34 PM", outcome: "Success" },
];

export const adminRoles: AdminRole[] = [
  { id: "ROLE-ADMIN", name: "Administrator", description: "Full access to workspace settings and all modules.", members: "2", permissions: ["Manage users", "Manage content", "Manage billing", "View audit logs"] },
  { id: "ROLE-MOD", name: "Moderator", description: "Review reports and manage live-room safety.", members: "4", permissions: ["Review reports", "Manage rooms", "View conversations"] },
  { id: "ROLE-EDITOR", name: "Editor", description: "Create and publish platform content.", members: "3", permissions: ["Manage content", "Manage media", "View analytics"] },
  { id: "ROLE-SUPPORT", name: "Support", description: "Assist members and resolve conversations.", members: "6", permissions: ["View users", "Manage conversations", "View reports"] },
];

export const adminActivity = [
  { title: "New VIP member joined", detail: "Elena Stone upgraded her membership", time: "2 min ago", tone: "accent" as const },
  { title: "Room reached capacity", detail: "Midnight lounge is now at 128 participants", time: "12 min ago", tone: "warning" as const },
  { title: "Moderation case resolved", detail: "Noah Williams closed MOD-904", time: "18 min ago", tone: "success" as const },
  { title: "New draft published", detail: "Liam Patel published Summer drop announcement", time: "1 hr ago", tone: "info" as const },
];

export const adminAlerts = [
  { title: "Moderator coverage", detail: "Three live rooms need a moderator in the next hour.", tone: "warning" as const },
  { title: "Payment review", detail: "Two renewals need attention before the end of the day.", tone: "danger" as const },
  { title: "System healthy", detail: "All Admin services are operating within normal limits.", tone: "info" as const },
];

export const analyticsTrend = [
  { label: "Mon", value: "42%" },
  { label: "Tue", value: "58%" },
  { label: "Wed", value: "51%" },
  { label: "Thu", value: "74%" },
  { label: "Fri", value: "68%" },
  { label: "Sat", value: "92%" },
  { label: "Sun", value: "81%" },
];
