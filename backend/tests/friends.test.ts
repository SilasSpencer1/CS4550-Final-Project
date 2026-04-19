import { describe, it, expect } from "vitest";
import { agent, signupAgent, createEvent } from "./helpers.js";

describe("friends", () => {
  it("requires auth", async () => {
    const res = await agent().get("/api/friends");
    expect(res.status).toBe(401);
  });

  it("sends a friend request", async () => {
    const a = agent();
    const b = agent();
    const { user: aUser } = await signupAgent(a, {
      username: "anna",
      email: "anna@ex.com",
    });
    await signupAgent(b, { username: "ben", email: "ben@ex.com" });

    const res = await b.post(`/api/friends/request/${aUser.username}`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("pending");

    const pending = await a.get("/api/friends/pending");
    expect(pending.body.length).toBe(1);
    expect(pending.body[0].requester.username).toBe("ben");
  });

  it("idempotent — duplicate request returns existing", async () => {
    const a = agent();
    const b = agent();
    const { user: aUser } = await signupAgent(a);
    await signupAgent(b);
    const r1 = await b.post(`/api/friends/request/${aUser.username}`);
    const r2 = await b.post(`/api/friends/request/${aUser.username}`);
    expect(r1.body._id).toBe(r2.body._id);
  });

  it("cannot friend yourself", async () => {
    const a = agent();
    const { user } = await signupAgent(a);
    const res = await a.post(`/api/friends/request/${user.username}`);
    expect(res.status).toBe(400);
  });

  it("recipient can accept and both appear as friends", async () => {
    const a = agent();
    const b = agent();
    const { user: aUser } = await signupAgent(a);
    await signupAgent(b);

    const reqRes = await b.post(`/api/friends/request/${aUser.username}`);
    await a.post(`/api/friends/accept/${reqRes.body._id}`).expect(200);

    const aFriends = await a.get("/api/friends");
    const bFriends = await b.get("/api/friends");
    expect(aFriends.body.length).toBe(1);
    expect(bFriends.body.length).toBe(1);
  });

  it("friends unlock friends-only events", async () => {
    const a = agent();
    const b = agent();
    const { user: aUser } = await signupAgent(a);
    await signupAgent(b);
    const ev = await createEvent(a, { title: "Friends night", visibility: "friends" });

    // before friendship: stranger sees busy
    const before = await b.get(`/api/events/${ev._id}`);
    expect(before.body.title).toBe("Busy");

    // accept friendship
    const reqRes = await b.post(`/api/friends/request/${aUser.username}`);
    await a.post(`/api/friends/accept/${reqRes.body._id}`);

    const after = await b.get(`/api/events/${ev._id}`);
    expect(after.body.title).toBe("Friends night");
  });

  it("GET /api/events/feed returns friends' upcoming public/friends events", async () => {
    const a = agent();
    const b = agent();
    const { user: aUser } = await signupAgent(a);
    await signupAgent(b);
    await createEvent(a, { title: "Coffee", visibility: "friends" });

    const reqRes = await b.post(`/api/friends/request/${aUser.username}`);
    await a.post(`/api/friends/accept/${reqRes.body._id}`);

    const feed = await b.get("/api/events/feed");
    expect(feed.body.map((e: any) => e.title)).toContain("Coffee");
  });

  it("DELETE removes friendship", async () => {
    const a = agent();
    const b = agent();
    const { user: aUser } = await signupAgent(a);
    await signupAgent(b);
    const reqRes = await b.post(`/api/friends/request/${aUser.username}`);
    await a.post(`/api/friends/accept/${reqRes.body._id}`);
    await a.delete(`/api/friends/${reqRes.body._id}`).expect(200);
    const list = await a.get("/api/friends");
    expect(list.body.length).toBe(0);
  });
});
