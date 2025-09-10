// src/pages/Register.js
import React, { useState } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [status, setStatus] = useState('Active');
  const [role, setRole] = useState('Employee');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');
  const [photo, setPhoto] = useState(null);

  // loader state (still shown inline if you want to keep it)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const navigate = useNavigate();

  const parseDuplicateError = (raw) => {
    if (!raw || typeof raw !== 'string') return null;
    const lower = raw.toLowerCase();
    if (!lower.includes('duplicate')) return null;
    if (lower.includes('email')) return 'Email already exists. Try a different email address.';
    if (lower.includes('user') || lower.includes('username')) return 'Username already exists. Please choose another username.';
    return 'That value already exists. Please use a different one.';
  };

  const getServerError = (err) => {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (typeof data === 'string') {
        const dup = parseDuplicateError(data);
        if (dup) return dup;
        if (data.toLowerCase().includes('validation')) return 'Some fields failed validation. Please check your inputs.';
        return data;
      }

      const msg = data?.message || data?.error || data?.detail || '';
      if (msg) {
        const dup = parseDuplicateError(msg);
        if (dup) return dup;
        return msg;
      }

      if (status === 409) return 'This record already exists.';
      if (status === 400) return 'Invalid data. Please review the form.';
    }
    return 'Unexpected error occurred.';
  };

  const uploadPhoto = async (employeeId) => {
    if (!photo) return;

    const form = new FormData();
    form.append('image', photo);

    // toast for upload (live progress)
    const tId = toast.loading('Uploading photo… 0%');

    try {
      setIsUploadingPhoto(true);
      setUploadProgress(0);

      await axios.post(
        `https://backendattendance-1.onrender.com/api/face/register/${employeeId}`,
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (evt) => {
            if (!evt.total) return;
            const pct = Math.round((evt.loaded * 100) / evt.total);
            setUploadProgress(pct);
            toast.update(tId, {
              render: `Uploading photo… ${pct}%`,
              progress: pct / 100,
            });
          },
        }
      );

      toast.update(tId, {
        render: 'Photo uploaded ✅',
        type: 'success',
        isLoading: false,
        autoClose: 1500,
      });
    } catch (err) {
      toast.update(tId, {
        render: `Photo upload failed. ${getServerError(err)}`,
        type: 'error',
        isLoading: false,
        autoClose: 3500,
      });
      // optional: also keep inline error UI if desired
      // console.error('Photo upload error:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const employeeData = {
      name,
      username,
      email,
      password,
      dob,
      joiningDate: null, // dummy
      salary: 0, // dummy
      status,
      role,
      mobileNumber,
      emergencyContactNumber,
      emergencyRelation,
    };

    // optimistic toast that we update later
    const tId = toast.loading('Creating account…');

    try {
      const res = await axios.post(
        'https://backendattendance-1.onrender.com/api/employees/register',
        employeeData
      );

      const employeeId = res.data.id;

      if (photo) {
        await uploadPhoto(employeeId);
      }

      toast.update(tId, {
        render: 'Registration successful 🎉',
        type: 'success',
        isLoading: false,
        autoClose: 1200,
      });

      // small pause so the user can see the success toast
      setTimeout(() => navigate('/'), 900);
    } catch (err) {
      const msg = getServerError(err);
      toast.update(tId, {
        render: `Registration failed. ${msg}`,
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  return (
    <div className="login-container">
      {/* Toast host (you can also move this to App.jsx once) */}
      <ToastContainer
        position="top-center"
        theme="dark"
        newestOnTop
        closeOnClick
        pauseOnHover={false}
        draggable
      />

      <style>{`
        :root{
          --bg:#070b16; --bg2:#0b1224; --card:#0c142a;
          --text:#e8eef6; --muted:#a4b1c8;
          --border:#1b2a4a; --ring:rgba(99,102,241,.25);
          --primary:#8b5cf6; --accent:#06b6d4;
        }
        .login-container{
          min-height:100dvh; display:grid; place-items:center; padding:24px;
          background:
            radial-gradient(900px 420px at 20% -10%, rgba(27,39,80,.7), transparent 60%),
            radial-gradient(900px 520px at 100% 0%, rgba(6,182,212,.18), transparent 55%),
            linear-gradient(160deg, #060c1a 0%, var(--bg2) 40%, #071022 100%);
          color:var(--text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
        }
        .card{
          width:100%; max-width:520px;
          background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.015));
          border:1px solid var(--border);
          border-radius:18px;
          padding:28px 24px 24px;
          box-shadow: 0 30px 80px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.04);
          backdrop-filter: blur(10px);
        }
        h2{ margin:0 0 6px; text-align:center; font-size:24px; font-weight:800; letter-spacing:.2px; }
        .subtitle{ text-align:center; margin:0 0 16px; color:var(--muted); font-size:14px; }
        form{ display:grid; gap:12px; }
        input, select, button{ font-size:14px; }
        input[type="text"], input[type="email"], input[type="password"], input[type="tel"], input[type="date"], select{
          width:100%; padding:12px 14px; border-radius:12px; border:1px solid var(--border);
          background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.01)); color:var(--text);
          outline:none; box-shadow: inset 0 1px 0 rgba(255,255,255,.04); transition: box-shadow .2s, border-color .2s, transform .05s;
        }
        input::placeholder{ color:#7d8aa7; }
        input:focus, select:focus{ border-color: rgba(139,92,246,.6); box-shadow: 0 0 0 6px var(--ring); }
        label{ display:grid; gap:8px; font-size:13px; color:var(--muted); font-weight:600; }
        button[type="submit"]{
          margin-top:4px; width:100%; padding:12px 16px; border:none; border-radius:12px;
          color:#fff; font-weight:800; letter-spacing:.2px; cursor:pointer;
          background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
          box-shadow: 0 16px 40px rgba(11,180,210,.25); transition: transform .04s ease, box-shadow .2s ease, opacity .2s;
        }
        button[type="submit"]:hover{ box-shadow: 0 24px 60px rgba(11,180,210,.32); }
        button[type="submit"]:active{ transform: translateY(1px); }
        .filewrap{ display:grid; gap:8px; }
        input[type="file"]{ padding:10px; border-radius:12px; border:1px solid var(--border);
          background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.01)); color:var(--text); }
        input[type="file"]::file-selector-button{
          margin-right:12px; padding:8px 12px; border:none; border-radius:10px; background:#183060; color:#e5e7eb; cursor:pointer;
        }
        input[type="file"]::file-selector-button:hover{ background:#1b3972; }
        .progress-wrap{ margin-top:6px; font-size:12px; color:var(--muted); }
        progress{ width:100%; height:10px; border-radius:999px; overflow:hidden; -webkit-appearance:none; appearance:none; }
        progress::-webkit-progress-bar{ background:#0a1226; border-radius:999px; border:1px solid var(--border); }
        progress::-webkit-progress-value{ background: linear-gradient(90deg, var(--primary), var(--accent)); border-radius:999px; }
        .divider{ height:1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent); margin: 6px 0 14px; }
      `}</style>

      <div className="card">
        <h2>Register</h2>
        <p className="subtitle">Create a new student account</p>
        <div className="divider" />

        <form onSubmit={handleRegister} encType="multipart/form-data">
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <label>
            Date of Birth:
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
          </label>

          <input type="tel" placeholder="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} required />
          <input type="tel" placeholder="Emergency Contact Number" value={emergencyContactNumber} onChange={(e) => setEmergencyContactNumber(e.target.value)} required />
          <input type="text" placeholder="Relation to Emergency Contact" value={emergencyRelation} onChange={(e) => setEmergencyRelation(e.target.value)} required />

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="Admin">Admin</option>
            <option value="Employee">Student</option>
          </select>

          <label className="filewrap">
            Upload Photo:
            <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
          </label>

          {isUploadingPhoto && (
            <div className="progress-wrap">
              <div>Uploading photo… {uploadProgress}%</div>
              <progress value={uploadProgress} max="100" />
            </div>
          )}

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
