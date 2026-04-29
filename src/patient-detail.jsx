// Patient detail with clinical chart
const CarePanelEmbed = ({ selectedTeeth, setSelectedTeeth, treatmentType, setTreatmentType, careType, setCareType, applyAction, recentApply }) => {
  return (
    <div style={{ marginBottom: 14 }}>
      <div className="rtc-bar">
        <span style={{ fontWeight: 700, color: "var(--ink-2)" }}>Selected:</span>
        {selectedTeeth.length === 0 ?
        <span style={{ color: "var(--ink-3)", fontSize: 12, fontStyle: "italic" }}>None — click a tooth to begin</span> :

        <div className="chips">
            {selectedTeeth.slice().sort((a, b) => a - b).map((n) =>
          <span key={n} className="chip">#{n}</span>
          )}
          </div>
        }
        <span className="count">{selectedTeeth.length}</span>
        {selectedTeeth.length > 0 &&
        <button className="clear" onClick={() => setSelectedTeeth([])}>Clear</button>
        }
      </div>
      {recentApply && Date.now() - recentApply.ts < 4000 &&
      <div style={{
        padding: "10px 14px", background: "#1F4A2D", color: "#fff", borderRadius: 12,
        marginBottom: 10, fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10
      }}>
          <Icon name="check" size={16} stroke={2.6} />
          <span>Applied <b>{recentApply.action.label}</b> ({recentApply.action.code}) to {recentApply.teeth.length} tooth{recentApply.teeth.length > 1 ? "s" : ""} as <b>{recentApply.type}</b></span>
        </div>
      }
      <CarePanel
        selected={selectedTeeth}
        treatmentType={treatmentType}
        setTreatmentType={setTreatmentType}
        careType={careType}
        setCareType={setCareType}
        onApply={applyAction} />
      
    </div>);

};

const ToothChart = ({ selected, onSelect }) => {
  // Universal numbering 1-32
  const upperRight = [1, 2, 3, 4, 5, 6, 7, 8];
  const upperLeft = [9, 10, 11, 12, 13, 14, 15, 16];
  const lowerLeft = [17, 18, 19, 20, 21, 22, 23, 24];
  const lowerRight = [25, 26, 27, 28, 29, 30, 31, 32];

  // Mock conditions
  const conds = {
    3: "treated", 14: "treated", 19: "cavity", 30: "planned", 32: "missing", 1: "missing", 8: "treated", 9: "treated"
  };
  const renderTooth = (n, pos) =>
  <div key={n} className={"tooth " + pos + (selected === n ? " selected" : "")} data-cond={conds[n] || "healthy"} onClick={() => onSelect(n)}>
      {n}
    </div>;


  return (
    <div className="arch">
      <div className="arch-row">{[...upperRight, ...upperLeft].map((n) => renderTooth(n, "upper"))}</div>
      <div className="chart-divider" />
      <div className="arch-row">{[...lowerRight.slice().reverse(), ...lowerLeft.slice().reverse()].map((n) => renderTooth(n, "lower"))}</div>
    </div>);

};

