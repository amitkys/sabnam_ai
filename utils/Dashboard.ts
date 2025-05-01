import useSWR from "swr";

import { ResponseData } from "@/app/api/(dashboard)/dashboardTable/route";
import { fetcher } from "@/utils/fetcher";

export function getDashboardTableData(
  filterBy: string,
  currentPage: number,
  pageSize: number,
) {
  const { data, error, isLoading } = useSWR<ResponseData>(
    `api/dashboardTable?filterBy=${filterBy}&page=${currentPage}&pageSize=${pageSize}`,
    fetcher,
  );

  return {
    data,
    error,
    isLoading,
  };
}
interface User {
  name: string;
  email: string;
  registeredAt: Date;
  avatar: string;
  averageScore: string;
}
export function getDashboardUser() {
  const { data, error, isLoading } = useSWR<User>(
    "/api/dashboardUser",
    fetcher,
  );

  return {
    data,
    error,
    isLoading,
  };
}
