export interface AppUser {
  uid: string;
  email: string | null;
  nickname: string;
  photoURL: string | null;
  createdAt: number;
}

export type MeetingStatus = "active" | "done";

export interface Meeting {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  place: string;
  coverImage: string | null;
  ownerId: string;
  memberIds: string[];
  memberInfo: Record<string, { nickname: string; photoURL: string | null }>;
  joinCode: string;
  status: MeetingStatus;
  createdAt: number;
}

export interface PlanItem {
  id: string;
  type: "link" | "memo";
  title: string;
  url?: string;
  content?: string;
  createdBy: string;
  createdAt: number;
}

export interface ReceiptItem {
  id: string;
  name: string;
  amount: number;
}

export type SplitMethod = "equal" | "custom";

export interface Receipt {
  id: string;
  items: ReceiptItem[];
  total: number;
  participantIds: string[];
  splitMethod: SplitMethod;
  splits: Record<string, number>;
  payerId: string;
  createdBy: string;
  createdAt: number;
}

export type SettlementStatus = "pending" | "paid";

export interface Settlement {
  uid: string;
  amount: number;
  status: SettlementStatus;
  updatedAt: number;
}

export interface Photo {
  id: string;
  url: string;
  uploaderId: string;
  createdAt: number;
}

export interface Review {
  id: string;
  text: string;
  uid: string;
  nickname: string;
  createdAt: number;
}

export type NotificationType =
  | "settlement_request"
  | "settlement_done"
  | "invite"
  | "photo_added";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  meetingId?: string;
  createdAt: number;
  read: boolean;
}
