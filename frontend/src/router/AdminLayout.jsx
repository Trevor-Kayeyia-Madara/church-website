import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";
import { apiUrl } from "@/lib/apiUrl";

export default function AdminLayout() {
  const [state, setState] = useState({ loading: true, user: null, authenticated: false });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(apiUrl("/api/admin/auth/me"), {
          credentials: "include",
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);
        const user = json?.user || null;
        const authenticated = !!json?.ok && !!user;
        if (cancelled) return;
        setState({ loading: false, user, authenticated });
      } catch {
        if (cancelled) return;
        setState({ loading: false, user: null, authenticated: false });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/80 font-bold">
          Checking admin session…
        </div>
      </div>
    );
  }

  // Avoid redirect loops if cookies are blocked/misconfigured: show a stable error.
  if (!state.user) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <AdminShell email={state.user.email || state.user.username || ""}>
      <Outlet />
    </AdminShell>
  );
}
