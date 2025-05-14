"use client";

import { testing } from "@/utils/testingApi";

export default function Page() {
  const { user, error, isLoading } = testing();

  if (isLoading) return <div>loading</div>;
  if (error) return <div>{error.message}</div>;

  console.log(user?.name);

  return <div>Hello</div>;
}
