import request from "supertest";
import type { SuperAgentTest } from "supertest";
import { createApp } from "../src/app.js";

export function app() {
  return createApp();
}

export function agent(): SuperAgentTest {
  return request.agent(app()) as unknown as SuperAgentTest;
}

export async function signupAgent(
  a: SuperAgentTest,
  overrides: Partial<{
    username: string;
    email: string;
    password: string;
    role: "user" | "organizer";
    displayName: string;
  }> = {}
) {
  const base = {
    username: `u${Math.random().toString(36).slice(2, 8)}`,
    email: `${Math.random().toString(36).slice(2, 8)}@example.com`,
    password: "password1",
    role: "user" as const,
    displayName: "Test User",
  };
  const payload = { ...base, ...overrides };
  const res = await a.post("/api/auth/signup").send(payload).expect(200);
  return { user: res.body, payload };
}

export async function createEvent(
  a: SuperAgentTest,
  overrides: Record<string, unknown> = {}
) {
  const now = new Date();
  const later = new Date(Date.now() + 1000 * 60 * 60);
  const body = {
    title: "Test event",
    description: "Test description",
    startTime: now.toISOString(),
    endTime: later.toISOString(),
    location: { address: "1 Main St", city: "Boston" },
    visibility: "friends",
    tags: ["test"],
    ...overrides,
  };
  const res = await a.post("/api/events").send(body).expect(200);
  return res.body;
}
