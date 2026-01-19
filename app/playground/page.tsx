"use client";
import { usePlayground } from "@/hooks/use-playground";

export default function Page() {
  const { data, error, isLoading } = usePlayground();
  if (isLoading) {
    return <div>loading</div>
  }
  if (error) {
    return <div>got error: {error.message}</div>
  }


  return (
    <div>{data?.name}</div>
  )
}