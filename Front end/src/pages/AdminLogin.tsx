import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminAuth } from "../auth/adminAuth";
import { Loader2, CheckCircle } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [logoutMsg, setLogoutMsg] = useState(false);

  const navigate = useNavigate();

  // ✅ Show logout success message
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("logout") === "1") {
      setLogoutMsg(true);

      setTimeout(() => {
        setLogoutMsg(false);
        window.history.replaceState({}, "", "/admin-login");
      }, 4000);
    }
  }, []);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    const ok = await adminAuth.login(email, password);

    if (ok) {
      navigate("/admin", { replace: true });
    } else {
      setError("Invalid email or password ❌");
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ✅ LOGOUT SUCCESS BANNER */}
      {logoutMsg && (
        <div className="bg-green-100 border-b border-green-400 text-green-800 px-6 py-3 text-center font-bold flex items-center justify-center gap-2">
          <CheckCircle className="text-green-600" size={20} />
          Logged out successfully
        </div>
      )}

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">

          <h1 className="text-2xl font-bold text-gray-900">
            Admin Login
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Login with admin email & password
          </p>

          {/* EMAIL */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Admin email"
            className="w-full mt-5 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
          />

          {/* PASSWORD */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Password"
            className="w-full mt-3 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400"
          />

          {error && (
            <p className="text-red-600 text-sm mt-3">{error}</p>
          )}

          {/* LOGIN BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-5 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

          {/* BACK BUTTON */}
          <button
            onClick={() => navigate("/", { replace: true })}
            className="w-full mt-3 border py-3 rounded-lg font-semibold hover:bg-gray-50"
          >
            Back to Home
          </button>

        </div>
      </div>
    </div>
  );
}
