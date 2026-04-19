import { Router } from "express";
import mongoose from "mongoose";
import { Friendship } from "../models/Friendship.js";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const me = req.session.userId!;
  const friendships = await Friendship.find({
    status: "accepted",
    $or: [{ requester: me }, { recipient: me }],
  })
    .populate("requester", "username displayName avatarUrl")
    .populate("recipient", "username displayName avatarUrl");

  const friends = friendships.map((f: any) =>
    f.requester._id.toString() === me ? f.recipient : f.requester
  );
  res.json(friends);
});

router.get("/pending", requireAuth, async (req, res) => {
  const list = await Friendship.find({
    recipient: req.session.userId,
    status: "pending",
  }).populate("requester", "username displayName avatarUrl");
  res.json(list);
});

router.get("/sent", requireAuth, async (req, res) => {
  const list = await Friendship.find({
    requester: req.session.userId,
    status: "pending",
  }).populate("recipient", "username displayName avatarUrl");
  res.json(list);
});

router.post("/request/:username", requireAuth, async (req, res) => {
  const target = await User.findOne({ username: req.params.username });
  if (!target) return res.status(404).json({ error: "User not found" });
  if (target._id.toString() === req.session.userId) {
    return res.status(400).json({ error: "Cannot friend yourself" });
  }
  const reqId = new mongoose.Types.ObjectId(req.session.userId);
  const existing = await Friendship.findOne({
    $or: [
      { requester: reqId, recipient: target._id },
      { requester: target._id, recipient: reqId },
    ],
  });
  if (existing) return res.json(existing);
  const f = await Friendship.create({
    requester: reqId,
    recipient: target._id,
    status: "pending",
  });
  res.json(f);
});

router.post("/accept/:id", requireAuth, async (req, res) => {
  const f = await Friendship.findById(req.params.id);
  if (!f) return res.status(404).json({ error: "Not found" });
  if (f.recipient.toString() !== req.session.userId) {
    return res.status(403).json({ error: "Not yours to accept" });
  }
  f.status = "accepted";
  await f.save();
  res.json(f);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const f = await Friendship.findById(req.params.id);
  if (!f) return res.status(404).json({ error: "Not found" });
  const me = req.session.userId;
  if (f.requester.toString() !== me && f.recipient.toString() !== me) {
    return res.status(403).json({ error: "Not yours" });
  }
  await f.deleteOne();
  res.json({ ok: true });
});

export default router;
