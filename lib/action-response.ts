import {Prisma} from "@/lib/generated/prisma/client"
import { ErrorTypes } from "./error-type"

export type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string; errorCode?: string }

export class ActionError extends Error {
  constructor(
    message: string,
    public errorCode?: string,
  ) {
    super(message)
    this.name = "ActionError"
  }
}

export async function actionWrapper<T>(
  fn: () => Promise<T>,
): Promise<ActionResponse<T>> {
  try {
    const data = await fn()
    return { success: true, data }
  } catch (error) {
    // Handle ActionError first
    if (error instanceof ActionError) {
      return {
        success: false,
        error: error.message,
        errorCode: error.errorCode,
      }
    }

    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          success: false,
          error: "Duplicate record not allowed",
          errorCode: ErrorTypes.DUPLICATE,
        }
      }
      if (error.code === "P2025") {
        return {
          success: false,
          error: "Data not found",
          errorCode: ErrorTypes.NOT_FOUND,
        }
      }
      // Other Prisma errors
      return {
        success: false,
        error: "Database error occurred",
        errorCode: ErrorTypes.DATABASE_ERROR,
      }
    }

    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.log("error on server action,", error.message)
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      console.log(
        "error on server action (prismaClientInitializationError),",
        error.message,
      )
    }

    // Handle generic errors
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again later",
      errorCode: ErrorTypes.UNKNOWN_ERROR,
    }
  }
}