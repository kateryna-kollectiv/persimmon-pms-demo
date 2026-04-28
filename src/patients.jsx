// Patients table view
const PatientsView = ({ onOpenPatient, filters }) => {
  const [sort, setSort] = React.useState("name");
  const [filter, setFilter] = React.useState("");

  const f = filters || {};

  const carrierMatch = (p) => !f.carrier?.length || f.carrier.some(c => p.carrier.toLowerCase().includes(c.toLowerCase()));
  const flagMatch = (p) => {
    if (!f.flag?.length) return true;
    const text = (p.flags||[]).join(" ").toLowerCase();
    return f.flag.some(fl => {
      if (fl==="Past due balance") return p.balance > 0;
      if (fl==="Recall overdue") return text.includes("overdue");
      if (fl==="New patient") return text.includes("new patient");
      if (fl==="Premed required") return text.includes("premed");
      if (fl==="Allergy") return text.includes("allerg");
      return text.includes(fl.toLowerCase());
    });
  };
  const recallMatch = (p) => {
    if (!f.recall?.length) return true;
    return f.recall.some(r => {
      if (r==="Never") return p.lastVisit === "Never";
      if (r==="This week") return /4\/(2[0-7])\/26/.test(p.lastVisit) || /4\/2[0-9]\/26/.test(p.lastVisit);
      if (r==="This month") return /4\/[0-9]+\/26/.test(p.lastVisit);
      if (r==="6+ months") return /1[0-2]\/[0-9]+\/25/.test(p.lastVisit);
      return false;
    });
  };

  const rows = PATIENTS.filter(p =>
    (!filter || p.name.toLowerCase().includes(filter.toLowerCase()) || p.carrier.toLowerCase().includes(filter.toLowerCase()))
    && carrierMatch(p) && flagMatch(p) && recallMatch(p)
  ).slice().sort((a,b) => {
    if (sort==="balance") return b.balance - a.balance;
    if (sort==="lastVisit") return (b.lastVisit||"").localeCompare(a.lastVisit||"");
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="canvas">
      <div style={{padding:"14px 24px",display:"flex",alignItems:"center",gap:12,borderBottom:"1px solid var(--line)"}}>
        <div className="search" style={{boxShadow:"none",background:"#F7F6F3",width:380}}>
          <Icon name="search" size={16}/>
          <input placeholder="Search patients" value={filter} onChange={e=>setFilter(e.target.value)}/>
        </div>
        <button className="filter-pill" onClick={()=>setSort(sort==="name"?"balance":"name")}>
          <Icon name="filter" size={16}/>
          <span>Sort: {sort==="name"?"Name":sort==="balance"?"Balance":"Last visit"}</span>
        </button>
        <div style={{marginLeft:"auto",fontSize:13,fontWeight:700,color:"var(--ink-3)"}}>{rows.length} patients</div>
        <button className="btn btn-primary" style={{height:40}}><Icon name="plus" size={16}/> New patient</button>
      </div>
      <div style={{overflow:"auto",maxHeight:"calc(100vh - 240px)"}}>
        <table className="pt-table">
          <thead>
            <tr>
              <th style={{width:"24%"}}>Name</th>
              <th style={{width:"12%"}}>DOB / Age</th>
              <th style={{width:"18%"}}>Carrier</th>
              <th style={{width:"12%"}}>Last visit</th>
              <th style={{width:"10%"}}>Balance</th>
              <th>Flags</th>
              <th style={{width:40}}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(p => (
              <tr key={p.id} onClick={()=>onOpenPatient(p.id)}>
                <td>
                  <div className="pt-name">
                    <div className="av" style={{backgroundImage:`url(${AVATARS[p.avatar]})`}}/>
                    <div>
                      <div className="nm">{p.name}</div>
                      <div className="id">{p.sin}</div>
                    </div>
                  </div>
                </td>
                <td><span style={{color:"var(--ink-3)"}}>{p.dob}</span> <span style={{margin:"0 6px",color:"rgba(54,54,54,.3)"}}>·</span> <b style={{color:"var(--ink-2)"}}>{p.age}</b></td>
                <td><div style={{fontWeight:700}}>{p.carrier}</div><div style={{fontSize:11,color:"var(--ink-3)",fontFamily:"JetBrains Mono,monospace"}}>{p.carrierId}</div></td>
                <td style={{color:p.lastVisit==="Never"?"var(--persimmon)":"var(--ink-2)"}}>{p.lastVisit}</td>
                <td className={"pt-bal"+(p.balance?" due":"")}>${p.balance.toFixed(2)}</td>
                <td>
                  <div className="chip-row">
                    {p.flags.slice(0,2).map(f => {
                      const cls = f.toLowerCase().includes("allerg")||f.toLowerCase().includes("anti")?"alert":
                                  f.toLowerCase().includes("new")?"info":
                                  f.toLowerCase().includes("overdue")?"warn":"";
                      return <span key={f} className={"badge "+cls}>{f}</span>;
                    })}
                  </div>
                </td>
                <td><Icon name="chevR" size={16} stroke={2}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

window.PatientsView = PatientsView;
