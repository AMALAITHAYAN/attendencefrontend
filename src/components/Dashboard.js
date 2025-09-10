import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import logo from './assets/logo.png';

// Base for your Flask Wi-Fi service (ngrok/HTTPS in prod)
const WIFI_BASE = process.env.REACT_APP_WIFI_BASE || 'http://127.0.0.1:8081';
// Hard-coded teacher id from your example; change if needed or pull from auth
const TEACHER_ID = 'T001';

const Dashboard = () => {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);

  const handleStartSession = async () => {
    if (starting) return;
    setStarting(true);
    const id = toast.loading('Starting session… pairing with Wi-Fi');

    try {
      const url = `${WIFI_BASE}/teacher/${TEACHER_ID}?t=${Date.now()}`;
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      // Non-2xx -> show error body (best effort)
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        toast.error(`Pairing failed (HTTP ${res.status}). ${text.slice(0,120)}`, { id });
        setStarting(false);
        return;
      }

      // Must be JSON: { ok: boolean, ... }
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const text = await res.text().catch(() => '');
        toast.error(`Unexpected response type. ${text.slice(0,120)}`, { id });
        setStarting(false);
        return;
      }

      const data = await res.json(); // { ok, ip?, error?, ... }

      if (data.ok) {
        toast.success(`Paired with Wi-Fi${data.ip ? ` (${data.ip})` : ''}`, { id });
        navigate('/admin-qr'); // proceed to QR page
      } else {
        toast.error(`Pairing failed: ${data.reason || data.error || 'Unknown error'}`, { id });
      }
    } catch (e) {
      toast.error('Network/CORS error while pairing.', { id });
      console.error(e);
    } finally {
      setStarting(false);
    }
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');
    .dashboard-blue-bg {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 100vh; font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #020617, #0f172a, #1e3a8a);
      color: #e2e8f0; padding: 2rem 1.5rem; box-sizing: border-box;
    }
    .dashboard-blue-header { display: flex; align-items: center; gap: 1rem; text-align: center; margin-bottom: 2.5rem; }
    .dashboard-blue-logo { width: 50px; height: 50px; }
    .dashboard-blue-header h1 { font-size: 2.5rem; font-weight: 600; color: #f8fafc; text-shadow: 0 2px 5px rgba(0,0,0,0.5); margin: 0; }
    .dashboard-blue-container {
      max-width: 500px; width: 100%; background-color: rgba(15,23,42,0.6);
      backdrop-filter: blur(12px); border: 2px solid rgba(59,130,246,0.4);
      border-radius: 16px; padding: 2.5rem; box-shadow: 0 10px 40px rgba(0,0,0,0.4); text-align: center;
    }
    .dashboard-blue-subtitle { font-size: 1.1rem; color: #93c5fd; margin-bottom: 2rem; font-weight: 400; }
    .dashboard-blue-buttons-grid { display: flex; flex-direction: column; gap: 1.2rem; }
    .dashboard-blue-btn {
      padding: 1rem; font-size: 1.1rem; font-weight: 600; color: #e2e8f0;
      background-color: #1e293b; border: 2px solid #334155; border-radius: 12px; cursor: pointer;
      transition: all 0.2s ease-out; outline: none; box-shadow: 0 4px 10px rgba(0,0,0,0.3); text-align: center;
    }
    .dashboard-blue-btn:hover {
      transform: translateY(-3px); border-color: #3b82f6; color: #ffffff;
      background: linear-gradient(to right, #3b82f6, #2563eb); box-shadow: 0 6px 20px rgba(59,130,246,0.3);
    }
    .dashboard-blue-btn:active { transform: translateY(-1px); box-shadow: 0 2px 10px rgba(59,130,246,0.2); }
    .dashboard-blue-btn-logout { background-color: rgba(127,29,29,0.2); border-color: rgba(239,68,68,0.4); color: #fca5a5; }
    .dashboard-blue-btn-logout:hover {
      background: linear-gradient(to right, #ef4444, #dc2626); border-color: #ef4444; color: #ffffff;
      box-shadow: 0 6px 20px rgba(239,68,68,0.3);
    }
    .dashboard-blue-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; background-color: #0f172a; }
    @media (max-width: 768px) {
      .dashboard-blue-bg { padding: 1.5rem 1rem; justify-content: flex-start; }
      .dashboard-blue-header { margin-bottom: 2rem; }
      .dashboard-blue-header h1 { font-size: 2rem; }
      .dashboard-blue-logo { width: 40px; height: 40px; }
      .dashboard-blue-container { padding: 1.5rem; border-width: 1px; }
    }
  `;

  return (
    <>
      <Toaster position="top-center" />
      <style>{styles}</style>
      <div className="dashboard-blue-bg">
        <div className="dashboard-blue-header">
          <img src={logo} alt="Company Logo" className="dashboard-blue-logo" />
          <h1>Admin Dashboard</h1>
        </div>

        <div className="dashboard-blue-container">
          <p className="dashboard-blue-subtitle">Choose an option to manage</p>

          {/* Start Session / Wi-Fi Pair */}
          <div className="dashboard-blue-buttons-grid" style={{ marginBottom: '1.2rem' }}>
            <button
              className="dashboard-blue-btn"
              onClick={handleStartSession}
              disabled={starting}
              title={`${WIFI_BASE}/teacher/${TEACHER_ID}`}
            >
              {starting ? 'Starting…' : 'Start Session (Wi-Fi Pair)'}
            </button>
          </div>

          <div className="dashboard-blue-buttons-grid">
            <button className="dashboard-blue-btn" onClick={() => navigate('/manage-employees')}>
              Manage Students
            </button>
            <button className="dashboard-blue-btn" onClick={() => navigate('/attendance')}>
              Attendance
            </button>
            <button className="dashboard-blue-btn" onClick={() => navigate('/reports')}>
              Reports
            </button>
            <button className="dashboard-blue-btn" onClick={() => navigate('/shift-schedule')}>
              Assign Periods
            </button>
            <button className="dashboard-blue-btn dashboard-blue-btn-logout" onClick={() => navigate('/')}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
