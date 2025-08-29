"use client";

import { useState, useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Loader } from "../ui/loader";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { getChartData } from "@/utils/testingApi";

const chartConfig = {
  totalAttempts: {
    label: "Attempts",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export default function DashboardChart({
  userCreationDate,
}: {
  userCreationDate: Date;
}) {
  const currentYear = new Date().getFullYear();
  const creationYear = userCreationDate.getFullYear();

  const years = Array.from(
    { length: currentYear - creationYear + 1 },
    (_, i) => creationYear + i,
  );

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const { chartData, error, isLoading } = getChartData(selectedYear.toString());

  const { processedChartData, hasAnyAttempts } = useMemo(() => {
    if (!chartData) return { processedChartData: [], hasAnyAttempts: false };

    const maxAttempts = Math.max(
      ...chartData.map((item) => item.totalAttempts),
    );
    const hasAnyAttempts = maxAttempts > 0;

    // No processing needed - just use the data as is
    const processedData = chartData;

    return { processedChartData: processedData, hasAnyAttempts };
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader size="sm" />
          <div>Loading chart..</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-sm font-bold">
            Error loading chart
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // Show message when no attempts found in entire year
  if (!hasAnyAttempts) {
    return (
      <Card className="h-96 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2 sm:items-center">
            <CardTitle className="text-lg sm:text-xl flex-shrink-0">
              Test attempt history
            </CardTitle>
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value, 10))}
            >
              <SelectTrigger className="w-[120px] sm:w-[180px] flex-shrink-0">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Years</SelectLabel>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-muted-foreground">
              <h3 className="text-lg font-medium mb-2">
                No test attempts in {selectedYear}
              </h3>
              <p className="text-sm">
                Start taking tests to see your progress here.
              </p>
            </div>
            <Button
              className="mt-4"
              onClick={() => (window.location.href = "/home")}
            >
              Take Your First Test
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 sm:items-center">
          <CardTitle className="text-lg sm:text-xl flex-shrink-0">
            Test attempt history
          </CardTitle>
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => setSelectedYear(parseInt(value, 10))}
          >
            <SelectTrigger className="w-[120px] sm:w-[180px] flex-shrink-0">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Years</SelectLabel>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 md:px-6 flex-1 min-h-0">
        <ChartContainer className="h-full w-full" config={chartConfig}>
          <BarChart accessibilityLayer data={processedChartData} height={120}>
            <CartesianGrid vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="month"
              tickFormatter={(value) => value.slice(0, 3)}
              tickLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;

                const data = payload[0].payload;
                const hasAttempts = data.totalAttempts > 0;

                return (
                  <div className="rounded-lg border bg-background px-2 py-1 shadow-sm">
                    <p className="font-medium">{label}</p>
                    {hasAttempts ? (
                      <p className="text-sm">
                        {`${chartConfig.totalAttempts.label}: ${data.totalAttempts}`}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No Attempts
                      </p>
                    )}
                  </div>
                );
              }}
              cursor={false}
            />
            <Bar
              background={{
                fill: "hsl(var(--muted))",
                radius: 8,
              }}
              dataKey="totalAttempts"
              fill="var(--color-totalAttempts)"
              radius={8}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
