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

  it("GET /api/rsvps/mine?status=invited filters to invites only", async () => {
    const a = agent();
    const b = agent();
    await signupAgent(a);
    const { user: bUser } = await signupAgent(b);
    const open = await createEvent(a, { visibility: "public" });
    const closed = await createEvent(a, { visibility: "friends" });
    await b.post(`/api/rsvps/event/${open._id}`).send({ status: "going" });
    await a.post(`/api/rsvps/event/${closed._id}/invite/${bUser._id}`);

    const res = await b.get("/api/rsvps/mine?status=invited");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].status).toBe("invited");
  });

  it("POST invite: only the creator can send invites", async () => {
    const a = agent();
    const b = agent();
    const c = agent();
    await signupAgent(a);
    const { user: bUser } = await signupAgent(b);
    await signupAgent(c);
    const ev = await createEvent(a, { visibility: "friends" });

    const notCreator = await c.post(
      `/api/rsvps/event/${ev._id}/invite/${bUser._id}`
    );
    expect(notCreator.status).toBe(403);

    const creator = await a.post(
      `/api/rsvps/event/${ev._id}/invite/${bUser._id}`
    );
    expect(creator.status).toBe(200);
    expect(creator.body.status).toBe("invited");
  });

  it("POST invite: can't invite yourself", async () => {
    const a = agent();
    const { user } = await signupAgent(a);
    const ev = await createEvent(a, { visibility: "friends" });
    const res = await a.post(`/api/rsvps/event/${ev._id}/invite/${user._id}`);
    expect(res.status).toBe(400);
  });

  it("POST invite: doesn't overwrite an existing going/maybe reply", async () => {
    const a = agent();
    const b = agent();
    await signupAgent(a);
    const { user: bUser } = await signupAgent(b);
    const ev = await createEvent(a, { visibility: "public" });
    await b.post(`/api/rsvps/event/${ev._id}`).send({ status: "maybe" });

    const res = await a.post(
      `/api/rsvps/event/${ev._id}/invite/${bUser._id}`
    );
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("maybe");
  });

  it("invited user who RSVPs 'going' stays going (no request-and-approve loop)", async () => {
    const a = agent();
    const b = agent();
    await signupAgent(a);
    const { user: bUser } = await signupAgent(b);
    const ev = await createEvent(a, { visibility: "friends" });

    await a.post(`/api/rsvps/event/${ev._id}/invite/${bUser._id}`).expect(200);
    const res = await b
      .post(`/api/rsvps/event/${ev._id}`)
      .send({ status: "going" });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("going");
  });

  it("invited user can view a friends-only event in full (privacy pass-through)", async () => {
    const a = agent();
    const b = agent();
    await signupAgent(a);
    const { user: bUser } = await signupAgent(b);
    const ev = await createEvent(a, {
      title: "friends only dinner",
      visibility: "friends",
    });

    // Before invite: stranger sees Busy shell
    const before = await b.get(`/api/events/${ev._id}`);
    expect(before.body.title).toBe("Busy");

    // After invite: full details visible even though they aren't friends
    await a.post(`/api/rsvps/event/${ev._id}/invite/${bUser._id}`).expect(200);
    const after = await b.get(`/api/events/${ev._id}`);
    expect(after.body.title).toBe("friends only dinner");
  });
});
