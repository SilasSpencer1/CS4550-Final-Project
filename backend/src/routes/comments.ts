import { Router } from "express";
import { Comment } from "../models/Comment.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/:kind/:id", async (req, res) => {
  const { kind, id } = req.params;
  if (kind !== "event" && kind !== "tmEvent") {
    return res.status(400).json({ error: "Invalid target kind" });
  }
  const comments = await Comment.find({ "target.kind": kind, "target.id": id })
    .populate("author", "username displayName avatarUrl")
    .sort({ createdAt: -1 });
  res.json(comments);
});

router.post("/:kind/:id", requireAuth, async (req, res) => {
  const { kind, id } = req.params;
  if (kind !== "event" && kind !== "tmEvent") {
    return res.status(400).json({ error: "Invalid target kind" });
  }
  const body = (req.body?.body ?? "").trim();
  if (!body) return res.status(400).json({ error: "Body required" });
  const comment = await Comment.create({
    author: req.session.userId,
    target: { kind, id },
    body,
  });
  const populated = await comment.populate("author", "username displayName avatarUrl");
  res.json(populated);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const c = await Comment.findById(req.params.id);
  if (!c) return res.status(404).json({ error: "Not found" });
  if (c.author.toString() !== req.session.userId) {
    return res.status(403).json({ error: "Not yours" });
  }
  await c.deleteOne();
  res.json({ ok: true });
});

export default router;
