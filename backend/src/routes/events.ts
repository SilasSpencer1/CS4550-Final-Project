import { Router } from "express";
import { Event } from "../models/Event.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { areFriends, friendIdsOf } from "../lib/friends.js";

const router = Router();

router.get("/mine", requireAuth, async (req, res) => {
  const events = await Event.find({ createdBy: req.session.userId }).sort({ startTime: 1 });
  res.json(events);
});

router.get("/feed", requireAuth, async (req, res) => {
  const ids = await friendIdsOf(req.session.userId!);
  const now = new Date();
  const events = await Event.find({
    createdBy: { $in: ids },
    endTime: { $gte: now },
    visibility: { $in: ["friends", "public"] },
  })
    .populate("createdBy", "username displayName avatarUrl")
    .sort({ startTime: 1 })
    .limit(50);
  res.json(events);
});

router.get("/public", async (_req, res) => {
  const now = new Date();
  const events = await Event.find({
    visibility: "public",
    endTime: { $gte: now },
  })
    .populate("createdBy", "username displayName avatarUrl role")
    .sort({ startTime: 1 })
    .limit(30);
  res.json(events);
});

router.post("/", requireAuth, async (req, res) => {
  const payload = req.body ?? {};
  const source = req.session.role === "organizer" ? "organizer" : "user";
  const visibility =
    source === "organizer" ? "public" : payload.visibility ?? "friends";
  const event = await Event.create({
    title: payload.title,
    description: payload.description ?? "",
    startTime: payload.startTime,
    endTime: payload.endTime,
    location: payload.location ?? {},
    createdBy: req.session.userId,
    source,
    visibility,
    tags: payload.tags ?? [],
    maxAttendees: payload.maxAttendees ?? null,
  });
  res.json(event);
});

router.get("/:id", async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    "createdBy",
    "username displayName avatarUrl role"
  );
  if (!event) return res.status(404).json({ error: "Not found" });

  const viewerId = req.session.userId;
  const creatorId = (event.createdBy as any)._id.toString();
  const isSelf = viewerId === creatorId;
  const friend = viewerId ? await areFriends(viewerId, creatorId) : false;

  if (event.visibility === "public" || isSelf || (event.visibility === "friends" && friend)) {
    return res.json(event);
  }
  res.json({
    _id: event._id,
    startTime: event.startTime,
    endTime: event.endTime,
    visibility: "busy",
    title: "Busy",
    createdBy: event.createdBy,
  });
});

router.put("/:id", requireAuth, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: "Not found" });
  if (event.createdBy.toString() !== req.session.userId) {
    return res.status(403).json({ error: "Not your event" });
  }
  const allowed = [
    "title",
    "description",
    "startTime",
    "endTime",
    "location",
    "visibility",
    "tags",
    "maxAttendees",
  ];
  for (const key of allowed) {
    if (key in req.body) (event as any)[key] = req.body[key];
  }
  await event.save();
  res.json(event);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: "Not found" });
  if (event.createdBy.toString() !== req.session.userId) {
    return res.status(403).json({ error: "Not your event" });
  }
  await event.deleteOne();
  res.json({ ok: true });
});

export default router;
