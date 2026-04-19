import express from "express";
import session from "express-session";
import cors from "cors";
import authRouter from "./routes/auth.js";
import usersRouter from "./routes/users.js";
import eventsRouter from "./routes/events.js";
import rsvpsRouter from "./routes/rsvps.js";
import friendsRouter from "./routes/friends.js";
import commentsRouter from "./routes/comments.js";
import discoverRouter from "./routes/discover.js";
import suggestionsRouter from "./routes/suggestions.js";
import gcalRouter from "./routes/gcalImport.js";
import geocodeRouter from "./routes/geocode.js";

export function createApp() {
  const app = express();
  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

  app.set("trust proxy", 1);
  app.use(
    cors({
      origin: FRONTEND_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(
    session({
      name: "sc.sid",
      secret: process.env.SESSION_SECRET ?? "dev-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 14,
      },
    })
  );

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/events", eventsRouter);
  app.use("/api/rsvps", rsvpsRouter);
  app.use("/api/friends", friendsRouter);
  app.use("/api/comments", commentsRouter);
  app.use("/api/discover", discoverRouter);
  app.use("/api/suggestions", suggestionsRouter);
  app.use("/api/gcal", gcalRouter);
  app.use("/api/geocode", geocodeRouter);

  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("[error]", err);
      res.status(500).json({ error: "Internal server error" });
    }
  );

  return app;
}
