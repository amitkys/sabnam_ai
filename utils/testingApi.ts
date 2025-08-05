"use client";
import useSWR from "swr";

import { fetcher } from "@/utils/fetcher";
import { User } from "@/app/api/testing/route";
import { IChartData } from "@/app/api/(dashboard)/chartData/route";

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

export function getChartData(year: string) {
  const { data, error, isLoading } = useSWR<IChartData[]>(
    `/api/chartData?year=${year}`,
    fetcher,
  );

  return {
    chartData: data,
    error,
    isLoading,
  };
}
