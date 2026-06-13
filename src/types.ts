export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  _count?: {
    tasks: number;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  dueDate: string;
  userId: string;
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface WorkloadItem {
  userId: string;
  name: string;
  role: string;
  avatarColor: string;
  inProgressCount: number;
  isOvercapacity: boolean;
}

export interface DashboardMetrics {
  summary: {
    total: number;
    completed: number;
    todo: number;
    inProgress: number;
    overdueCount: number;
    urgentCount: number;
  };
  overdueTasks: Task[];
  urgentTasks: Task[];
  workload: WorkloadItem[];
}
