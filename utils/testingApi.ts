"use client";
import useSWR from "swr";

import { fetcher } from "@/utils/fetcher";
import { User } from "@/app/api/testing/route";

export function useTesting() {
  const { data, error, isLoading } = useSWR<{ user: User }>(
    "/api/testing",
    fetcher,
  );

  return {
    user: data?.user,
    error,
    isLoading,
  };
}