const PatientDetail = ({ patientId, onBack }) => {
  const p = patientById(patientId);
  const [tooth, setTooth] = React.useState(19);
  const [tab, setTab] = React.useState("overview");

  // Tooth chart state
  const [selectedTeeth, setSelectedTeeth] = React.useState([]);
  const [hoverTooth, setHoverTooth] = React.useState(null);
  const [conditions, setConditions] = React.useState({
    3: "treated", 14: "crown", 19: "cavity", 30: "planned", 32: "missing", 1: "missing",
    8: "treated", 9: "treated", 18: "rct"
  });
  const [planned, setPlanned] = React.useState({
    14: [{ code: "D2740", color: "#3FA85B" }],
    19: [{ code: "D2392", color: "#D94343" }],
    30: [{ code: "D6010", color: "#9C5BD0" }]
  });
  const [treatmentType, setTreatmentType] = React.useState("Planned");
  const [careType, setCareType] = React.useState("General Dentistry");
  const [recentApply, setRecentApply] = React.useState(null);

  const applyAction = (action) => {
    if (!selectedTeeth.length) return;
    // Map action to a condition (for chart visual) when relevant
    const condByLabel = {
      "COMPOSITE": "treated", "AMALGAM": "treated", "FILLS": "treated",
      "CROWN": "crown", "CROWN PREP": "planned", "CROWN SEAT": "crown",
      "CROWN + BU": "planned", "BU": "treated", "VENEERS": "treated",
      "ROOT CANAL": "rct", "EXT": "missing", "MISSING": "missing",
      "IMPLANT": "planned", "WATCH": "planned", "SEALANT": "treated"
    };
    if (treatmentType === "Planned") {
      // add planned dot
      setPlanned((prev) => {
        const next = { ...prev };
        selectedTeeth.forEach((n) => {
          next[n] = [...(next[n] || []), { code: action.code, color: action.color === "#A6CCE0" ? "#5C8AAD" : action.color === "#F4D6BD" ? "#E89B47" : action.color === "#F0C8C0" ? "#D94343" : "#3FA85B" }];
        });
        return next;
      });
      // also flip to "planned" visual if currently healthy
      setConditions((prev) => {
        const next = { ...prev };
        selectedTeeth.forEach((n) => {
          if (!next[n] || next[n] === "healthy") next[n] = "planned";
        });
        return next;
      });
    } else if (treatmentType === "Existing" || treatmentType === "Completed") {
      const cond = condByLabel[action.label] || "treated";
      setConditions((prev) => {
        const next = { ...prev };
        selectedTeeth.forEach((n) => {next[n] = cond;});
        return next;
      });
    }
    setRecentApply({ action, teeth: [...selectedTeeth], type: treatmentType, ts: Date.now() });
    // keep selection so user can apply more actions, but show feedback
  };

  const upcoming = APPTS.filter((a) => a.patientId === patientId);

  return (
    <div className="canvas pd">
      <div className="pd-head">
        <button className="pd-back" onClick={onBack}><Icon name="chevL" size={18} stroke={2.4} /></button>
        <div className="pd-photo" style={{ backgroundImage: `url(${AVATARS[p.avatar]})` }} />
        <div className="pd-id">
          <h2>{p.name}</h2>
          <div className="meta">
            <span>{p.sex === "F" ? "Female" : "Male"}</span><span className="dot" />
            <span>{p.dob} · {p.age}</span><span className="dot" />
            <span style={{ fontFamily: "JetBrains Mono,monospace" }}>{p.sin}</span><span className="dot" />
            <span>Primary: {p.primaryDr}</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            {p.flags.map((f) => {
              const cls = f.toLowerCase().includes("allerg") || f.toLowerCase().includes("anti") ? "alert" :
              f.toLowerCase().includes("new") ? "info" : "warn";
              return <span key={f} className={"badge " + cls}>{f}</span>;
            })}
            {p.balance > 0 && <span className="badge alert">Balance ${p.balance}</span>}
          </div>
        </div>
        <div className="pd-actions">
          <button className="btn btn-ghost" style={{ background: "#F7F6F3" }}><Icon name="msg" size={16} /> Message</button>
          <button className="btn btn-ghost" style={{ background: "#F7F6F3" }}><Icon name="phone" size={16} /> Call</button>
          <button className="btn btn-primary"><Icon name="plus" size={16} /> New appointment</button>
        </div>
      </div>

      <div className={"pd-cols" + (tab === "chart" ? " with-right" : "")}>
        {/* LEFT — demographics + insurance */}
        <div className="pd-side">
          <div className="pd-card">
            <h3>Contact</h3>
            <div className="row"><span className="k">Phone</span><span>{p.phone}</span></div>
            <div className="row"><span className="k">Email</span><span style={{ fontSize: 12 }}>{p.email}</span></div>
            <div className="row"><span className="k">Address</span><span style={{ fontSize: 12, textAlign: "right", maxWidth: 160 }}>{p.address}</span></div>
          </div>
          <div className="pd-card">
            <h3>Insurance</h3>
            <div className="row"><span className="k">Carrier</span><span>{p.carrier}</span></div>
            <div className="row"><span className="k">Plan ID</span><span style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12 }}>{p.carrierId}</span></div>
            <div className="row"><span className="k">Verified</span><span><span className="badge ok"><Icon name="check" size={12} /> Active</span></span></div>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                <span>Annual max</span><span>$842 / $2,000</span>
              </div>
              <div className="progress"><i style={{ width: "42%" }} /></div>
            </div>
          </div>
          <div className="pd-card">
            <h3>Clinical alerts</h3>
            <div className="alerts">
              {p.flags.length === 0 && <div className="alert info"><Icon name="check" size={16} /> No alerts</div>}
              {p.flags.map((f) =>
              <div key={f} className={"alert " + (f.toLowerCase().includes("allerg") || f.toLowerCase().includes("anti") ? "med" : "info")}>
                  <Icon name="alert" size={16} /> {f}
                </div>
              )}
            </div>
          </div>
          <div className="pd-card">
            <h3>Recall</h3>
            <div className="row"><span className="k">Type</span><span>6-month prophy</span></div>
            <div className="row"><span className="k">Last</span><span>{p.lastVisit}</span></div>
            <div className="row"><span className="k">Due</span><span style={{ color: "#5A7A2F" }}>Jul 2026</span></div>
          </div>
        </div>

        {/* MAIN */}
        <div className="pd-main">
          <div className="panel-tabs" style={{ padding: 0, borderBottom: 0, marginBottom: 14, background: "transparent" }}>
            {[["overview", "Overview"], ["chart", "Chart"], ["history", "Visit history"], ["plans", "Treatment plans"], ["docs", "Overview"]].map(([k, l]) =>
            <button key={k} className={tab === k ? "on" : ""} onClick={() => setTab(k)}>{l}</button>
            )}
          </div>

          {tab === "overview" && <>

            <div className="pd-card">
              <h3>Account</h3>
              <div className="row"><span className="k">Balance</span><span style={{ color: p.balance ? "var(--persimmon)" : "var(--ink-2)", fontWeight: 700 }}>${p.balance.toFixed(2)}</span></div>
              <div className="row"><span className="k">Last payment</span><span>$78 — Mar 14</span></div>
              <div className="row"><span className="k">Card on file</span><span>Visa ···· 4892</span></div>
              <button className="btn btn-secondary" style={{ width: "100%", marginTop: 12, height: 40 }}><Icon name="cash" size={16} /> Charge balance</button>
            </div>

            <div className="pd-card">
              <h3>Upcoming appointments</h3>
              {upcoming.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-3)" }}>No upcoming visits scheduled.</div>}
              {upcoming.map((a) => {
                const op = OPERATORIES.find((o) => o.id === a.op);
                return (
                  <div key={a.id} className="row">
                    <span><b>Apr 29 · {fmtTime(a.start)}</b> &nbsp;<span style={{ color: "var(--ink-3)" }}>{op.name} · {op.doc}</span></span>
                    <span><span className={"status-pill " + STATUS[a.status].cls}><span className="dot" />{STATUS[a.status].label}</span></span>
                  </div>);

              })}
            </div>

            <div className="pd-card">
              <h3>Recent activity</h3>
              <div className="timeline">
                <div className="step done"><span className="dot" /><div className="body"><div className="t">Crown #14 seated</div><div className="s">Dr. Whitaker · Apr 14, 2026</div></div></div>
                <div className="step done"><span className="dot" /><div className="body"><div className="t">Hygiene visit — D1110</div><div className="s">Brenda RDH · Mar 4, 2026</div></div></div>
                <div className="step done"><span className="dot" /><div className="body"><div className="t">FMX taken — D0210</div><div className="s">Front desk · Jan 12, 2026</div></div></div>
                <div className="step done"><span className="dot" /><div className="body"><div className="t">Patient registration</div><div className="s">Front desk · Aug 22, 2024</div></div></div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="pd-card" style={{ marginBottom: 0 }}>
                <h3>Family</h3>
                <div className="row"><span className="k"><div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><div style={{ width: 24, height: 24, borderRadius: "50%", backgroundImage: `url(${AVATARS[1]})`, backgroundSize: "cover" }} />Roberta D.</div></span><span>Spouse</span></div>
                <div className="row"><span className="k"><div style={{ display: "inline-flex", gap: 8, alignItems: "center" }}><div style={{ width: 24, height: 24, borderRadius: "50%", backgroundImage: `url(${AVATARS[3]})`, backgroundSize: "cover" }} />Liam H.</div></span><span>Child · 17y</span></div>
              </div>
              <div className="pd-card" style={{ marginBottom: 0 }}>
                <h3>Notes</h3>
                <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0, lineHeight: 1.55 }}>Prefers morning visits. Ask about coffee sensitivity follow-up. Comfortable with bib-clip alternative.</p>
              </div>
            </div>
          </>}

          {tab === "chart" &&
          <div className="chart-card">
              <h3>Treatment Planner</h3>
              <RealisticToothChart
              conditions={conditions}
              planned={planned}
              selected={selectedTeeth}
              onSelectChange={setSelectedTeeth}
              hoverNum={hoverTooth}
              setHoverNum={setHoverTooth} />
            
            </div>
          }
          {tab === "chart" && <ChartDetails patient={p} />}
          {tab === "history" &&
          <div className="pd-card">
              <h3>Visit history</h3>
              {[
            ["Apr 14, 2026", "D2740 Crown #14", "Dr. Whitaker", "$540"],
            ["Mar 4, 2026", "D1110 Adult prophy", "Brenda RDH", "$95"],
            ["Jan 12, 2026", "D0210 FMX", "Front desk", "$120"],
            ["Oct 3, 2025", "D2392 #19 MO comp", "Dr. Whitaker", "$240"],
            ["Aug 22, 2024", "D0150 New patient exam", "Dr. Whitaker", "$95"]].
            map(([d, p, dr, f]) =>
            <div className="row" key={d + p}><span><b>{d}</b> · {p}</span><span style={{ color: "var(--ink-3)" }}>{dr} · {f}</span></div>
            )}
            </div>
          }
          {tab === "plans" &&
          <div className="pd-card">
              <h3>Treatment plans</h3>
              <div className="row"><span><b>Phase 1 — Restorative</b> · D2740 #14, D2950 #14</span><span><span className="badge warn">In progress</span></span></div>
              <div className="row"><span><b>Phase 2 — Hygiene</b> · D4341 SRP UL, LR</span><span><span className="badge info">Proposed</span></span></div>
              <div className="row"><span><b>Phase 3 — Cosmetic</b> · D2960 veneer #8, #9</span><span><span className="badge">Optional</span></span></div>
            </div>
          }
          {tab === "docs" &&
          <div className="pd-card">
              <h3>Documents</h3>
              {["Consent — endo (Apr 14)", "FMX 2026-01-12.dcm", "Treatment plan estimate.pdf", "Insurance card front.jpg", "HIPAA acknowledgement.pdf"].map((d) =>
            <div className="row" key={d}><span><Icon name="file" size={14} /> &nbsp; {d}</span><span style={{ color: "var(--ink-3)" }}><Icon name="download" size={16} /></span></div>
            )}
            </div>
          }
        </div>

        {tab === "chart" &&
        <div className="pd-side right" style={{ padding: "21px" }}>
            <CarePanelEmbed
            selectedTeeth={selectedTeeth}
            setSelectedTeeth={setSelectedTeeth}
            treatmentType={treatmentType}
            setTreatmentType={setTreatmentType}
            careType={careType}
            setCareType={setCareType}
            applyAction={applyAction}
            recentApply={recentApply} />
          
          </div>
        }

      </div>
    </div>);

};

window.PatientDetail = PatientDetail;