import { Link } from "react-router-dom";
import Icon from "./Icon";
import { formatDateTime } from "../lib/format";

interface Props {
  to: string;
  image?: string | null;
  title: string;
  startTime?: string | null;
  city?: string;
  tags?: string[];
}

export default function PosterTile({
  to,
  image,
  title,
  startTime,
  city,
  tags,
}: Props) {
  return (
    <Link to={to} className="poster-tile">
      {image ? (
        <img className="poster-tile-img" src={image} alt="" />
      ) : (
        <div
          className="poster-tile-img"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--mint-100)",
            color: "var(--mint-600)",
          }}
        >
          <Icon name="calendar" size={36} />
        </div>
      )}
      <div className="poster-tile-body">
        <div className="poster-tile-title">{title}</div>
        <div className="poster-tile-meta">
          {startTime ? formatDateTime(startTime) : "date tbd"}
          {city ? ` · ${city}` : ""}
        </div>
        {tags && tags.length > 0 && (
          <div className="poster-tile-tags">
            {tags.slice(0, 3).map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
