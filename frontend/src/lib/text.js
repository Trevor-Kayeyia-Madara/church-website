function stripNonBmp(value) {
  const s = String(value || "");
  if (!s) return "";
  // Remove 4-byte Unicode chars (e.g. emoji) to match MySQL utf8 limitations.
  let out = "";
  for (const ch of s) {
    if (ch.codePointAt(0) <= 0xffff) out += ch;
  }
  return out;
}

export function simpleSermonTitle(value) {
  const s = stripNonBmp(value);
  const compact = s.replace(/\s+/g, " ").trim();
  return compact || "Sermon";
}

