import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 🔔 Toast import
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    {/* ✅ Toast container (one-time setup) */}
    <Toaster position="top-right" reverseOrder={false} />
  </StrictMode>
);
