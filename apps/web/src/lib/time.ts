import { useMemo } from "react";

export const formatResponseTime = (minutes?: number) => {
  if (!minutes) return null;

  if (minutes < 60) {
    return `${minutes}m`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  } else {
    const days = Math.floor(minutes / 1440);
    return `${days}d`;
  }
};

export const useOneWeekDateRange = () => {
  return useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() + 7);
    return {
      startDate: start.getTime(),
      endDate: end.getTime(),
    };
  }, []);
};
