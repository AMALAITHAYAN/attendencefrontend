import React, { useState, useRef, useEffect } from 'react';
/* removed external CSS per request */
import logo from './assets/logo.png';
import axios from 'axios';
import { getDistance } from 'geolib';
import { Html5Qrcode } from 'html5-qrcode'; // low-level API for full-screen
import {
  MapPin,
  MapPinCheck,
  LocateFixed,
  Video,
  Camera,
  CheckCircle2,
  LogOut,
  UserRound,
  Clock4,
  IdCard,
  AlertCircle,
  CheckSquare,
  XCircle,
  Loader2
} from 'lucide-react';

/** Backends */
const API_BASE  = process.env.REACT_APP_API_BASE  || 'http://127.0.0.1:8000';   // QR/attendance API
const WIFI_BASE = process.env.REACT_APP_WIFI_BASE || 'https://4a94b6e818b2.ngrok-free.app'; // Flask Wi-Fi API (ngrok URL in prod)

const companyLocation = {
  latitude: 10.95414445334311,
  longitude: 76.95958714809733
};

const OVERLAY_ID = 'qr-fullscreen-overlay';
const VIDEO_ID = 'qr-fullscreen-video';

const EmployeeDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [attendanceId, setAttendanceId] = useState(null);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('idle'); // idle | location | camera | verifyingFace | confirmed | qr
  const [snapshot, setSnapshot] = useState(null);
  const videoRef = useRef(null);

  // html5-qrcode instance for full-screen overlay
  const qrRef = useRef(null);

  useEffect(() => {
    // cleanup on unmount
    return () => {
      stopCamera();
      stopQRScan();
    };
  }, []);

  const WIFI_BASE =
  process.env.REACT_APP_WIFI_BASE || 'https://4a94b6e818b2.ngrok-free.app';

const STUDENT_ID = encodeURIComponent(user?.rollNo || user?.id || 'S001');
const TEACHER_ID = 'T001';

const verifyWifiThenLocation = async () => {
  setMessage('Checking Wi-Fi…');
  try {
    const url = `${WIFI_BASE}/student/${STUDENT_ID}/${TEACHER_ID}` +
                `?ngrok-skip-browser-warning=1&t=${Date.now()}`;

    const res = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: { 'ngrok-skip-browser-warning': '1', 'Accept': 'application/json' }
    });

    if (!res.ok) {
      if (res.status === 404) {
        setMessage('❌ No teacher session found. Ask the teacher to press “Start Session”.');
        return;
      }
      const text = await res.text().catch(() => '');
      setMessage(`❌ Wi-Fi check failed (HTTP ${res.status}). ${text.slice(0,120)}`);
      return;
    }

    // Try JSON even if content-type is off
    let data;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      try { data = JSON.parse(text); }
      catch {
        setMessage(`❌ Wi-Fi check: unexpected response type. ${text.slice(0,120)}`);
        return;
      }
    }

    if (data.ok) {
      setMessage('✅ Wi-Fi paired. Verifying location…');
      verifyLocation();
    } else {
      setMessage(`❌ Wi-Fi not connected: ${data.reason || 'Different network'}.`);
    }
  } catch (err) {
    console.error(err);
    setMessage('❌ Wi-Fi check failed (network/CORS).');
  }
};


  const verifyLocation = () => {
    setMessage('Verifying location...');
    setStep('location');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const distance = getDistance({ latitude, longitude }, companyLocation);

        if (distance <= 1000) {
          setMessage('✅ Location verified.');
          setStep('camera');
          startCamera();
        } else {
          setMessage('❌ You are not at the office location.');
          setStep('idle');
        }
      },
      () => { setMessage('❌ Location access denied.'); setStep('idle'); }
    );
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setMessage('❌ Camera access denied.');
    }
  };

// --- capture a JPEG blob straight from canvas ---
const captureFace = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

  // Create a real JPEG blob (quality ~85%)
  canvas.toBlob(async (blob) => {
    if (!blob) {
      setMessage('❌ Could not capture image.');
      return;
    }
    // Preview
    setSnapshot(URL.createObjectURL(blob));
    // Verify
    await verifyFace(blob);
  }, 'image/jpeg', 0.85);
};

