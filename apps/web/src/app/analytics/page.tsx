"use client";

import { FocusTimeChart } from "@/analytics/components/FocusTimeChart";
import { JSX } from "react";
import { OverviewStats } from "@/analytics/components/OverviewStats";
import { ProductivityMetrics } from "@/analytics/components/ProductivityMetrics";
import { SessionBreakdownChart } from "@/analytics/components/SessionBreakdownChart";
import { useAnalyticsData } from "@/analytics/hooks/useAnalyticsData";

export default function AnalyticsPage(): JSX.Element {
  const {
    sessionHistory,
    weeklyStats,
    sessionsByFocusMode,
    productivityMetrics,
    days,
    setDays,
    isLoading,
  } = useAnalyticsData();

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : (
          <>
            <OverviewStats weeklyStats={weeklyStats} />
            <FocusTimeChart
              sessionHistory={sessionHistory}
              days={days}
              onDaysChange={setDays}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <SessionBreakdownChart
                sessionsByFocusMode={sessionsByFocusMode}
              />
              <ProductivityMetrics productivityMetrics={productivityMetrics} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
