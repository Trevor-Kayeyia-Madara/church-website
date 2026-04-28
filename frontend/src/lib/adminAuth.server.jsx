import { auth, AUTH_CONFIGURED } from "@/auth";

function parseAllowedEmails() {
  const raw = process.env.AUTH_ALLOWED_EMAILS || "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminSession() {
  if (!AUTH_CONFIGURED) return null;
  const session = await auth().catch(() => null);
  if (!session?.user) return null;

  const allowed = parseAllowedEmails();
  const email = String(session.user.email || "").toLowerCase();
  const isAllowed = !allowed.length || allowed.includes(email);
  return isAllowed ? session : null;
}