const verifyFace = async (blob) => {
  try {
    const formData = new FormData();
    // Make sure the field name matches your Spring controller: @RequestParam("image")
    formData.append('image', blob, 'face.jpg');

    setStep('verifyingFace');
    setMessage('Verifying face…');

    const res = await axios.post(
      'https://backendattendance-1.onrender.com/api/face/checkin',
      formData,
      {
        // DO NOT set Content-Type; browser adds boundary automatically
        timeout: 120000, // 120s to survive Render cold starts
        // onUploadProgress: (e) => console.log('upload', e.loaded, e.total)
      }
    );

    const body = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);

    if (body.includes('Not Matched')) {
      setMessage('❌ Face not matched. Access denied.');
      setStep('idle');
      stopCamera();
      return;
    }

    setMessage(`✅ Face match result: ${body}`);
    setStep('confirmed'); // proceed to QR
  } catch (err) {
    // Show as much detail as we can
    const serverMsg = err?.response?.data
      ? (typeof err.response.data === 'string'
          ? err.response.data
          : JSON.stringify(err.response.data))
      : err?.message || 'Unknown error';

    setMessage(`❌ Face verification failed. ${serverMsg}`);
    console.error('face-checkin error:', err);
    setStep('idle');
    stopCamera();
  }
};


  // ---------- Full-screen QR step ----------
