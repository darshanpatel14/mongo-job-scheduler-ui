import { Search, Filter } from 'lucide-react';
import { useState } from 'react';

interface JobFiltersProps {
  onFilterChange: (filters: { status?: string; search?: string }) => void;
}

export default function JobFilters({ onFilterChange }: JobFiltersProps) {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({ status: selectedStatus === 'all' ? undefined : selectedStatus, search: value });
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    onFilterChange({ status: status === 'all' ? undefined : status, search });
  };

  const statuses = ['all', 'pending', 'running', 'completed', 'failed', 'cancelled'];

  return (
    <div className="mb-6 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search jobs by name..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-gray-400" />
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedStatus === status
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
