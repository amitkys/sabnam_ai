"use server";

import { ActionError, actionWrapper } from "@/lib/action-response";
import { ErrorTypes } from "@/lib/error-type";
import {
  createAdminSession,
  destroyAdminSession,
  isAdminAuthenticated,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

/**
 * Logs in admin using username and password from .env
 */
export async function adminLoginAction({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  return actionWrapper(async () => {
    if (!username || !password) {
      throw new ActionError(
        "Username and password are required",
        ErrorTypes.MISSING_REQUIRED_FIELD
      );
    }

    const isValid = verifyAdminCredentials(username, password);
    if (!isValid) {
      throw new ActionError(
        "Invalid admin username or password",
        ErrorTypes.INVALID_CREDENTIALS
      );
    }

    await createAdminSession(username);
    return { success: true, username };
  });
}

/**
 * Logs out admin by clearing cookie
 */
export async function adminLogoutAction() {
  return actionWrapper(async () => {
    await destroyAdminSession();
    return { success: true };
  });
}

/**
 * Checks if current user is logged in as admin
 */
export async function checkAdminAuthAction() {
  return actionWrapper(async () => {
    const isAuthenticated = await isAdminAuthenticated();
    return { isAuthenticated };
  });
}
