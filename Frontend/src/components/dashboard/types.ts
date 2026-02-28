import type { Subject, UserTask } from '../../types/task';
import type { UserProfile } from '../../types/auth';
import type { FormEvent } from 'react';

export type DashboardSection = 'all' | 'today' | 'upcoming' | 'completed';

export type DueChip = 'all' | 'none' | 'today' | 'next7';

export type TaskFormState = {
  title: string;
  description: string;
  subjectId: string;
  dueDate: string;
  priority: 1 | 2 | 3 | 4 | 5;
};

export type DashboardStats = {
  total: number;
  active: number;
  completed: number;
  completionRate: number;
};

export type SectionCounts = Record<DashboardSection, number>;

export type SidebarProps = {
  profile: UserProfile;
  selectedSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
  sectionCounts: SectionCounts;
  subjects: Subject[];
  subjectName: string;
  onSubjectNameChange: (value: string) => void;
  onSubjectCreate: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onSubjectRename: (subject: Subject) => Promise<void>;
  onSubjectDelete: (subjectId: string) => Promise<void>;
  onLogout: () => Promise<void>;
};

export type TopbarProps = {
  title: string;
  stats: DashboardStats;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddTaskClick: () => void;
  onRefresh: () => Promise<void>;
  isRefreshing: boolean;
  filtersOpen: boolean;
  onToggleFilters: () => void;
};

export type FilterBarProps = {
  visible: boolean;
  dueChip: DueChip;
  onDueChipChange: (chip: DueChip) => void;
  subjectFilter: string;
  onSubjectFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  subjects: Subject[];
};

export type QuickAddProps = {
  expanded: boolean;
  editingTaskId: string | null;
  taskForm: TaskFormState;
  subjects: Subject[];
  isSubmitting: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onTaskFormChange: (next: TaskFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCancelEdit: () => void;
};

export type TaskListProps = {
  tasks: UserTask[];
  expandedTaskId: string | null;
  onToggleExpand: (taskId: string) => void;
  onTaskEdit: (task: UserTask) => void;
  onTaskDelete: (taskId: string) => Promise<void>;
  onTaskComplete: (taskId: string) => Promise<void>;
  subjectNameById: (id: string | null) => string;
  formatDate: (date: string | null) => string;
  priorityLabel: (priority: 1 | 2 | 3 | 4 | 5) => string;
  statusLabel: (status: 0 | 1) => string;
};
