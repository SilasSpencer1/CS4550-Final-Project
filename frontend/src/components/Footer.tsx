import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border-subtle)",
        marginTop: "var(--space-12)",
        padding: "var(--space-6) 0 var(--space-8)",
        background: "var(--bg-canvas)",
      }}
    >
      <div
        className="container flex-between"
        style={{ alignItems: "baseline", flexWrap: "wrap", gap: 12 }}
      >
        <div className="flex gap-2" style={{ alignItems: "center" }}>
          <img src="/assets/logo-mark.svg" alt="" style={{ height: 18 }} />
          <span style={{ fontWeight: 600 }}>roster</span>
          <span className="mono subtle" style={{ fontSize: 12, marginLeft: 8 }}>
            a social calendar for your people
          </span>
        </div>
        <nav
          className="flex gap-3"
          style={{ fontSize: 13, color: "var(--fg-muted)" }}
        >
          <Link to="/team">about + credits</Link>
          <Link to="/discover">discover</Link>
        </nav>
      </div>
    </footer>
  );
}
