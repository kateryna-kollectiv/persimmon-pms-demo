// Appointment side panel
const SidePanel = ({ open, payload, onClose, onConfirm, onSeat, onComplete, onOpenPatient }) => {
  const [tab, setTab] = React.useState("overview");
  React.useEffect(()=>{ setTab("overview"); }, [payload?.id]);

  if (!payload) return null;
  if (payload.kind === "new") {
    const op = OPERATORIES.find(o=>o.id===payload.opId);
    return (
      <>
        <div className={"scrim"+(open?" open":"")} onClick={onClose}/>
        <aside className={"panel"+(open?" open":"")} role="dialog" aria-label="New appointment">
          <button className="panel-close" onClick={onClose}><Icon name="x" size={16} stroke={2.5}/></button>
          <div className="panel-head">
            <div style={{width:80,height:80,borderRadius:"50%",background:"#FFEEE0",display:"grid",placeItems:"center",color:"#F73C1F"}}>
              <Icon name="plus" size={28} stroke={2.4}/>
            </div>
            <div className="who">
              <h2>New appointment</h2>
              <div className="meta" style={{textTransform:"none"}}>{op?.name} · {op?.doc} · {fmtTime(payload.slot)}</div>
            </div>
          </div>
          <div className="panel-body">
            <div className="section-card">
              <h3 className="section-title">Patient</h3>
              <div className="search" style={{width:"100%"}}>
                <Icon name="search" size={16}/>
                <input placeholder="Search by name, phone, or chart #"/>
              </div>
              <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:6}}>
                {PATIENTS.slice(0,4).map(p => (
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:12,background:"#F7F6F3"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",backgroundImage:`url(${AVATARS[p.avatar]})`,backgroundSize:"cover"}}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:"var(--ink)"}}>{p.name}</div>
                      <div style={{fontSize:12,color:"var(--ink-3)"}}>{p.dob} · {p.carrier}</div>
                    </div>
                    <button className="btn btn-ghost" style={{height:32,padding:"0 14px",fontSize:12}}>Select</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="section-card">
              <h3 className="section-title">Visit details</h3>
              <div className="kv-grid">
                <div className="kv"><span className="k">Operatory</span><span className="v">{op?.name}</span></div>
                <div className="kv"><span className="k">Provider</span><span className="v">{op?.doc}</span></div>
                <div className="kv"><span className="k">Start</span><span className="v">{fmtTime(payload.slot)}</span></div>
                <div className="kv"><span className="k">Duration</span><span className="v">60 min</span></div>
              </div>
            </div>
          </div>
          <div className="panel-foot">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary">Schedule visit</button>
          </div>
        </aside>
      </>
    );
  }

  const a = apptById(payload.id);
  const p = patientById(a.patientId);
  const op = OPERATORIES.find(o=>o.id===a.op);
  const stat = STATUS[a.status];

  const totalFee = a.codes.length * 540 + 120;
  const insPay = Math.round(totalFee * 0.5);
  const ptOwes = totalFee - insPay;

  return (
    <>
      <div className={"scrim"+(open?" open":"")} onClick={onClose}/>
      <aside className={"panel"+(open?" open":"")} role="dialog" aria-label="Appointment detail">
        <button className="panel-close" onClick={onClose}><Icon name="x" size={16} stroke={2.5}/></button>
        <div className="panel-head">
          <div className="panel-avatar" style={{backgroundImage:`url(${AVATARS[p.avatar]})`}}/>
          <div className="who">
            <h2>{p.name}</h2>
            <div className="meta" style={{textTransform:"none",marginBottom:6}}>
              {fmtTime(a.start)} – {fmtTime(a.end)} · {op.doc}
            </div>
            <div style={{display:"flex",gap:6}}>
              {p.flags.slice(0,2).map(f => <span key={f} className="badge alert" style={{fontSize:11}}>{f}</span>)}
              <span className={"status-pill "+stat.cls}><span className="dot"/>{stat.label}</span>
            </div>
          </div>
          <div className="codes">
            {a.codes.map(c => <div key={c.code}><b>{c.code}</b> · {c.label}</div>)}
          </div>
        </div>

        <div className="panel-tabs">
          {["overview","clinical","insurance","payments","comms"].map(t=>(
            <button key={t} className={tab===t?"on":""} onClick={()=>setTab(t)}>
              {t==="overview"?"Overview":t==="clinical"?"Clinical":t==="insurance"?"Insurance":t==="payments"?"Payments":"Communications"}
            </button>
          ))}
        </div>

        <div className="panel-body">
          {tab==="overview" && <>
            <div className="section-card">
              <h3 className="section-title">Patient flow</h3>
              <div className="timeline">
                <div className={"step "+(a.status!=="scheduled"?"done":"")}><span className="dot"/>
                  <div className="body"><div className="t">Confirmed</div><div className="s">Apr 28, 4:12 PM · SMS confirmation</div></div>
                </div>
                <div className={"step "+(["inchair","complete"].includes(a.status)?"done":a.status==="confirmed"?"now":"")}><span className="dot"/>
                  <div className="body"><div className="t">Checked in</div><div className="s">{a.status==="confirmed"?"Pending arrival":"Apr 29, 9:54 AM"}</div></div>
                </div>
                <div className={"step "+(a.status==="inchair"?"now":a.status==="complete"?"done":"")}><span className="dot"/>
                  <div className="body"><div className="t">Seated in {op.name}</div><div className="s">{a.status==="inchair"?"Currently in chair":a.status==="complete"?"Seated 10:02 AM":"—"}</div></div>
                </div>
                <div className={"step "+(a.status==="complete"?"done":"")}><span className="dot"/>
                  <div className="body"><div className="t">Treatment complete</div><div className="s">{a.status==="complete"?"Apr 29, 11:48 AM":"—"}</div></div>
                </div>
                <div className="step"><span className="dot"/>
                  <div className="body"><div className="t">Checkout & rebook</div><div className="s">—</div></div>
                </div>
              </div>
            </div>

            <div className="section-card">
              <h3 className="section-title">Treatment plan today</h3>
              {a.codes.map((c,i)=>(
                <div key={c.code} className="kv">
                  <span className="k">{c.code} · {c.label}</span>
                  <span className="v">${(540).toFixed(2)}</span>
                </div>
              ))}
              <div className="kv"><span className="k">Lab fee</span><span className="v">$120.00</span></div>
              <div className="kv" style={{marginTop:6}}><span className="k" style={{fontWeight:700,color:"var(--ink)"}}>Total fee</span><span className="v">${totalFee.toFixed(2)}</span></div>
            </div>

            <div className="section-card">
              <h3 className="section-title">Clinical alerts</h3>
              <div className="alerts">
                {p.flags.length===0 && <div className="alert info"><Icon name="check" size={16}/> No active alerts on file.</div>}
                {p.flags.map(f => (
                  <div key={f} className={"alert "+(f.toLowerCase().includes("allerg")||f.toLowerCase().includes("anti")?"med":"info")}>
                    <Icon name="alert" size={16}/> {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="section-card">
              <h3 className="section-title">Quick actions</h3>
              <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                <button className="btn btn-ghost" style={{background:"#F7F6F3"}}><Icon name="phone" size={16}/> Call</button>
                <button className="btn btn-ghost" style={{background:"#F7F6F3"}}><Icon name="msg" size={16}/> SMS</button>
                <button className="btn btn-ghost" style={{background:"#F7F6F3"}}><Icon name="mail" size={16}/> Email</button>
                <button className="btn btn-ghost" style={{background:"#F7F6F3"}} onClick={()=>onOpenPatient(p.id)}><Icon name="eye" size={16}/> Open chart</button>
                <button className="btn btn-ghost" style={{background:"#F7F6F3"}}><Icon name="edit" size={16}/> Reschedule</button>
              </div>
            </div>
          </>}

          {tab==="clinical" && <>
            <div className="section-card">
              <h3 className="section-title">Chief complaint</h3>
              <p style={{fontSize:14,color:"var(--ink-2)",margin:0,lineHeight:1.5}}>
                Patient reports sensitivity to cold on lower right molar (#30) since last week. No spontaneous pain.
                Floss tears intermittently around #19.
              </p>
            </div>
            <div className="section-card" style={{display:"none"}}>
              <h3 className="section-title">Vitals</h3>
              <div className="vitals">
                <div className="vital"><div className="l">BP</div><div className="v">118/76</div><div className="d">Normal</div></div>
                <div className="vital"><div className="l">Pulse</div><div className="v">72</div><div className="d">bpm</div></div>
                <div className="vital"><div className="l">SpO₂</div><div className="v">98%</div><div className="d">Normal</div></div>
                <div className="vital"><div className="l">Pain</div><div className="v">3/10</div><div className="d">Mild</div></div>
              </div>
            </div>
            <div className="section-card">
              <h3 className="section-title">Procedures planned</h3>
              {a.codes.map(c => (
                <div key={c.code} className="kv">
                  <span className="k"><b style={{color:"var(--ink-2)"}}>{c.code}</b> {c.label}{a.teeth.length?` · #${a.teeth.join(", #")}`:""}</span>
                  <span className="v"><span className="badge ok">Authorized</span></span>
                </div>
              ))}
            </div>
            <div className="section-card">
              <h3 className="section-title">Last note (Dr. Whitaker · Apr 14)</h3>
              <p style={{fontSize:13,color:"var(--ink-2)",margin:0,lineHeight:1.55}}>
                Existing PFM crown #14 with marginal recession. Recommend recementation if integrity intact;
                core buildup if structure compromised. Reviewed costs and post-op expectations with patient.
              </p>
            </div>
          </>}

          {tab==="insurance" && <>
            <div className="section-card">
              <h3 className="section-title">Eligibility</h3>
              <div className="kv-grid">
                <div className="kv"><span className="k">Carrier</span><span className="v">{p.carrier}</span></div>
                <div className="kv"><span className="k">Plan ID</span><span className="v">{p.carrierId}</span></div>
                <div className="kv"><span className="k">Verified</span><span className="v"><span className="badge ok"><Icon name="check" size={12}/> Apr 28</span></span></div>
                <div className="kv"><span className="k">Effective</span><span className="v">01/01/26 → 12/31/26</span></div>
              </div>
            </div>
            <div className="section-card">
              <h3 className="section-title">Benefits used (calendar year)</h3>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13,fontWeight:700}}>
                    <span>Annual maximum</span><span>$842 / $2,000</span>
                  </div>
                  <div className="progress"><i style={{width:"42%"}}/></div>
                </div>
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,fontSize:13,fontWeight:700}}>
                    <span>Deductible</span><span>$50 / $50</span>
                  </div>
                  <div className="progress"><i style={{width:"100%",background:"#5A7A2F"}}/></div>
                </div>
              </div>
            </div>
            <div className="section-card">
              <h3 className="section-title">Estimate today</h3>
              <div className="kv"><span className="k">Total fee</span><span className="v">${totalFee.toFixed(2)}</span></div>
              <div className="kv"><span className="k">Insurance estimate (50% major)</span><span className="v">−${insPay.toFixed(2)}</span></div>
              <div className="kv"><span className="k">Adjustments</span><span className="v">$0.00</span></div>
              <div className="kv" style={{paddingTop:10,borderTop:"1px solid var(--line)"}}>
                <span className="k" style={{color:"var(--ink)",fontWeight:700,fontSize:14}}>Patient owes today</span>
                <span className="v" style={{color:"var(--persimmon)",fontSize:18}}>${ptOwes.toFixed(2)}</span>
              </div>
            </div>
          </>}

          {tab==="payments" && <>
            <div className="section-card">
              <h3 className="section-title">Account balance</h3>
              <div className="kv"><span className="k">Current balance</span><span className="v" style={{color:p.balance?"var(--persimmon)":"var(--ink-2)"}}>${p.balance.toFixed(2)}</span></div>
              <div className="kv"><span className="k">Last payment</span><span className="v">$78.00 — Mar 14</span></div>
              <div className="kv"><span className="k">Card on file</span><span className="v">Visa ···· 4892</span></div>
            </div>
            <div className="section-card">
              <h3 className="section-title">Take payment</h3>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <button className="btn btn-secondary"><Icon name="cash" size={16}/> Charge ${ptOwes}</button>
                <button className="btn btn-ghost" style={{background:"#F7F6F3"}}>Card on file</button>
                <button className="btn btn-ghost" style={{background:"#F7F6F3"}}>New card</button>
                <button className="btn btn-ghost" style={{background:"#F7F6F3"}}>Send link</button>
              </div>
            </div>
          </>}

          {tab==="comms" && <>
            <div className="section-card">
              <h3 className="section-title">Recent communications</h3>
              <div className="timeline">
                <div className="step done"><span className="dot"/><div className="body"><div className="t">Confirmation SMS sent</div><div className="s">Apr 28, 4:12 PM · Replied "C"</div></div></div>
                <div className="step done"><span className="dot"/><div className="body"><div className="t">Visit reminder email</div><div className="s">Apr 27, 8:00 AM</div></div></div>
                <div className="step done"><span className="dot"/><div className="body"><div className="t">Treatment plan emailed</div><div className="s">Apr 14, 12:30 PM</div></div></div>
              </div>
            </div>
          </>}
        </div>

        <div className="panel-foot">
          {a.status==="confirmed" && <>
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
            <button className="btn btn-secondary" onClick={()=>onSeat(a.id)}>Mark checked-in</button>
            <button className="btn btn-primary" onClick={()=>onSeat(a.id)}>Verify & seat</button>
          </>}
          {a.status==="inchair" && <>
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={()=>onComplete(a.id)}><Icon name="check" size={16}/> Complete visit</button>
          </>}
          {a.status==="complete" && <>
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
            <button className="btn btn-secondary">Send receipt</button>
            <button className="btn btn-primary">Schedule next visit</button>
          </>}
          {a.status==="unconfirmed" && <>
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
            <button className="btn btn-secondary">Send reminder</button>
            <button className="btn btn-primary" onClick={()=>onConfirm(a.id)}>Mark confirmed</button>
          </>}
          {a.status==="noshow" && <>
            <button className="btn btn-ghost" onClick={onClose}>Close</button>
            <button className="btn btn-primary">Reschedule</button>
          </>}
        </div>
      </aside>
    </>
  );
};

window.SidePanel = SidePanel;
