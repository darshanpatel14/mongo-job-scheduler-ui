import { Activity, CheckCircle, XCircle, Clock, Loader, Ban } from 'lucide-react';
import type { JobStats } from '../types/job';

interface StatsCardProps {
  stats: JobStats | null;
}

export default function StatsCards({ stats }: StatsCardProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-16 mb-2"></div>
            <div className="h-8 bg-gray-700 rounded w-12"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { label: 'Total', value: stats.total, icon: Activity, color: 'text-purple-400' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-blue-400' },
    { label: 'Running', value: stats.running, icon: Loader, color: 'text-yellow-400' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Failed', value: stats.failed, icon: XCircle, color: 'text-red-400' },
    { label: 'Cancelled', value: stats.cancelled, icon: Ban, color: 'text-gray-400' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{card.label}</span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className={`text-2xl font-bold ${card.color}`}>
              {card.value.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}
