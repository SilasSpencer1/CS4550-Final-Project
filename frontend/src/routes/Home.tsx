import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../hooks";
import { publicEvents, friendsFeed, myEvents } from "../api/events";
import { getSuggestions } from "../api/suggestions";
import type { UserEvent, Suggestion } from "../api/types";
import EventRow from "../ui/EventRow";
import PosterTile from "../ui/PosterTile";
import Button from "../ui/Button";
import Icon from "../ui/Icon";
import { formatDate } from "../lib/format";

export default function Home() {
  const user = useAppSelector((s) => s.session.user);
  return user ? <LoggedInHome /> : <AnonHome />;
}

function AnonHome() {
  const [featured, setFeatured] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicEvents()
      .then(setFeatured)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="container">
        <div className="hero grain" style={{ marginTop: 24 }}>
          <img
            className="sticker-deco"
            src="/assets/stickers/sparkle.svg"
            alt=""
          />
          <div className="eyebrow">a social calendar for your people</div>
          <h1 className="mt-2">
            your roster,
            <br />
            your <span className="editorial">weekend</span>.
          </h1>
          <p>
            post what you're up to. see what friends are up to. ask to join — or
            don't. built for the small group chat, not the feed.
          </p>
          <div className="hero-actions">
            <Button variant="hero" size="lg" to="/signup">
              get started
            </Button>
            <Button variant="secondary" size="lg" to="/discover">
              browse events
              <Icon name="arrowRight" size={16} />
            </Button>
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingTop: 8 }}>
        <div className="section-head">
          <h2 className="section-title">what's happening publicly</h2>
          <span className="mono subtle">{formatDate(new Date())}</span>
        </div>
        {loading ? (
          <p className="muted">loading…</p>
        ) : featured.length === 0 ? (
          <div className="empty">
            <span className="editorial">no plans yet — that's a plan in itself.</span>
            <p>
              be the first. <Link to="/signup">start an account</Link> and post
              something.
            </p>
          </div>
        ) : (
          <div className="poster-grid poster-grid-featured">
            {featured.slice(0, 6).map((e, i) => (
              <PosterTile
                key={e._id}
                to={`/events/${e._id}`}
                title={e.title}
                startTime={e.startTime}
                city={e.location?.city}
                venue={e.location?.address}
                tags={e.tags}
                featured={i === 0}
              />
            ))}
          </div>
        )}
      </section>

      <section className="container mt-4" style={{ paddingTop: 32 }}>
        <div className="section-head">
          <h2 className="section-title">why roster</h2>
        </div>
        <div className="grid grid-3">
          <div className="card feature">
            <h4>
              <Icon name="lock" size={18} color="var(--persimmon-500)" />
              privacy by default
            </h4>
            <p>
              each event is public, friends-only, or just a busy block. you
              choose per event.
            </p>
          </div>
          <div className="card feature">
            <h4>
              <Icon name="users" size={18} color="var(--mint-600)" />
              friends, not followers
            </h4>
            <p>
              see the plans your people are making. tap to ask if you can tag
              along.
            </p>
          </div>
          <div className="card feature">
            <h4>
              <Icon name="sparkle" size={18} color="var(--grape-500)" />
              smart suggestions
            </h4>
            <p>
              we match local events to your interests and the gaps in your
              week.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function LoggedInHome() {
  const user = useAppSelector((s) => s.session.user)!;
  const [upcoming, setUpcoming] = useState<UserEvent[]>([]);
  const [feed, setFeed] = useState<UserEvent[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    myEvents().then((list) => {
      const now = Date.now();
      setUpcoming(
        list.filter((e) => new Date(e.endTime).getTime() >= now).slice(0, 5)
      );
    });
    friendsFeed().then((list) => setFeed(list.slice(0, 5)));
    getSuggestions()
      .then((list) => setSuggestions(list.slice(0, 5)))
      .catch(() => setSuggestions([]));
  }, []);

  return (
    <div className="container page">
      <section className="mb-5">
        <div className="eyebrow">{formatDate(new Date())}</div>
        <h1
          className="mt-2"
          style={{ fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-0.02em" }}
        >
          <span className="editorial">hi,</span>{" "}
          {user.displayName || user.username}
        </h1>
        <p className="muted mt-2">
          {upcoming.length > 0 ? (
            <>
              you have <b>{upcoming.length}</b> coming up
              {feed.length > 0 && (
                <>
                  {" "}
                  and <b>{feed.length}</b> friend plan{feed.length === 1 ? "" : "s"} on the horizon
                </>
              )}
              .
            </>
          ) : (
            <>pretty empty week — maybe start something?</>
          )}
        </p>
      </section>

      <section className="grid-sidebar mb-6">
        <div>
          <div className="section-head">
            <h2 className="section-title">your upcoming</h2>
            <Button variant="primary" size="sm" to="/events/new">
              <Icon name="plus" size={16} />
              new event
            </Button>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty">
              <span className="editorial">no plans yet — that's a plan in itself.</span>
              <p>
                <Link to="/events/new">add something</Link> to your calendar.
              </p>
            </div>
          ) : (
            <div className="stack-sm">
              {upcoming.map((e, i) => (
                <EventRow
                  key={e._id}
                  event={e}
                  sticker={i === 0}
                />
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="section-head">
            <h2 className="section-title">friends' plans</h2>
            <Link to="/feed" className="btn-link btn-sm">
              see all
            </Link>
          </div>
          {feed.length === 0 ? (
            <div className="empty">
              <span className="editorial">quiet on the feed.</span>
              <p>
                <Link to="/friends">add some friends</Link> to see their week.
              </p>
            </div>
          ) : (
            <div className="stack-sm">
              {feed.map((e) => (
                <EventRow key={e._id} event={e} />
              ))}
            </div>
          )}
        </div>
      </section>

      {suggestions.length > 0 && (
        <section>
          <div className="section-head">
            <h2 className="section-title">for you</h2>
            <Link to="/suggestions" className="btn-link btn-sm">
              see all
            </Link>
          </div>
          <div className="poster-grid">
            {suggestions.slice(0, 3).map((s) => (
              <PosterTile
                key={`${s.source}-${s.id}`}
                to={
                  s.source === "organizer"
                    ? `/events/${s.id}`
                    : `/discover/${s.id}`
                }
                title={s.title}
                image={s.image}
                startTime={s.startTime}
                city={s.city}
                tags={s.tags}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
