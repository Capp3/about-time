import { useQuery } from "wasp/client/operations";
import { getAllPunchesAdmin, getReportData } from "wasp/client/operations";
import { updatePunchAdmin } from "wasp/client/operations";
import { useState } from "react";
import { exportToCSV, exportToExcel } from "../utils/export";

export function AdminPage() {
  const today      = new Date().toISOString().split("T")[0];
  const monthStart = today.slice(0, 8) + "01";

  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate]     = useState(today);
  const [jobCode, setJobCode]     = useState("");
  const [editId, setEditId]       = useState<number | null>(null);
  const [editData, setEditData]   = useState<any>({});

  const { data: punches, refetch } = useQuery(getAllPunchesAdmin, {
    startDate, endDate, jobCode: jobCode || undefined,
  });

  const { data: reportData } = useQuery(getReportData, {
    startDate, endDate, jobCode: jobCode || undefined,
  });

  const formatDuration = (start: string, end: string) => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const h  = Math.floor(ms / 3600000);
    const m  = Math.floor((ms % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  const totalHours = (punches ?? [])
    .filter((p: any) => p.clockOut)
    .reduce((acc: number, p: any) =>
      acc + (new Date(p.clockOut).getTime() - new Date(p.clockIn).getTime()) / 3600000, 0);

  async function handleSaveEdit() {
    if (!editId) return;
    await updatePunchAdmin({ id: editId, ...editData });
    setEditId(null); setEditData({});
  }

  function buildExportRows() {
    return (reportData ?? punches ?? []).map((p: any) => ({
      "Full Name":  p.user?.fullName ?? "",
      Department:   p.user?.department ?? "",
      Date:         new Date(p.clockIn).toLocaleDateString(),
      "Clock In":   new Date(p.clockIn).toLocaleTimeString(),
      "Clock Out":  p.clockOut ? new Date(p.clockOut).toLocaleTimeString() : "",
      "Duration (h)": p.clockOut
        ? ((new Date(p.clockOut).getTime() - new Date(p.clockIn).getTime()) / 3600000).toFixed(2)
        : "",
      "Job Code":   p.jobCode ?? "",
      Note:         p.note ?? "",
    }));
  }

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h2>Admin — All Punches</h2>
        <div className="export-buttons">
          <button className="btn btn-export" onClick={() => exportToCSV(buildExportRows(), `report_${startDate}_${endDate}`)}>
            Export CSV
          </button>
          <button className="btn btn-export" onClick={() => exportToExcel(buildExportRows(), `report_${startDate}_${endDate}`)}>
            Export Excel
          </button>
        </div>
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
            <th>Name</th><th>Dept</th><th>Date</th><th>Clock In</th><th>Clock Out</th>
            <th>Duration</th><th>Job Code</th><th>Note</th><th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {(punches ?? []).map((p: any) => (
            editId === p.id ? (
              <tr key={p.id} className="editing-row">
                <td colSpan={2}>{p.user?.fullName}</td>
                <td colSpan={2}>
                  <input type="datetime-local"
                    defaultValue={new Date(p.clockIn).toISOString().slice(0,16)}
                    onChange={e => setEditData((d: any) => ({ ...d, clockIn: e.target.value }))}
                    className="input-field" />
                </td>
                <td>
                  <input type="datetime-local"
                    defaultValue={p.clockOut ? new Date(p.clockOut).toISOString().slice(0,16) : ""}
                    onChange={e => setEditData((d: any) => ({ ...d, clockOut: e.target.value }))}
                    className="input-field" />
                </td>
                <td>—</td>
                <td>
                  <input defaultValue={p.jobCode ?? ""} onChange={e => setEditData((d: any) => ({ ...d, jobCode: e.target.value }))} className="input-field" />
                </td>
                <td>
                  <input defaultValue={p.note ?? ""} onChange={e => setEditData((d: any) => ({ ...d, note: e.target.value }))} className="input-field" />
                </td>
                <td>
                  <button className="btn-icon btn-green" onClick={handleSaveEdit}>✓</button>
                  <button className="btn-icon" onClick={() => { setEditId(null); setEditData({}); }}>✕</button>
                </td>
              </tr>
            ) : (
              <tr key={p.id}>
                <td>{p.user?.fullName ?? "—"}</td>
                <td>{p.user?.department ?? "—"}</td>
                <td>{new Date(p.clockIn).toLocaleDateString()}</td>
                <td>{new Date(p.clockIn).toLocaleTimeString()}</td>
                <td>{p.clockOut ? new Date(p.clockOut).toLocaleTimeString() : <em>Active</em>}</td>
                <td>{p.clockOut ? formatDuration(p.clockIn, p.clockOut) : "—"}</td>
                <td>{p.jobCode ?? "—"}</td>
                <td>{p.note ?? "—"}</td>
                <td>
                  <button className="btn-icon" onClick={() => setEditId(p.id)}>✎</button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>
    </div>
  );
}
