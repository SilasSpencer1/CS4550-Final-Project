import { api } from "./client";
import type { Rsvp } from "./types";

export async function myRsvps(status?: Rsvp["status"]) {
  const { data } = await api.get<Rsvp[]>("/rsvps/mine", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function eventRsvps(eventId: string) {
  const { data } = await api.get<Rsvp[]>(`/rsvps/event/${eventId}`);
  return data;
}

export async function rsvpToEvent(eventId: string, status: Rsvp["status"] = "going") {
  const { data } = await api.post<Rsvp>(`/rsvps/event/${eventId}`, { status });
  return data;
}

export async function approveRsvp(eventId: string, userId: string) {
  const { data } = await api.post<Rsvp>(`/rsvps/event/${eventId}/approve/${userId}`);
  return data;
}

export async function inviteFriend(eventId: string, userId: string) {
  const { data } = await api.post<Rsvp>(`/rsvps/event/${eventId}/invite/${userId}`);
  return data;
}

export async function cancelRsvp(eventId: string) {
  await api.delete(`/rsvps/event/${eventId}`);
}
