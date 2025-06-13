import { NextResponse } from "next/server";

export interface User {
  name: string;
  age: number;
}

export async function GET() {
  const user: User = {
    name: "kys",
    age: 23,
  };

  await new Promise((resolve) => setTimeout(resolve, 5000));

  return NextResponse.json({ user }, { status: 200 });
}
