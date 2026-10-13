// Fire-and-forget request that wakes the Render backend (and, through
// /health's SELECT 1, the Neon database) as soon as someone opens the site.
// The response is ignored on purpose.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function warmUpBackend() {
  // Local dev: backend isn't asleep, and /health isn't proxied by Vite.
  if (!BASE_URL) return;
  try {
    fetch(`${BASE_URL}/health`, {
      method: "GET",
      mode: "no-cors", // we never read the reply, so no CORS handling needed
      cache: "no-store",
      keepalive: true, // request still completes if the user navigates away
    }).catch(() => {});
  } catch (_) {
    /* never let a warm-up failure affect the app */
  }
}
