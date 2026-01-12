"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

interface ProductivityMetricsProps {
  productivityMetrics?: {
    avgSessionLength: number;
    completionRate: number;
    peakHours: number[];
    totalSessions: number;
    completedSessions: number;
    skippedSessions: number;
  } | null;
}

export const ProductivityMetrics: React.FC<ProductivityMetricsProps> = ({
  productivityMetrics,
}) => {
  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour} ${ampm}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productivity Insights</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Average Session Length</span>
            <span className="text-sm text-muted-foreground">
              {productivityMetrics?.avgSessionLength || 0} min
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Completion Rate</span>
            <span className="text-sm text-muted-foreground">
              {productivityMetrics?.completionRate || 0}%
            </span>
          </div>
          <Progress
            value={productivityMetrics?.completionRate || 0}
            className="h-2"
          />
        </div>

        {productivityMetrics && productivityMetrics.peakHours.length > 0 && (
          <div>
            <div className="mb-2">
              <span className="text-sm font-medium">
                Peak Productivity Hours
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {productivityMetrics.peakHours.map((hour) => (
                <div
                  key={hour}
                  className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold">
              {productivityMetrics?.totalSessions || 0}
            </p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {productivityMetrics?.completedSessions || 0}
            </p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {productivityMetrics?.skippedSessions || 0}
            </p>
            <p className="text-xs text-muted-foreground">Skipped</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
