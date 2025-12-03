"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface SDGBarChartProps {
    data: any[];
    title: string;
    description: string;
    dataKey: string;
    xAxisKey: string;
}

export function SDGBarChart({ data, title, description, dataKey, xAxisKey }: SDGBarChartProps) {
  const chartConfig = {
    [dataKey]: {
      label: "Activities",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis />
              <Tooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey={dataKey} fill="var(--color-activities)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface SDGAreaChartProps {
    data: any[];
    title: string;
    description: string;
    dataKey: string;
    xAxisKey: string;
}


export function SDGAreaChart({ data, title, description, dataKey, xAxisKey }: SDGAreaChartProps) {
 const chartConfig = {
    [dataKey]: {
      label: "Points",
      color: "hsl(var(--accent))",
    },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-points)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-points)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis dataKey={xAxisKey} tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke="var(--color-points)"
                fillOpacity={1}
                fill="url(#fillPoints)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
