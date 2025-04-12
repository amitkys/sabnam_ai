"use client";

import useSWR from "swr";

const fetcher = async (url: string): Promise<any> => {
  const res = await fetch(url);

  if (!res.ok) {
    const errorResponse = await res.json();
    const error = new Error(errorResponse.message || "Unknown error");

    throw error;
  }

  return res.json();
};

export default function Page() {
  const { data, error, isLoading } = useSWR<any>("/api/testing", fetcher);

  if (isLoading) return <div>loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>Data: {JSON.stringify(data)}</div>;
}
