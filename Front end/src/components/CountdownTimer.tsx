import { useEffect, useState } from "react";

export default function CountdownTimer() {
  const [target] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.getTime();
  });

  const [timeLeft, setTimeLeft] = useState(target - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(target - Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);

  const days  = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((timeLeft / (1000 * 60 * 60)) % 24));
  const mins  = Math.max(0, Math.floor((timeLeft / (1000 * 60)) % 60));
  const secs  = Math.max(0, Math.floor((timeLeft / 1000) % 60));

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #fffbeb, #fef9c3)",
        border: "1.5px solid #fbbf24",
        borderRadius: 16,
        padding: "16px 20px",
        textAlign: "center",
        fontFamily: "'Nunito','Segoe UI',sans-serif",
        boxShadow: "0 4px 16px rgba(251,191,36,0.15)",
      }}
    >
      <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, color: "#d97706", letterSpacing: "0.2em", textTransform: "uppercase" }}>
        ⏳ Phase-1 Ends In
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
        {[
          { val: days,  label: "Days" },
          { val: hours, label: "Hrs" },
          { val: mins,  label: "Min" },
          { val: secs,  label: "Sec" },
        ].map(({ val, label }) => (
          <div key={label} style={{ background: "#fff", border: "1.5px solid #fde68a", borderRadius: 12, padding: "8px 12px", minWidth: 52, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "#d97706", lineHeight: 1 }}>
              {String(val).padStart(2, "0")}
            </p>
            <p style={{ margin: "3px 0 0", fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase" }}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}