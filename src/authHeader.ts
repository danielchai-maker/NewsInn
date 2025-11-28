import { getToken } from "./authClient";

export function authHeader() {
  const token = getToken();
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
}
