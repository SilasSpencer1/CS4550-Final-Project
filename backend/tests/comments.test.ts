import { describe, it, expect } from "vitest";
import { agent, signupAgent, createEvent } from "./helpers.js";

describe("comments", () => {
  it("POST requires auth", async () => {
    const res = await agent().post("/api/comments/event/someid").send({ body: "hi" });
    expect(res.status).toBe(401);
  });

  it("rejects invalid target kind", async () => {
    const a = agent();
    await signupAgent(a);
    const res = await a.post("/api/comments/bogus/abc").send({ body: "hi" });
    expect(res.status).toBe(400);
  });

  it("rejects empty body", async () => {
    const a = agent();
    await signupAgent(a);
    const res = await a.post("/api/comments/event/abc").send({ body: "   " });
    expect(res.status).toBe(400);
  });

  it("posts + lists comments on a user event", async () => {
    const a = agent();
    const b = agent();
    await signupAgent(a);
    await signupAgent(b, { username: "commenter", email: "com@ex.com" });
    const ev = await createEvent(a, { visibility: "public" });

    const post = await b
      .post(`/api/comments/event/${ev._id}`)
      .send({ body: "can't wait" });
    expect(post.status).toBe(200);
    expect(post.body.body).toBe("can't wait");
    expect(post.body.author.username).toBe("commenter");

    const list = await agent().get(`/api/comments/event/${ev._id}`);
    expect(list.status).toBe(200);
    expect(list.body.length).toBe(1);
    expect(list.body[0].body).toBe("can't wait");
  });

  it("supports tmEvent (3rd-party) comments by external id", async () => {
    const a = agent();
    await signupAgent(a);
    await a
      .post("/api/comments/tmEvent/G5diZ93kXbvK2")
      .send({ body: "ive been to this one" })
      .expect(200);
    const list = await agent().get("/api/comments/tmEvent/G5diZ93kXbvK2");
    expect(list.body.length).toBe(1);
  });

  it("DELETE only allows the author", async () => {
    const a = agent();
    const b = agent();
    await signupAgent(a);
    await signupAgent(b);
    const ev = await createEvent(a, { visibility: "public" });
    const posted = await b
      .post(`/api/comments/event/${ev._id}`)
      .send({ body: "hi" });
    expect(posted.status).toBe(200);
    expect(posted.body._id).toBeTruthy();

    const wrong = await a.delete(`/api/comments/${posted.body._id}`);
    expect(wrong.status).toBe(403);

    const ok = await b.delete(`/api/comments/${posted.body._id}`);
    expect(ok.status).toBe(200);
  });
});
