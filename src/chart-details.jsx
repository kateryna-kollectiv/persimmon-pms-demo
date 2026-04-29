// Chart Details — procedure table with sub-tabs, filter pills, and rows
// Sits below the Treatment Planner on the Chart tab.

const CHART_TX_ROWS = [
  {
    date: "06/03/2026",
    code: "D0120",
    desc: "Periodic Oral Evaluation",
    bd: "D",
    th: "—",
    surface: "—",
    provider: "OSVV",
    location: "PH",
    txPlan: "—",
    phase: "—",
    fee: 36.00,
    insExt: 36.00,
    disc: 0.00,
    payable: 0.00,
    status: "Proposed",
    user: "Armstrong, Monique",
    badge: null,
  },
  {
    date: "06/03/2026",
    code: "D1120",
    desc: "Child Prophylaxis",
    bd: "D",
    th: "—",
    surface: "—",
    provider: "OSVV",
    location: "PH",
    txPlan: "—",
    phase: "—",
    fee: 67.00,
    insExt: 0.00,
    disc: 0.00,
    payable: 67.00,
    status: "Proposed",
    user: "Armstrong, Monique",
    badge: "alert",
  },
  {
    date: "06/03/2026",
    code: "D1208",
    desc: "Topical Application of Fluoride (Non-Varnish)",
    bd: "D",
    th: "—",
    surface: "—",
    provider: "OSVV",
    location: "PH",
    txPlan: "—",
    phase: "—",
    fee: 26.00,
    insExt: 26.00,
    disc: 0.00,
    payable: 0.00,
    status: "Proposed",
    user: "Armstrong, Monique",
    badge: null,
  },
  {
    date: "04/27/2026",
    code: "D9230",
    desc: "N2O — Nitrous Oxide · Anxiolysis Analgesia",
    bd: "D",
    th: "—",
    surface: "—",
    provider: "OSVV",
    location: "PH",
    txPlan: "ortho ext",
    phase: "Phase 1",
    fee: 94.00,
    insExt: 75.20,
    disc: 0.00,
    payable: 18.80,
    status: "Proposed",
    user: "Dr. Valdez, Viviene",
    badge: null,
  },
  {
    date: "04/27/2026",
    code: "D7140",
    desc: "Extraction · Erupted Tooth or Exposed Root",
    bd: "D",
    th: "C",
    surface: "—",
    provider: "OSVV",
    location: "PH",
    txPlan: "ortho ext",
    phase: "Phase 1",
    fee: 105.00,
    insExt: 15.00,
    disc: 0.00,
    payable: 90.00,
    status: "Proposed",
    user: "Dr. Valdez, Viviene",
    badge: null,
  },
];

const CHART_FILTERS = [
  { id: "all", label: "All", count: null, active: true },
  { id: "conditions", label: "Conditions", count: 8 },
  { id: "existing", label: "Existing", count: 0 },
  { id: "planned", label: "Planned", count: 8 },
  { id: "today", label: "Today", count: 0 },
  { id: "completed", label: "Completed", count: 6 },
  { id: "notes", label: "Notes", count: 3 },
  { id: "tostart", label: "To Start", count: 0 },
  { id: "tocomplete", label: "To Complete", count: 0 },
  { id: "toreview", label: "To Review", count: 0 },
  { id: "documents", label: "Documents", count: 1 },
];

const fmtMoney = (n) => `$${n.toFixed(2)}`;

