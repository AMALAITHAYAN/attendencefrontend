import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Reports = () => {
  const [employees, setEmployees] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const [employeesRes, attendanceRes] = await Promise.all([
        axios.get('https://backendattendance-1.onrender.com/api/employees'),
        axios.get('https://backendattendance-1.onrender.com/api/attendance/today')
      ]);

      const employeesData = employeesRes.data;
      const attendanceData = attendanceRes.data;
      const employeeMap = {};
      employeesData.forEach(emp => {
        employeeMap[emp.id] = emp;
      });
      const attendanceWithNames = attendanceData.map(record => ({
        ...record,
        employeeName: employeeMap[record.employeeId]?.name || 'Unknown',
      }));
      setEmployees(employeesData);
      setTodayAttendance(attendanceWithNames);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Failed to load reports.');
    } finally {
      setIsLoading(false);
    }
  };

  const { totalEmployees, presentCount, absentCount, absentEmployees } = useMemo(() => {
    const total = employees.length;
    const present = todayAttendance.length;
    const presentIds = new Set(todayAttendance.map(att => att.employeeId));
    const absent = employees.filter(emp => !presentIds.has(emp.id));
    return {
      totalEmployees: total,
      presentCount: present,
      absentCount: absent.length,
      absentEmployees: absent
    };
  }, [employees, todayAttendance]);
  
  const attendancePercent = totalEmployees > 0 ? (presentCount / totalEmployees) * 100 : 0;

  const chartData = useMemo(() => ({
    labels: ['Present', 'Absent'],
    datasets: [
      {
        data: [presentCount, absentCount],
        backgroundColor: ['#3b82f6', '#ef4444'],
        borderColor: ['#0f172a'],
        borderWidth: 4,
        hoverOffset: 8,
        borderRadius: 5,
      },
    ],
  }), [presentCount, absentCount]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { size: 14, family: "'Poppins', sans-serif" },
        bodyFont: { size: 12, family: "'Poppins', sans-serif" },
        padding: 10,
        cornerRadius: 8,
      },
    },
    animation: {
        animateScale: true,
        animateRotate: true
    }
  }), []);

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
    :root { --blue-accent: #3b82f6; --slate-light: #e2e8f0; --slate-dark: #1e293b; --slate-darker: #0f172a; --slate-border: #334155; --text-light-accent: #93c5fd; --red-accent: #ef4444; }
    .manage-page-bg { min-height: 100vh; font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #020617, var(--slate-darker), #1e3a8a); color: var(--slate-light); padding: 2rem; box-sizing: border-box; }
    .manage-container { max-width: 1200px; margin: 0 auto; }
    .manage-header h1 { font-size: 2.5rem; font-weight: 700; color: #f8fafc; text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5); margin-bottom: 2.5rem; text-align: center; }
    .page-section-header { font-size: 1.5rem; color: var(--text-light-accent); margin: 2.5rem 0 1.5rem 0; border-bottom: 1px solid var(--slate-border); padding-bottom: 0.5rem; }
    
    .top-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start; }
    .report-cards-grid { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
    .report-card { background: var(--slate-dark); border: 1px solid var(--slate-border); border-radius: 12px; padding: 1.5rem; text-align: center; transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .report-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
    .report-card h3 { margin: 0 0 0.5rem 0; font-size: 1.1rem; color: var(--text-light-accent); font-weight: 600; }
    .report-card p { margin: 0; font-size: 2.5rem; font-weight: 700; color: #f8fafc; }
    
    .chart-container { position: relative; background: var(--slate-dark); border: 1px solid var(--slate-border); border-radius: 12px; padding: 1.5rem; height: 100%; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .chart-wrapper { position: relative; width: 250px; height: 250px; }
    .chart-center-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #f8fafc; }
    .chart-center-text .percent { font-size: 2.5rem; font-weight: 700; }
    .chart-center-text .label { font-size: 1rem; color: var(--text-light-accent); }
    .chart-legend { display: flex; justify-content: center; gap: 1.5rem; margin-top: 1.5rem; width: 100%; }
    .legend-item { display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; }
    .legend-color-box { width: 16px; height: 16px; border-radius: 4px; }
    
    .table-wrapper, .progress-section { margin-top: 2.5rem; background-color: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid var(--slate-border); padding: 1rem; }
    .progress-section { padding: 2rem; }
    
    .progress-container { width: 100%; background-color: var(--slate-dark); border-radius: 50px; overflow: hidden; height: 30px; margin-bottom: 1.5rem; }
    .progress-bar { height: 100%; display: flex; align-items: center; justify-content: center; font-weight: 600; color: white; font-size: 0.9rem; background: linear-gradient(to right, var(--blue-accent), #60a5fa); transition: width 0.5s ease-in-out; }
    .employee-list-container { display: flex; flex-direction: column; gap: 0.8rem; }
    .employee-list-row { display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; background-color: var(--slate-dark); border-radius: 8px; }
    .employee-list-row span { font-weight: 600; }
    .employee-list-row .progress-container { width: 50%; height: 25px; margin-bottom: 0; }
    .employee-list-row .progress-bar-absent { background: linear-gradient(to right, #f87171, var(--red-accent)); }

    /* --- Skeleton Loader Styles --- */
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .skeleton { background-color: var(--slate-border); border-radius: 8px; animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    .skeleton-card { height: 130px; }
    .skeleton-chart { height: 430px; }
    .skeleton-header { height: 40px; width: 60%; margin-bottom: 1.5rem; }
    .skeleton-table { height: 200px; }
    
    @media (max-width: 900px) {
      .top-grid { grid-template-columns: 1fr; }
    }
  `;

  if (isLoading) {
    return (
      <>
        <style>{styles}</style>
        <div className="manage-page-bg">
          <div className="manage-container">
            <div className="manage-header"><h1>Daily Reports</h1></div>
            <div className="top-grid">
              <div className="report-cards-grid">
                <div className="skeleton skeleton-card"></div>
                <div className="skeleton skeleton-card"></div>
                <div className="skeleton skeleton-card"></div>
              </div>
              <div className="skeleton skeleton-chart"></div>
            </div>
            <div className="skeleton skeleton-header" style={{marginTop: '2.5rem'}}></div>
            <div className="skeleton skeleton-table"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="manage-page-bg">
        <div className="manage-container">
          <div className="manage-header">
            <h1>Daily Reports</h1>
          </div>
          
          <div className="top-grid">
            <div className="report-cards-grid">
              <div className="report-card">
                <h3>Total Students</h3>
                <p>{totalEmployees}</p>
              </div>
              <div className="report-card">
                <h3>Students Present</h3>
                <p>{presentCount}</p>
              </div>
              <div className="report-card">
                <h3>Students Absent</h3>
                <p>{absentCount}</p>
              </div>
            </div>
            <div className="chart-container">
              {totalEmployees > 0 ? (
                <>
                  <div className="chart-wrapper">
                    <Doughnut data={chartData} options={chartOptions} />
                    <div className="chart-center-text">
                        <div className="percent">{attendancePercent.toFixed(0)}%</div>
                        <div className="label">Present</div>
                    </div>
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                        <div className="legend-color-box" style={{backgroundColor: '#3b82f6'}}></div>
                        <span>Present ({presentCount})</span>
                    </div>
                    <div className="legend-item">
                        <div className="legend-color-box" style={{backgroundColor: '#ef4444'}}></div>
                        <span>Absent ({absentCount})</span>
                    </div>
                  </div>
                </>
              ) : <p style={{textAlign: 'center', paddingTop: '4rem'}}>No data to display chart.</p>}
            </div>
          </div>

          <div className="progress-section">
            <h3 className="page-section-header" style={{ marginTop: 0 }}>Overall Attendance Progress</h3>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${attendancePercent}%` }}>
                {attendancePercent.toFixed(1)}% Present
              </div>
            </div>

            <h3 className="page-section-header">Student List</h3>
            <div className="employee-list-container">
              {todayAttendance.map(emp => (
                <div key={`present-${emp.id}`} className="employee-list-row">
                  <span>{emp.employeeName}</span>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: '100%' }}>Present</div>
                  </div>
                </div>
              ))}
              {absentEmployees.map(emp => (
                <div key={`absent-${emp.id}`} className="employee-list-row">
                  <span>{emp.name || 'Unknown'}</span>
                  <div className="progress-container">
                    <div className="progress-bar progress-bar-absent" style={{ width: '100%' }}>Absent</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Reports;