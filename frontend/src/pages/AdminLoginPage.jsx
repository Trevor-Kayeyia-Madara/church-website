import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("admin_token") || 
                 document.cookie.match(/admin_token=([^;]+)/)?.[1];
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "https://api.dcutawala.org";
      const res = await fetch(`${backendUrl}/api/admin/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("admin_token", data.token);
      document.cookie = `admin_token=${data.token}; path=/; max-age=86400`;

      setAuthenticated(true);
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  if (authenticated) {
    return <Navigate to="/admin" replace />;
  }

  const from = location.state?.from?.pathname || "/admin";

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="text-center mb-8">
          <p className="text-accent/90 text-xs font-black tracking-[0.25em] uppercase">Admin</p>
          <h1 className="mt-3 text-3xl font-black">Sign In</h1>
          <p className="mt-2 text-white/60 text-sm">Deliverance Church Utawala</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-300 text-sm font-bold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-black tracking-[0.25em] uppercase text-white/60 mb-2">
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60 transition-colors"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-xs font-black tracking-[0.25em] uppercase text-white/60 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl bg-background/60 border border-white/10 px-4 py-3 font-bold outline-none focus:border-primary/60 transition-colors"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-2xl bg-primary text-black font-extrabold px-6 py-3.5 hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-white/60 hover:text-white font-bold">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
