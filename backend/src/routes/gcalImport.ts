import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { User } from "../models/User.js";
import { Event } from "../models/Event.js";
import { authUrl, exchangeCode, listEvents } from "../lib/googleCalendar.js";

const router = Router();

router.get("/auth-url", requireAuth, (req, res) => {
  try {
    const url = authUrl(req.session.userId!);
    res.json({ url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/callback", async (req, res) => {
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;
  if (!code || !state) return res.status(400).send("Missing code or state");
  try {
    const tokens = await exchangeCode(code);
    await User.findByIdAndUpdate(state, {
      "google.refreshToken": tokens.refresh_token,
    });
    const frontend = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
    res.redirect(`${frontend}/gcal-import?connected=1`);
  } catch (err: any) {
    console.error("[gcal] callback failed", err?.message);
    res.status(500).send("OAuth failed");
  }
});

router.post("/sync", requireAuth, async (req, res) => {
  const user = await User.findById(req.session.userId);
  if (!user) return res.status(404).json({ error: "Not found" });
  const refreshToken = user.google?.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({ error: "Google account not linked" });
  }
  try {
    const items = await listEvents(refreshToken);
    let imported = 0;
    for (const item of items) {
      if (!item.id || !item.start || !item.end) continue;
      const startTime = new Date(item.start.dateTime ?? item.start.date!);
      const endTime = new Date(item.end.dateTime ?? item.end.date!);
      await Event.findOneAndUpdate(
        { createdBy: user._id, title: item.summary ?? "(untitled)", startTime },
        {
          title: item.summary ?? "(untitled)",
          description: item.description ?? "",
          startTime,
          endTime,
          createdBy: user._id,
          source: "gcal_import",
          visibility: user.defaultPrivacy,
          location: { address: item.location ?? "", city: "" },
        },
        { upsert: true, new: true }
      );
      imported++;
    }
    await User.findByIdAndUpdate(user._id, { "google.lastSyncAt": new Date() });
    res.json({ imported });
  } catch (err: any) {
    console.error("[gcal] sync failed", err?.message);
    res.status(500).json({ error: "Sync failed" });
  }
});

router.delete("/disconnect", requireAuth, async (req, res) => {
  await User.findByIdAndUpdate(req.session.userId, {
    "google.refreshToken": null,
    "google.lastSyncAt": null,
  });
  res.json({ ok: true });
});

export default router;
