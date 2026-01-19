"use server";

import { ActionError, actionWrapper } from "@/lib/action-response";
import { ErrorTypes } from "@/lib/error-type";

export async function getPlayground() {
  return actionWrapper(async () => {
    throw new ActionError("what the fuck is going here", ErrorTypes.BAD_REQUEST)

    return 5;
  })
}