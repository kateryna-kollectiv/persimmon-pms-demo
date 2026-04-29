// Schedule day view + appointment grid
const HOURS = (() => {
  const out = [];
  for (let m=DAY_START*60; m<DAY_END*60; m+=ROW_MINUTES) out.push(m);
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
    const popW = 460, popH = 420;
    const vw = window.innerWidth, vh = window.innerHeight;
    let x = rect.right + 12;
    if (x + popW > vw - 16) x = Math.max(16, rect.left - popW - 12);
    let y = rect.top;
    if (y + popH > vh - 16) y = Math.max(16, vh - popH - 16);
    setHoverAppt({ appt, x, y });
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
      {hoverAppt && (() => {
        const a = hoverAppt.appt;
        const p = patientById(a.patientId);
        const op = ops.find(o => o.id === a.op);
        const stat = STATUS[a.status];
        const dur = a.end - a.start;
        const codeTotals = a.codes.map((c, i) => ({
          ...c,
          patient: 0,
          insurance: [36, 67, 142, 195, 220][i % 5],
        }));
        const insTotal = codeTotals.reduce((s, c) => s + c.insurance, 0);
        const visitType = ({
          complete: "Visit complete",
          inchair: "In operatory",
          confirmed: "Confirmed",
          unconfirmed: "Unconfirmed",
          scheduled: "Scheduled",
          noshow: "No-show",
        })[a.status] || stat.label;

        return (
          <div className="appt-pop" style={{left:hoverAppt.x, top:hoverAppt.y}}>
            <div className="apop-grid">
              {/* LEFT — patient column */}
              <div className="apop-left">
                <div className="apop-pat">
                  <div className="apop-av" style={{backgroundImage:`url(${AVATARS[p.avatar]})`}}/>
                  <div className="apop-pat-body">
                    <div className="apop-pat-row">
                      <div className="apop-pat-name">{p.name}</div>
                      <span className="apop-tag-active">Active</span>
                    </div>
                    <div className="apop-pat-meta">{p.sin}</div>
                    <div className="apop-pat-meta">{p.dob} · {p.age} · {p.sex==="F"?"Female":"Male"}</div>
                    <div className="apop-chip-row"><span className="apop-chip pat-chip">PAT</span></div>
                  </div>
                </div>

                {p.flags && p.flags.length > 0 && (
                  <div className="apop-alert">
                    <Icon name="alert" size={14}/>
                    <span>{p.flags[0]}</span>
                  </div>
                )}

                <dl className="apop-kv">
                  <dt>Mobile</dt><dd>{p.phone}</dd>
                  <dt>Email</dt><dd className="trunc">{p.email}</dd>
                  <dt>Address</dt><dd className="trunc">{p.address}</dd>
                  <dt>Primary Dr.</dt><dd>{p.primaryDr}</dd>
                </dl>

                <dl className="apop-kv apop-kv-thin">
                  <dt>Last visit</dt><dd>{p.lastVisit}</dd>
                  <dt>Recall due</dt><dd>{p.flags?.includes("Overdue recall") ? <b style={{color:"var(--persimmon)"}}>Overdue</b> : "On time"}</dd>
                </dl>

                <div className="apop-balance">
                  <div className="apop-balance-row"><span>Patient balance</span>
                    <b style={{color: p.balance > 0 ? "var(--persimmon)" : "var(--ink-2)"}}>${p.balance}.00</b>
                  </div>
                  <div className="apop-balance-row"><span>Insurance balance</span>
                    <b style={{color:"var(--persimmon)"}}>${insTotal}.00</b>
                  </div>
                  <div className="apop-balance-row total"><span>Total balance</span>
                    <b style={{color:"var(--persimmon)"}}>${p.balance + insTotal}.00</b>
                  </div>
                </div>
              </div>

              {/* RIGHT — appointment column */}
              <div className="apop-right">
                <div className="apop-appt-head">
                  <div className="apop-appt-row">
                    <div className="apop-date">Wed, Apr 29 2026</div>
                    <span className="apop-tag-status" style={{color: stat.color, borderColor: stat.color}}>{visitType}</span>
                  </div>
                  <div className="apop-time">{fmtTime(a.start)} – {fmtTime(a.end)} <span className="apop-dim">· {dur}m</span></div>
                  <div className="apop-room">{op.name} · {op.doc} · {op.room}</div>
                </div>

                <dl className="apop-kv apop-kv-thin">
                  <dt>Last appt note</dt><dd>—</dd>
                  <dt>Confirmed</dt><dd>{a.status==="confirmed" || a.status==="complete" || a.status==="inchair" ? "Yes · 2 days ago" : <span style={{color:"var(--persimmon)"}}>Pending</span>}</dd>
                </dl>

                <div className="apop-ins">
                  <div className="apop-ins-head">
                    <b>{p.carrier}</b>
                    <span className="apop-tag-active">Active</span>
                  </div>
                  <div className="apop-ins-meta">Primary · {p.carrierId} · ${1750 - insTotal} remaining</div>
                </div>

                <div className="apop-codes">
                  <div className="apop-codes-head">
                    <span>Codes</span><span>Patient</span><span>Insurance</span><span>Total</span>
                  </div>
                  {codeTotals.slice(0, 3).map((c, i) => (
                    <div key={i} className="apop-codes-row">
                      <span className="apop-code-cell">
                        <b>{c.code}</b>
                        <em>{c.label}</em>
                      </span>
                      <span>${c.patient}.00</span>
                      <span>${c.insurance}.00</span>
                      <span>${c.patient + c.insurance}.00</span>
                    </div>
                  ))}
                  {codeTotals.length > 3 && (
                    <div className="apop-codes-more">+{codeTotals.length - 3} more codes</div>
                  )}
                  <div className="apop-codes-row total">
                    <span><b>Total</b></span>
                    <span>$0.00</span>
                    <span>${insTotal}.00</span>
                    <span><b>${insTotal}.00</b></span>
                  </div>
                </div>

                <div className="apop-foot">
                  Appt created by <b>Pena, Natalie</b> · 10/21/2025
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

window.ScheduleView = ScheduleView;
