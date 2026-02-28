import type { DashboardSection, SidebarProps } from './types';

const SECTION_LABELS: Record<DashboardSection, string> = {
  all: 'Inbox / All tasks',
  today: 'Today',
  upcoming: 'Upcoming',
  completed: 'Completed',
};

function Sidebar({
  profile,
  selectedSection,
  onSectionChange,
  sectionCounts,
  subjects,
  subjectName,
  onSubjectNameChange,
  onSubjectCreate,
  onSubjectRename,
  onSubjectDelete,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <p className="wordmark">TASKO</p>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {(Object.keys(SECTION_LABELS) as DashboardSection[]).map((section) => (
          <button
            key={section}
            type="button"
            className={selectedSection === section ? 'nav-item active' : 'nav-item'}
            onClick={() => onSectionChange(section)}
          >
            <span>{SECTION_LABELS[section]}</span>
            <span className="count-badge">{sectionCounts[section]}</span>
          </button>
        ))}
      </nav>

      <section className="subjects-block" aria-label="Subjects">
        <div className="subjects-head">
          <h3>Subjects</h3>
        </div>

        <form className="subject-quick-add" onSubmit={onSubjectCreate}>
          <input
            type="text"
            placeholder="Add subject"
            value={subjectName}
            onChange={(event) => onSubjectNameChange(event.target.value)}
            aria-label="Add subject"
            required
          />
          <button type="submit" className="ghost-button small" aria-label="Create subject">
            Add
          </button>
        </form>

        <ul className="subjects-mini-list">
          {subjects.map((subject) => (
            <li key={subject.id}>
              <span>{subject.name}</span>
              <div className="mini-actions">
                <button type="button" className="icon-button" onClick={() => onSubjectRename(subject)} aria-label={`Rename ${subject.name}`}>
                  ✎
                </button>
                <button type="button" className="icon-button danger" onClick={() => onSubjectDelete(subject.id)} aria-label={`Delete ${subject.name}`}>
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="sidebar-footer">
        <div className="profile-block">
          <strong>{profile.firstName} {profile.lastName}</strong>
          <span>{profile.email}</span>
        </div>
        <button type="button" className="danger-button" onClick={onLogout} aria-label="Logout">
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
