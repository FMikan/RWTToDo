import { useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import type { QuickAddProps } from './types';

function QuickAdd({
  expanded,
  editingTaskId,
  taskForm,
  subjects,
  isSubmitting,
  onExpand,
  onCollapse,
  onTaskFormChange,
  onSubmit,
  onCancelEdit,
}: QuickAddProps) {
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (expanded) {
      titleRef.current?.focus();
    }
  }, [expanded]);

  function onKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (editingTaskId) {
        onCancelEdit();
      }
      onCollapse();
    }
  }

  return (
    <section className={expanded ? 'quick-add expanded' : 'quick-add'}>
      <form onSubmit={onSubmit} onKeyDown={onKeyDown}>
        <input
          ref={titleRef}
          className="quick-title"
          type="text"
          placeholder="+ Add a task..."
          value={taskForm.title}
          onFocus={onExpand}
          onChange={(event) => onTaskFormChange({ ...taskForm, title: event.target.value })}
          aria-label="Task title"
          required
        />

        {expanded ? (
          <div className="quick-expanded-fields">
            <textarea
              placeholder="Description"
              value={taskForm.description}
              onChange={(event) => onTaskFormChange({ ...taskForm, description: event.target.value })}
              rows={3}
              aria-label="Task description"
            />

            <div className="quick-row">
              <select
                value={taskForm.subjectId}
                onChange={(event) => onTaskFormChange({ ...taskForm, subjectId: event.target.value })}
                aria-label="Task subject"
              >
                <option value="">No subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>

              <input
                type="date"
                value={taskForm.dueDate}
                onChange={(event) => onTaskFormChange({ ...taskForm, dueDate: event.target.value })}
                aria-label="Due date"
              />

              <select
                value={String(taskForm.priority)}
                onChange={(event) => onTaskFormChange({ ...taskForm, priority: Number(event.target.value) as 1 | 2 | 3 | 4 | 5 })}
                aria-label="Task priority"
              >
                <option value="1">Low</option>
                <option value="2">Medium</option>
                <option value="3">High</option>
                <option value="4">Urgent</option>
                <option value="5">Critical</option>
              </select>
            </div>

            <div className="quick-actions">
              <button type="submit" className="primary-button" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : editingTaskId ? 'Update task' : 'Create task'}
              </button>
              <button type="button" className="ghost-button" onClick={onCollapse}>
                Cancel
              </button>
              {editingTaskId ? (
                <button type="button" className="ghost-button" onClick={onCancelEdit}>
                  Reset Edit
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </form>
    </section>
  );
}

export default QuickAdd;
