// src/features/auth/jwt.ts
export type DecodedJwt = {
  exp?: number; // segundos desde epoch
  iat?: number; // segundos desde epoch
  [k: string]: unknown;
};

export function decodeJwt(token: string | null | undefined): DecodedJwt | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch {
    return null;
  }
}
