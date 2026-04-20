import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getEvent, deleteEvent } from "../api/events";
import { eventRsvps, rsvpToEvent, cancelRsvp, approveRsvp } from "../api/rsvps";
import type { PublicUser, Rsvp, UserEvent } from "../api/types";
import PrivacyBadge from "../components/PrivacyBadge";
import CommentList from "../components/CommentList";
import InvitePanel from "../components/InvitePanel";
import { useAppSelector } from "../hooks";
import { formatDateRange } from "../lib/format";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import Chip from "../ui/Chip";
import Icon from "../ui/Icon";

function creatorInfo(v: string | PublicUser | undefined) {
  if (!v || typeof v === "string") return null;
  return v;
}

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState<UserEvent | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [myStatus, setMyStatus] = useState<string | null>(null);
  const user = useAppSelector((s) => s.session.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    getEvent(id).then(setEvent);
    eventRsvps(id).then((list) => {
      setRsvps(list);
      if (user) {
        const mine = list.find(
          (r) =>
            (typeof r.user === "string" ? r.user : r.user._id) === user._id
        );
        setMyStatus(mine?.status ?? null);
      }
    });
  }, [id, user?._id]);

  if (!event)
    return (
      <div className="container page">
        <p className="muted">loading…</p>
      </div>
    );

  const creator = creatorInfo(event.createdBy as any);
  const isCreator = user && creator?._id === user._id;

  async function doRsvp(status: Rsvp["status"]) {
    if (!id) return;
    const r = await rsvpToEvent(id, status);
    setMyStatus(r.status);
    eventRsvps(id).then(setRsvps);
  }
  async function doCancel() {
    if (!id) return;
    await cancelRsvp(id);
    setMyStatus(null);
    eventRsvps(id).then(setRsvps);
  }
  async function doApprove(uid: string) {
    if (!id) return;
    await approveRsvp(id, uid);
    eventRsvps(id).then(setRsvps);
  }
  async function doDelete() {
    if (!id || !confirm("delete this plan?")) return;
    await deleteEvent(id);
    navigate("/calendar");
  }

  const going = rsvps.filter((r) => r.status === "going");
  const maybe = rsvps.filter((r) => r.status === "maybe");
  const requested = rsvps.filter((r) => r.status === "requested");
  const invited = rsvps.filter((r) => r.status === "invited");

  function refreshRsvps() {
    if (!id) return;
    eventRsvps(id).then(setRsvps);
  }

  return (
    <div className="container page">
      <div className="grid-sidebar">
        <div>
          <div className="flex-between mb-3" style={{ alignItems: "flex-start" }}>
            <div>
              <div className="eyebrow mb-2">
                {formatDateRange(event.startTime, event.endTime)}
              </div>
              <h1 style={{ fontSize: 34, letterSpacing: "-0.02em" }}>
                {event.title || "busy"}
              </h1>
            </div>
            <PrivacyBadge visibility={event.visibility} />
          </div>

          <div className="flex gap-2 mb-4" style={{ flexWrap: "wrap" }}>
            {creator && (
              <Chip kind="host">
                hosted by {creator.displayName || creator.username}
              </Chip>
            )}
            {event.source === "organizer" && (
              <Chip kind="organizer">organizer event</Chip>
            )}
            {event.source === "gcal_import" && (
              <Chip kind="tag">imported from google</Chip>
            )}
            {event.tags?.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>

          {event.location?.city && (
            <div className="card card-tight mb-3 flex gap-3" style={{ alignItems: "center" }}>
              <Icon name="mapPin" size={18} />
              <div>
                <div style={{ fontWeight: 500 }}>
                  {event.location.address || event.location.city}
                </div>
                {event.location.address && event.location.city && (
                  <div className="muted" style={{ fontSize: 13 }}>
                    {event.location.city}
                  </div>
                )}
              </div>
            </div>
          )}

          {event.description && (
            <p className="mb-4" style={{ fontSize: 16 }}>
              {event.description}
            </p>
          )}

          {user && !isCreator && event.visibility !== "busy" && (
            <div className="card-sticker mb-4">
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--ink-900)",
                  marginBottom: 10,
                }}
              >
                can you make it?
              </div>
              {myStatus ? (
                <div className="flex gap-2" style={{ alignItems: "center", flexWrap: "wrap" }}>
                  <Chip kind={myStatus === "going" ? "going" : myStatus === "maybe" ? "maybe" : "out"}>
                    you're {myStatus}
                  </Chip>
                  <Button variant="ghost" size="sm" onClick={doCancel}>
                    change
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => doRsvp("going")}
                    style={{ flex: 1 }}
                  >
                    i'm in
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => doRsvp("maybe")}
                    style={{ flex: 1 }}
                  >
                    maybe
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => doRsvp("invited")}
                    style={{ flex: 1 }}
                  >
                    can't
                  </Button>
                </div>
              )}
            </div>
          )}

          {isCreator && (
            <div className="flex gap-2 mb-4">
              <Button variant="ghost" onClick={doDelete}>
                <Icon name="trash" size={16} />
                delete
              </Button>
            </div>
          )}

          <div className="divider" />
          <CommentList kind="event" id={event._id} />
        </div>

        <aside>
          <div className="card">
            <div className="section-head">
              <h3 className="section-title">who's coming</h3>
              <span className="mono subtle" style={{ fontSize: 12 }}>
                {going.length} in · {maybe.length} maybe
              </span>
            </div>
            {rsvps.length === 0 ? (
              <p className="muted">no one yet.</p>
            ) : (
              <div className="stack-sm">
                {[...going, ...maybe, ...requested, ...invited].map((r) => {
                  const u = typeof r.user === "string" ? null : r.user;
                  if (!u) return null;
                  const chipKind: "going" | "maybe" | "out" =
                    r.status === "going"
                      ? "going"
                      : r.status === "maybe" || r.status === "requested"
                      ? "maybe"
                      : "out";
                  const label =
                    r.status === "requested"
                      ? "wants in"
                      : r.status === "invited"
                      ? "invited"
                      : r.status;
                  return (
                    <div
                      key={r._id}
                      className="flex gap-3"
                      style={{
                        alignItems: "center",
                        padding: "6px 0",
                        borderBottom: "1px solid var(--border-subtle)",
                      }}
                    >
                      <Avatar
                        name={u.displayName || u.username}
                        avatarUrl={u.avatarUrl}
                        size={32}
                      />
                      <div style={{ flex: 1 }}>
                        <Link
                          to={`/profile/${u.username}`}
                          style={{ fontWeight: 500, color: "var(--ink-900)" }}
                        >
                          {u.displayName || u.username}
                        </Link>
                      </div>
                      <Chip kind={chipKind}>{label}</Chip>
                      {isCreator && r.status === "requested" && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => doApprove(u._id)}
                        >
                          let in
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {isCreator && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <InvitePanel
                eventId={event._id}
                rsvps={rsvps}
                onInvited={refreshRsvps}
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
