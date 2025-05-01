"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import DashBoardTable from "@/components/dashboard/dashboardTable";
import DashboardUser from "@/components/dashboard/dashboardUser";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function Page() {
  return (
    <ContentLayout title="Dashboard">
      <div className="min-h-[calc(100vh-56px-64px-20px-24px-56px-48px)] flex flex-col">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/*DashBoard table  */}
          <DashBoardTable />

          {/* User Profile Card */}
          <div className="w-full lg:w-1/4 mt-0">
            <DashboardUser />
          </div>
        </div>
        <Card className="flex-grow flex flex-col h-full">
          <CardHeader className="py-3">
            <CardTitle>History</CardTitle>
            <CardDescription>
              of completed, uncompleted test sereis
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2 flex-grow flex flex-col justify-center">
            <ChartContainer className="h-60" config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={chartData}
                height={180}
                margin={{ left: 12, right: 12 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  axisLine={false}
                  dataKey="month"
                  tickFormatter={(value) => value.slice(0, 3)}
                  tickLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  cursor={false}
                />
                <defs>
                  <linearGradient id="fillDesktop" x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-desktop)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-desktop)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillMobile" x1="0" x2="0" y1="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-mobile)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-mobile)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <Area
                  dataKey="mobile"
                  fill="url(#fillMobile)"
                  fillOpacity={0.4}
                  stackId="a"
                  stroke="var(--color-mobile)"
                  type="natural"
                />
                <Area
                  dataKey="desktop"
                  fill="url(#fillDesktop)"
                  fillOpacity={0.4}
                  stackId="a"
                  stroke="var(--color-desktop)"
                  type="natural"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
