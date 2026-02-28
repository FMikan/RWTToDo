import type { TaskListProps } from './types';

function TaskList({
  tasks,
  expandedTaskId,
  onToggleExpand,
  onTaskEdit,
  onTaskDelete,
  onTaskComplete,
  subjectNameById,
  formatDate,
  priorityLabel,
  statusLabel,
}: TaskListProps) {
  return (
    <ul className="task-list" aria-label="Task list">
      {tasks.map((task) => {
        const expanded = expandedTaskId === task.id;

        return (
          <li key={task.id} className={task.status === 1 ? 'task-row done' : 'task-row'}>
            <button
              type="button"
              className="row-main"
              onClick={() => onToggleExpand(task.id)}
              aria-expanded={expanded}
            >
              <div className="row-title-wrap">
                <span className="row-title">{task.title}</span>
                <span className={task.status === 1 ? 'status-dot done' : 'status-dot active'}>{statusLabel(task.status)}</span>
              </div>
              <div className="row-meta">
                <span>{subjectNameById(task.subjectId)}</span>
                <span>{formatDate(task.dueDate)}</span>
                <span>{priorityLabel(task.priority)}</span>
              </div>
            </button>

            {expanded ? (
              <div className="row-expand">
                <p>{task.description || 'No description'}</p>
                <div className="row-actions">
                  {task.status === 0 ? (
                    <button type="button" className="primary-button small" onClick={() => void onTaskComplete(task.id)}>
                      Complete
                    </button>
                  ) : null}
                  <button type="button" className="ghost-button small" onClick={() => onTaskEdit(task)}>
                    Edit
                  </button>
                  <button type="button" className="danger-button small" onClick={() => void onTaskDelete(task.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ) : null}
          </li>
        );
      })}

      {tasks.length === 0 ? <li className="task-empty">No tasks in this view.</li> : null}
    </ul>
  );
}

export default TaskList;
