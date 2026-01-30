export async function apiFetch(url: string, options: RequestInit = {}) {
  // use relative path so it goes through Next.js rewrite proxy
  const API_URL = "";

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