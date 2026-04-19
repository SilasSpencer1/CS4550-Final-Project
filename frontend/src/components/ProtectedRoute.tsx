import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks";

interface Props {
  children: React.ReactNode;
  role?: "user" | "organizer";
}

export default function ProtectedRoute({ children, role }: Props) {
  const { user, loaded } = useAppSelector((s) => s.session);
  const location = useLocation();
  if (!loaded) {
    return (
      <div className="container page">
        <p className="muted">loading…</p>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
