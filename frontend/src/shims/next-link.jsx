import React from "react";
import { Link as RouterLink } from "react-router-dom";

function isExternal(href) {
  return typeof href === "string" && /^https?:\/\//.test(href);
}

export default function Link({ href, to, prefetch, replace, scroll, shallow, ...props }) {
  const dest = href ?? to ?? "";
  if (isExternal(dest)) {
    return <a href={dest} {...props} />;
  }
  return <RouterLink to={dest} {...props} />;
}

