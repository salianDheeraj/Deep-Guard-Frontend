// lib/auth.ts
// Centralized logout helper used by client components

export async function performLogout() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const enableServerLogout = process.env.NEXT_PUBLIC_ENABLE_SERVER_LOGOUT === 'true';

  // Try server-side logout (clears httpOnly cookies if used)
  try {
    if (enableServerLogout) {
      const res = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!res.ok) {
        // server doesn't support logout or returned error - warn but continue
        // eslint-disable-next-line no-console
        console.warn('Server logout returned non-OK status', res.status);
      }
    }
  } catch (err) {
    // Non-fatal: backend might not expose this endpoint
    // Log for debugging but continue to clear client state
    // eslint-disable-next-line no-console
    console.warn('Server logout failed or unavailable', err);
  }

  // Clear client-side tokens / user info
  try {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  } catch (err) {
    // ignore (e.g., running on server)
  }

  return true;
}
