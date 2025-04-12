import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Simulate backend failure
  return NextResponse.json({ message: "all is goodl" }, { status: 400 });
}
