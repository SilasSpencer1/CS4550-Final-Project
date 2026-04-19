import { Link } from "react-router-dom";
import Icon from "./Icon";
import type { UserEvent, PublicUser } from "../api/types";

const ACCENTS = [
  "#E42B01", // persimmon
  "#7AC2C8", // mint
  "#8069C7", // grape
  "#FFBBAB", // blush
  "#E4DC4E", // citron (text dark)
  "#16838C", // mint-600
];

function accentFor(id: string): { bg: string; fg: string } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h << 5) - h + id.charCodeAt(i);
  const bg = ACCENTS[Math.abs(h) % ACCENTS.length];
  return { bg, fg: bg === "#E4DC4E" ? "#1F1D1A" : "#fff" };
}

interface Props {
  event: UserEvent;
  sticker?: boolean;
}

const DOW = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export default function EventRow({ event, sticker }: Props) {
  const start = new Date(event.startTime);
  const dow = DOW[start.getDay()];
  const dom = start.getDate();
  const hour = start.getHours();
  const mins = start.getMinutes();
  const timeStr =
    mins === 0
      ? `${hour % 12 || 12}${hour >= 12 ? "pm" : "am"}`
      : `${hour % 12 || 12}:${String(mins).padStart(2, "0")}${hour >= 12 ? "pm" : "am"}`;
  const { bg, fg } = accentFor(event._id);
  const creator =
    typeof event.createdBy === "string"
      ? null
      : (event.createdBy as PublicUser);

  return (
    <Link
      to={`/events/${event._id}`}
      className={`event-row ${sticker ? "event-row-sticker" : ""}`}
    >
      <div className="event-date-tile" style={{ background: bg, color: fg }}>
        <span className="dow">{dow}</span>
        <span className="dom">{dom}</span>
      </div>
      <div className="event-row-body">
        <div className="event-row-title">{event.title || "Busy"}</div>
        <div className="event-row-meta">
          {timeStr}
          {event.location?.city ? ` · ${event.location.city}` : ""}
          {creator ? ` · ${creator.displayName || creator.username}` : ""}
        </div>
      </div>
      <Icon name="chevronRight" size={18} />
    </Link>
  );
}
