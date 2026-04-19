import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getComments, postComment } from "../api/comments";
import type { Comment } from "../api/types";
import { useAppSelector } from "../hooks";
import { formatRelative } from "../lib/format";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";

interface Props {
  kind: "event" | "tmEvent";
  id: string;
}

export default function CommentList({ kind, id }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const user = useAppSelector((s) => s.session.user);

  useEffect(() => {
    getComments(kind, id).then(setComments);
  }, [kind, id]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    try {
      const created = await postComment(kind, id, body.trim());
      setComments((list) => [created, ...list]);
      setBody("");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div>
      <h3 className="section-title mb-3">the chat</h3>
      {user ? (
        <form onSubmit={handlePost} className="mb-4">
          <textarea
            className="textarea mb-2"
            rows={2}
            placeholder="say something…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Button type="submit" size="sm" disabled={posting || !body.trim()}>
            post
          </Button>
        </form>
      ) : (
        <p className="muted">
          <Link to="/signin">sign in</Link> to join the chat.
        </p>
      )}
      {comments.length === 0 ? (
        <p className="muted">be the first to say something.</p>
      ) : (
        <div className="stack-sm">
          {comments.map((c) => (
            <div
              key={c._id}
              className="flex gap-3 align-start"
              style={{ marginBottom: 4 }}
            >
              <Avatar
                name={c.author.displayName || c.author.username}
                avatarUrl={c.author.avatarUrl}
                size={32}
              />
              <div
                className="card card-tight"
                style={{ flex: 1, boxShadow: "none" }}
              >
                <div className="flex-between" style={{ alignItems: "baseline" }}>
                  <Link
                    to={`/profile/${c.author.username}`}
                    style={{ fontWeight: 600, color: "var(--ink-900)" }}
                  >
                    {c.author.displayName || c.author.username}
                  </Link>
                  <span className="mono subtle" style={{ fontSize: 11 }}>
                    {formatRelative(c.createdAt)}
                  </span>
                </div>
                <div className="mt-2">{c.body}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
