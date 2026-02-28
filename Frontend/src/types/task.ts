export type TaskPriority = 1 | 2 | 3 | 4 | 5;

export type TaskStatus = 0 | 1;

export interface UserTask {
  id: string;
  userId: string;
  subjectId: string | null;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
}

export interface CreateTaskRequest {
  userId: string;
  subjectId: string | null;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface UpdateTaskRequest {
  subjectId: string | null;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TaskPriority;
}

export interface Subject {
  id: string;
  name: string;
}
