import { api } from "./client";
import type { SessionUser } from "./types";

export async function signup(input: {
  username: string;
  email: string;
  password: string;
  role: "user" | "organizer";
  displayName?: string;
}) {
  const { data } = await api.post<SessionUser>("/auth/signup", input);
  return data;
}

export async function signin(usernameOrEmail: string, password: string) {
  const { data } = await api.post<SessionUser>("/auth/signin", {
    usernameOrEmail,
    password,
  });
  return data;
}

export async function signout() {
  await api.post("/auth/signout");
}

export async function fetchMe(): Promise<SessionUser | null> {
  try {
    const { data } = await api.get<SessionUser>("/auth/me");
    return data;
  } catch {
    return null;
  }
}
