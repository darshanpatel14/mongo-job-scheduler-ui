import { formatDistance, format } from "date-fns";

export const formatDate = (date: Date | string): string => {
  return format(new Date(date), "MMM dd, yyyy HH:mm:ss");
};

export const formatRelativeTime = (date: Date | string): string => {
  return formatDistance(new Date(date), new Date(), { addSuffix: true });
};

export const getStatusColor = (status: string): string => {
  const colors = {
    pending: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    running: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    completed: "bg-green-500/20 text-green-400 border-green-500/30",
    failed: "bg-red-500/20 text-red-400 border-red-500/30",
    cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return colors[status as keyof typeof colors] || colors.pending;
};

export const getStatusIcon = (status: string): string => {
  const icons = {
    pending: "⏱️",
    running: "▶️",
    completed: "✅",
    failed: "❌",
    cancelled: "🚫",
  };
  return icons[status as keyof typeof icons] || "⏱️";
};
