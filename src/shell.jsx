// App shell: sidebar + topbar + sub-toolbar
const Sidebar = ({ view, setView }) => {
  const items = [
  { id: "huddle", icon: "grid", label: "Huddle" },
  { id: "schedule", icon: "calendar", label: "Schedule" },
  { id: "patients", icon: "users", label: "Patients" }];

  return (
    <aside className="sidebar" aria-label="Primary">
      <div className="sb-logo" title="Persimmon">
        <img src="assets/p-shape.svg" alt="Persimmon" style={{ width: 24, height: 24 }} />
      </div>
      {items.map((it) =>
      <button key={it.id} className={"sb-item" + (view === it.id ? " active" : "")}
      title={it.label} onClick={() => setView(it.id)}>
          <Icon name={it.icon} size={20} />
        </button>
      )}
      <div className="sb-spacer" />
    </aside>);

};

const TopBar = ({ title, sub, onTasksClick }) =>
<div className="topbar">
    <div className="topbar-title">
      <h1 style={{ height: "32px" }}>{title}</h1>
      {sub && <div className="sub" style={{ padding: "4px" }}>{sub}</div>}
    </div>
    <div className="search">
      <input placeholder="What are you looking for?" />
      <button className="search-btn"><Icon name="search" size={16} stroke={2.4} /></button>
    </div>
    <div className="topbar-end">
      <button className="iconbtn" title="My tasks" onClick={onTasksClick}>
        <Icon name="listTodo" size={20} />
      </button>
      <button className="iconbtn" title="Notifications" style={{ position: "relative" }}>
        <Icon name="bell" size={20} />
        <span className="bell-dot" aria-hidden="true" />
      </button>
      <button className="topbar-avatar" title="Sasha (you)" aria-label="Account">
        <div className="topbar-avatar-img" style={{ backgroundImage: `url(${AVATARS[1]})` }} />
      </button>
    </div>
  </div>;


const SubToolbar = ({ children }) =>
<div className="sub-toolbar">{children}</div>;


const DatePill = ({ date, onPrev, onNext }) =>
<div className="pill">
    <button onClick={onPrev}><Icon name="chevL" size={14} stroke={2.4} /></button>
    <div className="icon"><Icon name="calendar" size={18} /></div>
    <span>{date}</span>
    <button onClick={onNext}><Icon name="chevR" size={14} stroke={2.4} /></button>
  </div>;


const Segmented = ({ options, value, onChange }) =>
<div className="seg">
    {options.map((o) =>
  <button key={o} className={value === o ? "on" : ""} onClick={() => onChange(o)}>{o}</button>
  )}
  </div>;


// View-specific filter groups
const FILTER_GROUPS = {
  schedule: [
  { key: "provider", label: "Provider", options: ["Dr. Whitaker", "Dr. Okafor", "Dr. Normand", "Dr. Sidny", "Brenda, RDH", "Macus, RDH"] },
  { key: "status", label: "Status", options: ["Confirmed", "Unconfirmed", "In chair", "Complete", "No-show"] },
  { key: "type", label: "Visit type", options: ["Hygiene", "Restorative", "Surgery", "New patient"] }],

  patients: [
  { key: "carrier", label: "Insurance carrier", options: ["Delta Dental", "MetLife", "Cigna", "Aetna", "Guardian", "Medicare"] },
  { key: "flag", label: "Flags", options: ["Past due balance", "Recall overdue", "New patient", "Premed required", "Allergy"] },
  { key: "recall", label: "Last visit", options: ["This week", "This month", "6+ months", "Never"] }],

  huddle: [
  { key: "period", label: "Period", options: ["Today", "Yesterday", "This week", "This month"] },
  { key: "chairs", label: "Chairs", options: ["All operatories", "Dentists only", "Hygiene only"] }]

};

const FilterPill = ({ view, active, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {if (ref.current && !ref.current.contains(e.target)) setOpen(false);};
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const groups = FILTER_GROUPS[view] || [];
  const count = Object.values(active || {}).reduce((n, arr) => n + (arr?.length || 0), 0);
  const isActive = count > 0;

  const toggle = (groupKey, opt) => {
    const cur = active?.[groupKey] || [];
    const next = cur.includes(opt) ? cur.filter((x) => x !== opt) : [...cur, opt];
    onChange({ ...(active || {}), [groupKey]: next });
  };

  const clearAll = () => {onChange({});};

  return (
    <div ref={ref} className={"filter-pill" + (isActive ? " active" : "")} onClick={() => setOpen((o) => !o)}>
      <Icon name="filter" size={16} />
      <span>{isActive ? `${count} filter${count > 1 ? "s" : ""}` : "Filter by"}</span>
      <Icon name={open ? "chevD" : "chevD"} size={16} />
      {open &&
      <div className="filter-pop" onClick={(e) => e.stopPropagation()}>
          {groups.map((g) =>
        <div key={g.key}>
              <h4>{g.label}</h4>
              <div className="filter-chips">
                {g.options.map((opt) => {
              const on = (active?.[g.key] || []).includes(opt);
              return (
                <button key={opt} className={"filter-chip" + (on ? " on" : "")}
                onClick={() => toggle(g.key, opt)}>{opt}</button>);

            })}
              </div>
            </div>
        )}
          <div className="filter-pop-foot">
            <button className="clear" onClick={clearAll}>Clear all</button>
            <button className="apply" onClick={() => setOpen(false)}>Done</button>
          </div>
        </div>
      }
    </div>);

};

Object.assign(window, { Sidebar, TopBar, SubToolbar, DatePill, Segmented, FilterPill });