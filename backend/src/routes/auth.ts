import { Router } from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.post("/signup", async (req, res) => {
  const { username, email, password, role, displayName } = req.body ?? {};
  if (!username || !email || !password) {
    return res.status(400).json({ error: "username, email, and password are required" });
  }
  const existing = await User.findOne({ $or: [{ username }, { email }] });
  if (existing) return res.status(409).json({ error: "Username or email already taken" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    passwordHash,
    role: role === "organizer" ? "organizer" : "user",
    displayName: displayName || username,
  });

  req.session.userId = user._id.toString();
  req.session.role = user.role as "user" | "organizer";
  res.json(publicUser(user));
});

router.post("/signin", async (req, res) => {
  const { usernameOrEmail, password } = req.body ?? {};
  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: "usernameOrEmail and password are required" });
  }
  const user = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  req.session.userId = user._id.toString();
  req.session.role = user.role as "user" | "organizer";
  res.json(publicUser(user));
});

router.post("/signout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(publicUser(user));
});

function publicUser(u: any) {
  return {
    _id: u._id,
    username: u.username,
    email: u.email,
    role: u.role,
    displayName: u.displayName,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    interests: u.interests,
    location: u.location,
    defaultPrivacy: u.defaultPrivacy,
  };
}

export default router;
