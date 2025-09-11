import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const API_BASE = process.env.REACT_APP_API_BASE || "";

export default function EmployeeQRScanner({ onVerified }) {
  const containerId = "qr-reader";
  const qrcodeRef = useRef(null);       // Html5Qrcode instance
  const startedRef = useRef(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | scanning | success | error

  // stop and clear helper
  const stopScanner = async () => {
    try {
      if (qrcodeRef.current) {
        if (startedRef.current) {
          await qrcodeRef.current.stop();
          startedRef.current = false;
        }
        await qrcodeRef.current.clear();
      }
    } catch {
      /* ignore */
    }
  };

  // stop tracks helper (if we warmed up permission)
  const stopTracks = (stream) => {
    try { stream?.getTracks()?.forEach(t => t.stop()); } catch {}
  };

  useEffect(() => {
    const run = async () => {
      setMessage("");
      setStatus("idle");

      // 1) Require HTTPS for camera on mobile
      if (!window.isSecureContext) {
        setStatus("error");
        setMessage("❌ Camera requires HTTPS. Open this page over https://");
        return;
      }

      // 2) Ensure container exists in JSX (no manual DOM creation needed)
      const el = document.getElementById(containerId);
      if (!el) {
        setStatus("error");
        setMessage("❌ Scanner container not found.");
        return;
      }

      // 3) Create instance
      qrcodeRef.current = new Html5Qrcode(containerId, /* verbose */ false);

      // 4) Warm-up permission on Android (some versions need a direct gUM call)
      try {
        const warm = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        stopTracks(warm);
      } catch {
        // ignore; we'll still try to start
      }

      setStatus("scanning");
      setMessage("Opening camera…");

      // 5) decode handler
      const onSuccess = async (decodedText /*, decodedResult */) => {
        await stopScanner();
        setStatus("idle");
        try {
          const res = await fetch(`${API_BASE}/qr/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: decodedText }),
          });
          const json = await res.json().catch(() => ({}));
          if (res.ok && json?.success) {
            setStatus("success");
            setMessage("✅ QR verified");
            onVerified?.();
          } else {
            setStatus("error");
            setMessage(`❌ ${json?.message || "Invalid QR"}`);
          }
        } catch (e) {
          setStatus("error");
          setMessage("❌ QR verify request failed (network/CORS).");
        }
      };

      // 6) Try to pick a rear camera; fall back gracefully
      const startWith = async (constraints) => {
        await qrcodeRef.current.start(
          constraints,
          {
            fps: 24,
            // leave qrbox undefined for broader compatibility on Android
            disableFlip: true,
            experimentalFeatures: { useBarCodeDetectorIfSupported: true },
          },
          onSuccess,
          () => {} // ignore per-frame decode errors
        );
        startedRef.current = true;

        // iOS inline playback hint (harmless elsewhere)
        setTimeout(() => {
          const v = el.querySelector("video");
          if (v) {
            v.setAttribute("playsinline", "true");
            v.muted = true;
            v.play?.().catch(() => {});
          }
        }, 200);
      };

      try {
        // a) facingMode: environment (most reliable on Android)
        await startWith({ facingMode: { ideal: "environment" } });
      } catch (e1) {
        try {
          // b) choose a likely back camera from the device list
          const cams = await Html5Qrcode.getCameras();
          if (cams?.length) {
            let back = cams.find(c => /back|rear|environment/i.test(c.label));
            if (!back && cams.length > 1) back = cams[1];
            const chosen = (back || cams[0]).id;
            // NOTE: avoid { exact } on some Androids; it can blank the preview
            await startWith({ deviceId: chosen });
          } else {
            throw e1;
          }
        } catch (e2) {
          // c) last resort: front camera
          await startWith({ facingMode: "user" });
        }
      }
    };

    run();

    // cleanup
    return () => {
      stopScanner();
    };
  }, [onVerified]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Scan Admin QR</h2>
      {/* The scanner renders into this div. Do not create elements manually. */}
      <div id={containerId} style={{ width: "100%", maxWidth: 480, minHeight: 320 }} />
      {status === "scanning" && <p>Opening camera…</p>}
      {!!message && <p style={{ marginTop: 8 }}>{message}</p>}
    </div>
  );
}
