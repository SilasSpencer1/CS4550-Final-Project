import { describe, it, expect } from "vitest";
import request from "supertest";
import { app, agent, signupAgent } from "./helpers.js";

describe("auth", () => {
  it("rejects signup missing fields", async () => {
    const res = await request(app()).post("/api/auth/signup").send({});
    expect(res.status).toBe(400);
  });

  it("creates a user and returns a session", async () => {
    const a = agent();
    const { user } = await signupAgent(a, { username: "alice", email: "alice@ex.com" });
    expect(user.username).toBe("alice");
    expect(user.role).toBe("user");
    expect(user.passwordHash).toBeUndefined();

    const me = await a.get("/api/auth/me").expect(200);
    expect(me.body.username).toBe("alice");
  });

  it("refuses duplicate username/email", async () => {
    const a = agent();
    await signupAgent(a, { username: "dup", email: "dup@ex.com" });
    const second = await request(app()).post("/api/auth/signup").send({
      username: "dup",
      email: "other@ex.com",
      password: "password1",
    });
    expect(second.status).toBe(409);
  });

  it("honors role=organizer", async () => {
    const a = agent();
    const { user } = await signupAgent(a, { role: "organizer" });
    expect(user.role).toBe("organizer");
  });

  it("signin with wrong password fails", async () => {
    const a = agent();
    await signupAgent(a, { username: "bob", email: "bob@ex.com", password: "right1" });
    const res = await request(app())
      .post("/api/auth/signin")
      .send({ usernameOrEmail: "bob", password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("signin with right password issues a session", async () => {
    const a = agent();
    await signupAgent(a, { username: "carol", email: "carol@ex.com" });

    const b = agent();
    const signin = await b
      .post("/api/auth/signin")
      .send({ usernameOrEmail: "carol", password: "password1" });
    expect(signin.status).toBe(200);
    const me = await b.get("/api/auth/me");
    expect(me.status).toBe(200);
    expect(me.body.username).toBe("carol");
  });

  it("signout clears session", async () => {
    const a = agent();
    await signupAgent(a);
    await a.post("/api/auth/signout").expect(200);
    const me = await a.get("/api/auth/me");
    expect(me.status).toBe(401);
  });

  it("/api/auth/me requires auth", async () => {
    const res = await request(app()).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("two users can sign in on separate sessions simultaneously", async () => {
    const a = agent();
    const b = agent();
    await signupAgent(a, { username: "ea", email: "ea@ex.com" });
    await signupAgent(b, { username: "eb", email: "eb@ex.com" });
    const ma = await a.get("/api/auth/me").expect(200);
    const mb = await b.get("/api/auth/me").expect(200);
    expect(ma.body.username).toBe("ea");
    expect(mb.body.username).toBe("eb");
  });
});
