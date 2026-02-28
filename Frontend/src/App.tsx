import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';
import logo from './assets/brand/logo.png';
import securityIcon from './assets/brand/security.png';
import docsIcon from './assets/brand/docs.png';
import cookieIcon from './assets/brand/cookie.png';
import phoneIcon from './assets/brand/phone.png';
import {
  completeTask,
  createSubject,
  createTask,
  deleteSubject,
  deleteTask,
  getMe,
  getSubjects,
  getTasks,
  login,
  register,
  updateSubject,
  updateTask,
} from './lib/api';
import { clearSession, readSession, writeSession } from './lib/storage';
import type { StoredSession, UserProfile } from './types/auth';
import type { TaskPriority, TaskStatus, UserTask } from './types/task';
import Sidebar from './components/dashboard/Sidebar';
import Topbar from './components/dashboard/Topbar';
import FilterBar from './components/dashboard/FilterBar';
import QuickAdd from './components/dashboard/QuickAdd';
import TaskList from './components/dashboard/TaskList';
import type { DashboardSection, DueChip, TaskFormState } from './components/dashboard/types';

type AuthMode = 'login' | 'register';

type AuthFormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const INITIAL_AUTH_FORM: AuthFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
};

const INITIAL_TASK_FORM: TaskFormState = {
  title: '',
  description: '',
  subjectId: '',
  dueDate: '',
  priority: 2,
};

const SECTION_TITLES: Record<DashboardSection, string> = {
  all: 'All tasks',
  today: 'Today',
  upcoming: 'Upcoming',
  completed: 'Completed',
};

function toInputDate(date: string | null): string {
  if (!date) {
    return '';
  }

  if (date.includes('T')) {
    return date.split('T')[0];
  }

  return date;
}

function toApiDate(date: string): string | null {
  if (!date) {
    return null;
  }

  return date;
}

