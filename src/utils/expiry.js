// Expiration dates are stored as YYYY-MM-DD (local-date strings), so the
// "expires on" date means the full calendar day in the host's timezone.

export function todayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function isExpired(expiresAt) {
  if (!expiresAt) return false;
  return expiresAt < todayISODate();
}

export function isExpiringToday(expiresAt) {
  if (!expiresAt) return false;
  return expiresAt === todayISODate();
}

export function daysUntilExpiry(expiresAt) {
  if (!expiresAt) return null;
  const [y, m, d] = expiresAt.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  const target = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const midnightToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const MS_PER_DAY = 86_400_000;
  return Math.round((target - midnightToday) / MS_PER_DAY);
}

export function formatExpiryDate(expiresAt) {
  if (!expiresAt) return "—";
  const [y, m, d] = expiresAt.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return "—";
  try {
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return expiresAt;
  }
}
