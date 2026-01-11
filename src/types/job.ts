export interface Job {
  _id: string;
  name: string;
  data?: any;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  attempts: number;
  nextRunAt: Date | string;
  lastRunAt?: Date | string;
  lockedAt?: Date | string;
  lockedBy?: string;
  retry?: {
    maxAttempts: number;
    delay: number | ((attempt: number) => number);
  };
  repeat?: {
    cron?: string;
    every?: number;
    timezone?: string;
  };
  lastError?: string;
  priority?: number;
  concurrency?: number;
  dedupeKey?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface JobQuery {
  name?: string;
  status?: string | string[];
  limit?: number;
  skip?: number;
  sort?: {
    field: "nextRunAt" | "createdAt" | "updatedAt";
    order: "asc" | "desc";
  };
}

export interface JobStats {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
  cancelled: number;
}
