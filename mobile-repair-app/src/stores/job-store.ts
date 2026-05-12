import { create } from 'zustand';
import { Job, JobStatus, IssueCategory, ServiceType } from '../types';

interface JobState {
  jobs: Job[];
  /** Add a newly created booking to the store. */
  addJob: (job: Job) => void;
  /** Update the status of an existing job. */
  updateJobStatus: (jobId: string, status: JobStatus) => void;
  /** Get all jobs for the current customer. */
  getCustomerJobs: (customerId: string) => Job[];
}

/** Demo seed jobs for first-time display. */
const SEED_JOBS: Job[] = [
  {
    id: 'job-seed-1',
    customer_id: 'demo-user-001',
    technician_id: 'tech-001',
    tenant_id: 'demo-tenant-001',
    device_brand: 'Samsung',
    device_model: 'Galaxy S24',
    issue_category: IssueCategory.BATTERY,
    description: 'Battery drains within 2 hours of full charge.',
    photos: [],
    service_type: ServiceType.STORE_DROPOFF,
    status: JobStatus.COMPLETED,
    location: { address: 'Repair Center' },
    scheduled_at: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    deleted_at: null,
  },
];

export const useJobStore = create<JobState>((set, get) => ({
  jobs: SEED_JOBS,

  addJob: (job) =>
    set((state) => ({ jobs: [job, ...state.jobs] })),

  updateJobStatus: (jobId, status) =>
    set((state) => ({
      jobs: state.jobs.map((j) =>
        j.id === jobId ? { ...j, status, updated_at: new Date().toISOString() } : j,
      ),
    })),

  getCustomerJobs: (customerId) =>
    get().jobs.filter((j) => j.customer_id === customerId && !j.deleted_at),
}));
