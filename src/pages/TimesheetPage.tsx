import { useQuery } from "wasp/client/operations";
import { getMyPunches } from "wasp/client/operations";
import { deleteMyPunch } from "wasp/client/operations";
import { useState } from "react";
import { exportToCSV } from "../utils/export";

export function TimesheetPage() {
  const today = new Date().toISOString().split("T")[0];
  const monthStart = today.slice(0, 8) + "01";
  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate]     = useState(today);
  const [jobCode, setJobCode]     = useState("");

  const { data: punches, refetch } = useQuery(getMyPunches, { startDate, endDate, jobCode: jobCode || undefined });

  const formatDuration = (start: string, end: string) => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const h  = Math.floor(ms / 3600000);
    const m  = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const totalHours = (punches ?? [])
    .filter((p: any) => p.clockOut)
    .reduce((acc: number, p: any) => {
      return acc + (new Date(p.clockOut).getTime() - new Date(p.clockIn).getTime()) / 3600000;
    }, 0);

  async function handleDelete(id: number) {
    if (!confirm("Delete this punch record?")) return;
    await deleteMyPunch({ id });
  }

  function handleExport() {
    const rows = (punches ?? []).map((p: any) => ({
      Date:      new Date(p.clockIn).toLocaleDateString(),
      "Clock In": new Date(p.clockIn).toLocaleTimeString(),
      "Clock Out": p.clockOut ? new Date(p.clockOut).toLocaleTimeString() : "",
      Duration:  p.clockOut ? formatDuration(p.clockIn, p.clockOut) : "",
      "Job Code": p.jobCode ?? "",
      Note:      p.note ?? "",
    }));
    exportToCSV(rows, `timesheet_${startDate}_${endDate}`);
  }

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h2>My Timesheet</h2>
        <button className="btn btn-export" onClick={handleExport}>Export CSV</button>
      </header>

      <div className="filter-bar">
        <label>From <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="input-field" /></label>
        <label>To   <input type="date" value={endDate}   onChange={e => setEndDate(e.target.value)}   className="input-field" /></label>
        <label>Job  <input type="text" placeholder="Job code" value={jobCode} onChange={e => setJobCode(e.target.value)} className="input-field" /></label>
      </div>

      <div className="summary-bar">
        <span>Total Hours: <strong>{totalHours.toFixed(2)}h</strong></span>
        <span>Records: <strong>{(punches ?? []).length}</strong></span>
      </div>

      <table className="punch-table">
        <thead>
          <tr>
            <th>Date</th><th>Clock In</th><th>Clock Out</th><th>Duration</th><th>Job Code</th><th>Note</th><th></th>
          </tr>
        </thead>
        <tbody>
          {(punches ?? []).map((p: any) => (
            <tr key={p.id}>
              <td>{new Date(p.clockIn).toLocaleDateString()}</td>
              <td>{new Date(p.clockIn).toLocaleTimeString()}</td>
              <td>{p.clockOut ? new Date(p.clockOut).toLocaleTimeString() : <em>Active</em>}</td>
              <td>{p.clockOut ? formatDuration(p.clockIn, p.clockOut) : "—"}</td>
              <td>{p.jobCode ?? "—"}</td>
              <td>{p.note ?? "—"}</td>
              <td>
                {p.clockOut && (
                  <button className="btn-icon btn-danger" onClick={() => handleDelete(p.id)} title="Delete">✕</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
