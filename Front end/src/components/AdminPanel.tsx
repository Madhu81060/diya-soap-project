import { useEffect, useState } from "react";
import { supabase, type Member } from "../lib/supabase";
import { adminAuth } from "../auth/adminAuth";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function AdminPanel() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const admin = adminAuth.getAdmin();

  // ================= SECURITY CHECK =================
  useEffect(() => {
    if (!adminAuth.isLoggedIn()) {
      window.location.href = "/admin-login";
    }
  }, []);

  // ================= LOGOUT =================
  const logout = () => {
    adminAuth.logout();
    window.location.href = "/admin-login?logout=1";
  };

  // ================= FETCH MEMBERS =================
  const fetchMembers = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BACKEND_URL}/members`);

      if (!res.ok) {
        setMessage("❌ Failed to fetch members");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setMembers(data);
      setLoading(false);

    } catch (err) {
      setMessage("❌ Server error");
      setLoading(false);
    }
  };

  // ================= REALTIME =================
  useEffect(() => {
    fetchMembers();

    const channel = supabase
      .channel("members_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "members" },
        fetchMembers
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ================= EXPORT CSV =================
  const exportToCSV = () => {
    const csv = [
      ["Order ID","Box","Name","Mobile","City","Payment"],
      ...members.map((m) => [
        m.order_id,
        m.box_number,
        m.full_name,
        m.mobile,
        m.city,
        m.payment_status,
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "members.csv";
    a.click();
  };

  if (loading) {
    return (
      <div className="p-10 text-center font-bold text-xl">
        Loading admin panel...
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">

      {message && (
        <div className="mb-6 bg-green-100 border border-green-400 text-green-800 px-6 py-3 rounded-lg font-bold text-center">
          {message}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold">🛠️ Admin Panel</h1>

        <div className="flex items-center gap-4">
          <span className="font-bold">
            👤 {admin?.name || admin?.email}
          </span>

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={exportToCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
        >
          📤 Export CSV
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white border rounded-lg">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Order ID</th>
              <th className="p-2">Box</th>
              <th className="p-2">Name</th>
              <th className="p-2">Mobile</th>
              <th className="p-2">City</th>
              <th className="p-2">Payment</th>
            </tr>
          </thead>

          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{m.order_id}</td>
                <td className="p-2">{m.box_number}</td>
                <td className="p-2">{m.full_name}</td>
                <td className="p-2">{m.mobile}</td>
                <td className="p-2">{m.city}</td>
                <td className="p-2 font-bold text-green-600">
                  {m.payment_status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// trigger vercel deploy
