"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const RouteLoadingContext = createContext({
  isLoading: false,
  start: () => {},
  stop: () => {},
});

export function RouteLoadingProvider({ children }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef(null);

  const stop = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsLoading(false);
  };

  const start = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsLoading(true);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      setIsLoading(false);
    }, 10_000);
  };

  useEffect(() => {
    // Navigation finished (or route changed)
    stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const value = useMemo(() => ({ isLoading, start, stop }), [isLoading]);

  return <RouteLoadingContext.Provider value={value}>{children}</RouteLoadingContext.Provider>;
}

export function useRouteLoading() {
  return useContext(RouteLoadingContext);
}
