import { useEffect, useState } from "react";
import { friendsFeed } from "../api/events";
import type { UserEvent } from "../api/types";
import EventRow from "../ui/EventRow";

export default function Feed() {
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    friendsFeed()
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page">
      <div className="eyebrow mb-2">what your people are up to</div>
      <h1 className="mb-5" style={{ fontSize: 30, letterSpacing: "-0.02em" }}>
        <span className="editorial">the feed.</span>
      </h1>
      {loading ? (
        <p className="muted">loading…</p>
      ) : events.length === 0 ? (
        <div className="empty">
          <span className="editorial">quiet on the feed.</span>
          <p>add some friends and check back in a bit.</p>
        </div>
      ) : (
        <div className="stack-sm">
          {events.map((e) => (
            <EventRow key={e._id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
