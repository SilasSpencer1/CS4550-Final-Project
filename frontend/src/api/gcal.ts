import { api } from "./client";

export async function getAuthUrl() {
  const { data } = await api.get<{ url: string }>("/gcal/auth-url");
  return data.url;
}

export async function sync() {
  const { data } = await api.post<{ imported: number }>("/gcal/sync");
  return data;
}

export async function disconnect() {
  await api.delete("/gcal/disconnect");
}
