import { NextResponse } from "next/server";

export interface IUser {
  name: string;
  age: number;
  phone: string;
}

export async function GET() {
  const user: IUser = {
    name: "kys",
    age: 18,
    phone: "9122",
  };

  return NextResponse.json({ user }, { status: 200 });
}
