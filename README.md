# Roster — Social Calendar

CS4550 Web Development · Final Project · Spring 2026

A social calendar where users share their schedules, connect with friends, and discover local events. Privacy tiers (busy / friends-only / public), Google Calendar one-way import, and a Ticketmaster-powered discovery feed.

---

## Team

| Name | Section | Role |
| --- | --- | --- |
| Silas Spencer | CS4550 | Solo |

## Links

- **Live app:** _TBD — deploy to Netlify_
- **Frontend repository:** _TBD_
- **Backend repository:** _TBD_
- **API (backend):** _TBD — deploy to Render_

## Tech stack

- **Frontend:** React + Vite + TypeScript, React Router, Redux Toolkit, React-Bootstrap, `react-big-calendar`
- **Backend:** Node + Express + TypeScript, Mongoose, express-session
- **Database:** MongoDB Atlas
- **3rd-party APIs:** Ticketmaster Discovery, Google Calendar (OAuth)
- **Deploy:** Netlify (frontend) · Render (backend) · Atlas (DB)

## User types

- **Regular user** — personal calendar, friendships, RSVPs, comments
- **Organizer** — publishes public events that surface in user Suggestions

## Domain models

- `User`, `Event`, `Rsvp`, `Friendship`, `Comment` (5 domain models)
- One-to-many: `User → Events` (creator)
- Many-to-many: `Users ↔ Events` via `Rsvp`; `Users ↔ Users` via `Friendship`

## Running locally

Two terminals.

```bash
# 1) Backend
cd backend
cp .env.example .env    # fill in MONGO_URI, TICKETMASTER_API_KEY, GOOGLE_* (optional)
npm install
npm run dev             # http://localhost:4000

# 2) Frontend
cd frontend
npm install
npm run dev             # http://localhost:5173
```

## Environment variables

### Backend (`backend/.env`)

| Name | Purpose |
| --- | --- |
| `MONGO_URI` | MongoDB connection string |
| `SESSION_SECRET` | Signing key for session cookies |
| `FRONTEND_ORIGIN` | Allowed CORS origin (e.g. `http://localhost:5173` or Netlify URL) |
| `PORT` | Backend port (default 4000) |
| `TICKETMASTER_API_KEY` | Free key from developer.ticketmaster.com |
| `GOOGLE_CLIENT_ID` | Google OAuth client id (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) |
| `GOOGLE_REDIRECT_URI` | OAuth callback; must match Google Cloud Console setting |

### Frontend (`frontend/.env`)

| Name | Purpose |
| --- | --- |
| `VITE_API_BASE` | URL of deployed backend (leave unset for local Vite proxy) |

## Deploy checklist

1. Create a MongoDB Atlas cluster; allow network access from Render.
2. Push `backend/` to GitHub; deploy on Render with the env vars above; health check `/health`.
3. Push `frontend/` to GitHub; deploy on Netlify with `VITE_API_BASE` set to the Render URL.
4. Update `FRONTEND_ORIGIN` on Render to the Netlify URL after deploy.
5. In Google Cloud Console, add both URLs to the OAuth client's authorized origins/redirects (keep the app in Testing mode).

## Rubric map

Rubric alignment: the home page ships anonymous + logged-in variants, the profile is both editable and publicly viewable with grouped tabs, discovery is backed by the Ticketmaster Discovery API with URL-based search state (so refresh and back-nav both remember results), event detail surfaces live remote data plus user-generated RSVPs and comments, and the database layer enforces privacy across two user types (regular + organizer). Domain models: `User`, `Event`, `Rsvp`, `Friendship`, `Comment`. One-to-many: `User → Event`. Many-to-many: `Users ↔ Events` via `Rsvp`, `Users ↔ Users` via `Friendship`.
