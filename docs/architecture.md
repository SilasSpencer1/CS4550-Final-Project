# System Architecture

Roster is a three-tier MERN app deployed across three services (Netlify, Render, Atlas) with two third-party API integrations (Ticketmaster, OpenStreetMap) and one optional OAuth integration (Google Calendar).

---

## Deployment topology

```mermaid
graph TB
    subgraph Browser
        SPA[React SPA<br/>Vite + TS + Redux Toolkit]
    end

    subgraph Netlify[Netlify · static host]
        FRONTEND[frontend/dist<br/>HTML + JS + CSS]
    end

    subgraph Render[Render · web service]
        API[Express API<br/>Node + TS + Mongoose]
    end

    subgraph Atlas[MongoDB Atlas · free-tier M0]
        DB[(roster database)]
    end

    subgraph ThirdParty[3rd-party APIs]
        TM[Ticketmaster<br/>Discovery API]
        OSM[OpenStreetMap<br/>Nominatim]
        GCAL[Google Calendar<br/>OAuth + REST]
    end

    SPA -- initial load --> FRONTEND
    SPA -- XHR /api/* --> API
    API -- mongoose --> DB
    API -- axios --> TM
    API -- axios + User-Agent --> OSM
    API -- googleapis --> GCAL

    style SPA fill:#FFF2EE,stroke:#E42B01
    style API fill:#F8F5C7,stroke:#8C8900
    style DB fill:#DBEEEF,stroke:#16838C
    style TM fill:#E4DDF4,stroke:#4A3A87
    style OSM fill:#E4DDF4,stroke:#4A3A87
    style GCAL fill:#E4DDF4,stroke:#4A3A87
```

**Live URLs:**

| layer | url | stack |
|---|---|---|
| frontend | https://roster-spencer.netlify.app | React + Vite + TS |
| backend | https://roster-backend-cmvp.onrender.com | Node + Express + Mongoose |
| database | Atlas `Cluster0` (US_EAST_1) | MongoDB 8.x |

---

## Request flow · typical logged-in page load

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant Netlify
    participant Render as Render (Express)
    participant Atlas as Atlas (Mongo)
    participant TM as Ticketmaster

    User->>Browser: visit roster-spencer.netlify.app
    Browser->>Netlify: GET /
    Netlify-->>Browser: index.html + JS bundle
    Browser->>Browser: React hydrates, fetch session
    Browser->>Render: GET /api/auth/me (Cookie: sc.sid)
    Render->>Atlas: find user by session.userId
    Atlas-->>Render: user doc
    Render-->>Browser: 200 {username, role, ...}

    Browser->>Render: GET /api/events/mine + /api/events/feed + /api/suggestions
    Render->>Atlas: find events by createdBy + friends
    Atlas-->>Render: event docs

    Render->>TM: GET events.json?city=Boston
    TM-->>Render: JSON (cached 5 min)
    Render-->>Browser: 200 ranked suggestions

    Browser->>User: logged-in home renders
```

---

## Request flow · 3rd-party API proxying

Both Ticketmaster and OSM are accessed through the backend — never directly from the browser — so:

1. API keys (Ticketmaster) live on Render only, not shipped in the frontend bundle.
2. We rate-limit and cache server-side: OSM at 1 req/sec, TM with a 5 min TTL.
3. User-Agent headers required by OSM are set consistently.

```mermaid
sequenceDiagram
    participant Browser
    participant API as Render API
    participant Cache as In-memory cache
    participant OSM

    Browser->>API: GET /api/geocode/search?q=Fenway Park
    API->>Cache: lookup "search:fenway park:5"
    alt cache hit
        Cache-->>API: cached results
    else cache miss
        API->>API: queue (min 1100ms since last)
        API->>OSM: GET /search?q=Fenway Park&format=jsonv2
        OSM-->>API: raw results
        API->>Cache: store 10 min
    end
    API-->>Browser: shaped GeocodeResult[]
```

---

## Auth + session flow

Session-based (not JWT). `express-session` stores a signed cookie; session store is in-memory on Render (fine for single-instance free tier, would move to Redis for production scale).

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant API
    participant DB as Atlas

    User->>Browser: enter credentials
    Browser->>API: POST /api/auth/signin {usernameOrEmail, password}
    API->>DB: findOne by username or email
    DB-->>API: user doc (with passwordHash)
    API->>API: bcrypt.compare
    alt match
        API->>API: set req.session.userId + role
        API-->>Browser: 200 + Set-Cookie: sc.sid
    else mismatch
        API-->>Browser: 401
    end

    Note over Browser,API: Subsequent requests auto-attach Cookie. Middleware requireAuth reads req.session.userId.
```

---

## Privacy enforcement

Every read endpoint that returns event data runs through the same filter:

```mermaid
flowchart TD
    start([GET /api/events/:id]) --> load[load Event by id]
    load --> creator{viewer is<br/>creator?}
    creator -- yes --> full[return full event]
    creator -- no --> pub{visibility<br/>= public?}
    pub -- yes --> full
    pub -- no --> fr{visibility = friends<br/>AND accepted friend?}
    fr -- yes --> full
    fr -- no --> rsvp{viewer has any<br/>RSVP for event?}
    rsvp -- yes --> full
    rsvp -- no --> stub[return BUSY shell<br/>startTime + endTime only]

    style full fill:#DCEFD8,stroke:#3B8332
    style stub fill:#F1ECDE,stroke:#6A6459
```

The RSVP check is how an **invited** user gains read access to a friends-only event even if they aren't actually friends with the creator yet — the invitation pre-authorizes them.

---

## Deploy pipeline

No CI/CD configured yet; deploys are manual via CLIs, but each target auto-configures from files in the repo:

- **Netlify** — [`frontend/netlify.toml`](../frontend/netlify.toml) sets build command + SPA redirect.
- **Render** — [`render.yaml`](../render.yaml) declares the service, env var names, and health check. Every push to `main` would auto-deploy if GitHub integration were connected (currently manual via `render deploys create`).
- **Atlas** — managed by Atlas CLI; cluster + db user + IP allowlist already provisioned.

---

## Test + smoke pyramid

```mermaid
graph TB
    unit[Frontend unit tests<br/>@testing-library · 40 tests]
    integration[Backend integration tests<br/>supertest + in-memory Mongo · 65 tests]
    smoke[E2E smoke script<br/>real Express + 2-user flow · 19 steps]

    unit -->|fast, no network| lint([local]):::local
    integration -->|medium, isolated Mongo| lint
    smoke -->|full stack, uses compiled backend| deploy([pre-deploy]):::deploy

    classDef local fill:#DBEEEF,stroke:#16838C
    classDef deploy fill:#FFF2EE,stroke:#E42B01
```

- `cd backend && npm test` — runs the integration suite.
- `cd frontend && npm test` — runs the unit suite.
- `cd backend && npm run smoke` — spins up an in-memory Mongo, boots Express, and walks the full signup → friend → invite → RSVP → comment flow. Point it at a staging backend with `SMOKE_BASE=<url>` for post-deploy verification.
