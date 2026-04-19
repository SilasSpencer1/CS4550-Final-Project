import { describe, it, expect } from "vitest";
import { agent, signupAgent, createEvent } from "./helpers.js";

describe("rsvps", () => {
  it("POST requires auth", async () => {
    const a = agent();
    await signupAgent(a);
    const ev = await createEvent(a);
    const res = await agent().post(`/api/rsvps/event/${ev._id}`).send({});
    expect(res.status).toBe(401);
  });

  it("non-creator's first RSVP=going becomes status=requested", async () => {
    const a = agent();
    const b = agent();
    await signupAgent(a);
    await signupAgent(b);
    const ev = await createEvent(a, { visibility: "public" });

    const res = await b
      .post(`/api/rsvps/event/${ev._id}`)
      .send({ status: "going" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("requested");
  });

  it("creator can approve a requested RSVP", async () => {
    const a = agent();
    const b = agent();
    await signupAgent(a);
    const { user: bUser } = await signupAgent(b);
    const ev = await createEvent(a, { visibility: "public" });
    await b.post(`/api/rsvps/event/${ev._id}`).send({ status: "going" });

    const res = await a.post(`/api/rsvps/event/${ev._id}/approve/${bUser._id}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("going");
  });

  it("non-creators can't approve", async () => {
    const a = agent();
    const b = agent();
    const c = agent();
    await signupAgent(a);
    const { user: bUser } = await signupAgent(b);
    await signupAgent(c);
    const ev = await createEvent(a, { visibility: "public" });
    await b.post(`/api/rsvps/event/${ev._id}`).send({ status: "going" });

    const res = await c.post(`/api/rsvps/event/${ev._id}/approve/${bUser._id}`);
    expect(res.status).toBe(403);
  });

  it("DELETE cancels RSVP", async () => {
    const a = agent();
    const b = agent();
    await signupAgent(a);
    await signupAgent(b);
    const ev = await createEvent(a, { visibility: "public" });
    await b.post(`/api/rsvps/event/${ev._id}`).send({ status: "maybe" });
    await b.delete(`/api/rsvps/event/${ev._id}`).expect(200);
    const list = await a.get(`/api/rsvps/event/${ev._id}`);
    expect(list.body.length).toBe(0);
  });

  it("GET /api/rsvps/mine lists my RSVPs", async () => {
    const a = agent();
    const b = agent();
    await signupAgent(a);
    await signupAgent(b);
    const ev = await createEvent(a, { visibility: "public" });
    await b.post(`/api/rsvps/event/${ev._id}`).send({ status: "going" });
    const res = await b.get("/api/rsvps/mine");
    expect(res.body.length).toBe(1);
  });
});
