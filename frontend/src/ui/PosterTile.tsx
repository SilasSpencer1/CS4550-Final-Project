import { Link } from "react-router-dom";
import Icon from "./Icon";

interface Props {
  to: string;
  image?: string | null;
  title: string;
  startTime?: string | null;
  city?: string;
  venue?: string;
  tags?: string[];
  featured?: boolean;
}

const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MON = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

// Time-of-day → accent color. Morning = mint, afternoon = citron,
// evening = persimmon, late night = grape. Ties visual energy to schedule.
function accentFor(d: Date | null): { bg: string; fg: string; name: string } {
  if (!d) return { bg: "var(--ink-100)", fg: "var(--ink-800)", name: "tbd" };
  const h = d.getHours();
  if (h < 11) return { bg: "var(--mint-500)", fg: "#1F1D1A", name: "morning" };
  if (h < 17) return { bg: "var(--citron-500)", fg: "#1F1D1A", name: "afternoon" };
  if (h < 22) return { bg: "var(--persimmon-500)", fg: "#fff", name: "evening" };
  return { bg: "var(--grape-500)", fg: "#fff", name: "late" };
}

function timeLabel(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  const hour = h % 12 || 12;
  return m === 0
    ? `${hour}${ampm}`
    : `${hour}:${String(m).padStart(2, "0")}${ampm}`;
}

export default function PosterTile({
  to,
  image,
  title,
  startTime,
  city,
  venue,
  tags,
  featured,
}: Props) {
  const d = startTime ? new Date(startTime) : null;
  const accent = accentFor(d);
  const place = venue || city || "";

  return (
    <Link
      to={to}
      className={`ptile ${featured ? "ptile-featured" : ""} ${image ? "ptile-image" : "ptile-block"}`}
      aria-label={title}
    >
      <div className="ptile-art" style={{ background: image ? undefined : accent.bg, color: accent.fg }}>
        {image && (
          <img src={image} alt="" className="ptile-image-bg" loading="lazy" />
        )}
        {d ? (
          <div className={`ptile-datestamp ${image ? "ptile-datestamp-over" : ""}`}>
            <span className="dow">{DOW[d.getDay()]}</span>
            <span className="dom">{d.getDate()}</span>
            <span className="mon">{MON[d.getMonth()]}</span>
          </div>
        ) : (
          <div className="ptile-datestamp">
            <span className="dow">—</span>
            <span className="dom">tbd</span>
          </div>
        )}
        {d && (
          <span className={`ptile-time ${image ? "ptile-time-over" : ""}`}>
            <Icon name="clock" size={12} /> {timeLabel(d)}
          </span>
        )}
      </div>
      <div className="ptile-body">
        <h3 className="ptile-title">{title}</h3>
        {place && (
          <div className="ptile-venue">
            <Icon name="mapPin" size={13} />
            <em className="editorial">{place}</em>
          </div>
        )}
        {tags && tags.length > 0 && (
          <div className="ptile-tags">
            {tags.slice(0, 3).map((t) => (
              <span key={t} className="ptile-tag">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
