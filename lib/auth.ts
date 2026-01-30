// lib/auth.ts
export async function performLogout() {
  // 1. USE RELATIVE PATH
  // We leave this empty so it hits the Next.js Rewrite Proxy (Same-Origin)
  const API_URL = ""; 
  
  // Optional: keep the flag if you want, but usually you always want server logout
  const enableServerLogout = process.env.NEXT_PUBLIC_ENABLE_SERVER_LOGOUT !== 'false';

  try {
    if (enableServerLogout) {
      // 2. CALL PROXY ENDPOINT
      // This sends the request to /auth/logout on the frontend domain.
      // Next.js forwards it to Render.
      // The browser accepts the "Clear-Cookie" header because it looks local.
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    }
  } catch (err) {
    console.warn('Server logout failed or unavailable', err);
  }

  // 3. FORCE PAGE RELOAD / REDIRECT
  // Since cookies are httpOnly, JS cannot confirm they are gone.
  // A hard reload or redirect ensures the middleware runs again and detects the missing cookies.
  if (typeof window !== "undefined") {
    // Optional: Clear purely cosmetic data if you store any
    localStorage.removeItem('user_preference_theme'); 
    
    // Redirect to login
    window.location.href = "/login";
  }

  return true;
}