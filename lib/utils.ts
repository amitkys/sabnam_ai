import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { TestSeriesResponse } from "@/lib/type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fetcher function for SWR
// export const fetcher = (url: string): Promise<TestSeriesResponse> =>
//   fetch(url).then((res) => res.json());

export const fetcher = async (url: string): Promise<TestSeriesResponse> => {
  const res = await fetch(url);

  if (!res.ok) {
    const errorResponse = await res.json();
    const error = new Error(errorResponse.message || "Unknown error");

    throw error;
  }

  return res.json();
};
