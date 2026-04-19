import { api } from "./client";
import type { Comment } from "./types";

export async function getComments(kind: "event" | "tmEvent", id: string) {
  const { data } = await api.get<Comment[]>(`/comments/${kind}/${id}`);
  return data;
}

export async function postComment(
  kind: "event" | "tmEvent",
  id: string,
  body: string
) {
  const { data } = await api.post<Comment>(`/comments/${kind}/${id}`, { body });
  return data;
}

export async function deleteComment(id: string) {
  await api.delete(`/comments/${id}`);
}
