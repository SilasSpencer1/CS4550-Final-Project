import { describe, it, expect } from "vitest";
import { agent, signupAgent, createEvent } from "./helpers.js";

describe("events", () => {
  it("POST /api/events requires auth", async () => {
    const res = await agent().post("/api/events").send({});
    expect(res.status).toBe(401);
  });

  it("POST /api/events creates an event as a regular user", async () => {
    const a = agent();
    await signupAgent(a);
    const ev = await createEvent(a, {
      title: "Pizza night",
      visibility: "friends",
    });
    expect(ev.title).toBe("Pizza night");
    expect(ev.source).toBe("user");
    expect(ev.visibility).toBe("friends");
  });

  it("organizers always produce source=organizer + visibility=public", async () => {
    const a = agent();
    await signupAgent(a, { role: "organizer" });
    const ev = await createEvent(a, {
      title: "Jazz night",
      visibility: "friends", // should be overridden
    });
    expect(ev.source).toBe("organizer");
    expect(ev.visibility).toBe("public");
  });

  it("GET /api/events/mine returns only my events", async () => {
    const a = agent();
    const b = agent();
    await signupAgent(a, { username: "me", email: "me@ex.com" });
    await signupAgent(b, { username: "other", email: "other@ex.com" });
    await createEvent(a, { title: "Mine A" });
    await createEvent(b, { title: "Not mine" });

    const res = await a.get("/api/events/mine");
    expect(res.status).toBe(200);
    const titles = res.body.map((e: any) => e.title);
    expect(titles).toContain("Mine A");
    expect(titles).not.toContain("Not mine");
  });

  it("PUT /api/events/:id updates only own event", async () => {
    const a = agent();
    const b = agent();
    await signupAgent(a);
    await signupAgent(b);
    const ev = await createEvent(a, { title: "Original" });

    const other = await b.put(`/api/events/${ev._id}`).send({ title: "Hijacked" });
    expect(other.status).toBe(403);

    const mine = await a.put(`/api/events/${ev._id}`).send({ title: "Updated" });
    expect(mine.status).toBe(200);
    expect(mine.body.title).toBe("Updated");
  });

  it("DELETE /api/events/:id refuses non-owners", async () => {
    const a = agent();
    const b = agent();
    await signupAgent(a);
    await signupAgent(b);
    const ev = await createEvent(a);
    const other = await b.delete(`/api/events/${ev._id}`);
    expect(other.status).toBe(403);
    const mine = await a.delete(`/api/events/${ev._id}`);
    expect(mine.status).toBe(200);
  });

  it("GET /api/events/public returns only public events", async () => {
    const a = agent();
    await signupAgent(a);
    await createEvent(a, { title: "Public", visibility: "public" });
    await createEvent(a, { title: "Friends", visibility: "friends" });
    const res = await agent().get("/api/events/public");
    expect(res.status).toBe(200);
    const titles = res.body.map((e: any) => e.title);
    expect(titles).toContain("Public");
    expect(titles).not.toContain("Friends");
  });

  it("GET /api/events/:id privacy: stranger on friends event sees busy shell", async () => {
    const a = agent();
    await signupAgent(a);
    const ev = await createEvent(a, { title: "Private", visibility: "friends" });
    const stranger = await agent().get(`/api/events/${ev._id}`);
    expect(stranger.status).toBe(200);
    expect(stranger.body.title).toBe("Busy");
    expect(stranger.body.visibility).toBe("busy");
  });

  it("GET /api/events/:id privacy: public event is visible to anon", async () => {
    const a = agent();
    await signupAgent(a);
    const ev = await createEvent(a, { title: "Open", visibility: "public" });
    const res = await agent().get(`/api/events/${ev._id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Open");
  });
});
