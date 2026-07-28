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

export type PlanItemTag =
  | "restaurant"
  | "cafe"
  | "lodging"
  | "activity"
  | "transport"
  | "shopping"
  | "etc";

export const PLAN_ITEM_TAGS: { value: PlanItemTag; label: string }[] = [
  { value: "restaurant", label: "식당" },
  { value: "cafe", label: "카페" },
  { value: "lodging", label: "숙소" },
  { value: "activity", label: "액티비티" },
  { value: "transport", label: "교통" },
  { value: "shopping", label: "쇼핑" },
  { value: "etc", label: "기타" },
];

export interface PlanItem {
  id: string;
  type: "link" | "memo";
  title: string;
  url?: string;
  content?: string;
  tag: PlanItemTag;
  pinned: boolean;
  likedBy: string[];
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
  | "photo_added"
  | "member_joined"
  | "plan_item_added"
  | "receipt_added"
  | "review_added";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  meetingId?: string;
  createdAt: number;
  read: boolean;
}
