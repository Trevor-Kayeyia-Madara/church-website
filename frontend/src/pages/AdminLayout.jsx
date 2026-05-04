import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("admin_token") || 
                   document.cookie.match(/admin_token=([^;]+)/)?.[1];
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/admin/auth/me", {
          headers: { "Authorization": `Bearer ${token}` },
          credentials: "include",
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setAuthenticated(true);
            setEmail(data.email || "admin@dcutawala.org");
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    fetch("/api/admin/auth/logout", { method: "POST" })
      .finally(() => {
        localStorage.removeItem("admin_token");
        document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        window.location.href = "/admin/login";
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-accent font-bold">Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return (
    <AdminShell email={email} onLogout={handleLogout}>
      {children}
    </AdminShell>
  );
}
