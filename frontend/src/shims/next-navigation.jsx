import { useLocation, useNavigate, useSearchParams as useRRSearchParams } from "react-router-dom";

export function usePathname() {
  const location = useLocation();
  return location.pathname;
}

export function useSearchParams() {
  return useRRSearchParams();
}

export function redirect(to) {
  // Next.js redirect() is server-side; in Vite we keep it explicit via routing.
  throw new Error(`redirect(${to}) is not supported in this build. Use <Navigate /> in routes instead.`);
}

export function notFound() {
  const err = new Error("NOT_FOUND");
  err.code = "NOT_FOUND";
  throw err;
}

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (to) => navigate(to),
    replace: (to) => navigate(to, { replace: true }),
  };
}

