"use client"

import { useState, useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select"
import { Button } from "@/components/ui/button"
import { getChartData } from "@/utils/testingApi"
import { Loader } from "../ui/loader"
import { Spinner } from "../custom/spinner"

const chartConfig = {
  totalAttempts: {
    label: "Attempts",
    color: "hsl(var(--chart-5))",
  },
  zeroBase: {
    label: "No Attempts",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export default function DashboardChart({ userCreationDate }: { userCreationDate: Date }) {
  const currentYear = new Date().getFullYear();
  const creationYear = userCreationDate.getFullYear();

  const years = Array.from(
    { length: currentYear - creationYear + 1 },
    (_, i) => creationYear + i
  );

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const { chartData, error, isLoading } = getChartData(selectedYear.toString());

  const { processedChartData, hasAnyAttempts, maxAttempts } = useMemo(() => {
    if (!chartData) return { processedChartData: [], hasAnyAttempts: false, maxAttempts: 0 };

    const maxAttempts = Math.max(...chartData.map(item => item.totalAttempts));
    const hasAnyAttempts = maxAttempts > 0;

    const processedData = chartData.map(item => ({
      ...item,
      // For zero attempts, show a small fixed bar (5% of max or minimum 1)
      zeroBase: item.totalAttempts === 0 ? (hasAnyAttempts ? Math.max(maxAttempts * 0.05, 1) : 1) : 0,
    }));

    return { processedChartData: processedData, hasAnyAttempts, maxAttempts };
  }, [chartData]);

  if (isLoading) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader size="sm" />
          <div>Loading..</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-sm">
            Error loading chart
          </div>
          <Button
            variant="outline"
            size="sm"
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <CardTitle className="mb-2 md:mb-0">Test attempt history</CardTitle>
            <div className="flex items-center gap-2">
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value, 10))}
              >
                <SelectTrigger className="w-[180px]">
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
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 flex flex-col items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-muted-foreground">
              <h3 className="text-lg font-medium mb-2">No test attempts in {selectedYear}</h3>
              <p className="text-sm">Start taking tests to see your progress here.</p>
            </div>
            <Button
              onClick={() => window.location.href = '/home'}
              className="mt-4"
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle className="mb-2 md:mb-0">Test attempt history</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value, 10))}
            >
              <SelectTrigger className="w-[180px]">
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
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart accessibilityLayer data={processedChartData} height={120}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
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
                        {chartConfig.zeroBase.label}
                      </p>
                    )}
                  </div>
                );
              }}
            />
            <Bar
              dataKey="totalAttempts"
              fill="var(--color-totalAttempts)"
              radius={8}
              stackId="a"
            />
            <Bar
              dataKey="zeroBase"
              fill="var(--color-zeroBase)"
              radius={8}
              stackId="a"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}