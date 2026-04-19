#!/usr/bin/env node
// End-to-end smoke test for the Roster backend.
// Boots an in-memory MongoDB, starts the real Express app, and walks a two-user
// flow: signup → create event → second signup → friend request → RSVP → comment.
// Exits 0 if every step returns the expected shape; 1 and a useful log otherwise.

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

const BASE = process.env.SMOKE_BASE ?? "";
const step = (name) => {
  process.stdout.write(`  ${name}… `);
};
const ok = () => console.log("ok");
const fail = (err) => {
  console.log("FAIL");
  console.error(err);
  process.exit(1);
};

// A stateful fetch wrapper that tracks Set-Cookie per "agent" so each user keeps a session.
function makeAgent(baseUrl) {
  const cookies = new Map();
  function cookieHeader() {
    return [...cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
  }
  function absorbCookies(resp) {
    const sc = resp.headers.getSetCookie?.() ?? [];
    for (const c of sc) {
      const [pair] = c.split(";");
      const eq = pair.indexOf("=");
      if (eq > 0) cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
    }
  }
  async function req(method, path, body) {
    const headers = { "Content-Type": "application/json" };
    const c = cookieHeader();
    if (c) headers.Cookie = c;
    const resp = await fetch(baseUrl + path, {
      method,
      headers,
      body: body != null ? JSON.stringify(body) : undefined,
    });
    absorbCookies(resp);
    const text = await resp.text();
    let parsed = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }
    return { status: resp.status, body: parsed };
  }
  return {
    get: (p) => req("GET", p),
    post: (p, b) => req("POST", p, b),
    put: (p, b) => req("PUT", p, b),
    del: (p) => req("DELETE", p),
  };
}

function assertStatus(res, code, where) {
  if (res.status !== code) {
    throw new Error(
      `${where}: expected ${code}, got ${res.status} — ${JSON.stringify(res.body)}`
    );
  }
}

