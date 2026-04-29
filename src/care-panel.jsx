// New realistic tooth chart with multi-select + Care Panel for treatment

const CARE_ACTIONS = [
// green = restorative existing/standard
{ code: "D2392", label: "COMPOSITE", group: "resto", color: "#9DC4A6", note: "" },
{ code: "D2140", label: "AMALGAM", group: "resto", color: "#9DC4A6", note: "" },
{ code: "D3310", label: "ROOT CANAL", group: "resto", color: "#9DC4A6" },
{ code: "D9972", label: "WHITENING", group: "resto", color: "#9DC4A6" },
{ code: "D4341", label: "SRP", group: "resto", color: "#9DC4A6" },
// blue = preventative / completed
{ code: "D2391", label: "FILLS", group: "done", color: "#A6CCE0" },
{ code: "D3110", label: "INDIRECT PULP CAP", group: "resto", color: "#9DC4A6" },
{ code: "D2962", label: "VENEERS", group: "resto", color: "#9DC4A6" },
{ code: "D1351", label: "SEALANT", group: "resto", color: "#9DC4A6" },
{ code: "D9230", label: "NG", group: "resto", color: "#9DC4A6" },
{ code: "D1110", label: "PROPHY / FL", group: "resto", color: "#9DC4A6" },
{ code: "D2950", label: "CROWN PREP", group: "done", color: "#A6CCE0" },
// crown row
{ code: "D2740", label: "CROWN", group: "resto", color: "#9DC4A6" },
{ code: "D7140", label: "EXT", group: "resto", color: "#9DC4A6" },
{ code: "D6240", label: "BRIDGE", group: "resto", color: "#9DC4A6" },
{ code: "D5110", label: "DENTURES", group: "resto", color: "#9DC4A6" },
{ code: "D0150", label: "EXAMS", group: "resto", color: "#9DC4A6" },
{ code: "D2920", label: "CROWN SEAT", group: "done", color: "#A6CCE0" },
// BU + crown row
{ code: "D2950", label: "BU", group: "resto", color: "#9DC4A6" },
{ code: "D2950+", label: "CROWN + BU", group: "watch", color: "#F0C8C0", note: "i" },
{ code: "D6010", label: "IMPLANT", group: "watch", color: "#F0C8C0" },
{ code: "REF", label: "REFERRALS", group: "resto", color: "#9DC4A6" },
{ code: "D0274", label: "X-RAYS", group: "resto", color: "#9DC4A6" },
{ code: "FOC", label: "PRBLM FOCUS", group: "done", color: "#A6CCE0" },
// bottom row — watch / status
{ code: "WATCH", label: "WATCH", group: "watch", color: "#F4D6BD" },
{ code: "MISS", label: "MISSING", group: "watch", color: "#F4D6BD" },
{ code: "COND", label: "CONDITIONS", group: "watch", color: "#F4D6BD" },
{ code: "DX", label: "TX DIAGNOSIS", group: "watch", color: "#F4D6BD" },
{ code: "D4341B", label: "SRP", group: "done", color: "#A6CCE0" },
{ code: "HYG", label: "HYGIENE", group: "done", color: "#A6CCE0" }];


const CareActionBtn = ({ action, onClick, disabled }) =>
<button
  className="care-btn"
  style={{ background: action.color, opacity: disabled ? 0.4 : 1 }}
  onClick={onClick}
  disabled={disabled}>
  
    <span>{action.label}</span>
    {action.note && <span className="info">i</span>}
  </button>;


