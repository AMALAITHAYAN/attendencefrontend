import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

const API_BASE = process.env.REACT_APP_API_BASE || "";

export default function EmployeeQRScanner({ onVerified }) {
  const scannerRef = useRef(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle"); // idle | scanning | success | error

  useEffect(() => {
    // Create container
    if (!scannerRef.current) {
      scannerRef.current = document.createElement("div");
      scannerRef.current.id = "qr-reader";
      document.getElementById("qr-reader-root").appendChild(scannerRef.current);
    }

    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 }, false);
    setStatus("scanning");

    scanner.render(
      async (decodedText) => {
        try {
          // stop scanning as soon as we have a code
          await scanner.clear();
          setStatus("idle");

          const res = await fetch(`${API_BASE}/qr/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: decodedText }),
          });

          const json = await res.json();
          if (json?.success) {
            setStatus("success");
            setMessage("✅ QR verified");
            if (onVerified) onVerified();
          } else {
            setStatus("error");
            setMessage(`❌ ${json?.message || "Invalid QR"}`);
          }
        } catch (e) {
          setStatus("error");
          setMessage("❌ Failed to verify QR");
        }
      },
      // ignore scan errors (blurry frames etc.)
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
      const root = document.getElementById("qr-reader-root");
      if (root) root.innerHTML = "";
      scannerRef.current = null;
    };
  }, [onVerified]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Scan Admin QR</h2>
      <div id="qr-reader-root" />
      {status === "scanning" && <p>Opening camera…</p>}
      {!!message && <p style={{ marginTop: 8 }}>{message}</p>}
    </div>
  );
}
