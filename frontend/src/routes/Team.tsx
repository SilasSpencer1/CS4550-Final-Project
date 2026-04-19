import { Link } from "react-router-dom";
import Icon from "../ui/Icon";

const FRONTEND_REPO =
  import.meta.env.VITE_FRONTEND_REPO ??
  "https://github.com/SilasSpencer1/CS4550-Final-Project";
const BACKEND_REPO =
  import.meta.env.VITE_BACKEND_REPO ??
  "https://github.com/SilasSpencer1/CS4550-Final-Project";

interface Member {
  name: string;
  section: string;
}

const TEAM: Member[] = [
  { name: "Silas Spencer", section: "CS4550 — Web Development, Spring 2026" },
];

export default function Team() {
  return (
    <div className="container page" style={{ maxWidth: 720 }}>
      <div className="eyebrow mb-2">about this project</div>
      <h1 className="mb-5" style={{ fontSize: 34, letterSpacing: "-0.02em" }}>
        <span className="editorial">the team behind</span> roster.
      </h1>

      <section className="mb-6">
        <h2 className="section-title mb-3">who built it</h2>
        <div className="stack-sm">
          {TEAM.map((m) => (
            <div key={m.name} className="card card-tight">
              <div style={{ fontWeight: 600, fontSize: 16 }}>{m.name}</div>
              <div className="mono subtle" style={{ fontSize: 13 }}>
                {m.section}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <h2 className="section-title mb-3">source code</h2>
        <div className="stack-sm">
          <a
            href={FRONTEND_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="card card-tight flex-between"
            style={{ textDecoration: "none", color: "var(--ink-900)" }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>frontend repo</div>
              <div className="mono subtle" style={{ fontSize: 12 }}>
                react + vite + typescript · {FRONTEND_REPO.replace("https://", "")}
              </div>
            </div>
            <Icon name="external" size={18} />
          </a>
          <a
            href={BACKEND_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="card card-tight flex-between"
            style={{ textDecoration: "none", color: "var(--ink-900)" }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>backend repo</div>
              <div className="mono subtle" style={{ fontSize: 12 }}>
                express + mongoose · {BACKEND_REPO.replace("https://", "")}
              </div>
            </div>
            <Icon name="external" size={18} />
          </a>
        </div>
      </section>

      <section>
        <h2 className="section-title mb-3">stack</h2>
        <div className="card">
          <table className="table" style={{ border: "none", boxShadow: "none" }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>frontend</td>
                <td>react, vite, typescript, redux toolkit, react-router, react-big-calendar</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>backend</td>
                <td>node, express, typescript, mongoose, express-session, bcrypt</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>database</td>
                <td>mongodb atlas</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>3rd-party apis</td>
                <td>ticketmaster discovery · google calendar (oauth)</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>deploy</td>
                <td>netlify · render · atlas</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>design</td>
                <td>roster design system — inter, fraunces italic, jetbrains mono</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-4 text-center">
        <Link to="/">back to home</Link>
      </p>
    </div>
  );
}
