import type { Request, Response, NextFunction } from "express";

export function requireRole(role: "user" | "organizer") {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    if (req.session.role !== role) {
      return res.status(403).json({ error: "Forbidden: wrong role" });
    }
    next();
  };
}
