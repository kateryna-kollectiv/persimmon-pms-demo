// Full-screen tasks inbox — list of all assigned tasks on the left, detail view on the right.

const TasksInbox = ({ onClose, onOpenPatient, onComplete, initialId }) => {
  const [filter, setFilter] = React.useState("all"); // all | today | overdue
  const [query, setQuery] = React.useState("");
  const [activeId, setActiveId] = React.useState(initialId || (TASKS[0] && TASKS[0].id));
  const [composeOpen, setComposeOpen] = React.useState(false);

  // Esc to close
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const today = "Apr 29";
  const filtered = TASKS.filter(t => {
    if (filter === "today" && t.due !== today) return false;
    if (filter === "overdue" && t.due !== today) return false; // for demo, "Apr 29" is treated as today/overdue
    if (query) {
      const q = query.toLowerCase();
      if (!t.title.toLowerCase().includes(q) &&
          !t.assignor.toLowerCase().includes(q) &&
          !t.category.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const counts = {
    all: TASKS.length,
    today: TASKS.filter(t => t.due === today).length,
    overdue: TASKS.filter(t => t.due === today).length,
  };

  const active = filtered.find(t => t.id === activeId) || filtered[0];

  return (
    <>
      <div className="ti-scrim" onClick={onClose} />
      <div className="ti-modal" role="dialog" aria-modal="true">

        {/* Top bar */}
        <div className="ti-topbar">
          <div className="ti-title">
            <Icon name="listTodo" size={22} stroke={2.2} />
            <h2>My Tasks</h2>
            <span className="ti-count-pill">{TASKS.length}</span>
          </div>
          <div className="ti-search">
            <Icon name="search" size={16} />
            <input
              placeholder="Search tasks, patients, assignors…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && <button className="ti-clear" onClick={()=>setQuery("")}><Icon name="x" size={14}/></button>}
          </div>
          <div className="ti-actions">
            <button className="ti-btn-ghost" title="Filter">
              <Icon name="filter" size={16} />
              <span>Filter</span>
            </button>
            <button className="ti-btn-primary" onClick={()=>setComposeOpen(true)}>
              <Icon name="plus" size={16} stroke={2.6}/>
              <span>New task</span>
            </button>
            <button className="ti-x" onClick={onClose} aria-label="Close">
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        {/* Sort pills */}
        <div className="ti-pills">
          {[
            { id:"all",     label:"All",     count:counts.all },
            { id:"today",   label:"Today",   count:counts.today },
            { id:"overdue", label:"Overdue", count:counts.overdue, accent:true },
          ].map(p => (
            <button
              key={p.id}
              className={"ti-pill" + (filter===p.id ? " on" : "") + (p.accent ? " accent" : "")}
              onClick={()=>setFilter(p.id)}
            >
              {p.label}
              <span className="ti-pill-count">{p.count}</span>
            </button>
          ))}
          <div className="ti-pills-spacer" />
          <div className="ti-sort">
            <span>Sort by</span>
            <button>Due date <Icon name="chevD" size={12}/></button>
          </div>
        </div>

        {/* Body: list + detail */}
        <div className="ti-body">

          {/* List */}
          <div className="ti-list">
            {filtered.length === 0 && (
              <div className="ti-empty">
                <Icon name="check" size={32} stroke={2}/>
                <p>No tasks match.</p>
              </div>
            )}
            {filtered.map(t => {
              const patient = t.patientId ? patientById(t.patientId) : null;
              const isOverdue = t.due === today;
              return (
                <button
                  key={t.id}
                  className={"ti-row" + (active && active.id === t.id ? " on" : "")}
                  onClick={()=>setActiveId(t.id)}
                >
                  <span className={"ti-pri ti-pri-" + t.priority} aria-hidden="true" />
                  <div className="ti-row-body">
                    <div className="ti-row-title">{t.title}</div>
                    <div className="ti-row-meta">
                      <span className="ti-row-cat">{t.category}</span>
                      <span className="ti-row-dot"/>
                      <span className={"ti-row-due" + (isOverdue ? " today" : "")}>{t.due}</span>
                      <span className="ti-row-dot"/>
                      <span className="ti-row-by">{t.assignor}</span>
                    </div>
                    {patient && (
                      <div className="ti-row-patient">
                        <div className="av" style={{backgroundImage:`url(${AVATARS[patient.avatar]})`}}/>
                        <span>{patient.name}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail */}
          <div className="ti-detail">
            {active ? (
              <TasksInboxDetail
                task={active}
                onOpenPatient={onOpenPatient}
                onComplete={onComplete}
              />
            ) : (
              <div className="ti-detail-empty">
                <p>Select a task to see details.</p>
              </div>
            )}
          </div>
        </div>

        {/* Compose modal */}
        {composeOpen && (
          <div className="ti-compose-scrim" onClick={()=>setComposeOpen(false)}>
            <div className="ti-compose" onClick={e=>e.stopPropagation()}>
              <div className="ti-compose-head">
                <h3>Create new task</h3>
                <button onClick={()=>setComposeOpen(false)}><Icon name="x" size={16}/></button>
              </div>
              <div className="ti-compose-body">
                <label>Title<input type="text" placeholder="What needs to be done?"/></label>
                <div className="ti-compose-row">
                  <label>Due<input type="text" defaultValue="Apr 29"/></label>
                  <label>Priority
                    <select defaultValue="medium">
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </label>
                  <label>Category
                    <select defaultValue="Billing">
                      <option>Billing</option><option>Insurance</option>
                      <option>Clinical</option><option>Hygiene</option><option>Operations</option>
                    </select>
                  </label>
                </div>
                <label>Assign to<input type="text" defaultValue="Sasha (me)"/></label>
                <label>Description<textarea rows="4" placeholder="Add detail…"/></label>
              </div>
              <div className="ti-compose-foot">
                <button className="btn btn-ghost" onClick={()=>setComposeOpen(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={()=>setComposeOpen(false)}>Create task</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const TasksInboxDetail = ({ task, onOpenPatient, onComplete }) => {
  const patient = task.patientId ? patientById(task.patientId) : null;
  const priColor = { high:"#A64242", medium:"#B65A1F", low:"#5A7A2F" }[task.priority];
  const priBg    = { high:"#FFE2E3", medium:"#FFEEE0", low:"#E6EFDB" }[task.priority];

  return (
    <div className="ti-detail-inner">
      <div className="ti-detail-head">
        <div className="task-meta">
          <span className="task-cat">{task.category}</span>
          <span className="task-dot"/>
          <span className="task-pri" style={{color:priColor, background:priBg}}>
            <Icon name="flag" size={11}/>{task.priority}
          </span>
          <span className="task-dot"/>
          <span className="task-due">Due {task.due}</span>
        </div>
        <h2 className="task-title">{task.title}</h2>
        <div className="task-assigned">
          <span>Assigned by</span><b>{task.assignor}</b>
        </div>
      </div>

      <div className="ti-detail-body">
        <section className="task-sec">
          <h4>Description</h4>
          <p>{task.body}</p>
        </section>

        {patient && (
          <section className="task-sec">
            <h4>Related patient</h4>
            <button className="task-patient" onClick={()=>onOpenPatient(patient.id)}>
              <div className="av" style={{backgroundImage:`url(${AVATARS[patient.avatar]})`}}/>
              <div className="info">
                <div className="nm">{patient.name}</div>
                <div className="sub">
                  {patient.age} · {patient.sex} · {patient.carrier}
                  {patient.balance > 0 && <> · <b style={{color:"var(--persimmon)"}}>${patient.balance} due</b></>}
                </div>
              </div>
              <Icon name="arrowR" size={18}/>
            </button>
          </section>
        )}

        {task.related.length > 0 && (
          <section className="task-sec">
            <h4>Attachments &amp; references</h4>
            <div className="task-attach">
              {task.related.map((r,i)=>(
                <button key={i} className="task-ref">
                  <Icon name="file" size={14}/><span>{r}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="task-sec">
          <h4>Activity</h4>
          <div className="task-activity">
            <div className="ta-row">
              <div className="ta-dot"/>
              <div className="ta-text">
                <b>{task.assignor}</b> created this task
                <span className="ta-when">2 days ago</span>
              </div>
            </div>
            <div className="ta-row">
              <div className="ta-dot mute"/>
              <div className="ta-text">
                Assigned to <b>Sasha Whitaker</b>
                <span className="ta-when">2 days ago</span>
              </div>
            </div>
          </div>
        </section>

        <section className="task-sec">
          <h4>Add a note</h4>
          <div className="task-compose">
            <textarea placeholder={`Reply to ${task.assignor.split(",")[0]}…`}/>
            <div className="task-compose-foot">
              <button className="link"><Icon name="link" size={14}/>Attach</button>
              <button className="task-send"><Icon name="send" size={14}/>Send</button>
            </div>
          </div>
        </section>
      </div>

      <div className="ti-detail-foot">
        <button className="btn btn-ghost">Snooze</button>
        <div style={{flex:1}}/>
        <button className="btn btn-secondary">Reassign</button>
        <button className="btn btn-primary" onClick={()=>onComplete(task.id)}>
          <Icon name="check" size={16} stroke={3}/>Mark complete
        </button>
      </div>
    </div>
  );
};

window.TasksInbox = TasksInbox;
