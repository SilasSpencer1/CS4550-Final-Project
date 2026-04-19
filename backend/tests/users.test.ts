import { describe, it, expect } from "vitest";
import { agent, signupAgent, createEvent } from "./helpers.js";

describe("users", () => {
  it("GET /api/users/:username returns public profile", async () => {
    const a = agent();
    const { user } = await signupAgent(a, {
      username: "u1",
      email: "u1@ex.com",
      displayName: "User One",
    });
    const res = await agent().get(`/api/users/${user.username}`).expect(200);
    expect(res.body.username).toBe("u1");
    expect(res.body.displayName).toBe("User One");
    expect(res.body.isSelf).toBe(false);
  });

  it("hides email from other viewers and shows to self", async () => {
    const a = agent();
    const { user } = await signupAgent(a, {
      username: "u2",
      email: "u2@ex.com",
    });
    const stranger = await agent().get(`/api/users/${user.username}`);
    expect(stranger.body.email).toBeUndefined();

    const self = await a.get(`/api/users/${user.username}`);
    expect(self.body.email).toBe("u2@ex.com");
    expect(self.body.isSelf).toBe(true);
  });

  it("PUT /api/users/me updates own profile", async () => {
    const a = agent();
    await signupAgent(a);
    const res = await a.put("/api/users/me").send({
      bio: "hello",
      interests: ["jazz", "hiking"],
      location: { city: "Boston", state: "MA" },
      defaultPrivacy: "public",
    });
    expect(res.status).toBe(200);
    expect(res.body.bio).toBe("hello");
    expect(res.body.interests).toEqual(["jazz", "hiking"]);
    expect(res.body.location.city).toBe("Boston");
  });

  it("PUT /api/users/me requires auth", async () => {
    const res = await agent().put("/api/users/me").send({ bio: "x" });
    expect(res.status).toBe(401);
  });

  it("GET /api/users?q= searches by username/displayName", async () => {
    const a = agent();
    await signupAgent(a, { username: "alpha", email: "a@ex.com", displayName: "Alpha" });
    await signupAgent(agent(), { username: "beta", email: "b@ex.com", displayName: "Beta" });
    const res = await a.get("/api/users?q=alph");
    expect(res.status).toBe(200);
    expect(res.body.some((u: any) => u.username === "alpha")).toBe(true);
    expect(res.body.some((u: any) => u.username === "beta")).toBe(false);
  });

  it("GET /api/users/:username/events respects privacy for strangers", async () => {
    const a = agent();
    const { user } = await signupAgent(a);
    await createEvent(a, { title: "Secret dinner", visibility: "friends" });
    await createEvent(a, { title: "Open party", visibility: "public" });

    const res = await agent().get(`/api/users/${user.username}/events`);
    expect(res.status).toBe(200);
    const titles = res.body.map((e: any) => e.title);
    expect(titles).toContain("Open party");
    // Friends-only event should show as "Busy" title for a stranger
    const secret = res.body.find(
      (e: any) => e.visibility === "busy" && e.title === "Busy"
    );
    expect(secret).toBeTruthy();
  });

  it("GET /api/users/:username/events shows full details to the owner", async () => {
    const a = agent();
    const { user } = await signupAgent(a);
    await createEvent(a, { title: "Secret dinner", visibility: "friends" });
    const res = await a.get(`/api/users/${user.username}/events`);
    expect(res.status).toBe(200);
    const titles = res.body.map((e: any) => e.title);
    expect(titles).toContain("Secret dinner");
  });
});
