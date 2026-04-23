import { Router } from "express";
import { User } from "../models/User.js";
import { Event } from "../models/Event.js";
import { Friendship } from "../models/Friendship.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { areFriends } from "../lib/friends.js";

const router = Router();

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json(user);
});

router.put("/me", requireAuth, async (req, res) => {
  const allowed = [
    "displayName",
    "bio",
    "avatarUrl",
    "interests",
    "location",
    "defaultPrivacy",
  ];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in req.body) update[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.session.userId, update, { new: true });
  res.json(user);
});

router.get("/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ error: "Not found" });
  const viewerId = req.session.userId;
  const friend = viewerId ? await areFriends(viewerId, user._id.toString()) : false;
  const isSelf = viewerId === user._id.toString();
  res.json({
    _id: user._id,
    username: user.username,
    role: user.role,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    interests: user.interests,
    location: user.location,
    email: isSelf ? user.email : undefined,
    isFriend: friend,
    isSelf,
  });
});

router.get("/:username/events", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ error: "Not found" });
  const viewerId = req.session.userId;
  const friend = viewerId ? await areFriends(viewerId, user._id.toString()) : false;
  const isSelf = viewerId === user._id.toString();

  const now = new Date();
  const events = await Event.find({ createdBy: user._id, endTime: { $gte: now } })
    .sort({ startTime: 1 })
    .limit(50);

  const sanitized = events.map((e) => {
    const vis = e.visibility;
    const seeDetails = isSelf || vis === "public" || (vis === "friends" && friend);
    if (seeDetails) return e.toObject();
    return {
      _id: e._id,
      startTime: e.startTime,
      endTime: e.endTime,
      visibility: "busy",
      title: "Busy",
    };
  });
  res.json(sanitized);
});

router.get("/:username/friends", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ error: "Not found" });
  const friendships = await Friendship.find({
    status: "accepted",
    $or: [{ requester: user._id }, { recipient: user._id }],
  })
    .populate("requester", "username displayName avatarUrl role")
    .populate("recipient", "username displayName avatarUrl role");

  const friends = friendships.map((f: any) =>
    f.requester._id.toString() === user._id.toString() ? f.recipient : f.requester
  );
  res.json(friends);
});

router.get("/", async (req, res) => {
  const q = (req.query.q as string) || "";
  const users = await User.find({
    $or: [
      { username: { $regex: q, $options: "i" } },
      { displayName: { $regex: q, $options: "i" } },
    ],
  })
    .limit(20)
    .select("username displayName avatarUrl role");
  res.json(users);
});

export default router;
