// src/components/AdminQRCode.jsx
import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const API_BASE = process.env.REACT_APP_API_BASE || "";
const TTL_SECONDS = 3; // matches your 5-minute refresh

export default function AdminQRCode() {
  const [token, setToken] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [qrSize, setQrSize] = useState(260);
  const canvasRef = useRef(null);

  // Responsive QR size
  useEffect(() => {
    const calcSize = () => {
      // Scale nicely on mobile, cap for desktop
      const vw = Math.min(window.innerWidth, 640); // clamp so huge screens don't oversize
      const size = Math.max(180, Math.min(360, Math.floor(vw * 0.7)));
      setQrSize(size);
    };
    calcSize();
    window.addEventListener("resize", calcSize);
    return () => window.removeEventListener("resize", calcSize);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function fetchToken() {
      setLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(`${API_BASE}/qr/token`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setToken(data.token || "");
        // If backend returns expires_in, use it; otherwise fall back to TTL_SECONDS
        const nextRemaining = typeof data.expires_in === "number" ? data.expires_in : TTL_SECONDS;
        setRemaining(nextRemaining);
      } catch (e) {
        if (!mounted) return;
        setToken("");
        setErrorMsg("Couldn’t fetch a QR token. Check your network or try again.");
        console.error("Failed to fetch /qr/token", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // Initial fetch
    fetchToken();

    // Auto-refresh every 5 minutes
    const refresh = setInterval(fetchToken, TTL_SECONDS * 1000);

    // Countdown timer
    const tick = setInterval(() => {
  setRemaining((s) => (s > 0 ? s - 1 : 0));
}, 1000);

    return () => {
      mounted = false;
      clearInterval(refresh);
      clearInterval(tick);
    };
  }, []);

  const handleManualRefresh = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE}/qr/token`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setToken(data.token || "");
      setRemaining(typeof data.expires_in === "number" ? data.expires_in : TTL_SECONDS);
    } catch (e) {
      setErrorMsg("Refresh failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      toastInline("Token copied!");
    } catch {
      toastInline("Copy failed");
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return toastInline("Nothing to download yet");
    const link = document.createElement("a");
    link.download = "attendance-qr.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const handleShare = async () => {
    if (!navigator.share) return toastInline("Sharing not supported on this device");
    try {
      await navigator.share({
        title: "Attendance QR",
        text: "Scan this code to mark attendance.",
        url: window.location.href,
      });
    } catch {
      /* user cancelled */
    }
  };

  // Lightweight inline toast (no extra deps here)
  const [toastMsg, setToastMsg] = useState("");
  const toastInline = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 1500);
  };

  const pct = Math.max(0, Math.min(100, Math.round(((remaining || 0) / TTL_SECONDS) * 100)));

  return (
    <>
      <style>{styles}</style>
      <div className="qr-screen">
        <header className="qr-header">
          <h1 className="qr-title">Attendance QR</h1>
          <p className="qr-subtitle">Auto-refresh every 5 minutes • Live countdown</p>
        </header>

        <main className="qr-card">
          {/* Progress bar */}
          <div className="qr-progress" aria-label="Time remaining">
            <div className="qr-progress-bar" style={{ width: `${pct}%` }} />
          </div>

          {/* Status row */}
          <div className="qr-status">
            <span className="qr-dot live" aria-hidden="true" />
            <span className="qr-status-text">
              {remaining > 0 ? `Expires in ${remaining}s` : "Expired — refresh to get a new code"}
            </span>
          </div>

          {/* QR area */}
          <div className="qr-canvas-wrap" ref={canvasRef} aria-live="polite">
            {loading ? (
              <div className="qr-skeleton" aria-label="Loading QR" />
            ) : token ? (
              <QRCodeCanvas value={token} size={qrSize} includeMargin />
            ) : (
              <div className="qr-empty">No QR available</div>
            )}
          </div>

          {/* Token preview (collapsible on mobile via wrap) */}
          <div className="qr-token">
            <div className="qr-token-label">Token</div>
            <div className="qr-token-value" title={token || ""}>
              {token || "—"}
            </div>
          </div>

          {/* Actions */}
          <div className="qr-actions">
            <button className="btn primary" onClick={handleManualRefresh} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh Now"}
            </button>
            <button className="btn" onClick={handleCopy} disabled={!token || loading}>
              Copy Token
            </button>
            <button className="btn" onClick={handleDownload} disabled={!token || loading}>
              Download PNG
            </button>
            <button className="btn ghost" onClick={handleShare}>
              Share
            </button>
          </div>
        </main>

        <footer className="qr-footer">
          <button className="link-btn" onClick={() => window.history.back()}>
            ← Back
          </button>
          <span className="qr-hint">Keep this page visible on a large screen for faster scanning.</span>
        </footer>

        {/* Tiny inline toast */}
        {toastMsg ? <div className="qr-toast">{toastMsg}</div> : null}
      </div>
    </>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

:root{
  --bg1:#020617;
  --bg2:#0f172a;
  --bg3:#1e3a8a;
  --card:#0b1224cc;
  --border:#33415580;
  --accent:#3b82f6;
  --accent-2:#2563eb;
  --text:#e2e8f0;
  --muted:#94a3b8;
  --ok:#22c55e;
  --warn:#f59e0b;
  --shadow:0 10px 40px rgba(0,0,0,.35);
}

*{box-sizing:border-box}
html,body,#root{height:100%}

.qr-screen{
  min-height:100vh;
  padding:24px 16px;
  display:flex;
  flex-direction:column;
  gap:16px;
  align-items:center;
  color:var(--text);
  font-family:'Poppins',system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,'Noto Sans',sans-serif;
  background: radial-gradient(1200px 700px at 10% -10%, #0b1324 10%, transparent 60%),
              linear-gradient(135deg,var(--bg1),var(--bg2),var(--bg3));
}

.qr-header{
  text-align:center;
  margin-top:4px;
}
.qr-title{
  margin:0 0 4px 0;
  font-weight:600;
  font-size:clamp(20px, 4vw, 28px);
  text-shadow:0 2px 6px rgba(0,0,0,.4);
}
.qr-subtitle{
  margin:0;
  font-size:14px;
  color:var(--muted);
}

.qr-card{
  width:min(720px, 100%);
  background:var(--card);
  border:1px solid var(--border);
  border-radius:16px;
  box-shadow:var(--shadow);
  padding:20px;
  display:flex;
  flex-direction:column;
  gap:16px;
  backdrop-filter: blur(10px);
}

/* progress */
.qr-progress{
  width:100%;
  height:8px;
  background:rgba(148,163,184,.15);
  border-radius:999px;
  overflow:hidden;
  border:1px solid rgba(148,163,184,.2);
}
.qr-progress-bar{
  height:100%;
  background:linear-gradient(90deg,var(--accent),var(--accent-2));
  transition:width .6s ease;
}

/* status */
.qr-status{
  display:flex;
  align-items:center;
  gap:8px;
  font-size:14px;
  color:var(--muted);
}
.qr-dot{
  width:10px;height:10px;border-radius:50%;
  background:var(--ok);
  box-shadow:0 0 8px rgba(34,197,94,.6);
}
.qr-dot.live{ animation:pulse 1.5s infinite }
@keyframes pulse{
  0%{ transform:scale(1); opacity:1 }
  50%{ transform:scale(1.25); opacity:.6 }
  100%{ transform:scale(1); opacity:1 }
}

/* QR area */
.qr-canvas-wrap{
  align-self:center;
  display:grid;
  place-items:center;
  width:100%;
  padding:8px;
}
.qr-skeleton{
  width:min(360px, 70vw);
  height:min(360px, 70vw);
  border-radius:12px;
  background:linear-gradient(90deg, #1f2937 0%, #2b3952 50%, #1f2937 100%);
  background-size:200% 100%;
  animation:shimmer 1.4s infinite;
  border:1px solid var(--border);
}
@keyframes shimmer{
  0%{ background-position:200% 0 }
  100%{ background-position:-200% 0 }
}
.qr-empty{
  padding:24px;
  color:var(--muted);
  border:1px dashed var(--border);
  border-radius:12px;
}

/* token row */
.qr-token{
  display:grid;
  grid-template-columns: 80px 1fr;
  gap:8px;
  align-items:center;
  font-size:14px;
  word-break:break-all;
}
.qr-token-label{
  color:var(--muted);
}
.qr-token-value{
  padding:10px 12px;
  border:1px solid var(--border);
  border-radius:10px;
  background:rgba(2,6,23,.35);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,"Liberation Mono","Courier New", monospace;
}

/* actions */
.qr-actions{
  display:grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap:10px;
}
.btn{
  appearance:none;
  border:none;
  border-radius:12px;
  padding:12px 14px;
  font-weight:600;
  color:var(--text);
  background:#1e293b;
  border:1px solid var(--border);
  box-shadow:0 4px 10px rgba(0,0,0,.25);
  cursor:pointer;
  transition:transform .15s ease, background .15s ease, border-color .15s ease, box-shadow .15s ease;
}
.btn:hover{
  transform:translateY(-2px);
  border-color:var(--accent);
  box-shadow:0 8px 20px rgba(59,130,246,.25);
}
.btn:active{ transform:translateY(-1px) }
.btn:disabled{
  opacity:.6;
  cursor:not-allowed;
  transform:none;
}
.btn.primary{
  background:linear-gradient(90deg,var(--accent),var(--accent-2));
  border-color:#3b82f680;
}
.btn.ghost{
  background:transparent;
}

/* footer */
.qr-footer{
  width:min(720px, 100%);
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:12px;
  color:var(--muted);
  font-size:13px;
}
.link-btn{
  background:none;
  border:none;
  color:#93c5fd;
  font-weight:600;
  cursor:pointer;
  padding:6px 8px;
  border-radius:8px;
}
.link-btn:hover{
  text-decoration:underline;
}

/* tiny toast */
.qr-toast{
  position:fixed;
  left:50%;
  bottom:24px;
  transform:translateX(-50%);
  background:#0b1224cc;
  color:var(--text);
  padding:10px 14px;
  border:1px solid var(--border);
  border-radius:10px;
  box-shadow:var(--shadow);
  backdrop-filter:blur(8px);
  z-index:50;
}

/* mobile tweaks */
@media (max-width: 520px){
  .qr-card{ padding:16px }
  .qr-actions{ grid-template-columns: 1fr }
  .qr-token{ grid-template-columns: 1fr; gap:6px }
  .qr-footer{ flex-direction:column; align-items:flex-start; gap:8px }
}
`;
