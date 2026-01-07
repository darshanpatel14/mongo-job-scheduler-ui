import { RefreshCw, Trash2, RotateCcw, X, Edit } from 'lucide-react';
import type { Job } from '../types/job';
import { formatDate, formatRelativeTime, getStatusColor } from '../utils/helpers';
import Pagination from './Pagination';

interface JobListProps {
  jobs: Job[];
  loading: boolean;
  onJobClick: (job: Job) => void;
  onEdit: (job: Job) => void;
  onRefresh: () => void;
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
  onCancel: (id: string) => void;
  // Pagination Props
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (items: number) => void;
  totalItems: number;
}

export default function JobList({ 
  jobs, 
  loading, 
  onJobClick, 
  onEdit, 
  onRefresh, 
  onDelete, 
  onRetry, 
  onCancel,
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalItems
}: JobListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0 && totalItems === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">No jobs found</p>
        <p className="text-sm mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-4 gap-4">
        <h3 className="text-lg font-semibold text-white">Jobs</h3>
        
        <div className="flex items-center gap-2 self-end xl:self-auto">
             <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={onItemsPerPageChange}
                totalItems={totalItems}
                className="!py-0" 
            />
            <div className="h-8 w-px bg-gray-700 mx-2 hidden sm:block"></div>
            <button
            onClick={onRefresh}
            className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors border border-gray-700/50"
            title="Refresh"
            >
            <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>
        </div>
      </div>

      {jobs.map((job) => (
        <div
          key={job._id}
          onClick={() => onJobClick(job)}
          className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-lg p-4 border border-gray-700/50 hover:border-gray-600/50 cursor-pointer transition-all duration-200 group"
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h4 className="text-white font-medium mb-1">{job.name}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(job.status)}`}>
                  {job.status}
                </span>
                <span>•</span>
                <span title={formatDate(job.createdAt)}>Created {formatRelativeTime(job.createdAt)}</span>
              </div>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button
                  onClick={(e) => { e.stopPropagation(); onEdit(job); }}
                  className="p-2 rounded bg-green-500/20 hover:bg-green-500/30 text-green-400"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
              {job.status === 'failed' && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRetry(job._id); }}
                  className="p-2 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                  title="Retry"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              {(job.status === 'pending' || job.status === 'running') && (
                <button
                  onClick={(e) => { e.stopPropagation(); onCancel(job._id); }}
                  className="p-2 rounded bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(job._id); }}
                className="p-2 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {job.lastError && (
            <div className="mt-2 text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
              Error: {job.lastError.substring(0, 100)}
              {job.lastError.length > 100 && '...'}
            </div>
          )}

          <div className="mt-2 flex gap-4 text-xs text-gray-500">
            {job.nextRunAt && (
              <span className="font-medium text-blue-300">
                 Run {formatRelativeTime(job.nextRunAt)}
              </span>
            )}
             {job.nextRunAt && (
              <span className="text-gray-600">
                 ({formatDate(job.nextRunAt)})
              </span>
            )}
            {job.attempts > 0 && (
              <span>Attempts: {job.attempts}</span>
            )}
            {job.repeat && (
              <span className="text-purple-400">🔁 Repeating</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
