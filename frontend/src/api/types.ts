export type Role = "user" | "organizer";
export type Visibility = "busy" | "friends" | "public";
export type EventSource = "user" | "organizer" | "gcal_import";

export interface SessionUser {
  _id: string;
  username: string;
  email: string;
  role: Role;
  displayName: string;
  bio: string;
  avatarUrl: string;
  interests: string[];
  location: { city: string; state: string };
  defaultPrivacy: Visibility;
}

export interface PublicUser {
  _id: string;
  username: string;
  role: Role;
  displayName: string;
  bio: string;
  avatarUrl: string;
  interests: string[];
  location: { city: string; state: string };
  email?: string;
  isFriend?: boolean;
  isSelf?: boolean;
}

export interface UserEvent {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: { address: string; city: string; lat: number | null; lng: number | null };
  createdBy: string | PublicUser;
  source: EventSource;
  visibility: Visibility;
  tags: string[];
  maxAttendees: number | null;
}

export interface Rsvp {
  _id: string;
  user: string | PublicUser;
  event: string | UserEvent;
  status: "going" | "maybe" | "invited" | "requested";
}

export interface Comment {
  _id: string;
  author: PublicUser;
  target: { kind: "event" | "tmEvent"; id: string };
  body: string;
  createdAt: string;
}

export interface TmSummary {
  id: string;
  name: string;
  url: string;
  image: string | null;
  startDateTime: string | null;
  venue: string;
  city: string;
  classifications: string[];
}

export interface TmDetail {
  id: string;
  name: string;
  info: string;
  pleaseNote: string;
  url: string;
  image: string | null;
  startDateTime: string | null;
  priceRanges: { min: number; max: number; currency: string }[];
  venue: { name: string; city: string; state: string; address: string } | null;
  classifications: string[];
}

export interface Suggestion {
  source: "organizer" | "ticketmaster";
  id: string;
  title: string;
  startTime: string | null;
  endTime?: string | null;
  city: string;
  tags: string[];
  score: number;
  image?: string | null;
  url?: string;
}