const ChartDetails = ({ patient }) => {
  const [section, setSection] = React.useState("chart"); // chart | txplans | imaging
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [showFees, setShowFees] = React.useState(true);
  const [rejectedOnly, setRejectedOnly] = React.useState(false);
  const [checked, setChecked] = React.useState({});

  const toggleAll = (e) => {
    if (e.target.checked) {
      const all = {};
      CHART_TX_ROWS.forEach((_, i) => { all[i] = true; });
      setChecked(all);
    } else {
      setChecked({});
    }
  };
  const toggleOne = (i) => setChecked(s => ({ ...s, [i]: !s[i] }));
  const allChecked = CHART_TX_ROWS.every((_, i) => checked[i]);

  return (
    <div className="cd-card">
      {/* Section tabs */}
      <div className="cd-sectabs">
        {[["chart","Chart Details"],["txplans","Tx. Plans"],["imaging","Imaging"]].map(([k,l])=>(
          <button key={k} className={"cd-sectab"+(section===k?" on":"")} onClick={()=>setSection(k)}>{l}</button>
        ))}
        <div className="cd-sectabs-spacer"/>
        <label className="cd-toggle">
          <input type="checkbox" checked={showFees} onChange={e=>setShowFees(e.target.checked)}/>
          <span>Show Fees Estimate</span>
        </label>
        <label className="cd-toggle">
          <input type="checkbox" checked={rejectedOnly} onChange={e=>setRejectedOnly(e.target.checked)}/>
          <span>Rejected Tx Only</span>
        </label>
      </div>

      {/* Filter pills */}
      <div className="cd-pills">
        {CHART_FILTERS.map(f => (
          <button
            key={f.id}
            className={"cd-pill"+(activeFilter===f.id?" on":"")}
            onClick={()=>setActiveFilter(f.id)}
          >
            <span>{f.label}</span>
            {f.count !== null && <span className="cd-pill-count">{f.count}</span>}
          </button>
        ))}
        <button className="cd-pill cd-pill-select">Default <svg className="cd-caret" width="10" height="10" viewBox="0 0 10 10"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
        <button className="cd-pill cd-pill-select">Case <svg className="cd-caret" width="10" height="10" viewBox="0 0 10 10"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
      </div>

      {/* Table */}
      <div className="cd-tablewrap">
        <table className="cd-table">
          <thead>
            <tr>
              <th className="cd-th-check">
                <input type="checkbox" checked={allChecked} onChange={toggleAll}/>
              </th>
              <th>Date <svg className="cd-caret" width="10" height="10" viewBox="0 0 10 10"><path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg></th>
              <th className="cd-th-desc">Description <span className="cd-th-link">(Show Details)</span></th>
              <th>B.D.</th>
              <th>Th/Area</th>
              <th>Surface</th>
              <th>Provider</th>
              <th>Location</th>
              <th>Tx Plan</th>
              <th>Phase</th>
              <th className="cd-th-num">Fee</th>
              <th className="cd-th-num">Ins. Ext</th>
              <th className="cd-th-num">Disc.</th>
              <th className="cd-th-num">Pat. Payable</th>
              <th>Status</th>
              <th>Notes</th>
              <th>N/A</th>
              <th>User Name</th>
            </tr>
          </thead>
          <tbody>
            {CHART_TX_ROWS.map((r, i) => (
              <tr key={i} className={checked[i]?"on":""}>
                <td><input type="checkbox" checked={!!checked[i]} onChange={()=>toggleOne(i)}/></td>
                <td className="cd-mono">{r.date}</td>
                <td className="cd-desc">
                  <a className="cd-link" href="#">{r.code}</a>
                  <span> &nbsp;-&nbsp; {r.desc}</span>
                  {r.badge==="alert" && <span className="cd-alert" title="Attention"><Icon name="alert" size={12}/></span>}
                </td>
                <td><a className="cd-link" href="#">{r.bd}</a></td>
                <td className="cd-dim">{r.th}</td>
                <td className="cd-dim">{r.surface}</td>
                <td><a className="cd-link" href="#">{r.provider}</a></td>
                <td className="cd-dim">{r.location}</td>
                <td className="cd-dim">{r.txPlan}</td>
                <td className="cd-dim">{r.phase}</td>
                <td className="cd-num"><a className="cd-link" href="#">{fmtMoney(r.fee)}</a></td>
                <td className="cd-num">{fmtMoney(r.insExt)}</td>
                <td className="cd-num"><a className="cd-link" href="#">{fmtMoney(r.disc)}</a></td>
                <td className="cd-num"><a className="cd-link" href="#">{fmtMoney(r.payable)}</a></td>
                <td><span className="cd-status">{r.status}</span></td>
                <td className="cd-dim">—</td>
                <td className="cd-dim">—</td>
                <td className="cd-user">{r.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer summary */}
      <div className="cd-foot">
        <div className="cd-foot-meta">
          <span>{CHART_TX_ROWS.length} procedures</span>
          <span className="cd-foot-sep"/>
          <span>{Object.values(checked).filter(Boolean).length} selected</span>
        </div>
        <div className="cd-foot-totals">
          <span>Total fee <b>{fmtMoney(CHART_TX_ROWS.reduce((s,r)=>s+r.fee,0))}</b></span>
          <span>Insurance <b>{fmtMoney(CHART_TX_ROWS.reduce((s,r)=>s+r.insExt,0))}</b></span>
          <span>Patient <b>{fmtMoney(CHART_TX_ROWS.reduce((s,r)=>s+r.payable,0))}</b></span>
        </div>
      </div>
    </div>
  );
};

window.ChartDetails = ChartDetails;