// ---------- Full-screen QR step (mobile rear camera + single stream) ----------
// ---------- Full-screen QR step (mobile rear camera + single stream) ----------
const startQRScan = async () => {
  setStep('qr');

  // Make sure we’re on HTTPS (mobile won’t allow camera otherwise)
  if (!window.isSecureContext) {
    setMessage('❌ Camera requires HTTPS on mobile. Open this page over https://');
    return;
  }

  // 🔒 IMPORTANT: stop the face camera stream before starting QR scanner
  stopCamera();

  setMessage('Open camera to scan the admin QR…');

  // Build overlay once
  let overlay = document.getElementById(OVERLAY_ID);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = OVERLAY_ID;
    overlay.innerHTML = `
      <div class="qr-overlay-inner">
        <div class="qr-topbar">
          <span>Scan the Admin QR</span>
          <button id="qr-close-btn" class="qr-close">Close</button>
        </div>
        <div id="${VIDEO_ID}"></div>
        <div class="qr-help">Point your camera at the QR code</div>
      </div>
    `;
    document.body.appendChild(overlay);

    const style = document.createElement('style');
    style.textContent = `
      #${OVERLAY_ID}{ position:fixed; inset:0; z-index:9999; background:#000; color:#fff;
        display:grid; grid-template-rows:auto 1fr auto; }
      #${OVERLAY_ID} .qr-overlay-inner{ display:grid; grid-template-rows:auto 1fr auto; height:100vh; }
      #${OVERLAY_ID} .qr-topbar{ display:flex; align-items:center; justify-content:space-between;
        padding:12px 16px; background:rgba(0,0,0,.4); font-weight:700; }
      #${OVERLAY_ID} .qr-close{ background:rgba(255,255,255,.12); color:#fff; border:1px solid rgba(255,255,255,.25);
        border-radius:10px; padding:8px 12px; cursor:pointer; font-weight:800; }
      #${OVERLAY_ID} #${VIDEO_ID}{ width:100vw; height:calc(100vh - 120px); }
      #${OVERLAY_ID} .qr-help{ text-align:center; padding:10px; opacity:.75; }
      #${VIDEO_ID} video{ width:100% !important; height:100% !important; object-fit:cover; }
      #${OVERLAY_ID}::after{ content:""; position:absolute; left:10%; right:10%; top:50%;
        height:2px; background:rgba(0,255,128,.6); box-shadow:0 0 12px rgba(0,255,128,.8);
        transform:translateY(-1px); }
    `;
    document.head.appendChild(style);

    overlay.querySelector('#qr-close-btn').addEventListener('click', () => {
      stopQRScan();
      setStep('confirmed');
      setMessage('QR scan cancelled.');
    });
  }

  // If already running, stop first
  await stopQRScan(false);

  const html5QrCode = new Html5Qrcode(VIDEO_ID, /* verbose */ false);
  qrRef.current = html5QrCode;

  try {
    // 🎯 Prefer rear camera on mobile
    const cameras = await Html5Qrcode.getCameras();
    if (!cameras || cameras.length === 0) {
      setMessage('❌ No camera found on this device.');
      return;
    }
    let backCam = cameras.find(c => /back|rear|environment/i.test(c.label));
    if (!backCam && cameras.length > 1) backCam = cameras[1];
    const deviceId = (backCam || cameras[0]).id;

    await html5QrCode.start(
      { deviceId: { exact: deviceId } },          // force this lens
      { fps: 24, qrbox: { width: 260, height: 260 } },
      async (decodedText) => {
        await stopQRScan(false);
        try {
          const resp = await fetch(`${API_BASE}/qr/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: decodedText })
          });
          if (!resp.ok) {
            let details = 'Failed to verify QR';
            try { const errJson = await resp.json(); if (errJson?.message) details = errJson.message; } catch {}
            setMessage(`❌ ${details}`);
            setStep('confirmed');
            await stopQRScan(true);
            return;
          }
          const json = await resp.json();
          if (json?.success) {
            setMessage('✅ QR verified. Completing check-in…');
            await stopQRScan(true);
            await checkIn();
          } else {
            setMessage(`❌ ${json?.message || 'Invalid QR'}`);
            setStep('confirmed');
            await stopQRScan(true);
          }
        } catch (e) {
          const hint = e?.message?.includes('Failed to fetch')
            ? 'Network/CORS error. Is the server reachable?'
            : e?.message || 'Unknown error';
          setMessage(`❌ QR verify request failed. ${hint}`);
          setStep('confirmed');
          await stopQRScan(true);
        }
      },
      () => {} // ignore per-frame errors
    );

    // iOS: keep inline, avoid full-screen video
    setTimeout(() => {
      const v = document.querySelector(`#${VIDEO_ID} video`);
      if (v) { v.setAttribute('playsinline','true'); v.setAttribute('webkit-playsinline','true'); v.muted = true; }
    }, 250);

  } catch (err) {
    console.error('QR start error:', err);
    const msg = (err && err.name === 'NotAllowedError')
      ? 'Camera permission denied. Enable camera access in site settings.'
      : 'Could not start camera for QR scan.';
    setMessage(`❌ ${msg}`);
    setStep('confirmed');
    await stopQRScan(false);
  }
};

const stopQRScan = async (removeOverlay = true) => {
  try {
    if (qrRef.current) {
      await qrRef.current.stop();
      await qrRef.current.clear();
      qrRef.current = null;
    }
  } catch {}
  if (removeOverlay) {
    const overlay = document.getElementById(OVERLAY_ID);
    if (overlay) overlay.remove();
  }
};

  const checkIn = async () => {
    try {
      const res = await axios.post(`https://backendattendance-1.onrender.com/api/attendance/checkin/${user.id}`, {
        snapshot
      });
      setAttendanceId(res.data.id);
      setMessage('✅ Checked in successfully.');
      stopCamera();
      setStep('idle'); // <-- back to dashboard idle
    } catch (err) {
      const serverMsg = typeof err?.response?.data === 'string'
        ? err.response.data
        : err?.response?.data?.message || 'Already checked in today.';
      setMessage(`❌ ${serverMsg}`);
      // After a failed check-in attempt, allow user to retry scan if needed
      setStep('confirmed');
    }
  };

  const checkOut = async () => {
    if (!attendanceId) {
      setMessage('⚠️ You need to check in first.');
      return;
    }
    try {
      await axios.post(`https://backendattendance-1.onrender.com/api/attendance/checkout/${attendanceId}`);
      setMessage('✅ Checked out successfully.');
    } catch (err) {
      setMessage('❌ Failed to check out.');
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((track) => track.stop());
  };

  const logout = () => {
    stopCamera();
    stopQRScan();
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="dashboard-bg">
      <style>{`
        :root{
          --bg:#070b16; --bg2:#0b1224; --card:#0c142a; --card2:#0a1226;
          --text:#e8eef6; --muted:#a4b1c8;
          --border:#1b2a4a; --ring:rgba(99,102,241,.25);
          --primary:#8b5cf6; --accent:#06b6d4; --danger:#ef4444; --success:#10b981; --warn:#f59e0b;
        }
        *{box-sizing:border-box}
        html,body,#root{height:100%}
        .dashboard-bg{
          min-height:100dvh; padding:16px; display:flex; flex-direction:column; gap:16px;
          background:
            radial-gradient(900px 420px at 20% -10%, rgba(27,39,80,.7), transparent 60%),
            radial-gradient(900px 520px at 100% 0%, rgba(6,182,212,.18), transparent 55%),
            linear-gradient(160deg, #060c1a 0%, var(--bg2) 40%, #071022 100%);
          color:var(--text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
        }
        .dashboard-header{
          display:flex; align-items:center; gap:12px; padding:12px;
          border:1px solid var(--border); border-radius:16px;
          background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.015));
          backdrop-filter: blur(8px);
        }
        .dashboard-logo{
          width:42px; height:42px; border-radius:10px; object-fit:contain;
          background:#0e1730; padding:6px; border:1px solid var(--border);
        }
        .dashboard-header h1{
          font-size:18px; margin:0; font-weight:800; letter-spacing:.2px;
          display:flex; align-items:center; gap:8px;
        }
        .dashboard-container{
          display:grid; gap:16px;
          border:1px solid var(--border); border-radius:18px;
          padding:18px;
          background: linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.015));
          backdrop-filter: blur(8px);
        }
        .dashboard-subtitle{
          margin:0; color:var(--muted); font-size:14px; text-align:left;
        }

        .cards{
          display:grid; grid-template-columns: repeat(3, 1fr); gap:12px;
        }
        .card{
          border:1px solid var(--border); border-radius:16px; padding:14px; display:grid; gap:8px;
          background: linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.01));
        }
        .card h3{ margin:0; font-size:14px; color:var(--muted); font-weight:700; letter-spacing:.2px; }
        .stat{
          display:flex; align-items:center; gap:10px; font-size:14px;
        }
        .chip{
          display:inline-flex; gap:6px; align-items:center;
          padding:6px 10px; border-radius:999px; font-size:12px; font-weight:700; letter-spacing:.2px;
          border:1px solid var(--border); color:#d1e4ff; background: rgba(11, 48, 120, .25);
        }
        .buttons{
          display:flex; flex-wrap:wrap; gap:10px; align-items:center;
        }
        .btn{
          display:inline-flex; align-items:center; gap:8px;
          padding:10px 12px; border:none; border-radius:12px; cursor:pointer; color:#fff; font-weight:800; letter-spacing:.2px;
          background: linear-gradient(90deg, var(--primary) 0%, var(--accent) 100%);
          box-shadow: 0 12px 32px rgba(6,182,212,.22);
          transition: transform .05s ease, box-shadow .2s ease, opacity .2s;
        }
        .btn:hover{ box-shadow: 0 18px 44px rgba(6,182,212,.28); }
        .btn:active{ transform: translateY(1px); }
        .btn[disabled]{ opacity:.65; cursor:not-allowed; }

        .btn.secondary{
          background: linear-gradient(90deg, #2e3350 0%, #25304a 100%);
        }
        .btn.danger{ background: linear-gradient(90deg, #c2410c 0%, #ef4444 100%); }
        .btn.success{ background: linear-gradient(90deg, #0ea5e9 0%, #10b981 100%); }
        .btn.warn{ background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%); }

        .media{
          display:grid; gap:8px; justify-items:center;
          border:1px dashed var(--border); border-radius:14px; padding:12px; background: rgba(12,20,42,.35);
        }
        .media video{ width:100%; max-width:420px; height:auto; border-radius:12px; border:1px solid var(--border); background:#000; }
        .media img{ width:200px; height:auto; border-radius:12px; border:1px solid var(--border); }

        .message{
          margin-top:6px; font-weight:700; color:#e6f0ff;
          display:flex; align-items:center; gap:8px;
        }
        .message.error{ color:#fecaca; }
        .message.success{ color:#d1fae5; }
        .message.warn{ color:#fde68a; }

        @keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }

        /* Responsive */
        @media (max-width: 900px){
          .cards{ grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px){
          .dashboard-header{ padding:10px; }
          .dashboard-header h1{ font-size:16px; }
          .dashboard-container{ padding:14px; }
          .cards{ grid-template-columns: 1fr; }
          .buttons{ gap:8px; }
          .btn{ width:100%; justify-content:center; }
        }
      `}</style>

      {/* Header */}
      <div className="dashboard-header">
        <img src={logo} alt="Company Logo" className="dashboard-logo" />
        <h1>
          <UserRound size={18} />
          Welcome, {user?.name || 'Employee'}
        </h1>
      </div>

      {/* Content */}
      <div className="dashboard-container">
        <p className="dashboard-subtitle">This is your Attendance Dashboard</p>

        {/* Top stats / status */}
        <div className="cards">
          <div className="card">
            <h3>Status</h3>
            <div className="stat">
              <MapPin size={16} />
              <span>Office Radius: <span className="chip"><LocateFixed size={14}/> 1 km</span></span>
            </div>
          </div>
          <div className="card">
            <h3>Attendance</h3>
            <div className="stat">
              <Clock4 size={16} />
              <span>Session: {attendanceId ? <span className="chip"><CheckSquare size={14}/> Active</span> : <span className="chip"><XCircle size={14}/> None</span>}</span>
            </div>
          </div>
          <div className="card">
            <h3>Profile</h3>
            <div className="stat">
              <IdCard size={16} /><span>ID: {user?.id ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="buttons">
          {step === 'idle' && (
            <button className="btn" onClick={verifyWifiThenLocation}>
              <MapPinCheck size={16} /> Start Check-In
            </button>
          )}
          {step === 'location' && (
            <button className="btn secondary" disabled>
              <Loader2 size={16} className="spin" style={{animation: 'spin 1s linear infinite'}} /> Verifying Location…
            </button>
          )}

          {step === 'camera' && (
            <>
              <div className="media">
                <Video size={16} />
                <video ref={videoRef} autoPlay width="320" height="240" />
                <button className="btn success" onClick={captureFace}>
                  <Camera size={16} /> Capture Face
                </button>
              </div>
            </>
          )}

          {step === 'verifyingFace' && (
            <button className="btn secondary" disabled>
              <Loader2 size={16} className="spin" style={{animation: 'spin 1s linear infinite'}} /> Verifying Face…
            </button>
          )}

          {step === 'confirmed' && (
            <>
              <div className="media">
                <img src={snapshot} alt="Captured Face" width="200" />
                <button className="btn" onClick={startQRScan}>
                  <CheckCircle2 size={16} /> Scan QR to Confirm
                </button>
              </div>
            </>
          )}

          {/* No small box anymore — full-screen overlay handles the UI */}
          {step === 'qr' && (
            <div className="message">
              <span>Camera opened in full-screen for scanning…</span>
            </div>
          )}

          <button className="btn secondary" onClick={checkOut} disabled={!attendanceId}>
            <Clock4 size={16} /> Check Out
          </button>

          <button className="btn secondary" onClick={() => (window.location.href = '/employee-profile')}>
            <UserRound size={16} /> My Profile
          </button>

          <button className="btn danger" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        </div>

        {message && (
          <p
            className={
              'message ' +
              (message.startsWith('✅') ? 'success ' : '') +
              (message.startsWith('❌') ? 'error ' : '') +
              (message.startsWith('⚠️') ? 'warn ' : '')
            }
          >
            {message.startsWith('✅') ? <CheckCircle2 size={16}/> :
             message.startsWith('❌') ? <AlertCircle size={16}/> :
             message.startsWith('⚠️') ? <AlertCircle size={16}/> : null}
            <span>{message}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;









