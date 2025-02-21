import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TestSeriesResponse } from "@/lib/type";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// Fetcher function for SWR
export const fetcher = (url: string): Promise<TestSeriesResponse> =>
  fetch(url).then((res) => res.json());