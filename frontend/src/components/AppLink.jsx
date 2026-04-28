"use client";

import Link from "next/link";
import { useRouteLoading } from "@/lib/routeLoadingContext";

export default function AppLink({ onClick, ...props }) {
  const { start } = useRouteLoading();

  return (
    <Link
      {...props}
      onClick={(e) => {
        start();
        onClick?.(e);
      }}
    />
  );
}

