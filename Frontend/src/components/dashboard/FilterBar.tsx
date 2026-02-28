import type { DueChip, FilterBarProps } from './types';

const DUE_CHIPS: Array<{ key: DueChip; label: string }> = [
  { key: 'all', label: 'All due' },
  { key: 'none', label: 'No due date' },
  { key: 'today', label: 'Today' },
  { key: 'next7', label: 'Next 7 days' },
];

function FilterBar({
  visible,
  dueChip,
  onDueChipChange,
  subjectFilter,
  onSubjectFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  subjects,
}: FilterBarProps) {
  return (
    <section className={visible ? 'filter-panel open' : 'filter-panel'} aria-hidden={!visible}>
      <div className="chip-row" role="tablist" aria-label="Due filters">
        {DUE_CHIPS.map((chip) => (
          <button
            key={chip.key}
            type="button"
            className={dueChip === chip.key ? 'chip active' : 'chip'}
            onClick={() => onDueChipChange(chip.key)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="advanced-filters">
        <select
          value={subjectFilter}
          onChange={(event) => onSubjectFilterChange(event.target.value)}
          aria-label="Filter by subject"
        >
          <option value="all">All subjects</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => onPriorityFilterChange(event.target.value)}
          aria-label="Filter by priority"
        >
          <option value="all">All priorities</option>
          <option value="1">Low</option>
          <option value="2">Medium</option>
          <option value="3">High</option>
          <option value="4">Urgent</option>
          <option value="5">Critical</option>
        </select>
      </div>
    </section>
  );
}

export default FilterBar;
