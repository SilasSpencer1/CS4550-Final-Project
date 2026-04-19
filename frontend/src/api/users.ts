import { api } from "./client";
import type { PublicUser, SessionUser, UserEvent } from "./types";

export async function getUser(username: string) {
  const { data } = await api.get<PublicUser>(`/users/${username}`);
  return data;
}

export async function getUserEvents(username: string) {
  const { data } = await api.get<UserEvent[]>(`/users/${username}/events`);
  return data;
}

export async function updateMe(input: Partial<SessionUser>) {
  const { data } = await api.put<SessionUser>("/users/me", input);
  return data;
}

export async function searchUsers(q: string) {
  const { data } = await api.get<PublicUser[]>(`/users`, { params: { q } });
  return data;
}
