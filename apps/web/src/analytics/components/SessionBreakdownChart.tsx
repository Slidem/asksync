"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SessionBreakdownChartProps {
  sessionsByFocusMode?: Array<{
    mode: string;
    count: number;
    totalTime: number;
  }> | null;
}

export const SessionBreakdownChart: React.FC<SessionBreakdownChartProps> = ({
  sessionsByFocusMode,
}) => {
  const focusModeLabels: Record<string, string> = {
    deep: "Deep Focus",
    normal: "Normal",
    quick: "Quick",
    review: "Review",
    custom: "Custom",
  };

  const chartData =
    sessionsByFocusMode?.map((item) => ({
      mode: focusModeLabels[item.mode] || item.mode,
      sessions: item.count,
      "Total Minutes": Math.floor(item.totalTime / (1000 * 60)),
    })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions by Focus Mode</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="mode"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Bar
              dataKey="sessions"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
