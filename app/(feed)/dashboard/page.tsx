"use client";

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import DashBoardTable from "@/components/dashboard/dashboardTable";
import DashboardUser from "@/components/dashboard/dashboardUser";
import DashboardChart from "@/components/dashboard/dashboardChart";

export const description = "A bar chart"
const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export default function Page() {
  return (
    <ContentLayout title="Dashboard">
      <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] flex flex-col">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/*DashBoard table  */}
          <DashBoardTable />

          {/* User Profile Card */}
          {/* <div className="w-full lg:w-1/4 mt-0">
            <DashboardUser />
          </div> */}
        </div>
        <DashboardChart />
      </div>
    </ContentLayout>
  );
}
