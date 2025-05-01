"use client";
import useSWR from "swr";

export const fetcher = async (url: string): Promise<any> => {
  const res = await fetch(url);

  if (!res.ok) {
    const errorResponse = await res.json();
    const error = new Error(errorResponse.message || "Unknown error");

    throw error;
  }

  return res.json();
};

export function testing() {
  const { data, error, isLoading } = useSWR("/api/testing", fetcher);

  return {
    data,
    error,
    isLoading,
  };
}
