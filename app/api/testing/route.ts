import { NextResponse } from "next/server";

export interface User {
  name: string;
  email: string;
  age: number;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  }
}

export async function GET() {
  const user: User = {
    name: "John Doe",
    email: "john@example.com",
    age: 42,
    address: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zip: "12345"
    }
  };
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return NextResponse.json({ user }, {status: 200});
}