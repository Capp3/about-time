import { Link } from "react-router-dom";
import { useAuth, logout } from "wasp/client/auth";

export function NavBar() {
  const { data: user } = useAuth();
  if (!user) return null;
  const isAdmin = (user as any).role === "admin";

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Link to="/dashboard" className="nav-brand">Broadcast Timekeeper</Link>
        <Link to="/dashboard"  className="nav-link">Dashboard</Link>
        <Link to="/timesheet"  className="nav-link">My Timesheet</Link>
        {isAdmin && <Link to="/admin" className="nav-link">Admin</Link>}
        <div className="nav-right">
          <span style={{ fontSize: ".8rem", color: "var(--text-muted)" }}>
            {(user as any).fullName}
          </span>
          <button className="btn" style={{ padding: ".35rem .85rem", background: "var(--surface2)", color: "var(--text-muted)", border: "1px solid var(--border)" }} onClick={logout}>
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
