import type { TopbarProps } from './types';

function Topbar({
  title,
  stats,
  searchTerm,
  onSearchChange,
  onAddTaskClick,
  onRefresh,
  isRefreshing,
  filtersOpen,
  onToggleFilters,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div className="title-block">
        <h1>{title}</h1>
        <p className="inline-stats">
          Total {stats.total} • Active {stats.active} • Completed {stats.completed} • {stats.completionRate}%
        </p>
      </div>

      <div className="topbar-controls">
        <input
          type="search"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tasks"
          aria-label="Search tasks"
        />

        <button
          type="button"
          className="primary-button"
          onClick={onAddTaskClick}
          aria-label="Open quick add task"
        >
          + Add task
        </button>

        <button
          type="button"
          className="icon-button"
          onClick={onToggleFilters}
          aria-label="Toggle filters"
          aria-expanded={filtersOpen}
        >
          Filters
        </button>

        <button
          type="button"
          className="icon-button"
          onClick={() => void onRefresh()}
          aria-label="Refresh tasks"
        >
          {isRefreshing ? '...' : '↻'}
        </button>
      </div>
    </header>
  );
}

export default Topbar;
