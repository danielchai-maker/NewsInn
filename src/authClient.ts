// src/authClient.ts

export function saveAuth(data: any) {
  // Simpan token & user
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data));
}

export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
