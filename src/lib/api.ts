// src/lib/api.ts

export async function apiFetch(url: string, options: RequestInit = {}) {
  // ✅ 1. Use relative path to leverage Next.js Rewrite Proxy
  const API_URL = "";

  const res = await fetch(API_URL + url, {
    ...options,
    credentials: "include", // ✅ 2. Always send HttpOnly cookies
  });

  // ✅ 3. Intercept 401s (Token Expired)
  if (res.status === 401) {
    
    // 🛡️ SAFETY CHECK: Don't try to refresh if the failed request WAS the refresh
    // This prevents infinite loops if the refresh token itself is invalid.
    if (url.includes("/refresh")) {
        return res;
    }

    // 4. Attempt to refresh the token
    const refresh = await fetch(API_URL + "/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    // 5. If refresh failed (RefreshToken also expired) -> Return original 401
    // The UI (e.g. Sidebar/Dashboard) will see the 401 and redirect to Login
    if (!refresh.ok) {
      return res; 
    }

    // 6. Refresh succeeded -> Retry original request
    // The browser has now updated the HttpOnly cookie automatically
    return fetch(API_URL + url, {
      ...options,
      credentials: "include",
    });
  }

  return res;
}