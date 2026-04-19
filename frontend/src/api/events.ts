import { api } from "./client";
import type { UserEvent } from "./types";

export async function myEvents() {
  const { data } = await api.get<UserEvent[]>("/events/mine");
  return data;
}

export async function friendsFeed() {
  const { data } = await api.get<UserEvent[]>("/events/feed");
  return data;
}

export async function publicEvents() {
  const { data } = await api.get<UserEvent[]>("/events/public");
  return data;
}

export async function getEvent(id: string) {
  const { data } = await api.get<UserEvent>(`/events/${id}`);
  return data;
}

export async function createEvent(input: Partial<UserEvent>) {
  const { data } = await api.post<UserEvent>("/events", input);
  return data;
}

export async function updateEvent(id: string, input: Partial<UserEvent>) {
  const { data } = await api.put<UserEvent>(`/events/${id}`, input);
  return data;
}

export async function deleteEvent(id: string) {
  await api.delete(`/events/${id}`);
}
