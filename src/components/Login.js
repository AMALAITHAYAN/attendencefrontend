// src/components/Login.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // ✅ DO NOT CHANGE: keeps your API connection intact
      const response = await axios.post('http://localhost:8080/api/employees/login', {
        email,
        password,
      });

      const { role, name } = response.data;

      setNotification(`Login successful! Welcome ${name}.`);
      setIsError(false);

      // ✅ DO NOT CHANGE: persist the same payload
      localStorage.setItem('user', JSON.stringify(response.data));

      setTimeout(() => {
        // ✅ DO NOT CHANGE: same routing by role
        if (role === 'Admin') {
          navigate('/Dashboard');
        } else if (role === 'Employee') {
          navigate('/employee-dashboard');
        } else {
          setNotification('Unknown role!');
          setIsError(true);
        }
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      setIsLoading(false);
      setIsError(true);
      if (error.response && error.response.status === 401) {
        setNotification('Invalid email or password.');
      } else {
        setNotification('An error occurred during login.');
      }
    }
  };

  const onPasswordKey = (e) => {
    const isCaps =
      e.getModifierState &&
      (e.getModifierState('CapsLock') || e.getModifierState('Caps Lock'));
    setCapsOn(!!isCaps);
  };

  return (
    <>
      <style>
        {`
        :root{
          --bg:#0b0f14;
          --card:#0f1620;
          --muted:#94a3b8;
          --text:#e6edf3;
          --brand: #7c3aed; /* violet-600 */
          --brand-2: #06b6d4; /* cyan-500 */
          --success:#22c55e;
          --danger:#ef4444;
          --input:#18202b;
          --border:#243041;
          --ring: rgba(124, 58, 237, .35);
        }

        *{ box-sizing:border-box; }
        html, body, #root { height:100%; }
        body {
          margin:0;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
          background: radial-gradient(1100px 700px at 20% -10%, rgba(124,58,237,.15), transparent 60%),
                      radial-gradient(900px 600px at 110% 20%, rgba(6,182,212,.12), transparent 50%),
                      var(--bg);
          color: var(--text);
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .page {
          min-height: 100dvh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* soft grid background lines */
        .grid::before{
          content:'';
          position:absolute; inset:0;
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px);
          background-size: 36px 36px;
          mask-image: radial-gradient(closest-side, #000 60%, transparent);
          pointer-events:none;
        }

        .card {
          width:100%;
          max-width: 440px;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%) , var(--card);
          border: 1px solid var(--border);
          border-radius: 20px;
          backdrop-filter: saturate(140%) blur(6px);
          box-shadow:
            0 8px 30px rgba(0,0,0,.45),
            0 0 0 1px rgba(255,255,255,.03) inset;
          overflow: clip;
          animation: rise .4s ease-out;
        }

        @keyframes rise {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .card__head {
          padding: 28px 28px 18px;
          display:flex; flex-direction:column; gap:12px; align-items:center; text-align:center;
          background:
           radial-gradient(400px 140px at 50% -30%, rgba(124,58,237,.25), transparent 70%),
           radial-gradient(380px 120px at 10% -10%, rgba(6,182,212,.18), transparent 60%);
          border-bottom:1px solid var(--border);
        }

        .brand {
          width:62px; height:62px; border-radius:16px;
          display:grid; place-items:center;
          background:
            conic-gradient(from 180deg at 50% 50%, var(--brand), var(--brand-2), var(--brand));
          position: relative;
          box-shadow: 0 12px 30px rgba(124,58,237,.35);
          isolation:isolate;
        }
        .brand::after{
          content:'';
          position:absolute; inset:2px; border-radius:14px;
          background: linear-gradient(180deg, rgba(0,0,0,.25), rgba(255,255,255,.06));
        }
        .brand__glyph{
          position:relative; z-index:1;
          width:20px; height:20px; border-radius:4px; background:white;
          box-shadow:
            0 -6px 0 0 var(--brand-2),
            0 6px 0 0 var(--brand-2);
        }

        .title { font-size: 24px; font-weight: 800; letter-spacing: -0.3px; }
        .subtitle { font-size: 13px; color: var(--muted); }

        .card__body { padding: 22px; }
        .form { display:grid; gap:16px; }

        .group { display:grid; gap:8px; }
        .label { font-size: 13px; font-weight: 600; }

        .input-wrap {
          position:relative;
        }
        .input {
          width:100%;
          appearance:none;
          border:1px solid var(--border);
          background: var(--input);
          color: var(--text);
          padding: 14px 44px 14px 44px;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: box-shadow .15s ease, border-color .15s ease, background .15s ease, transform .02s ease;
        }
        .input:focus {
          border-color: var(--brand);
          box-shadow: 0 0 0 6px var(--ring);
          background: #121a24;
        }
        .input:disabled { opacity:.6; cursor:not-allowed; }

        .left-icon {
          position:absolute; top:50%; left:12px; translate:0 -50%;
          width:18px; height:18px; opacity:.7;
        }

        .right-btn {
          position:absolute; top:50%; right:10px; translate:0 -50%;
          border:none; background:transparent; color: var(--muted);
          font-size:12px; padding:6px 8px; border-radius:8px; cursor:pointer;
        }
        .right-btn:hover { color: var(--text); }

        .hint { color: var(--muted); font-size: 12px; margin-top: 4px; }
        .hint--warn { color: #fbbf24; }

        .submit {
          width:100%;
          border:none;
          border-radius: 12px;
          padding: 14px;
          font-weight: 700;
          font-size: 15px;
          background: linear-gradient(90deg, var(--brand), var(--brand-2));
          color:white;
          cursor:pointer;
          transition: transform .06s ease, box-shadow .2s ease;
          box-shadow: 0 10px 24px rgba(124,58,237,.35), 0 4px 10px rgba(6,182,212,.2);
        }
        .submit:hover:not(:disabled){ transform: translateY(-1px); }
        .submit:active:not(:disabled){ transform: translateY(0); }
        .submit:disabled{ opacity:.7; cursor:not-allowed; box-shadow:none; }

        .footer {
          margin-top: 8px;
          text-align:center;
          color: var(--muted);
          font-size: 14px;
        }
        .footer a {
          color: var(--brand-2);
          text-decoration: none;
          font-weight: 600;
        }
        .footer a:hover { text-decoration: underline; }

        /* Notification */
        .toast {
          position: fixed;
          top: 16px; left: 50%; translate: -50% 0;
          display:flex; align-items:center; gap:10px;
          padding: 12px 14px;
          border-radius: 12px;
          font-size: 14px; font-weight: 600;
          border:1px solid var(--border);
          background: rgba(17, 24, 39, 0.85);
          backdrop-filter: blur(6px) saturate(140%);
          box-shadow: 0 12px 30px rgba(0,0,0,.45);
          z-index: 50;
          animation: drop .25s ease-out;
        }
        .toast--ok { border-color: rgba(34,197,94,.45); }
        .toast--bad { border-color: rgba(239,68,68,.5); }
        .dot {
          width:10px; height:10px; border-radius:50%;
        }
        .dot.ok { background: var(--success); }
        .dot.bad { background: var(--danger); }

        @keyframes drop { from { opacity:0; transform: translate(-50%, -8px); } to { opacity:1; transform: translate(-50%, 0); } }

        /* Mobile adjustments */
        @media (max-width: 420px){
          .card{ border-radius:16px; }
          .title{ font-size:22px; }
          .input{ font-size:16px; padding: 16px 48px; } /* avoid iOS zoom */
          .submit{ font-size:16px; padding: 16px; }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce){
          *{ animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
        }
      `}
      </style>

      {/* Notifications */}
      {notification && (
        <div className={`toast ${isError ? 'toast--bad' : 'toast--ok'}`} role="status" aria-live="polite">
          <span className={`dot ${isError ? 'bad' : 'ok'}`} />
          <span>{notification}</span>
        </div>
      )}

      <div className="page grid">
        <div className="card" role="region" aria-labelledby="login-title">
          <header className="card__head">
            <div className="brand"><div className="brand__glyph" /></div>
            <h1 id="login-title" className="title">AttendEase</h1>
            <p className="subtitle">Student Attendance Management System</p>
          </header>

          <main className="card__body">
            <form className="form" onSubmit={handleLogin} noValidate>
              {/* Email */}
              <div className="group">
                <label htmlFor="email" className="label">Email Address</label>
                <div className="input-wrap">
                  <svg className="left-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.6" aria-hidden="true">
                    <path d="M4 6h16v12H4z" />
                    <path d="M4 7l8 6 8-6" />
                  </svg>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label htmlFor="password" className="label">Password</label>
                <div className="input-wrap">
                  <svg className="left-icon" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.6" aria-hidden="true">
                    <rect x="5" y="10" width="14" height="10" rx="2" />
                    <path d="M8 10V8a4 4 0 0 1 8 0v2" />
                  </svg>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                    onKeyUp={onPasswordKey}
                    onKeyDown={onPasswordKey}
                  />
                  <button
                    type="button"
                    className="right-btn"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    disabled={isLoading}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {capsOn && <div className="hint hint--warn">Caps Lock is ON</div>}
              </div>

              {/* Submit */}
              <button type="submit" className="submit" disabled={isLoading} aria-busy={isLoading}>
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>

              {/* Footer */}
              <div className="footer">
                Don&apos;t have an account?
                {' '}
                <a href="/register">Register here</a>
              </div>
            </form>
          </main>
        </div>
      </div>
    </>
  );
};

export default Login;
