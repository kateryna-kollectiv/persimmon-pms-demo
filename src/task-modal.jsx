// Task detail modal — opens when you click an Assigned-To-Me row

const TaskModal = ({ task, onClose, onOpenPatient, onComplete }) => {
  if (!task) return null;
  const patient = task.patientId ? patientById(task.patientId) : null;
  const priColor = { high:"#A64242", medium:"#B65A1F", low:"#5A7A2F" }[task.priority];
  const priBg    = { high:"#FFE2E3", medium:"#FFEEE0", low:"#E6EFDB" }[task.priority];

  return (
    <>
      <div className="task-scrim" onClick={onClose}/>
      <div className="task-modal" role="dialog" aria-modal="true">
        <button className="task-x" onClick={onClose} aria-label="Close">
          <Icon name="x" size={18}/>
        </button>

        <div className="task-head">
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
            <span>Assigned by</span>
            <b>{task.assignor}</b>
          </div>
        </div>

        <div className="task-body">
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
                    <Icon name="file" size={14}/>
                    <span>{r}</span>
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

        <div className="task-foot">
          <button className="btn btn-ghost" onClick={onClose}>Snooze</button>
          <div style={{flex:1}}/>
          <button className="btn btn-secondary" onClick={onClose}>Reassign</button>
          <button className="btn btn-primary" onClick={()=>onComplete(task.id)}>
            <Icon name="check" size={16} stroke={3}/>Mark complete
          </button>
        </div>
      </div>
    </>
  );
};

window.TaskModal = TaskModal;
