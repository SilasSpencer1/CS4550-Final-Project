import { api } from "./client";
import type { PublicUser } from "./types";

export interface FriendRequest {
  _id: string;
  requester: PublicUser;
  recipient: PublicUser;
  status: "pending" | "accepted";
}

export async function myFriends() {
  const { data } = await api.get<PublicUser[]>("/friends");
  return data;
}

export async function pendingRequests() {
  const { data } = await api.get<FriendRequest[]>("/friends/pending");
  return data;
}

export async function sentRequests() {
  const { data } = await api.get<FriendRequest[]>("/friends/sent");
  return data;
}

export async function sendRequest(username: string) {
  const { data } = await api.post<FriendRequest>(`/friends/request/${username}`);
  return data;
}

export async function acceptRequest(id: string) {
  const { data } = await api.post<FriendRequest>(`/friends/accept/${id}`);
  return data;
}

export async function removeFriend(id: string) {
  await api.delete(`/friends/${id}`);
}
