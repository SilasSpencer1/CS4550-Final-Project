import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { myEvents, deleteEvent } from "../api/events";
import type { UserEvent } from "../api/types";
import { formatDateTime } from "../lib/format";
import Button from "../ui/Button";
import Icon from "../ui/Icon";

export default function OrganizerDashboard() {
  const [events, setEvents] = useState<UserEvent[]>([]);

  async function refresh() {
    setEvents(await myEvents());
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("delete this event?")) return;
    await deleteEvent(id);
    refresh();
  }

  return (
    <div className="container page">
      <div className="section-head">
        <div>
          <div className="eyebrow mb-2">organizer</div>
          <h1 style={{ fontSize: 30, letterSpacing: "-0.02em" }}>
            <span className="editorial">host something great.</span>
          </h1>
          <p className="muted">
            your public events surface in everyone's suggestions.
          </p>
        </div>
        <Button variant="hero" to="/events/new">
          <Icon name="plus" size={16} />
          new public event
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="empty">
          <span className="editorial">you haven't hosted anything yet.</span>
          <p>click above to post your first public event.</p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>title</th>
              <th>starts</th>
              <th>city</th>
              <th className="numeric">tags</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e._id}>
                <td>
                  <Link to={`/events/${e._id}`} style={{ fontWeight: 500 }}>
                    {e.title}
                  </Link>
                </td>
                <td className="mono">{formatDateTime(e.startTime)}</td>
                <td>{e.location?.city}</td>
                <td className="numeric">{e.tags?.length ?? 0}</td>
                <td className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(e._id)}
                  >
                    <Icon name="trash" size={14} />
                    delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
