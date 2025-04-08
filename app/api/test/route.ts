import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/auth.config";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  return NextResponse.json({ session });
}
