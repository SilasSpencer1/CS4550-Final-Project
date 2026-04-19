import { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { signout } from "../api/auth";
import { clearUser } from "../store/session";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import Icon from "../ui/Icon";

export default function Navbar() {
  const user = useAppSelector((s) => s.session.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleSignout() {
    await signout();
    dispatch(clearUser());
    setOpen(false);
    navigate("/");
  }

  const loggedInLinks = (
    <>
      <NavLink to="/calendar" onClick={() => setOpen(false)}>
        Calendar
      </NavLink>
      <NavLink to="/feed" onClick={() => setOpen(false)}>
        Feed
      </NavLink>
      <NavLink to="/friends" onClick={() => setOpen(false)}>
        Friends
      </NavLink>
      <NavLink to="/suggestions" onClick={() => setOpen(false)}>
        For you
      </NavLink>
      {user?.role === "organizer" && (
        <NavLink to="/organizer" onClick={() => setOpen(false)}>
          Organizer
        </NavLink>
      )}
    </>
  );

  return (
    <header className="topnav">
      <div className="topnav-inner">
        <Link to="/" className="topnav-brand" onClick={() => setOpen(false)}>
          <img src="/assets/logo-mark.svg" alt="" />
          <span>roster</span>
        </Link>
        <nav className="topnav-links" aria-label="primary">
          <NavLink to="/discover">Discover</NavLink>
          {user && loggedInLinks}
        </nav>
        <div className="topnav-spacer" />
        <div className="topnav-actions">
          {user ? (
            <>
              <Link
                to={`/profile/${user.username}`}
                className="flex"
                aria-label="your profile"
                style={{
                  textDecoration: "none",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--ink-900)",
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                <Avatar
                  name={user.displayName || user.username}
                  avatarUrl={user.avatarUrl}
                  size={32}
                />
                <span className="d-none-mobile">
                  {user.displayName || user.username}
                </span>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignout}
                className="sign-out-btn"
              >
                <Icon name="logOut" size={16} />
                sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" to="/signin">
                sign in
              </Button>
              <Button variant="primary" size="sm" to="/signup">
                get started
              </Button>
            </>
          )}
          <button
            className="mobile-menu-btn"
            aria-expanded={open}
            aria-label="menu"
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "x" : "menu"} size={20} />
          </button>
        </div>
      </div>
      {open && (
        <div className="mobile-menu">
          <NavLink to="/discover" onClick={() => setOpen(false)}>
            Discover
          </NavLink>
          {user && loggedInLinks}
          {!user && (
            <>
              <NavLink to="/signin" onClick={() => setOpen(false)}>
                sign in
              </NavLink>
              <NavLink to="/signup" onClick={() => setOpen(false)}>
                get started
              </NavLink>
            </>
          )}
        </div>
      )}
    </header>
  );
}
