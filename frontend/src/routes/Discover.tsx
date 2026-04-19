import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { discoverSearch } from "../api/discover";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setLoading, setResults } from "../store/search";
import PosterTile from "../ui/PosterTile";
import Button from "../ui/Button";
import Icon from "../ui/Icon";

export default function Discover() {
  const [params, setParams] = useSearchParams();
  const { results, loading, lastQuery } = useAppSelector((s) => s.search);
  const dispatch = useAppDispatch();

  const city = params.get("city") ?? "";
  const keyword = params.get("keyword") ?? "";
  const startDateTime = params.get("startDateTime") ?? "";

  useEffect(() => {
    if (!city && !keyword) return;
    const same =
      lastQuery &&
      lastQuery.city === city &&
      lastQuery.keyword === keyword &&
      lastQuery.startDateTime === startDateTime;
    if (same && results.length > 0) return;
    dispatch(setLoading(true));
    discoverSearch({
      city,
      keyword,
      startDateTime: startDateTime || undefined,
    })
      .then((r) =>
        dispatch(
          setResults({
            query: { city, keyword, startDateTime },
            results: r,
          })
        )
      )
      .catch(() =>
        dispatch(
          setResults({
            query: { city, keyword, startDateTime },
            results: [],
          })
        )
      );
  }, [city, keyword, startDateTime, dispatch, lastQuery, results.length]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const next: Record<string, string> = {};
    const c = (form.elements.namedItem("city") as HTMLInputElement).value;
    const k = (form.elements.namedItem("keyword") as HTMLInputElement).value;
    const s = (form.elements.namedItem("startDateTime") as HTMLInputElement).value;
    if (c) next.city = c;
    if (k) next.keyword = k;
    if (s) next.startDateTime = `${s}:00Z`;
    setParams(next);
  }

  return (
    <div className="container page">
      <div className="eyebrow mb-2">find local</div>
      <h1 className="mb-5" style={{ fontSize: 30, letterSpacing: "-0.02em" }}>
        <span className="editorial">what's on this week?</span>
      </h1>

      <form onSubmit={handleSubmit} className="card mb-5">
        <div
          className="grid"
          style={{ gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12 }}
        >
          <div className="input-icon">
            <Icon name="mapPin" size={18} />
            <input
              className="input"
              name="city"
              placeholder="city"
              defaultValue={city}
            />
          </div>
          <div className="input-icon">
            <Icon name="search" size={18} />
            <input
              className="input"
              name="keyword"
              placeholder="keyword — e.g. jazz"
              defaultValue={keyword}
            />
          </div>
          <input
            className="input"
            name="startDateTime"
            type="datetime-local"
            defaultValue={startDateTime.replace(":00Z", "")}
          />
          <Button type="submit" variant="primary">
            go
          </Button>
        </div>
      </form>

      {loading ? (
        <p className="muted">searching…</p>
      ) : results.length === 0 ? (
        <div className="empty">
          <span className="editorial">
            {city || keyword ? "nothing yet." : "search above to start."}
          </span>
          {(city || keyword) && <p>try a different city or keyword.</p>}
        </div>
      ) : (
        <div className="poster-grid poster-grid-featured">
          {results.map((r, i) => (
            <PosterTile
              key={r.id}
              to={`/discover/${r.id}`}
              title={r.name}
              image={r.image}
              startTime={r.startDateTime}
              city={r.city}
              venue={r.venue}
              tags={r.classifications}
              featured={i === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
