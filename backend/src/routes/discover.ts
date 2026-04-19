import { Router } from "express";
import { searchEvents, getEvent } from "../lib/ticketmaster.js";

const router = Router();

router.get("/search", async (req, res) => {
  try {
    const events = await searchEvents({
      city: req.query.city as string | undefined,
      keyword: req.query.keyword as string | undefined,
      startDateTime: req.query.startDateTime as string | undefined,
      size: req.query.size ? Number(req.query.size) : undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
    });
    res.json(events);
  } catch (err: any) {
    console.error("[discover] search failed", err?.message);
    res.status(502).json({ error: "Upstream API error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const event = await getEvent(req.params.id);
    res.json(event);
  } catch (err: any) {
    const status = err?.response?.status === 404 ? 404 : 502;
    res.status(status).json({ error: status === 404 ? "Not found" : "Upstream API error" });
  }
});

export default router;
