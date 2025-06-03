"use server";
import prisma from "@/lib/db";

export async function getUser() {
  try {
    const user = await prisma.user.findFirst();

    if (!user) {
      return { error: "User not found" };
    }

    return { data: user };
  } catch (error) {
    console.log(error);

    return { error: "Failed to fetch user" };
  }
}
