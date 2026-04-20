import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { myFriends } from "../api/friends";
import { inviteFriend } from "../api/rsvps";
import type { PublicUser, Rsvp } from "../api/types";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import Icon from "../ui/Icon";

interface Props {
  eventId: string;
  rsvps: Rsvp[];
  onInvited: () => void;
}

export default function InvitePanel({ eventId, rsvps, onInvited }: Props) {
  const [friends, setFriends] = useState<PublicUser[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    myFriends().then(setFriends);
  }, []);

  const rsvpUserIds = useMemo(
    () =>
      new Set(
        rsvps
          .map((r) => (typeof r.user === "string" ? r.user : r.user?._id))
          .filter(Boolean) as string[]
      ),
    [rsvps]
  );

  const pool = useMemo(() => {
    const q = query.trim().toLowerCase();
    return friends.filter((f) => {
      if (rsvpUserIds.has(f._id)) return false;
      if (!q) return true;
      return (
        f.username.toLowerCase().includes(q) ||
        (f.displayName ?? "").toLowerCase().includes(q)
      );
    });
  }, [friends, rsvpUserIds, query]);

  async function invite(userId: string) {
    setBusy(userId);
    try {
      await inviteFriend(eventId, userId);
      onInvited();
    } finally {
      setBusy(null);
    }
  }

  if (friends.length === 0) {
    return (
      <div className="card">
        <h3 className="section-title mb-3">invite friends</h3>
        <p className="muted" style={{ fontSize: 14 }}>
          no friends yet. <Link to="/friends">find some</Link> and they'll show
          up here.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="section-head">
        <h3 className="section-title">invite friends</h3>
        <span className="mono subtle" style={{ fontSize: 12 }}>
          {pool.length} available
        </span>
      </div>
      <div className="input-icon mb-3">
        <Icon name="search" size={16} />
        <input
          className="input"
          placeholder="search your roster"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {pool.length === 0 ? (
        <p className="muted" style={{ fontSize: 14 }}>
          {query
            ? "no friends match that."
            : "everyone on your roster is already on the list."}
        </p>
      ) : (
        <div className="stack-sm" style={{ maxHeight: 320, overflowY: "auto" }}>
          {pool.map((f) => (
            <div
              key={f._id}
              className="flex gap-3"
              style={{
                alignItems: "center",
                padding: "6px 0",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
              <Avatar
                name={f.displayName || f.username}
                avatarUrl={f.avatarUrl}
                size={32}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>
                  {f.displayName || f.username}
                </div>
                <div className="mono subtle" style={{ fontSize: 11 }}>
                  @{f.username}
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => invite(f._id)}
                disabled={busy === f._id}
              >
                {busy === f._id ? "sending…" : "invite"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
