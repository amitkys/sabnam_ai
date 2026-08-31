import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_COOKIE_NAME = "sabnam_admin_token";
const SECRET = process.env.BETTER_AUTH_SECRET || "sabnam_admin_default_secret_key_87321";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/**
 * Generates an HMAC-SHA256 signature for a value
 */
function signValue(value: string): string {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

/**
 * Validates admin credentials against environment variables
 */
export function verifyAdminCredentials(username?: string, password?: string): boolean {
  const expectedUsername = process.env.ADMIN_USERNAME || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (!username || !password) return false;
  return username.trim() === expectedUsername.trim() && password === expectedPassword;
}

/**
 * Creates an admin session and sets the HTTP-only cookie
 */
export async function createAdminSession(username: string): Promise<boolean> {
  const expiresAt = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `${username}:${expiresAt}`;
  const signature = signValue(payload);
  const token = `${payload}:${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return true;
}

/**
 * Checks if the current request has a valid admin session cookie
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

    if (!token) return false;

    const parts = token.split(":");
    if (parts.length !== 3) return false;

    const [username, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);

    if (isNaN(expiresAt) || Date.now() > expiresAt) {
      return false;
    }

    const payload = `${username}:${expiresAtStr}`;
    const expectedSignature = signValue(payload);

    if (signature !== expectedSignature) {
      return false;
    }

    const expectedUsername = process.env.ADMIN_USERNAME || "admin";
    return username === expectedUsername;
  } catch {
    return false;
  }
}

/**
 * Clears the admin session cookie
 */
export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
