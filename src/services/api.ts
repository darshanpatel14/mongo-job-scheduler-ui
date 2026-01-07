import axios from "axios";
import type { Job, JobQuery, JobStats } from "../types/job";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const jobsApi = {
  // Get all jobs with optional filters
  getJobs: async (query?: JobQuery): Promise<Job[]> => {
    const response = await api.get("/jobs", { params: query });
    return response.data;
  },

  // Get job by ID
  getJob: async (id: string): Promise<Job> => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Get job statistics
  getStats: async (): Promise<JobStats> => {
    const response = await api.get("/jobs/stats");
    return response.data;
  },

  // Cancel a job
  cancelJob: async (id: string): Promise<void> => {
    await api.post(`/jobs/${id}/cancel`);
  },

  // Retry a failed job
  retryJob: async (id: string): Promise<void> => {
    await api.post(`/jobs/${id}/retry`);
  },

  // Create a new job
  createJob: async (jobData: Partial<Job>): Promise<Job> => {
    const response = await api.post("/jobs", jobData);
    return response.data;
  },

  // Update an existing job
  updateJob: async (id: string, jobData: Partial<Job>): Promise<Job> => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  // Delete a job
  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },
};
