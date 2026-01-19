"use server";

import { ActionError, actionWrapper } from "@/lib/action-response";
import { ErrorTypes } from "@/lib/error-type";

export async function getPlayground() {
  return actionWrapper(async () => {

    const user = {
      name: "amitkys",
      age: 23
    }
    return user;
  })
}