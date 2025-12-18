export const formatMessageTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

export const getTimeUntilAnswer = (
  expectedTime: number,
): { text: string; isOverdue: boolean } => {
  const now = Date.now();
  const timeDiff = expectedTime - now;

  if (timeDiff < 0) {
    const overdue = Math.abs(timeDiff);
    const hours = Math.floor(overdue / (1000 * 60 * 60));
    const minutes = Math.floor(overdue / (1000 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return { text: `${days}d overdue`, isOverdue: true };
    if (hours > 0) return { text: `${hours}h overdue`, isOverdue: true };
    return { text: `${minutes}m overdue`, isOverdue: true };
  }

  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor(timeDiff / (1000 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return { text: `${days}d remaining`, isOverdue: false };
  if (hours > 0) return { text: `${hours}h remaining`, isOverdue: false };
  return { text: `${minutes}m remaining`, isOverdue: false };
};

export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
