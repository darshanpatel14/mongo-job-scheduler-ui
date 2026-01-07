import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Clock,
  Repeat,
  AlertCircle,
  Database,
  Globe,
} from "lucide-react";
import type { Job } from "../types/job";

interface JobFormModalProps {
  job?: Job | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: Partial<Job>) => Promise<void>;
}

export default function JobFormModal({
  job,
  isOpen,
  onClose,
  onSave,
}: JobFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [runAt, setRunAt] = useState("");
  const [dataJson, setDataJson] = useState("{}");
  const [repeatType, setRepeatType] = useState<"none" | "cron" | "every">(
    "none"
  );
  const [cronExpression, setCronExpression] = useState("");
  const [everyInterval, setEveryInterval] = useState("");
  const [timezone, setTimezone] = useState("");
  const [maxRetries, setMaxRetries] = useState("3");
  const [retryDelay, setRetryDelay] = useState("1000");

  useEffect(() => {
    if (isOpen) {
      if (job) {
        // Edit Mode
        setName(job.name);
        setRunAt(
          job.nextRunAt
            ? new Date(job.nextRunAt).toISOString().slice(0, 16)
            : ""
        );
        setDataJson(JSON.stringify(job.data || {}, null, 2));

        if (job.repeat?.cron) {
          setRepeatType("cron");
          setCronExpression(job.repeat.cron);
          setTimezone(job.repeat.timezone || "");
        } else if (job.repeat?.every) {
          setRepeatType("every");
          setEveryInterval(job.repeat.every.toString());
        } else {
          setRepeatType("none");
        }

        if (job.retry) {
          setMaxRetries(job.retry.maxAttempts?.toString() || "3");
          const delay =
            typeof job.retry.delay === "number" ? job.retry.delay : 1000;
          setRetryDelay(delay.toString());
        }
      } else {
        // Create Mode - Reset
        setName("");
        setRunAt("");
        setDataJson("{}");
        setRepeatType("none");
        setCronExpression("");
        setTimezone("");
        setEveryInterval("");
        setMaxRetries("3");
        setRetryDelay("1000");
      }
      setError(null);
    }
  }, [isOpen, job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let parsedData = {};
      try {
        parsedData = JSON.parse(dataJson);
      } catch (err) {
        throw new Error("Invalid JSON in Data field");
      }

      const payload: any = {
        name,
        data: parsedData,
        runAt: runAt ? new Date(runAt).toISOString() : undefined,
        retry: {
          maxAttempts: parseInt(maxRetries),
          delay: parseInt(retryDelay),
        },
      };

      if (repeatType === "cron" && cronExpression) {
        payload.repeat = {
          cron: cronExpression,
          ...(timezone && { timezone }),
        };
      } else if (repeatType === "every" && everyInterval) {
        payload.repeat = { every: parseInt(everyInterval) };
      } else {
        payload.repeat = undefined;
      }

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save job");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800/50 rounded-t-xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              {job ? (
                <Database className="w-5 h-5 text-blue-400" />
              ) : (
                <Save className="w-5 h-5 text-green-400" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-white">
              {job ? "Edit Job" : "Create New Job"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto flex-1"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Job Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. send-email-campaign"
                disabled={!!job} // Usually name is immutable or hard to change logic for, but API lets us. Let's keep editable if API allows, but typical patterns lock it. User specifically asked for Create UI for API, API code uses name. I will leave it enabled. Actually, re-reading API code, update doesn't take name. So disable if job exists.
              />
              {job && (
                <p className="text-xs text-gray-500 mt-1">
                  Job name cannot be changed once created.
                </p>
              )}
            </div>

            {/* Run At */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Run At (Optional)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="datetime-local"
                  value={runAt}
                  onChange={(e) => setRunAt(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to run immediately (or based on repeat schedule)
              </p>
            </div>

            {/* Repeat Configuration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 flex items-center gap-2">
                <Repeat className="w-4 h-4 text-gray-400" />
                Repeat Schedule
              </label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setRepeatType("none")}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    repeatType === "none"
                      ? "bg-blue-500/10 border-blue-500 text-blue-400"
                      : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  None
                </button>
                <button
                  type="button"
                  onClick={() => setRepeatType("cron")}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    repeatType === "cron"
                      ? "bg-blue-500/10 border-blue-500 text-blue-400"
                      : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  Cron
                </button>
                <button
                  type="button"
                  onClick={() => setRepeatType("every")}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    repeatType === "every"
                      ? "bg-blue-500/10 border-blue-500 text-blue-400"
                      : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  Interval
                </button>
              </div>

              {repeatType === "cron" && (
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={cronExpression}
                      onChange={(e) => setCronExpression(e.target.value)}
                      placeholder="Cron Expression (* * * * *)"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      list="timezones"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      placeholder="Timezone (e.g. UTC, America/New_York)"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                    />
                    <datalist id="timezones">
                      <option value="UTC" />
                      <option value="America/New_York" />
                      <option value="America/Los_Angeles" />
                      <option value="Europe/London" />
                      <option value="Europe/Paris" />
                      <option value="Asia/Tokyo" />
                      <option value="Asia/Kolkata" />
                      <option value="Australia/Sydney" />
                    </datalist>
                  </div>
                </div>
              )}
              {repeatType === "every" && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={everyInterval}
                    onChange={(e) => setEveryInterval(e.target.value)}
                    placeholder="Time in ms"
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                  />
                  <span className="text-gray-400 text-sm">ms</span>
                </div>
              )}
            </div>

            {/* Retry Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Max Retries
                </label>
                <input
                  type="number"
                  min="0"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Retry Delay (ms)
                </label>
                <input
                  type="number"
                  min="0"
                  value={retryDelay}
                  onChange={(e) => setRetryDelay(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Data JSON */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Data Payload (JSON)
              </label>
              <textarea
                value={dataJson}
                onChange={(e) => setDataJson(e.target.value)}
                rows={5}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/50 rounded-b-xl flex justify-end gap-3 sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {job ? "Update Job" : "Create Job"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
