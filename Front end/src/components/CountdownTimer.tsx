import { useEffect, useState } from "react";

export default function CountdownTimer() {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 7); // 7 days timer

  const [timeLeft, setTimeLeft] = useState(targetDate.getTime() - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(targetDate.getTime() - Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const days = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((timeLeft / (1000 * 60 * 60)) % 24));
  const mins = Math.max(0, Math.floor((timeLeft / (1000 * 60)) % 60));
  const secs = Math.max(0, Math.floor((timeLeft / 1000) % 60));

  return (
    <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 text-center font-bold text-amber-900 shadow">
      ⏳ Phase-1 ends in: {days}d {hours}h {mins}m {secs}s
    </div>
  );
}
