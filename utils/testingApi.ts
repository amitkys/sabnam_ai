"use client";
import useSWR from "swr";

import { fetcher } from "@/utils/fetcher";
import { IUser } from "@/app/api/testing/route";

export function testing() {
  const { data, error, isLoading } = useSWR<{ user: IUser }>(
    "/api/testing",
    fetcher,
  );

  return {
    user: data?.user,
    error,
    isLoading,
  };
}
