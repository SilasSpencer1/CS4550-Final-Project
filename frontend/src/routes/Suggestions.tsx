import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSuggestions } from "../api/suggestions";
import type { Suggestion } from "../api/types";
import PosterTile from "../ui/PosterTile";

export default function Suggestions() {
  const [list, setList] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuggestions()
      .then(setList)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container page">
      <div className="eyebrow mb-2">picked for you</div>
      <h1 className="mb-2" style={{ fontSize: 30, letterSpacing: "-0.02em" }}>
        <span className="editorial">things you'd probably love.</span>
      </h1>
      <p className="muted mb-5">
        based on your interests, your city, and the gaps in your week.
      </p>

      {loading ? (
        <p className="muted">loading…</p>
      ) : list.length === 0 ? (
        <div className="empty">
          <span className="editorial">nothing yet.</span>
          <p>
            add some interests and a city to your{" "}
            <Link to="/profile/me/edit">profile</Link> and we'll pull
            recommendations.
          </p>
        </div>
      ) : (
        <div className="grid grid-3">
          {list.map((s) => (
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
      )}
    </div>
  );
}
