import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signin } from "../api/auth";
import { useAppDispatch } from "../hooks";
import { setUser } from "../store/session";
import Button from "../ui/Button";
import Field from "../ui/Field";

export default function Signin() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from ?? "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await signin(id, password);
      dispatch(setUser(user));
      navigate(from);
    } catch (err: any) {
      setError(
        err?.response?.data?.error ?? "couldn't sign you in — try that again?"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container page" style={{ maxWidth: 420 }}>
      <div className="eyebrow mb-2">welcome back</div>
      <h1 className="mb-5" style={{ fontSize: 32, letterSpacing: "-0.02em" }}>
        <span className="editorial">good to see you.</span>
      </h1>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="stack">
        <Field label="username or email">
          <input
            className="input"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
            autoComplete="username"
          />
        </Field>
        <Field label="password">
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </Field>
        <Button type="submit" variant="primary" size="lg" block disabled={loading}>
          {loading ? "signing in…" : "sign in"}
        </Button>
        <p className="muted text-center" style={{ marginTop: 8 }}>
          new here? <Link to="/signup">make an account</Link>
        </p>
      </form>
    </div>
  );
}
