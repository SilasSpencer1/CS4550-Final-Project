import { Router } from "express";
import { Rsvp } from "../models/Rsvp.js";
import { Event } from "../models/Event.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/mine", requireAuth, async (req, res) => {
  const query: Record<string, unknown> = { user: req.session.userId };
  if (typeof req.query.status === "string") {
    query.status = req.query.status;
  }
  const rsvps = await Rsvp.find(query).populate({
    path: "event",
    populate: { path: "createdBy", select: "username displayName avatarUrl" },
  });
  res.json(rsvps);
});

router.get("/event/:eventId", async (req, res) => {
  const rsvps = await Rsvp.find({ event: req.params.eventId }).populate(
    "user",
    "username displayName avatarUrl"
  );
  res.json(rsvps);
});

router.post("/event/:eventId", requireAuth, async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) return res.status(404).json({ error: "Event not found" });
  const status = req.body?.status ?? "going";
  const isCreator = event.createdBy.toString() === req.session.userId;
  const existing = await Rsvp.findOne({
    user: req.session.userId,
    event: event._id,
  });
  // An invite pre-approves the user, so a "going" reply from an invited user
  // goes straight to "going" (no request-and-approve ping-pong). Otherwise a
  // non-creator asking to join is "requested" until approved.
  const wasInvited = existing?.status === "invited";
  const resolvedStatus =
    isCreator || wasInvited
      ? status
      : status === "going"
      ? "requested"
      : status;

  const rsvp = await Rsvp.findOneAndUpdate(
    { user: req.session.userId, event: event._id },
    { status: resolvedStatus },
    { new: true, upsert: true }
  );
  res.json(rsvp);
});

router.post("/event/:eventId/invite/:userId", requireAuth, async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) return res.status(404).json({ error: "Event not found" });
  if (event.createdBy.toString() !== req.session.userId) {
    return res.status(403).json({ error: "Only the creator can invite" });
  }
  if (req.params.userId === req.session.userId) {
    return res.status(400).json({ error: "Cannot invite yourself" });
  }
  // Don't overwrite an existing going/maybe/requested reply with "invited".
  const existing = await Rsvp.findOne({
    user: req.params.userId,
    event: event._id,
  });
  if (existing) {
    return res.json(existing);
  }
  const rsvp = await Rsvp.create({
    user: req.params.userId,
    event: event._id,
    status: "invited",
  });
  res.json(rsvp);
});

router.post("/event/:eventId/approve/:userId", requireAuth, async (req, res) => {
  const event = await Event.findById(req.params.eventId);
  if (!event) return res.status(404).json({ error: "Event not found" });
  if (event.createdBy.toString() !== req.session.userId) {
    return res.status(403).json({ error: "Not your event" });
  }
  const rsvp = await Rsvp.findOneAndUpdate(
    { user: req.params.userId, event: event._id },
    { status: "going" },
    { new: true }
  );
  if (!rsvp) return res.status(404).json({ error: "RSVP not found" });
  res.json(rsvp);
});

router.delete("/event/:eventId", requireAuth, async (req, res) => {
  await Rsvp.deleteOne({ user: req.session.userId, event: req.params.eventId });
  res.json({ ok: true });
});

export default router;
