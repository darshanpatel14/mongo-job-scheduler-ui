import { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
import StatsCards from './components/StatsCards';
import JobFilters from './components/JobFilters';
import JobList from './components/JobList';
import JobDetails from './components/JobDetails';
import JobFormModal from './components/JobFormModal';

import { jobsApi } from './services/api';
import type { Job, JobStats } from './types/job';

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobStats | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal States
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{ status?: string; search?: string }>({});

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobsApi.getJobs();
      setJobs(data);
      // We don't set filteredJobs here directly if we want to respect current filters
      // But initial load or refresh usually resets or re-applies filters.
      // let's rely on the useEffect dependency on 'jobs' to re-run the filter logic?
      // Actually, the useEffect depends on [filters, jobs]. So setting jobs will trigger it.
      // But we need to make sure we don't overwrite filteredJobs if filters exist.
      // The useEffect below handles it.
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      // Mock data logic removed for brevity as it's not the focus of this diff and was just for demo
      setJobs([]); 
    } finally {
      setLoading(false);
    }
  };

  // ... (fetchStats same as before)
  const fetchStats = async () => {
    try {
      const data = await jobsApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  // Apply filters and Pagination Reset
  useEffect(() => {
    let filtered = jobs;

    if (filters.status) {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(job =>
        job.name.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    setFilteredJobs(filtered);
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [filters, jobs]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, []);

  // Update stats when jobs change
  useEffect(() => {
    if (jobs.length > 0) {
      fetchStats();
    }
  }, [jobs]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  // ... (Handlers: handleDelete, handleRetry, handleCancel, handleSaveJob, openCreateModal, openEditModal - same as before)
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    try {
      await jobsApi.deleteJob(id);
      fetchJobs();
    } catch (error) {
      console.error('Failed to delete job:', error);
    }
  };

  const handleRetry = async (id: string) => {
    try {
      await jobsApi.retryJob(id);
      fetchJobs();
    } catch (error) {
      console.error('Failed to retry job:', error);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this job?')) return;
    try {
      await jobsApi.cancelJob(id);
      fetchJobs();
    } catch (error) {
      console.error('Failed to cancel job:', error);
    }
  };

  const handleSaveJob = async (jobData: Partial<Job>) => {
    if (editingJob) {
      await jobsApi.updateJob(editingJob._id, jobData);
    } else {
      await jobsApi.createJob(jobData);
    }
    fetchJobs();
  };

  const openCreateModal = () => {
    setEditingJob(null);
    setIsFormOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setIsFormOpen(true);
  };

  // Pagination Logic
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const currentJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Header */}
      <header className="flex-none bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-sm border-b border-gray-700/50 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Mongo Scheduler UI
                </h1>
                <p className="text-sm text-gray-400">Job Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400 hidden sm:block">
                Auto-refresh: 30s
                </div>
                <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
                >
                <Plus className="w-4 h-4" />
                Create Job
                </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 gap-6">
        
        {/* Fixed Top Section: Stats & Filters */}
        <div className="flex-none space-y-6">
            <StatsCards stats={stats} />
            <JobFilters onFilterChange={setFilters} />
        </div>

        {/* Scrollable List Section */}
        <div className="flex-1 flex flex-col min-h-0 bg-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm overflow-hidden">
             
                <div className="flex-1 overflow-y-auto px-4 py-4 min-h-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    <JobList
                        jobs={currentJobs}
                        loading={loading}
                        onJobClick={setSelectedJob}
                        onEdit={openEditModal}
                        onRefresh={fetchJobs}
                        onDelete={handleDelete}
                        onRetry={handleRetry}
                        onCancel={handleCancel}
                        // Pagination Props
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={setItemsPerPage}
                        totalItems={filteredJobs.length}
                    />
                </div>
        </div>
      </main>

      {/* Job Details Modal */}
      <JobDetails job={selectedJob} onClose={() => setSelectedJob(null)} />

      {/* Create/Edit Job Modal */}
      <JobFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveJob} 
        job={editingJob}
      />
    </div>
  );
}

export default App;
