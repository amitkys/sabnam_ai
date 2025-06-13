"use client";

import { useTesting } from "@/utils/testingApi";

export default function TestPage() {
  const { user, error, isLoading } = useTesting();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>{user?.age}</div>;
}
