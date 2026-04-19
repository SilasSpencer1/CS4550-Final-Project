import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  myFriends,
  pendingRequests,
  sentRequests,
  sendRequest,
  acceptRequest,
  removeFriend,
  FriendRequest,
} from "../api/friends";
import { searchUsers } from "../api/users";
import type { PublicUser } from "../api/types";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import Icon from "../ui/Icon";

const TABS = [
  { id: "friends", label: "friends" },
  { id: "pending", label: "incoming" },
  { id: "sent", label: "sent" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function Friends() {
  const [friends, setFriends] = useState<PublicUser[]>([]);
  const [pending, setPending] = useState<FriendRequest[]>([]);
  const [sent, setSent] = useState<FriendRequest[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PublicUser[]>([]);
  const [tab, setTab] = useState<TabId>("friends");

  async function refresh() {
    setFriends(await myFriends());
    setPending(await pendingRequests());
    setSent(await sentRequests());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function doSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setResults(await searchUsers(query.trim()));
  }

  return (
    <div className="container page">
      <div className="eyebrow mb-2">your people</div>
      <h1 className="mb-5" style={{ fontSize: 30, letterSpacing: "-0.02em" }}>
        <span className="editorial">your roster.</span>
      </h1>

      <form onSubmit={doSearch} className="mb-5">
        <div className="input-icon">
          <Icon name="search" size={18} />
          <input
            className="input"
            placeholder="find someone by username or name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </form>

      {results.length > 0 && (
        <div className="mb-5">
          <h3 className="section-title mb-3">search results</h3>
          <div className="stack-sm">
            {results.map((u) => (
              <div
                key={u._id}
                className="card card-tight flex gap-3"
                style={{ alignItems: "center" }}
              >
                <Avatar
                  name={u.displayName || u.username}
                  avatarUrl={u.avatarUrl}
                  size={40}
                />
                <div style={{ flex: 1 }}>
                  <Link
                    to={`/profile/${u.username}`}
                    style={{ fontWeight: 600, color: "var(--ink-900)" }}
                  >
                    {u.displayName || u.username}
                  </Link>
                  <div className="mono subtle" style={{ fontSize: 12 }}>
                    @{u.username}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={async () => {
                    await sendRequest(u.username);
                    refresh();
                  }}
                >
                  add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tabs">
        {TABS.map((t) => {
          const count =
            t.id === "friends"
              ? friends.length
              : t.id === "pending"
              ? pending.length
              : sent.length;
          return (
            <button
              key={t.id}
              className={`tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      {tab === "friends" &&
        (friends.length === 0 ? (
          <div className="empty">
            <span className="editorial">no one here yet.</span>
            <p>search above to add your first friend.</p>
          </div>
        ) : (
          <div className="grid grid-2">
            {friends.map((u) => (
              <Link
                key={u._id}
                to={`/profile/${u.username}`}
                className="card card-tight flex gap-3"
                style={{
                  alignItems: "center",
                  textDecoration: "none",
                  color: "var(--ink-900)",
                }}
              >
                <Avatar
                  name={u.displayName || u.username}
                  avatarUrl={u.avatarUrl}
                  size={40}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {u.displayName || u.username}
                  </div>
                  <div className="mono subtle" style={{ fontSize: 12 }}>
                    @{u.username}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ))}

      {tab === "pending" &&
        (pending.length === 0 ? (
          <div className="empty">
            <span className="editorial">nothing waiting.</span>
          </div>
        ) : (
          <div className="stack-sm">
            {pending.map((r) => (
              <div
                key={r._id}
                className="card card-tight flex gap-3"
                style={{ alignItems: "center" }}
              >
                <Avatar
                  name={r.requester.displayName || r.requester.username}
                  avatarUrl={r.requester.avatarUrl}
                  size={40}
                />
                <div style={{ flex: 1 }}>
                  <Link to={`/profile/${r.requester.username}`}>
                    {r.requester.displayName || r.requester.username}
                  </Link>
                </div>
                <Button
                  size="sm"
                  onClick={async () => {
                    await acceptRequest(r._id);
                    refresh();
                  }}
                >
                  accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await removeFriend(r._id);
                    refresh();
                  }}
                >
                  pass
                </Button>
              </div>
            ))}
          </div>
        ))}

      {tab === "sent" &&
        (sent.length === 0 ? (
          <div className="empty">
            <span className="editorial">no outstanding requests.</span>
          </div>
        ) : (
          <div className="stack-sm">
            {sent.map((r) => (
              <div
                key={r._id}
                className="card card-tight flex gap-3"
                style={{ alignItems: "center" }}
              >
                <Avatar
                  name={r.recipient.displayName || r.recipient.username}
                  avatarUrl={r.recipient.avatarUrl}
                  size={40}
                />
                <div style={{ flex: 1 }}>
                  <Link to={`/profile/${r.recipient.username}`}>
                    {r.recipient.displayName || r.recipient.username}
                  </Link>
                  <div className="mono subtle" style={{ fontSize: 12 }}>
                    waiting on them
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await removeFriend(r._id);
                    refresh();
                  }}
                >
                  cancel
                </Button>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
