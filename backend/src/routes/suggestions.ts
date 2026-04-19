import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { suggestFor } from "../lib/suggest.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const suggestions = await suggestFor(req.session.userId!);
  res.json(suggestions);
});

export default router;
