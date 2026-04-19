import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="container page text-center" style={{ paddingTop: 80 }}>
      <div className="mono subtle mb-2">404</div>
      <h1 style={{ fontSize: 48, letterSpacing: "-0.02em" }}>
        <span className="editorial">that page doesn't exist.</span>
      </h1>
      <p className="mt-3">
        <Link to="/">back to roster</Link>
      </p>
    </div>
  );
}
