import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { discoverDetail } from "../api/discover";
import type { TmDetail } from "../api/types";
import CommentList from "../components/CommentList";
import { useAppSelector } from "../hooks";
import { createEvent } from "../api/events";
import { formatCurrency, formatDateTime } from "../lib/format";
import Button from "../ui/Button";
import Chip from "../ui/Chip";
import Icon from "../ui/Icon";

export default function DiscoverDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<TmDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const user = useAppSelector((s) => s.session.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    discoverDetail(id)
      .then(setEvent)
      .catch(() => setError("we couldn't find that event."));
  }, [id]);

  if (error)
    return (
      <div className="container page">
        <p className="muted">{error}</p>
      </div>
    );
  if (!event)
    return (
      <div className="container page">
        <p className="muted">loading…</p>
      </div>
    );

  async function saveToCalendar() {
    if (!user || !event) return;
    setSaving(true);
    try {
      const start = event.startDateTime
        ? new Date(event.startDateTime)
        : new Date();
      const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
      const created = await createEvent({
        title: event.name,
        description: event.info,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        location: {
          address: event.venue?.address ?? "",
          city: event.venue?.city ?? "",
          lat: null,
          lng: null,
        },
        tags: event.classifications,
        visibility: user.defaultPrivacy,
      } as any);
      navigate(`/events/${created._id}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container page">
      <div className="grid-sidebar">
        <div>
          {event.image && (
            <img
              src={event.image}
              alt=""
              className="mb-4"
              style={{
                width: "100%",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-raised)",
              }}
            />
          )}
          <div className="eyebrow mb-2">
            {event.startDateTime ? formatDateTime(event.startDateTime) : "date tbd"}
          </div>
          <h1 style={{ fontSize: 34, letterSpacing: "-0.02em" }}>
            {event.name}
          </h1>

          {event.venue && (
            <div className="card card-tight mt-4 mb-4 flex gap-3" style={{ alignItems: "center" }}>
              <Icon name="mapPin" size={18} />
              <div>
                <div style={{ fontWeight: 500 }}>{event.venue.name}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {event.venue.city}
                  {event.venue.state ? `, ${event.venue.state}` : ""}
                </div>
              </div>
            </div>
          )}

          {event.classifications.length > 0 && (
            <div className="mb-4">
              {event.classifications.map((c) => (
                <span key={c} className="tag">
                  {c}
                </span>
              ))}
            </div>
          )}

          {event.info && <p className="mb-3">{event.info}</p>}
          {event.pleaseNote && (
            <p className="muted" style={{ fontSize: 14 }}>
              <b>note:</b> {event.pleaseNote}
            </p>
          )}
          {event.priceRanges?.length > 0 && (
            <div className="mb-4">
              <Chip kind="tag">
                tickets{" "}
                <span className="numeric" style={{ marginLeft: 4 }}>
                  {formatCurrency(
                    event.priceRanges[0].min,
                    event.priceRanges[0].currency
                  )}
                  {" – "}
                  {formatCurrency(
                    event.priceRanges[0].max,
                    event.priceRanges[0].currency
                  )}
                </span>
              </Chip>
            </div>
          )}

          <div className="flex gap-2 mb-5" style={{ flexWrap: "wrap" }}>
            <Button
              variant="secondary"
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              open on ticketmaster
              <Icon name="external" size={16} />
            </Button>
            {user && (
              <Button
                variant="hero"
                onClick={saveToCalendar}
                disabled={saving}
              >
                {saving ? "saving…" : "save to my calendar"}
              </Button>
            )}
          </div>

          <div className="divider" />
          <CommentList kind="tmEvent" id={event.id} />
        </div>

        <aside>
          <div className="card">
            <h3 className="section-title mb-3">about</h3>
            <p className="muted" style={{ fontSize: 14 }}>
              pulled live from ticketmaster. save it to your calendar to chat
              with people going, or ask friends if they're in.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
