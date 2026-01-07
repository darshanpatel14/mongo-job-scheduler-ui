import { X } from 'lucide-react';
import type { Job } from '../types/job';
import { formatDate, getStatusColor } from '../utils/helpers';

interface JobDetailsProps {
  job: Job | null;
  onClose: () => void;
}

export default function JobDetails({ job, onClose }: JobDetailsProps) {
  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">{job.name}</h2>
            <span className={`inline-block mt-2 px-3 py-1 rounded text-sm border ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Basic Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem label="ID" value={job._id} />
                <InfoItem label="Attempts" value={job.attempts.toString()} />
                <InfoItem label="Created" value={formatDate(job.createdAt)} />
                <InfoItem label="Updated" value={formatDate(job.updatedAt)} />
              </div>
            </div>

            {/* Schedule */}
            {(job.nextRunAt || job.lastRunAt) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  {job.nextRunAt && <InfoItem label="Next Run" value={formatDate(job.nextRunAt)} />}
                  {job.lastRunAt && <InfoItem label="Last Run" value={formatDate(job.lastRunAt)} />}
                </div>
              </div>
            )}

            {/* Repeat */}
            {job.repeat && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Repeat</h3>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  {job.repeat.cron && <InfoItem label="Cron" value={job.repeat.cron} />}
                  {job.repeat.every && <InfoItem label="Every" value={`${job.repeat.every}ms`} />}
                  {job.repeat.timezone && <InfoItem label="Timezone" value={job.repeat.timezone} />}
                </div>
              </div>
            )}

            {/* Retry */}
            {job.retry && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Retry</h3>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <InfoItem label="Max Attempts" value={job.retry.maxAttempts.toString()} />
                  <InfoItem label="Delay" value={typeof job.retry.delay === 'number' ? `${job.retry.delay}ms` : 'Dynamic'} />
                </div>
              </div>
            )}

            {/* Lock Info */}
            {job.lockedBy && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Lock Info</h3>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <InfoItem label="Locked By" value={job.lockedBy} />
                  {job.lockedAt && <InfoItem label="Locked At" value={formatDate(job.lockedAt)} />}
                </div>
              </div>
            )}

            {/* Error */}
            {job.lastError && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Last Error</h3>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm font-mono">
                  {job.lastError}
                </div>
              </div>
            )}

            {/* Data */}
            {job.data && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Data</h3>
                <pre className="bg-gray-800/50 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                  {JSON.stringify(job.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-2">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm text-white">{value}</div>
    </div>
  );
}
