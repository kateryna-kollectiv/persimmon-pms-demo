// Schedule day view + appointment grid
const HOURS = (() => {
  const out = [];
  for (let h=DAY_START; h<DAY_END; h++) out.push(h*60);
  return out;
})();

const ScheduleView = ({ onSelectAppt, selectedAppt, currentMin, filters }) => {
  const wrapRef = React.useRef(null);
  const [hoverCell, setHoverCell] = React.useState(null); // {opId, slot, x,y}
  const [hoverAppt, setHoverAppt] = React.useState(null);

  const ops = OPERATORIES;
  const totalH = HOURS.length * ROW_HEIGHT;

  const f = filters || {};
  // Build a per-op visibility map and a per-appt match
  const providerOk = (op) => !f.provider?.length || f.provider.some(name => op.doc.toLowerCase().includes(name.toLowerCase().split(",")[0].toLowerCase()));
  const statusOk = (a) => !f.status?.length || f.status.some(s => STATUS[a.status]?.label.toLowerCase() === s.toLowerCase());
  const typeOk = (a, op) => {
    if (!f.type?.length) return true;
    const codes = (a.codes||[]).map(c=>c.code).join(" ");
    return f.type.some(t => {
      if (t==="Hygiene") return op.id.startsWith("hyg") || /D11|D41|D43|D49|D12/.test(codes);
      if (t==="Restorative") return /D2[0-9]+/.test(codes);
      if (t==="Surgery") return /D7[0-9]+|D60[0-9]+/.test(codes);
      if (t==="New patient") return /D0150/.test(codes);
      return true;
    });
  };
  const apptVisible = (a, op) => statusOk(a) && typeOk(a, op);

  const visibleOps = ops.filter(providerOk);
  const renderOps = visibleOps.length ? visibleOps : ops;

  const handleCellEnter = (opId, slotMin, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverCell({ opId, slotMin, x: rect.right + 12, y: rect.top });
  };
  const handleCellLeave = () => setHoverCell(null);

  const handleApptEnter = (appt, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverAppt({ appt, x: rect.right + 12, y: rect.top });
  };

  return (
    <div className="canvas">
      <div className="grid-wrap" ref={wrapRef} style={{"--ops":renderOps.length}}>
        <div className="op-head">
          <div className="corner"/>
          {renderOps.map(op => (
            <div key={op.id} className="opcell">
              <div className="name">{op.name}</div>
              <div className="doc">{op.doc}</div>
              <div className={"chair-status"+(op.busy?" busy":"")}>
                <span className="dot"/>
                {op.busy ? "In session" : "Available"}
              </div>
            </div>
          ))}
        </div>
        <div className="grid-body">
          <div className="grid" style={{height: totalH}}>
            <div className="timecol">
              {HOURS.map(m => (
                <div key={m} className="timeslot">{fmtTime(m).replace(":00","")}</div>
              ))}
            </div>
            {renderOps.map(op => (
              <div key={op.id} className="opcol">
                {HOURS.map((m, i) => (
                  <div key={m}
                    className="row"
                    onMouseEnter={(e)=>handleCellEnter(op.id, m, e)}
                    onMouseLeave={handleCellLeave}
                    onClick={()=>onSelectAppt({ kind:"new", opId:op.id, slot:m })}
                    style={{cursor:"pointer"}}
                  />
                ))}
                {APPTS.filter(a=>a.op===op.id).map(a => {
                  const top = minsToY(a.start);
                  const h = minsToY(a.end) - top - 4;
                  const patient = patientById(a.patientId);
                  const isSel = selectedAppt && selectedAppt.id === a.id;
                  const stat = STATUS[a.status];
                  const visible = apptVisible(a, op);
                  return (
                    <div key={a.id}
                      className={"appt"+(isSel?" selected":"")+(visible?"":" dim")}
                      data-color={a.color}
                      style={{ top:top+2, height:h, opacity: visible?1:0.18, pointerEvents: visible?"auto":"none" }}
                      onClick={(e)=>{ e.stopPropagation(); onSelectAppt({ kind:"appt", id:a.id }); }}
                      onMouseEnter={(e)=>handleApptEnter(a, e)}
                      onMouseLeave={()=>setHoverAppt(null)}
                    >
                      <div className="name">{patient?.name}</div>
                      <div className="time">{fmtTime(a.start)} – {fmtTime(a.end)}</div>
                      <div className="codes">
                        {a.codes.slice(0,2).map(c => (
                          <div key={c.code} className="code"><b>{c.code}</b><span>·</span><span>{c.label}</span></div>
                        ))}
                      </div>
                      <div className="footer">
                        <div className="avatar-stack">
                          <div className="av" style={{backgroundImage:`url(${AVATARS[patient?.avatar||0]})`}}/>
                          <div className="av" style={{backgroundImage:`url(${AVATARS[(patient?.avatar+1)%AVATARS.length||1]})`}}/>
                        </div>
                        <div className={"status-pill "+stat.cls}>
                          <span className="dot"/>{stat.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            {currentMin >= DAY_START*60 && currentMin <= DAY_END*60 && (
              <div className="now-line"
                style={{top: minsToY(currentMin), gridColumn: `2 / span ${ops.length}`}}
                data-label={fmtTime(currentMin)}/>
            )}
          </div>
        </div>
      </div>

      {hoverCell && !APPTS.find(a => a.op===hoverCell.opId && hoverCell.slotMin>=a.start && hoverCell.slotMin<a.end) && (
        <div className="mini-pop" style={{left:hoverCell.x, top:hoverCell.y}}>
          <div className="title">{fmtTime(hoverCell.slotMin)}</div>
          <div className="row"><span>{ops.find(o=>o.id===hoverCell.opId).name}</span><span>{ops.find(o=>o.id===hoverCell.opId).doc}</span></div>
          <div className="row"><span>Status</span><span style={{color:"#5A7A2F"}}>Open</span></div>
          <div className="add"><Icon name="plus" size={14} stroke={2.4}/> Click to schedule</div>
        </div>
      )}
      {hoverAppt && (
        <div className="appt-pop" style={{left:hoverAppt.x, top:hoverAppt.y}}>
          <h4>{patientById(hoverAppt.appt.patientId)?.name}</h4>
          <div className="meta">{fmtTime(hoverAppt.appt.start)} – {fmtTime(hoverAppt.appt.end)} · {ops.find(o=>o.id===hoverAppt.appt.op).doc}</div>
          {hoverAppt.appt.codes.map(c => (
            <div key={c.code} className="kv"><span>{c.code}</span><span>{c.label}</span></div>
          ))}
          <div className="kv"><span>Status</span><span style={{color: STATUS[hoverAppt.appt.status].color}}>{STATUS[hoverAppt.appt.status].label}</span></div>
        </div>
      )}
    </div>
  );
};

window.ScheduleView = ScheduleView;
