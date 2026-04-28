export function formatDate(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoString;
  }
}

export function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return null;
  const m = Number(minutes);
  if (!Number.isFinite(m) || m <= 0) return null;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  if (!h) return `${mm} min`;
  return `${h}h ${mm}m`;
}

