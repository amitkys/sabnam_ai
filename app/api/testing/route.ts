import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Simulate backend failure
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return NextResponse.json({ message: "all is goodl" }, { status: 200 });
}
