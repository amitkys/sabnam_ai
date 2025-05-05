import { NextResponse } from "next/server";

import Prisma from "@/lib/db";

export async function GET() {
  // Simulate backend failure
  // await new Promise((resolve) => setTimeout(resolve, 2000));

  const user = await Prisma.user.findFirst();

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ users: user });
}
