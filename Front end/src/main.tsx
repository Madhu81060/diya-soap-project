import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// 🔔 Toast import
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
      {/* ✅ Toast container (one-time setup) */}
      <Toaster position="top-right" reverseOrder={false} />
    </HelmetProvider>
  </StrictMode>
);