async function run() {
  console.log("🧪 Roster E2E smoke\n");

  step("booting in-memory mongodb");
  const mem = await MongoMemoryServer.create();
  process.env.MONGO_URI = mem.getUri();
  process.env.SESSION_SECRET = "smoke-secret";
  process.env.PORT = "4811";
  process.env.FRONTEND_ORIGIN = "http://localhost:5173";
  await mongoose.connect(process.env.MONGO_URI);
  ok();

  step("starting express app");
  const { createApp } = await import("../dist/app.js");
  const app = createApp();
  const server = await new Promise((resolve, reject) => {
    const s = app.listen(4811, (err) => (err ? reject(err) : resolve(s)));
  });
  const base = BASE || "http://localhost:4811";
  ok();

  try {
    step("GET /health");
    const health = await makeAgent(base).get("/health");
    assertStatus(health, 200, "/health");
    if (!health.body.ok) throw new Error("health body wrong");
    ok();

    const alice = makeAgent(base);
    const bob = makeAgent(base);

    step("alice signs up (role=user)");
    const aSignup = await alice.post("/api/auth/signup", {
      username: "smoke-alice",
      email: "alice@smoke.test",
      password: "password1",
      role: "user",
      displayName: "Alice",
    });
    assertStatus(aSignup, 200, "signup alice");
    ok();

    step("alice updates interests + city");
    const aProfile = await alice.put("/api/users/me", {
      interests: ["jazz", "hiking"],
      location: { city: "Boston", state: "MA" },
    });
    assertStatus(aProfile, 200, "update profile");
    ok();

    step("bob signs up (role=organizer)");
    const bSignup = await bob.post("/api/auth/signup", {
      username: "smoke-bob",
      email: "bob@smoke.test",
      password: "password1",
      role: "organizer",
    });
    assertStatus(bSignup, 200, "signup bob");
    if (bSignup.body.role !== "organizer") throw new Error("role not saved");
    ok();

    step("alice creates a friends-only event");
    const aliceEvent = await alice.post("/api/events", {
      title: "Pizza at Mel's",
      description: "thursday pizza",
      startTime: new Date(Date.now() + 36e5).toISOString(),
      endTime: new Date(Date.now() + 2 * 36e5).toISOString(),
      location: { city: "Boston", address: "" },
      visibility: "friends",
      tags: ["pizza"],
    });
    assertStatus(aliceEvent, 200, "create aliceEvent");
    if (aliceEvent.body.visibility !== "friends")
      throw new Error("visibility wrong");
    ok();

    step("bob creates a public organizer event");
    const bobEvent = await bob.post("/api/events", {
      title: "Jazz Night Boston",
      startTime: new Date(Date.now() + 2 * 36e5).toISOString(),
      endTime: new Date(Date.now() + 4 * 36e5).toISOString(),
      location: { city: "Boston" },
      tags: ["jazz"],
    });
    assertStatus(bobEvent, 200, "create bobEvent");
    if (bobEvent.body.source !== "organizer")
      throw new Error("organizer source not applied");
    if (bobEvent.body.visibility !== "public")
      throw new Error("organizer visibility not forced public");
    ok();

    step("stranger (anon) sees alice's event as 'Busy'");
    const anon = makeAgent(base);
    const strangerView = await anon.get(`/api/events/${aliceEvent.body._id}`);
    assertStatus(strangerView, 200, "stranger view");
    if (strangerView.body.title !== "Busy")
      throw new Error(
        `expected Busy, got title=${strangerView.body.title}`
      );
    ok();

    step("bob sends alice a friend request");
    const request = await bob.post("/api/friends/request/smoke-alice");
    assertStatus(request, 200, "friend request");
    ok();

    step("alice accepts; both now see each other as friends");
    const accept = await alice.post(`/api/friends/accept/${request.body._id}`);
    assertStatus(accept, 200, "accept friend");
    const aFriends = await alice.get("/api/friends");
    const bFriends = await bob.get("/api/friends");
    if (aFriends.body.length !== 1 || bFriends.body.length !== 1)
      throw new Error(
        `expected 1 friend each, got a=${aFriends.body.length} b=${bFriends.body.length}`
      );
    ok();

    step("bob can now see alice's friends-only event in full");
    const bobView = await bob.get(`/api/events/${aliceEvent.body._id}`);
    assertStatus(bobView, 200, "bob view");
    if (bobView.body.title !== "Pizza at Mel's")
      throw new Error(`expected full title, got ${bobView.body.title}`);
    ok();

    step("alice sees bob's event in her feed");
    const feed = await alice.get("/api/events/feed");
    assertStatus(feed, 200, "feed");
    if (!feed.body.some((e) => e.title === "Jazz Night Boston"))
      throw new Error("bob's event not in alice's feed");
    ok();

    step("alice RSVPs to bob's event → status=requested");
    const rsvp = await alice.post(`/api/rsvps/event/${bobEvent.body._id}`, {
      status: "going",
    });
    assertStatus(rsvp, 200, "rsvp");
    if (rsvp.body.status !== "requested")
      throw new Error(`expected requested, got ${rsvp.body.status}`);
    ok();

    step("bob approves alice's RSVP");
    const approve = await bob.post(
      `/api/rsvps/event/${bobEvent.body._id}/approve/${aSignup.body._id}`
    );
    assertStatus(approve, 200, "approve");
    if (approve.body.status !== "going")
      throw new Error(`expected going, got ${approve.body.status}`);
    ok();

    step("alice posts a comment on bob's event");
    const comment = await alice.post(
      `/api/comments/event/${bobEvent.body._id}`,
      { body: "cant wait" }
    );
    assertStatus(comment, 200, "comment");
    if (comment.body.body !== "cant wait")
      throw new Error("comment body wrong");
    ok();

    step("public listing shows bob's event");
    const pub = await anon.get("/api/events/public");
    assertStatus(pub, 200, "public list");
    if (!pub.body.some((e) => e.title === "Jazz Night Boston"))
      throw new Error("bob's event missing from public list");
    ok();

    step("suggestions for alice surface bob's tagged event");
    const sugg = await alice.get("/api/suggestions");
    assertStatus(sugg, 200, "suggestions");
    // Alice has 'jazz' in interests; bob's event is tagged 'jazz'. It should be in the top 10.
    if (!sugg.body.some((s) => s.title === "Jazz Night Boston"))
      throw new Error("jazz event missing from suggestions");
    ok();

    step("role guard: non-organizer can't access organizer-only route");
    const cannotApprove = await alice.post(
      `/api/rsvps/event/${bobEvent.body._id}/approve/${aSignup.body._id}`
    );
    if (cannotApprove.status !== 403)
      throw new Error(
        `expected 403 when alice tries to approve on bob's event, got ${cannotApprove.status}`
      );
    ok();

    step("signout clears session");
    await alice.post("/api/auth/signout");
    const afterOut = await alice.get("/api/auth/me");
    if (afterOut.status !== 401)
      throw new Error(`expected 401 after signout, got ${afterOut.status}`);
    ok();

    console.log("\n✅ All E2E smoke checks passed.\n");
  } catch (err) {
    fail(err);
  } finally {
    await new Promise((r) => server.close(r));
    await mongoose.disconnect();
    await mem.stop();
  }
}

run().catch(fail);
