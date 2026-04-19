import { Router } from "express";
import { searchAddress, reverse } from "../lib/geocode.js";

const router = Router();

router.get("/search", async (req, res) => {
  const q = (req.query.q as string | undefined) ?? "";
  const limit = Math.min(
    Math.max(1, Number(req.query.limit) || 5),
    10
  );
  if (q.trim().length < 3) {
    return res.json([]);
  }
  try {
    const results = await searchAddress(q, limit);
    res.json(results);
  } catch (err: any) {
    console.error("[geocode.search]", err?.message);
    res.status(502).json({ error: "Geocoding unavailable" });
  }
});

router.get("/reverse", async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return res.status(400).json({ error: "lat and lng required" });
  }
  try {
    const result = await reverse(lat, lng);
    if (!result) return res.status(404).json({ error: "Not found" });
    res.json(result);
  } catch (err: any) {
    console.error("[geocode.reverse]", err?.message);
    res.status(502).json({ error: "Geocoding unavailable" });
  }
});

export default router;
