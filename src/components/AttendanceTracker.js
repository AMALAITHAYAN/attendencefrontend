import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AttendanceTracker = () => {
  const [attendance, setAttendance] = useState([]);
  const [customDate, setCustomDate] = useState(new Date().toISOString().split("T")[0]); // Default to today

  const formatEmployeeId = (num) => {
    if (!num) return "";
    return `EMP${num.toString().padStart(3, "0")}`;
  };

  const SHIFT_START = "09:00:00";
  const SHIFT_HOURS = 9;

  const fetchAttendance = async () => {
    try {
      if (!customDate) {
        setAttendance([]);
        return;
      }
      const url = `http://localhost:8080/api/attendance/date?date=${customDate}`;
      const response = await axios.get(url);
      setAttendance(response.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendance([]);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [customDate]);

  const timeToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m, s] = timeStr.split(":").map(Number);
    return h * 3600 + m * 60 + s;
  };

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 0;
    const inSec = timeToSeconds(checkIn);
    const outSec = timeToSeconds(checkOut);
    const diffSec = outSec - inSec;
    return diffSec > 0 ? (diffSec / 3600).toFixed(2) : 0;
  };

  const getAttendanceStatus = (record) => {
    if (record.leave) return "Leave";
    if (!record.checkInTime && !record.checkOutTime) return "Absent";
    const workingHours = calculateWorkingHours(record.checkInTime, record.checkOutTime);
    if (workingHours >= SHIFT_HOURS) return "Present";
    if (workingHours >= SHIFT_HOURS / 2) return "Half-day";
    if (workingHours > 0 && workingHours < SHIFT_HOURS / 2) return "No show";
    return "Absent";
  };

  const getOnTimeStatus = (checkIn) => {
    if (!checkIn) return "-";
    const checkInSec = timeToSeconds(checkIn);
    const shiftStartSec = timeToSeconds(SHIFT_START);
    if (checkInSec === shiftStartSec) return "On-time";
    else if (checkInSec > shiftStartSec) return "Late";
    else return "Early";
  };
  
  // Download functions remain unchanged
  const downloadExcel = () => {
    const exportData = attendance.map((record) => {
      const workingHours = calculateWorkingHours(record.checkInTime, record.checkOutTime);
      return { id: record.id, employeeId: formatEmployeeId(record.employeeId), date: record.date, shiftTime: `${SHIFT_START} - ${Number(SHIFT_START.split(":")[0]) + SHIFT_HOURS}:00:00`, checkInTime: record.checkInTime, checkOutTime: record.checkOutTime || "-", workingHours, attendanceStatus: getAttendanceStatus(record), onTimeStatus: getOnTimeStatus(record.checkInTime) };
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");
    XLSX.writeFile(workbook, "attendance.xlsx");
  };
  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Attendance Report", 14, 10);
    const tableRows = attendance.map((record) => {
      const workingHours = calculateWorkingHours(record.checkInTime, record.checkOutTime);
      return [formatEmployeeId(record.employeeId), record.date, `${SHIFT_START} - ${Number(SHIFT_START.split(":")[0]) + SHIFT_HOURS}:00:00`, record.checkInTime, record.checkOutTime || "-", workingHours, getAttendanceStatus(record), getOnTimeStatus(record.checkInTime)];
    });
    autoTable(doc, { head: [["Employee ID", "Date", "Shift Time", "Check-In", "Check-Out", "Working Hours", "Attendance Status", "On-time Status"]], body: tableRows, startY: 20 });
    doc.save("attendance.pdf");
  };

  // --- ALL STYLES ARE CONTAINED HERE ---
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
    :root { --blue-accent: #3b82f6; --blue-accent-dark: #2563eb; --slate-light: #e2e8f0; --slate-dark: #1e293b; --slate-darker: #0f172a; --slate-border: #334155; --text-light-accent: #93c5fd; }
    .manage-page-bg { min-height: 100vh; font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #020617, var(--slate-darker), #1e3a8a); color: var(--slate-light); padding: 2rem; box-sizing: border-box; }
    .manage-container { max-width: 1200px; margin: 0 auto; }
    .manage-header h1 { font-size: 2.5rem; font-weight: 700; color: #f8fafc; text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5); margin-bottom: 2rem; text-align: center; }
    .toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; padding: 1.5rem; background-color: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(var(--blue-accent), 0.3); }
    .date-picker-group { display: flex; align-items: center; gap: 1rem; flex-grow: 1; }
    .date-picker-group label { font-weight: 600; color: var(--text-light-accent); }
    .date-picker-group input[type="date"] { padding: 10px 15px; font-size: 1rem; background-color: var(--slate-dark); border: 2px solid var(--slate-border); border-radius: 8px; color: var(--slate-light); transition: all 0.2s ease-out; font-family: 'Poppins', sans-serif; }
    .date-picker-group input[type="date"]:focus { outline: none; border-color: var(--blue-accent); box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
    .date-picker-group input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.8) brightness(1.2); cursor: pointer; }
    .toolbar-buttons { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .toolbar-btn { padding: 10px 20px; font-size: 0.9rem; font-weight: 600; color: #fff; background: linear-gradient(to right, var(--blue-accent), #60a5fa); border: none; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2); }
    .toolbar-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3); }
    .table-wrapper { overflow-x: auto; background-color: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.3); padding: 1rem; }
    .students-table { width: 100%; border-collapse: collapse; }
    .students-table thead { background-color: rgba(30, 41, 59, 0.8); }
    .students-table th { padding: 1rem; text-align: left; font-weight: 600; color: var(--text-light-accent); text-transform: uppercase; letter-spacing: 0.5px; font-size: 0.9rem; }
    .students-table tbody tr { border-bottom: 1px solid rgba(59, 130, 246, 0.2); transition: background-color 0.2s ease-in-out; }
    .students-table tbody tr:last-child { border-bottom: none; }
    .students-table tbody tr:hover { background-color: rgba(59, 130, 246, 0.1); }
    .students-table td { padding: 1rem; vertical-align: middle; }
    .no-records td { text-align: center; padding: 2rem; font-size: 1.1rem; color: #94a3b8; }
    
    @media (max-width: 900px) {
        .manage-page-bg { padding: 1rem; }
        .manage-header h1 { font-size: 1.8rem; }
        .toolbar { flex-direction: column; align-items: stretch; padding: 1rem; }
        .students-table thead { display: none; }
        .students-table, .students-table tbody, .students-table tr, .students-table td { display: block; width: 100%; }
        .students-table tr { margin-bottom: 1rem; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 1rem; background-color: var(--slate-dark); }
        .students-table tbody tr:hover { background-color: var(--slate-dark); }
        .students-table td { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(59, 130, 246, 0.1); text-align: right; }
        .students-table td:last-child { border-bottom: none; }
        .students-table td::before { content: attr(data-label); font-weight: 600; color: var(--text-light-accent); text-align: left; margin-right: 1rem; }
    }
    `;

  return (
    <>
      <style>{styles}</style>
      <div className="manage-page-bg">
        <div className="manage-container">
          <div className="manage-header">
            <h1>Attendance Tracker</h1>
          </div>

          <div className="toolbar">
            <div className="date-picker-group">
              <label htmlFor="attendance-date">Select Date:</label>
              <input
                id="attendance-date"
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="toolbar-buttons">
              <button className="toolbar-btn" onClick={downloadExcel} disabled={!attendance.length}>
                Download Excel
              </button>
              <button className="toolbar-btn" onClick={downloadPDF} disabled={!attendance.length}>
                Download PDF
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Date</th>
                  <th>Shift Time</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Working Hours</th>
                  <th>Attendance Status</th>
                  <th>On-time Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr className="no-records">
                    <td colSpan="8">
                      {customDate ? `No records found for ${customDate}` : "Please select a date"}
                    </td>
                  </tr>
                ) : (
                  attendance.map((record) => {
                    const workingHours = calculateWorkingHours(record.checkInTime, record.checkOutTime);
                    return (
                      <tr key={record.id}>
                        <td data-label="Student ID">{formatEmployeeId(record.employeeId)}</td>
                        <td data-label="Date">{record.date}</td>
                        <td data-label="Shift Time">{`${SHIFT_START} - ${Number(SHIFT_START.split(":")[0]) + SHIFT_HOURS}:00:00`}</td>
                        <td data-label="Check-In">{record.checkInTime || "-"}</td>
                        <td data-label="Check-Out">{record.checkOutTime || "-"}</td>
                        <td data-label="Working Hours">{workingHours}</td>
                        <td data-label="Attendance Status">{getAttendanceStatus(record)}</td>
                        <td data-label="On-time Status">{getOnTimeStatus(record.checkInTime)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AttendanceTracker;