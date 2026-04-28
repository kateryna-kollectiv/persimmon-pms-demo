// App root + routing + state

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#F73C1F",
  "accentOlive": "#464E01",
  "density": "comfortable",
  "showNowLine": true,
  "view": "schedule"
}/*EDITMODE-END*/;

const App = () => {
  const [view, setView] = React.useState(TWEAK_DEFAULTS.view || "schedule");
  const [panel, setPanel] = React.useState(null);          // {kind:"appt"|"new", id?, opId?, slot?}
  const [panelOpen, setPanelOpen] = React.useState(false);
  const [openPatient, setOpenPatient] = React.useState(null);
  const [toast, setToast] = React.useState("");
  const [now, setNow] = React.useState(13*60 + 38);        // 1:38 PM mock current
  const [tweaks, setTweaks] = React.useState(TWEAK_DEFAULTS);
  const [filters, setFilters] = React.useState({});        // {[groupKey]: string[]}
  const [openTask, setOpenTask] = React.useState(null);

  // Apply tweak vars
  React.useEffect(()=>{
    document.documentElement.style.setProperty('--persimmon', tweaks.primaryColor);
    document.documentElement.style.setProperty('--olive', tweaks.accentOlive);
  }, [tweaks]);

  // simulate clock ticking — slowly advance now-line
  React.useEffect(()=>{
    const t = setInterval(()=>setNow(n => Math.min(n+1, DAY_END*60)), 30000);
    return ()=>clearInterval(t);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(()=>setToast(""), 2400);
  };

  const handleSelectAppt = (p) => {
    setPanel(p);
    setPanelOpen(true);
  };
  const handleClose = () => {
    setPanelOpen(false);
    setTimeout(()=>setPanel(null), 350);
  };

  const handleConfirm = (id) => {
    const a = APPTS.find(x=>x.id===id); a.status="confirmed";
    showToast("Appointment confirmed");
    handleClose();
  };
  const handleSeat = (id) => {
    const a = APPTS.find(x=>x.id===id); a.status="inchair";
    showToast("Patient seated");
    handleClose();
  };
  const handleComplete = (id) => {
    const a = APPTS.find(x=>x.id===id); a.status="complete";
    showToast("Visit complete · ready for checkout");
    handleClose();
  };
  const handleOpenPatient = (id) => {
    handleClose();
    setOpenPatient(id);
    setView("patients");
  };

  const titles = {
    huddle: { t:"Good morning, Sasha", s: <><b>39 total patient visits</b><span className="dot"/><span style={{color:"#5A7A2F"}}>2 waiting</span><span className="dot"/><span style={{color:"var(--persimmon)"}}>1 in chair</span></> },
    schedule: { t:"Schedule", s: <><b>{APPTS.length} appointments scheduled</b><span className="dot"/><span style={{color:"#5A7A2F"}}>2 waiting</span><span className="dot"/><span style={{color:"var(--persimmon)"}}>{APPTS.filter(a=>a.status==='inchair').length} in chair</span></> },
    patients: { t:"Patients", s: <><b>{PATIENTS.length} active patients</b><span className="dot"/><span>2 recall due</span></> },
  };

  return (
    <div className="app">
      <Sidebar view={view} setView={(v)=>{setOpenPatient(null);setView(v);}}/>

      {!openPatient && <>
        <TopBar title={titles[view].t} sub={titles[view].s} onTasksClick={()=>{
          if (TASKS && TASKS.length) setOpenTask(TASKS[0].id);
        }}/>
        <SubToolbar>
          <DatePill date="Wed, Apr 29 2026" onPrev={()=>{}} onNext={()=>{}}/>
          {view==="huddle"   && <div style={{flex:1,display:"flex",justifyContent:"center"}}><Segmented options={["Day","Week","Month","Year"]} value="Day" onChange={()=>{}}/></div>}
          {view==="schedule" && <div style={{flex:1,display:"flex",justifyContent:"center"}}><Segmented options={["Day","Op","Week","List"]} value="Op" onChange={()=>{}}/></div>}
          {view==="patients" && <div style={{flex:1,display:"flex",justifyContent:"center"}}><Segmented options={["All","Recall due","New","Balance"]} value="All" onChange={()=>{}}/></div>}
          <FilterPill view={view} active={filters[view]||{}} onChange={(f)=>setFilters({...filters, [view]:f})}/>
          <button className="iconbtn primary" title="New appointment" onClick={()=>{
            if (view==="schedule") handleSelectAppt({kind:"new",opId:"op1",slot:14*60});
          }}><Icon name={view==="schedule"?"calendarPlus":"plus"} size={20} stroke={2}/></button>
        </SubToolbar>
      </>}

      {openPatient
        ? <PatientDetail patientId={openPatient} onBack={()=>setOpenPatient(null)}/>
        : view==="huddle" ? <Huddle onOpenTask={(id)=>setOpenTask(id)}/>
        : view==="schedule" ? <ScheduleView onSelectAppt={handleSelectAppt} selectedAppt={panel?.kind==='appt'?{id:panel.id}:null} currentMin={tweaks.showNowLine?now:99999} filters={filters.schedule||{}}/>
        : <PatientsView onOpenPatient={(id)=>setOpenPatient(id)} filters={filters.patients||{}}/>
      }

      {openTask && (
        <TaskModal
          task={taskById(openTask)}
          onClose={()=>setOpenTask(null)}
          onOpenPatient={(id)=>{setOpenTask(null);setOpenPatient(id);setView("patients");}}
          onComplete={(id)=>{setOpenTask(null);showToast("Task marked complete");}}
        />
      )}

      <SidePanel
        open={panelOpen}
        payload={panel}
        onClose={handleClose}
        onConfirm={handleConfirm}
        onSeat={handleSeat}
        onComplete={handleComplete}
        onOpenPatient={handleOpenPatient}
      />

      <div className={"toast"+(toast?" show":"")}><span className="check"><Icon name="check" size={12} stroke={3}/></span>{toast}</div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