const RealisticToothChart = ({
  conditions = {},
  planned = {},
  selected = [],
  onSelectChange,
  hoverNum,
  setHoverNum
}) => {
  const upper = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  const lower = [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17];

  const toggle = (n) => {
    if (selected.includes(n)) onSelectChange(selected.filter((x) => x !== n));else
    onSelectChange([...selected, n]);
  };

  return (
    <div className="rtc">
      {/* Numbers row top */}
      <div className="rtc-nums">
        {upper.map((n) => <div key={n} className={"num" + (selected.includes(n) ? " sel" : "")}>{n}</div>)}
      </div>
      <div className="rtc-row">
        {upper.map((n) =>
        <ToothSVG
          key={n}
          num={n}
          condition={conditions[n] || "healthy"}
          planned={planned[n] || []}
          selected={selected.includes(n)}
          hovered={hoverNum === n}
          onClick={() => toggle(n)}
          onMouseEnter={() => setHoverNum(n)}
          onMouseLeave={() => setHoverNum(null)} />

        )}
      </div>

      <div className="rtc-midline">
        <div className="rtc-mid-tick" />
      </div>

      <div className="rtc-row lower">
        {lower.map((n) =>
        <ToothSVG
          key={n}
          num={n}
          condition={conditions[n] || "healthy"}
          planned={planned[n] || []}
          selected={selected.includes(n)}
          hovered={hoverNum === n}
          onClick={() => toggle(n)}
          onMouseEnter={() => setHoverNum(n)}
          onMouseLeave={() => setHoverNum(null)} />

        )}
      </div>
      <div className="rtc-nums">
        {lower.map((n) => <div key={n} className={"num" + (selected.includes(n) ? " sel" : "")}>{n}</div>)}
      </div>
    </div>);

};

const CarePanel = ({ selected, treatmentType, setTreatmentType, careType, setCareType, onApply }) => {
  const [tab, setTab] = React.useState("panel");
  return (
    <div className="care-panel">
      <div className="cp-tabs">
        <button className={tab === "panel" ? "on" : ""} onClick={() => setTab("panel")}>Care Panel</button>
        <button className={tab === "notes" ? "on" : ""} onClick={() => setTab("notes")}>Care Notes</button>
        <div className="cp-actions">
          <button className="cp-mini" style={{ backgroundColor: "rgb(255, 255, 255)", margin: "2px", borderColor: "rgb(247, 60, 31)", borderWidth: "2px", borderStyle: "solid", justifyContent: "center", flexDirection: "row", padding: "4px 4px 6px", color: "rgb(247, 60, 31)", borderRadius: "20px", fontSize: "12px" }}><Icon name="plus" size={12} stroke={2.6} /> Code</button>
          <button className="cp-mini" style={{ backgroundColor: "rgb(255, 255, 255)", margin: "2px", borderWidth: "2px", borderStyle: "solid", borderColor: "rgb(247, 60, 31)", color: "rgb(247, 60, 31)", padding: "4px 4px 6px", borderRadius: "20px", fontSize: "12px" }}><Icon name="plus" size={12} stroke={2.6} /> Note</button>
        </div>
      </div>

      {tab === "panel" ?
      <>
          <div className="cp-form">
            <div className="cp-row">
              <span className="cp-l">Treatment Type</span>
              <span className="cp-c">:</span>
              <div className="cp-radios">
                {["Planned", "Existing", "Completed"].map((t) =>
              <label key={t} className={"cp-radio" + (treatmentType === t ? " on" : "")}
              onClick={() => setTreatmentType(t)}>
                    <span className="rd" />{t}
                  </label>
              )}
              </div>
            </div>
            <div className="cp-row">
              <span className="cp-l">Care Panel Type</span>
              <span className="cp-c">:</span>
              <select className="cp-select" value={careType} onChange={(e) => setCareType(e.target.value)}>
                <option>General Dentistry</option>
                <option>Hygiene</option>
                <option>Endodontics</option>
                <option>Oral Surgery</option>
                <option>Prosthodontics</option>
              </select>
            </div>
          </div>

          <div className="cp-grid" style={{ width: "329px" }}>
            {CARE_ACTIONS.map((a, i) =>
          <CareActionBtn
            key={a.label + i}
            action={a}
            disabled={selected.length === 0}
            onClick={() => onApply(a)} />

          )}
          </div>

          <div className="cp-legend">
            <span><span className="dot" style={{ background: "#3D7BD9" }} />Note</span>
            <span><span className="dot" style={{ background: "#E89B47" }} />Condition</span>
            <span><span className="dot" style={{ background: "#3FA85B" }} />Codes</span>
            <span><span className="dot" style={{ background: "#9C5BD0" }} />Forms</span>
            <span><span className="dot" style={{ background: "#D94343" }} />Exp Code</span>
            <span><span className="dot" style={{ background: "#5BC4D0" }} />Letter</span>
          </div>
        </> :

      <div className="cp-notes">
          <textarea placeholder="Add a clinical note for the selected teeth…" />
        </div>
      }
    </div>);

};

window.RealisticToothChart = RealisticToothChart;
window.CarePanel = CarePanel;
window.CARE_ACTIONS = CARE_ACTIONS;