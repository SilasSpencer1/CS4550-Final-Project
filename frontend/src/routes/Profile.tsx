import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getUser, getUserEvents, getUserFriends } from "../api/users";
import { sendRequest } from "../api/friends";
import type { PublicUser, UserEvent } from "../api/types";
import { useAppSelector } from "../hooks";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import Chip from "../ui/Chip";
import Icon from "../ui/Icon";
import EventRow from "../ui/EventRow";

const TABS = [
  { id: "upcoming", label: "upcoming" },
  { id: "hosted", label: "hosted" },
  { id: "friends", label: "friends" },
  { id: "interests", label: "interests" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function Profile() {
  const { username } = useParams();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [friends, setFriends] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("upcoming");
  const [friended, setFriended] = useState(false);
  const sessionUser = useAppSelector((s) => s.session.user);

  useEffect(() => {
    if (!username) return;
    setError(null);
    getUser(username)
      .then(setUser)
      .catch(() => setError("we couldn't find that person."));
    getUserEvents(username).then(setEvents);
    getUserFriends(username)
      .then(setFriends)
      .catch(() => setFriends([]));
  }, [username]);

  if (error)
    return (
      <div className="container page">
        <p className="muted">{error}</p>
      </div>
    );
  if (!user)
    return (
      <div className="container page">
        <p className="muted">loading…</p>
      </div>
    );

  async function handleFriend() {
    if (!username) return;
    await sendRequest(username);
    setFriended(true);
  }

  const upcoming = events.filter(
    (e) => new Date(e.endTime).getTime() >= Date.now()
  );
  const hosted = upcoming.filter((e) => e.visibility !== "busy");

  return (
    <div className="container page">
      <header className="flex gap-3 align-start mb-5" style={{ flexWrap: "wrap" }}>
        <Avatar
          name={user.displayName || user.username}
          avatarUrl={user.avatarUrl}
          size={80}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex gap-2" style={{ alignItems: "center", flexWrap: "wrap" }}>
            <h1 style={{ fontSize: 30, letterSpacing: "-0.02em" }}>
              {user.displayName || user.username}
            </h1>
            {user.role === "organizer" && <Chip kind="organizer">organizer</Chip>}
            {user.isFriend && (
              <Chip kind="going">
                <Icon name="check" size={12} /> friends
              </Chip>
            )}
          </div>
          <div className="mono subtle">@{user.username}</div>
          {user.location?.city && (
            <div className="muted mt-2">
              <Icon name="mapPin" size={14} /> {user.location.city}
              {user.location.state ? `, ${user.location.state}` : ""}
            </div>
          )}
          {user.bio && <p className="mt-2">{user.bio}</p>}
        </div>
        <div className="flex gap-2">
          {user.isSelf ? (
            <Button variant="secondary" to="/profile/me/edit">
              <Icon name="pencil" size={16} /> edit profile
            </Button>
          ) : sessionUser && !user.isFriend ? (
            <Button
              variant="primary"
              onClick={handleFriend}
              disabled={friended}
            >
              {friended ? "request sent" : "add friend"}
            </Button>
          ) : null}
        </div>
      </header>

      {user.interests?.length > 0 && (
        <div className="mb-5">
          {user.interests.map((t) => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {t.id === "upcoming" && ` (${upcoming.length})`}
            {t.id === "hosted" && ` (${hosted.length})`}
            {t.id === "friends" && ` (${friends.length})`}
          </button>
        ))}
      </div>

      {tab === "upcoming" &&
        (upcoming.length === 0 ? (
          <div className="empty">
            <span className="editorial">nothing coming up.</span>
            <p>their week's pretty open.</p>
          </div>
        ) : (
          <div className="stack-sm">
            {upcoming.map((e) => (
              <EventRow key={e._id} event={e} />
            ))}
          </div>
        ))}

      {tab === "hosted" &&
        (hosted.length === 0 ? (
          <div className="empty">
            <span className="editorial">no hosted plans visible to you.</span>
            <p>might be some friends-only stuff tucked away.</p>
          </div>
        ) : (
          <div className="stack-sm">
            {hosted.map((e) => (
              <EventRow key={e._id} event={e} />
            ))}
          </div>
        ))}

      {tab === "friends" &&
        (friends.length === 0 ? (
          <div className="empty">
            <span className="editorial">no one on their roster yet.</span>
          </div>
        ) : (
          <div className="grid grid-2">
            {friends.map((f) => (
              <Link
                key={f._id}
                to={`/profile/${f.username}`}
                className="card card-tight flex gap-3"
                style={{
                  alignItems: "center",
                  textDecoration: "none",
                  color: "var(--ink-900)",
                }}
              >
                <Avatar
                  name={f.displayName || f.username}
                  avatarUrl={f.avatarUrl}
                  size={40}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600 }}>
                    {f.displayName || f.username}
                  </div>
                  <div className="mono subtle" style={{ fontSize: 12 }}>
                    @{f.username}
                  </div>
                </div>
                {f.role === "organizer" && (
                  <Chip kind="organizer">organizer</Chip>
                )}
              </Link>
            ))}
          </div>
        ))}

      {tab === "interests" && (
        <div>
          {user.interests?.length ? (
            <div>
              {user.interests.map((t) => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <div className="empty">
              <span className="editorial">no interests listed.</span>
              {user.isSelf && (
                <p>
                  <Link to="/profile/me/edit">add some</Link> so we can
                  recommend better events.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
