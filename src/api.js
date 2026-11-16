export const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
export const APK_DOWNLOAD_URL = "https://github.com/codewithabhi004/blinker-a/releases/latest/download/blinker-a.apk";

export async function apiRequest(path, { token, ...options } = {}) {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status}).`);
  }
  return payload;
}
