import { supabase } from "../lib/supabase";

const KEY = "DIYA_ADMIN_SESSION";

type LoginResult = {
  success: boolean;
  admin?: any;
};

export const adminAuth = {
  // ✅ LOGIN
  async login(email: string, password: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .eq("status", "active")
        .single();

      if (error || !data) {
        console.error("Admin login failed:", error);
        return false;
      }

      // Save session with timestamp (future expiry support)
      const session = {
        admin: data,
        loginTime: Date.now(),
      };

      localStorage.setItem(KEY, JSON.stringify(session));

      return true;
    } catch (err) {
      console.error("Login error:", err);
      return false;
    }
  },

  // ✅ LOGOUT
  logout() {
    localStorage.removeItem(KEY);
  },

  // ✅ CHECK LOGIN
  isLoggedIn(): boolean {
    const session = localStorage.getItem(KEY);
    if (!session) return false;

    try {
      const parsed = JSON.parse(session);

      // (Optional) session expiry example: 24 hours
      const ONE_DAY = 24 * 60 * 60 * 1000;

      if (Date.now() - parsed.loginTime > ONE_DAY) {
        localStorage.removeItem(KEY);
        return false;
      }

      return true;
    } catch {
      return false;
    }
  },

  // ✅ GET ADMIN
  getAdmin() {
    const session = localStorage.getItem(KEY);
    if (!session) return null;

    try {
      return JSON.parse(session).admin;
    } catch {
      return null;
    }
  },
};