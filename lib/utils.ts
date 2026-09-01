import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);

  if (!res.ok) {
    const errorResponse = await res.json();
    const error = new Error(errorResponse.message || "Unknown error");

    throw error;
  }

  return res.json() as Promise<T>;
};

