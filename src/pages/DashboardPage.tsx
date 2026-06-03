import { useQuery } from "wasp/client/operations";
import { getCurrentStatus, getMyPunches } from "wasp/client/operations";
import { clockIn, clockOut } from "wasp/client/operations";
import { useState } from "react";
import type { AuthUser } from "wasp/auth";

export function DashboardPage({ user }: { user: AuthUser }) {
  const { data: status, isLoading: statusLoading } = useQuery(getCurrentStatus);
  const { data: punches } = useQuery(getMyPunches, {});
  const [jobCode, setJobCode] = useState("");
  const [note, setNote]       = useState("");
  const [error, setError]     = useState("");

  async function handleClockIn() {
    try {
      setError("");
      await clockIn({ jobCode, note });
      setJobCode(""); setNote("");
    } catch (e: any) { setError(e.message); }
  }

  async function handleClockOut() {
    try {
      setError("");
      await clockOut({ note });
      setNote("");
    } catch (e: any) { setError(e.message); }
  }

  const formatDuration = (start: string, end?: string | null) => {
    const ms = (end ? new Date(end) : new Date()).getTime() - new Date(start).getTime();
    const h  = Math.floor(ms / 3600000);
    const m  = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const isClockedIn = !!status;

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h2>Dashboard</h2>
        <span className="user-badge">{(user as any).fullName || user.getFirstProviderUserId()}</span>
      </header>

      <div className="status-card">
        <div className={`status-indicator ${isClockedIn ? "active" : "inactive"}`}>
          {isClockedIn ? "CLOCKED IN" : "CLOCKED OUT"}
        </div>
        {isClockedIn && status && (
          <p className="elapsed">Elapsed: {formatDuration(status.clockIn)}</p>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="punch-controls">
        <input
          placeholder="Job code / production name"
          value={jobCode}
          onChange={e => setJobCode(e.target.value)}
          disabled={isClockedIn}
          className="input-field"
        />
        <input
          placeholder="Optional note"
          value={note}
          onChange={e => setNote(e.target.value)}
          className="input-field"
        />
        {!isClockedIn ? (
          <button className="btn btn-green" onClick={handleClockIn}>Clock In</button>
        ) : (
          <button className="btn btn-red" onClick={handleClockOut}>Clock Out</button>
        )}
      </div>

      <section className="recent-punches">
        <h3>Recent Punches</h3>
        <table className="punch-table">
          <thead>
            <tr>
              <th>Date</th><th>Clock In</th><th>Clock Out</th><th>Duration</th><th>Job Code</th><th>Note</th>
            </tr>
          </thead>
          <tbody>
            {(punches ?? []).slice(0, 10).map((p: any) => (
              <tr key={p.id}>
                <td>{new Date(p.clockIn).toLocaleDateString()}</td>
                <td>{new Date(p.clockIn).toLocaleTimeString()}</td>
                <td>{p.clockOut ? new Date(p.clockOut).toLocaleTimeString() : "—"}</td>
                <td>{p.clockOut ? formatDuration(p.clockIn, p.clockOut) : "In progress"}</td>
                <td>{p.jobCode ?? "—"}</td>
                <td>{p.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