function parseTaskDate(date: string | null): Date | null {
  if (!date) {
    return null;
  }

  const normalized = date.includes('T') ? date : `${date}T00:00:00`;
  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function dayStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDate(date: string | null): string {
  const parsed = parseTaskDate(date);

  if (!parsed) {
    if (date) {
      return date;
    }

    return 'No due date';
  }

  return parsed.toLocaleDateString();
}

function isToday(date: string | null): boolean {
  const target = parseTaskDate(date);

  if (!target) {
    return false;
  }

  const current = dayStart(new Date());
  const targetDay = dayStart(target);

  return (
    targetDay.getFullYear() === current.getFullYear()
    && targetDay.getMonth() === current.getMonth()
    && targetDay.getDate() === current.getDate()
  );
}

function isWithinUpcoming(date: string | null): boolean {
  const target = parseTaskDate(date);

  if (!target) {
    return false;
  }

  const today = dayStart(new Date());
  const targetDay = dayStart(target);
  const inSevenDays = new Date(today);
  inSevenDays.setDate(today.getDate() + 7);

  return targetDay >= today && targetDay <= inSevenDays;
}

function App() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [authForm, setAuthForm] = useState<AuthFormState>(INITIAL_AUTH_FORM);

  const [session, setSession] = useState<StoredSession | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [subjects, setSubjects] = useState<Array<{ id: string; name: string }>>([]);

  const [taskForm, setTaskForm] = useState<TaskFormState>(INITIAL_TASK_FORM);
  const [subjectName, setSubjectName] = useState<string>('');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const [selectedSection, setSelectedSection] = useState<DashboardSection>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dueChip, setDueChip] = useState<DueChip>('all');
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);

  const [quickAddExpanded, setQuickAddExpanded] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDashboardLoading, setIsDashboardLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const authTitle = mode === 'login' ? 'Welcome back!' : 'Get Started Now';

  function applySession(nextSession: StoredSession): void {
    setSession(nextSession);
    writeSession(nextSession);
  }

  async function runWithSession<T>(
    operation: (activeSession: StoredSession) => Promise<{ data: T; session: StoredSession }>,
  ): Promise<T> {
    if (!session) {
      throw new Error('Session missing. Please sign in again.');
    }

    const result = await operation(session);

    if (
      result.session.accessToken !== session.accessToken
      || result.session.refreshToken !== session.refreshToken
    ) {
      applySession(result.session);
    }

    return result.data;
  }

  const fetchDashboardData = useCallback(async (activeSession: StoredSession): Promise<void> => {
    let sessionRef = activeSession;

    const subjectsResult = await getSubjects(sessionRef);
    sessionRef = subjectsResult.session;

    const tasksResult = await getTasks(sessionRef);
    sessionRef = tasksResult.session;

    applySession(sessionRef);
    setSubjects(subjectsResult.data);
    setTasks(tasksResult.data);
  }, []);

  useEffect(() => {
    const existingSession = readSession();

    if (!existingSession) {
      setIsLoading(false);
      return;
    }

    void (async () => {
      try {
        const meResult = await getMe(existingSession);
        applySession(meResult.session);
        setProfile(meResult.data);
        await fetchDashboardData(meResult.session);
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    })();
  }, [fetchDashboardData]);

  const filteredTasks = useMemo(() => {
    const matchesSection = (task: UserTask): boolean => {
      if (selectedSection === 'completed') {
        return task.status === 1;
      }

      if (selectedSection === 'today') {
        return task.status === 0 && isToday(task.dueDate);
      }

      if (selectedSection === 'upcoming') {
        return task.status === 0 && isWithinUpcoming(task.dueDate);
      }

      return task.status === 0;
    };

    const matchesDueChip = (task: UserTask): boolean => {
      if (selectedSection === 'completed') {
        return true;
      }

      if (dueChip === 'none') {
        return !task.dueDate;
      }

      if (dueChip === 'today') {
        return isToday(task.dueDate);
      }

      if (dueChip === 'next7') {
        return isWithinUpcoming(task.dueDate);
      }

      return true;
    };

    return tasks
      .filter(matchesSection)
      .filter(matchesDueChip)
      .filter((task) => (subjectFilter === 'all' ? true : task.subjectId === subjectFilter))
      .filter((task) => (priorityFilter === 'all' ? true : String(task.priority) === priorityFilter))
      .filter((task) => {
        if (!searchTerm.trim()) {
          return true;
        }

        const haystack = `${task.title} ${task.description ?? ''}`.toLowerCase();
        return haystack.includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => {
        if (!a.dueDate && !b.dueDate) {
          return 0;
        }

        if (!a.dueDate) {
          return 1;
        }

        if (!b.dueDate) {
          return -1;
        }

        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [dueChip, priorityFilter, searchTerm, selectedSection, subjectFilter, tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === 1).length;
    const active = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, active, completed, completionRate };
  }, [tasks]);

  const sectionCounts = useMemo(() => ({
    all: tasks.filter((task) => task.status === 0).length,
    today: tasks.filter((task) => task.status === 0 && isToday(task.dueDate)).length,
    upcoming: tasks.filter((task) => task.status === 0 && isWithinUpcoming(task.dueDate)).length,
    completed: tasks.filter((task) => task.status === 1).length,
  }), [tasks]);

  function resetTaskForm(): void {
    setTaskForm(INITIAL_TASK_FORM);
    setEditingTaskId(null);
  }

  function priorityLabel(priority: TaskPriority): string {
    const labels: Record<TaskPriority, string> = {
      1: 'Low',
      2: 'Medium',
      3: 'High',
      4: 'Urgent',
      5: 'Critical',
    };

    return labels[priority];
  }

  function statusLabel(status: TaskStatus): string {
    return status === 1 ? 'Completed' : 'Active';
  }

  function subjectNameById(id: string | null): string {
    if (!id) {
      return 'No subject';
    }

    return subjects.find((subject) => subject.id === id)?.name ?? 'Unknown subject';
  }

  async function onLogout(): Promise<void> {
    clearSession();
    setSession(null);
    setProfile(null);
    setTasks([]);
    setSubjects([]);
    setSuccessMessage('Signed out successfully.');
    setErrorMessage('');
  }

  async function onAuthSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        await register({
          firstName: authForm.firstName.trim(),
          lastName: authForm.lastName.trim(),
          email: authForm.email.trim(),
          password: authForm.password,
        });

        setMode('login');
        setSuccessMessage('Registration successful. You can sign in now.');
        setAuthForm((current) => ({ ...current, password: '' }));
      } else {
        const loginResult = await login({
          email: authForm.email.trim(),
          password: authForm.password,
        });

        const currentSession: StoredSession = {
          accessToken: loginResult.accessToken,
          refreshToken: loginResult.refreshToken,
        };

        const meResult = await getMe(currentSession);
        applySession(meResult.session);
        setProfile(meResult.data);
        await fetchDashboardData(meResult.session);
        setAuthForm(INITIAL_AUTH_FORM);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function reloadDashboard(): Promise<void> {
    try {
      setIsDashboardLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      await runWithSession(async (activeSession) => {
        const subjectsResult = await getSubjects(activeSession);
        const tasksResult = await getTasks(subjectsResult.session);

        return {
          data: {
            subjects: subjectsResult.data,
            tasks: tasksResult.data,
          },
          session: tasksResult.session,
        };
      }).then((data) => {
        setSubjects(data.subjects);
        setTasks(data.tasks);
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not refresh dashboard.');
    } finally {
      setIsDashboardLoading(false);
    }
  }

  async function onSubjectCreate(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!subjectName.trim()) {
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');
      await runWithSession((activeSession) => createSubject(activeSession, subjectName.trim()));
      setSubjectName('');
      setSuccessMessage('Subject created.');
      await reloadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not create subject.');
    }
  }

  async function onSubjectRename(subject: { id: string; name: string }): Promise<void> {
    const nextName = window.prompt('Rename subject', subject.name);

    if (!nextName || nextName.trim() === subject.name) {
      return;
    }

    try {
      await runWithSession((activeSession) => updateSubject(activeSession, subject.id, nextName.trim()));
      setSuccessMessage('Subject updated.');
      await reloadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not rename subject.');
    }
  }

  async function onSubjectDelete(subjectId: string): Promise<void> {
    if (!window.confirm('Delete this subject?')) {
      return;
    }

    try {
      await runWithSession((activeSession) => deleteSubject(activeSession, subjectId));
      setSuccessMessage('Subject deleted.');
      await reloadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete subject.');
    }
  }

  async function onTaskSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!profile) {
      setErrorMessage('Missing profile context. Sign in again.');
      return;
    }

    if (!taskForm.title.trim()) {
      setErrorMessage('Task title is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      if (editingTaskId) {
        await runWithSession((activeSession) =>
          updateTask(activeSession, editingTaskId, {
            title: taskForm.title.trim(),
            description: taskForm.description.trim() ? taskForm.description.trim() : null,
            dueDate: toApiDate(taskForm.dueDate),
            priority: taskForm.priority,
            subjectId: taskForm.subjectId || null,
          }));

        setSuccessMessage('Task updated.');
      } else {
        await runWithSession((activeSession) =>
          createTask(activeSession, {
            userId: profile.id,
            title: taskForm.title.trim(),
            description: taskForm.description.trim() ? taskForm.description.trim() : null,
            dueDate: toApiDate(taskForm.dueDate),
            priority: taskForm.priority,
            subjectId: taskForm.subjectId || null,
            status: 0,
          }));

        setSuccessMessage('Task created.');
      }

      resetTaskForm();
      setQuickAddExpanded(false);
      await reloadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save task.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function onTaskEdit(task: UserTask): void {
    setEditingTaskId(task.id);
    setQuickAddExpanded(true);
    setTaskForm({
      title: task.title,
      description: task.description ?? '',
      subjectId: task.subjectId ?? '',
      dueDate: toInputDate(task.dueDate),
      priority: task.priority,
    });
  }

  async function onTaskDelete(taskId: string): Promise<void> {
    if (!window.confirm('Delete this task?')) {
      return;
    }

    try {
      await runWithSession((activeSession) => deleteTask(activeSession, taskId));
      setSuccessMessage('Task deleted.');
      await reloadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete task.');
    }
  }

  async function onTaskComplete(taskId: string): Promise<void> {
    try {
      await runWithSession((activeSession) => completeTask(activeSession, taskId));
      setSuccessMessage('Task completed.');
      await reloadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not complete task.');
    }
  }

  if (isLoading) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <p className="status-text">Loading session...</p>
        </section>
      </main>
    );
  }

  if (session && profile) {
    return (
      <main className="app-shell">
        <Sidebar
          profile={profile}
          selectedSection={selectedSection}
          onSectionChange={setSelectedSection}
          sectionCounts={sectionCounts}
          subjects={subjects}
          subjectName={subjectName}
          onSubjectNameChange={setSubjectName}
          onSubjectCreate={onSubjectCreate}
          onSubjectRename={onSubjectRename}
          onSubjectDelete={onSubjectDelete}
          onLogout={onLogout}
        />

        <section className="workspace">
          <Topbar
            title={SECTION_TITLES[selectedSection]}
            stats={stats}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddTaskClick={() => {
              setQuickAddExpanded(true);
              if (!editingTaskId) {
                resetTaskForm();
              }
            }}
            onRefresh={reloadDashboard}
            isRefreshing={isDashboardLoading}
            filtersOpen={filtersOpen}
            onToggleFilters={() => setFiltersOpen((value) => !value)}
          />

          <QuickAdd
            expanded={quickAddExpanded}
            editingTaskId={editingTaskId}
            taskForm={taskForm}
            subjects={subjects}
            isSubmitting={isSubmitting}
            onExpand={() => setQuickAddExpanded(true)}
            onCollapse={() => setQuickAddExpanded(false)}
            onTaskFormChange={setTaskForm}
            onSubmit={onTaskSubmit}
            onCancelEdit={resetTaskForm}
          />

          <FilterBar
            visible={filtersOpen}
            dueChip={dueChip}
            onDueChipChange={setDueChip}
            subjectFilter={subjectFilter}
            onSubjectFilterChange={setSubjectFilter}
            priorityFilter={priorityFilter}
            onPriorityFilterChange={setPriorityFilter}
            subjects={subjects}
          />

          <TaskList
            tasks={filteredTasks}
            expandedTaskId={expandedTaskId}
            onToggleExpand={(taskId) =>
              setExpandedTaskId((current) => (current === taskId ? null : taskId))
            }
            onTaskEdit={onTaskEdit}
            onTaskDelete={onTaskDelete}
            onTaskComplete={onTaskComplete}
            subjectNameById={subjectNameById}
            formatDate={formatDate}
            priorityLabel={priorityLabel}
            statusLabel={statusLabel}
          />

          {errorMessage ? <p className="error-text global">{errorMessage}</p> : null}
          {successMessage ? <p className="success-text global">{successMessage}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="auth-shell">
      <div className="shape shape-one" />
      <div className="shape shape-two" />
      <div className="shape shape-three" />

      <div className={mode === 'register' ? 'auth-container auth-container--signup' : 'auth-container'}>
        <section className="auth-branding">
          <img className="brand-logo" src={logo} alt="Tasko logo" />
          <p className="brand-tagline">Stay on top of your day</p>
        </section>

        <section className="auth-card">
          <h1>{authTitle}</h1>

          <form onSubmit={onAuthSubmit} className="auth-form">
            {mode === 'register' ? (
              <>
                <label htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  type="text"
                  value={authForm.firstName}
                  required
                  onChange={(event) => setAuthForm((current) => ({ ...current, firstName: event.target.value }))}
                />

                <label htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  type="text"
                  value={authForm.lastName}
                  required
                  onChange={(event) => setAuthForm((current) => ({ ...current, lastName: event.target.value }))}
                />
              </>
            ) : null}

            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={authForm.email}
              required
              onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              minLength={8}
              value={authForm.password}
              required
              onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
            />

            {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
            {successMessage ? <p className="success-text">{successMessage}</p> : null}

            <button type="submit" disabled={isSubmitting} className="primary-button">
              {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <button
            type="button"
            className="link-button"
            onClick={() => {
              setMode((current) => (current === 'login' ? 'register' : 'login'));
              setErrorMessage('');
              setSuccessMessage('');
            }}
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </section>
      </div>

      <footer className="auth-footer">
        <a href="#" onClick={(event) => event.preventDefault()}>
          <img src={securityIcon} alt="Security" /> Privacy Policy
        </a>
        <a href="#" onClick={(event) => event.preventDefault()}>
          <img src={docsIcon} alt="Documents" /> Terms and Conditions
        </a>
        <a href="#" onClick={(event) => event.preventDefault()}>
          <img src={cookieIcon} alt="Cookie" /> Cookie Policy
        </a>
        <a href="#" onClick={(event) => event.preventDefault()}>
          <img src={phoneIcon} alt="Support" /> Contact/Support
        </a>
      </footer>
    </main>
  );
}

export default App;
