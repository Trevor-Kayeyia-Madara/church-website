"use client";

import { createContext, useContext } from "react";
import { SITE as DEFAULT_SITE } from "@/lib/siteConfig";

const SiteContext = createContext(DEFAULT_SITE);

export function SiteProvider({ value, children }) {
  return <SiteContext.Provider value={value || DEFAULT_SITE}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}

