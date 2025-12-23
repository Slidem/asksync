export interface Task {
  id: string;
  orgId: string;
  timeblockId?: string;
  order?: number;
  title: string;
  completed: boolean;
  currentlyWorkingOn: boolean;
  createdBy: string;
  createdAt: number;
  completedAt?: number;
}
