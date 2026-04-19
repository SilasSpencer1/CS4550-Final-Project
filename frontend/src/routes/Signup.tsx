import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/auth";
import { useAppDispatch } from "../hooks";
import { setUser } from "../store/session";
import Button from "../ui/Button";
import Field from "../ui/Field";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"user" | "organizer">("user");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await signup({ username, email, password, role, displayName });
      dispatch(setUser(user));
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "couldn't create that account — try again?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page" style={{ maxWidth: 460 }}>
      <div className="eyebrow mb-2">welcome</div>
      <h1 className="mb-2" style={{ fontSize: 32, letterSpacing: "-0.02em" }}>
        <span className="editorial">hello,</span> who are you?
      </h1>
      <p className="muted mb-5">set up your roster in under a minute.</p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="stack">
        <Field label="username" htmlFor="username">
          <input
            id="username"
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            placeholder="quinn"
          />
        </Field>
        <Field label="display name" hint="how you'll show up to friends">
          <input
            className="input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="quinn w."
          />
        </Field>
        <Field label="email">
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@somewhere.com"
          />
        </Field>
        <Field label="password">
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
          />
        </Field>
        <Field label="account type" hint="organizers can publish public events">
          <select
            className="select"
            value={role}
            onChange={(e) => setRole(e.target.value as "user" | "organizer")}
          >
            <option value="user">person — personal calendar & friends</option>
            <option value="organizer">organizer — host public events</option>
          </select>
        </Field>
        <Button
          type="submit"
          variant="hero"
          size="lg"
          block
          disabled={loading}
        >
          {loading ? "creating…" : "create my account"}
        </Button>
        <p className="muted text-center" style={{ marginTop: 8 }}>
          have an account already? <Link to="/signin">sign in</Link>
        </p>
      </form>
    </div>
  );
}
