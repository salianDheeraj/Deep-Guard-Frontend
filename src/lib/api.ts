export async function apiFetch(url: string, options: RequestInit = {}) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const res = await fetch(API_URL + url, {
    ...options,
    credentials: "include",
  });

  // If token expired → try refresh
  if (res.status === 401) {
    const refresh = await fetch(API_URL + "/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    // Refresh failed → logout user
    if (!refresh.ok) {
      return res; // original 401
    }

    // Refresh succeeded → retry original request
    return fetch(API_URL + url, {
      ...options,
      credentials: "include",
    });
  }

  return res;
}
