"use client";

import { Pie, PieChart } from "recharts";
import { TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface PerformanceChartProps {
  chartData: Array<{ name: string; value: number; fill: string }>;
  chartConfig: ChartConfig;
}

export function PerformanceChart({
  chartData,
  chartConfig,
}: PerformanceChartProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Performance Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer
            className="mx-auto aspect-square h-full"
            config={chartConfig}
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
                cursor={true}
              />
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={60}
                nameKey="name"
                strokeWidth={5}
              />
              <ChartLegend
                className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
                content={<ChartLegendContent nameKey="name" />}
              />
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
