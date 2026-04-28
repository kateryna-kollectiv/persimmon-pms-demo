// Huddle dashboard — 3-zone layout: schedule column · KPI grid · assigned-to-me rail

const Ring = ({ value, max = 100, color = "#464E01", track = "#F7F6F3", size = 320, stroke = 18 }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
      strokeLinecap="round" strokeDasharray={`${c * pct} ${c}`}
      transform={`rotate(-90 ${size / 2} ${size / 2})`} />
    </svg>);

};

const TrendIcon = ({ up = true, value }) =>
<span className={"kpi-trend" + (up ? "" : " down")}>
    <Icon name={up ? "arrowUp" : "arrowDown"} size={12} stroke={3} />
    <span>{value || (up ? "+12.4%" : "-3.1%")}</span>
  </span>;


// Half-arc gauge for Hygiene Reappoint
const HalfArc = ({ value = 84.38, color = "#5A7A2F", track = "#F7F6F3" }) => {
  const r = 90;
  const cx = 120,cy = 120;
  const len = Math.PI * r;
  const pct = Math.min(value / 100, 1);
  return (
    <svg width={240} height={130} viewBox="0 0 240 130" preserveAspectRatio="xMidYMax meet"
    style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", pointerEvents: "none" }}>
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
      stroke={track} strokeWidth={20} fill="none" strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
      stroke={color} strokeWidth={20} fill="none" strokeLinecap="round"
      strokeDasharray={`${len * pct} ${len}`} />
    </svg>);

};

const TaskRow = ({ task, onClick }) => {
  const isOverdue = task.due === "Apr 29";
  return (
    <button className="task-row" onClick={onClick}>
      <div className="tr-body">
        <div className="tr-title">{task.title}</div>
        <div className="tr-meta">
          <span className={"tr-due" + (isOverdue ? " today" : "")}>{task.due}</span>
          <span className="tr-dot" />
          <span className="tr-by">{task.assignor}</span>
        </div>
      </div>
    </button>);

};

const Huddle = ({ onOpenTask }) => {
  const [hoverTask, setHoverTask] = React.useState(null);

  return (
    <div className="canvas canvas-huddle">
      <div className="huddle-layout">

        {/* ── LEFT COLUMN: Schedule Utilization + Total Patient Visits ── */}
        <div className="hud-col left">
          <div className="kpi-util">
            <h3 className="kpi-title">Schedule Utilization</h3>
            <p className="kpi-sub">Percentage of provider chair time booked across all operatories today.</p>
            <div className="util-ring">
              <Ring value={84.67} color="var(--olive)" track="#F7F6F3" size={300} stroke={18} />
              <div className="util-center">
                <div className="v">
                  <span className="big">84.67</span>
                  <span className="pct">%</span>
                </div>
                <div className="l">Today</div>
              </div>
            </div>
            <TrendIcon up value="+12.4%" />
          </div>

          <div className="kpi-visits">
            <div className="vis-glow" aria-hidden="true" />
            <div className="vis-top">
              <div>
                <div className="vis-title">Total Patient<br />Visits</div>
              </div>
              <div className="vis-stack">
                {[0, 1, 2, 3, 4].map((i) =>
                <div key={i} className="av" style={{ backgroundImage: `url(${AVATARS[i % AVATARS.length]})`, marginLeft: i ? -10 : 0 }} />
                )}
                <button className="vis-go" aria-label="View all">
                  <Icon name="arrowUpR" size={16} stroke={2.5} />
                </button>
              </div>
            </div>
            <ul className="vis-bullets">
              <li>2 patients waiting on insurance verification</li>
              <li>Op 1: 30-min gap at 1:00 PM — call standby list</li>
              <li>Roberta D. ready for crown seat after lunch</li>
            </ul>
            <div className="vis-num">39</div>
          </div>
        </div>

        {/* ── MIDDLE: KPI Grid (3 cols × 3 rows) ── */}
        <div className="hud-col middle">
          <div className="kpi-grid">

            <div className="kpi peach kpi-tall">
              <h3 className="kpi-title">Gross Dentist Prod</h3>
              <p className="kpi-sub">Production billed by dentists today.</p>
              <div className="kpi-corner-icon"><Icon name="arrowUpR" size={14} stroke={2.5} /></div>
              <div className="kpi-spacer" />
              <div className="kpi-value">$7,359<span className="kpi-cents">.54</span></div>
              <TrendIcon up value="+12.4%" />
            </div>

            <div className="kpi white kpi-tall">
              <h3 className="kpi-title">Hygiene Reappoint</h3>
              <p className="kpi-sub">Hygiene visits with a future scheduled appointment.</p>
              <div className="kpi-corner-icon" style={{ background: "#DBEFE7", color: "#5A7A2F" }}>
                <Icon name="check" size={14} stroke={3} />
              </div>
              <div className="kpi-spacer" />
              <div className="kpi-value" style={{ position: "relative", zIndex: 2 }}>84.38<span className="kpi-cents">%</span></div>
              <HalfArc value={84.38} />
            </div>

            <div className="kpi sky kpi-tall">
              <h3 className="kpi-title">Gross Hygienist Production</h3>
              <p className="kpi-sub">Production billed by hygienists.</p>
              <div className="kpi-corner-icon"><Icon name="activity" size={14} stroke={2.5} /></div>
              <div className="kpi-spacer" />
              <div className="kpi-value">$3,210<span className="kpi-cents">.00</span></div>
              <TrendIcon up={false} value="-3.1%" />
            </div>

            <div className="kpi yellow kpi-tall">
              <h3 className="kpi-title">Account Past Due AR</h3>
              <p className="kpi-sub">Outstanding patient balance over 60 days.</p>
              <div className="kpi-corner-icon" style={{ background: "#FFEEE0", color: "#B65A1F" }}>
                <Icon name="alertCircle" size={14} stroke={2.5} />
              </div>
              <div className="kpi-spacer" />
              <div className="kpi-value">$462<span className="kpi-cents">.00</span></div>
            </div>

            <div className="kpi cream kpi-tall">
              <h3 className="kpi-title">OTC Rate</h3>
              <p className="kpi-sub">Open treatment conversion this week.</p>
              <div className="kpi-corner-icon"><Icon name="chart" size={14} stroke={2.5} /></div>
              <div className="kpi-spacer" />
              <div className="kpi-value">77.78<span className="kpi-cents">%</span></div>
              <TrendIcon up value="+12.4%" />
            </div>

            <div className="kpi lavender kpi-tall">
              <h3 className="kpi-title">Total Gross Production</h3>
              <p className="kpi-sub">All providers, all chairs.</p>
              <div className="kpi-corner-icon"><Icon name="cash" size={14} stroke={2.5} /></div>
              <div className="kpi-spacer" />
              <div className="kpi-value">$10,569<span className="kpi-cents">.54</span></div>
              <TrendIcon up value="+12.4%" />
            </div>

            <div className="kpi white kpi-short">
              <h3 className="kpi-title">New Patient Visits</h3>
              <p className="kpi-sub">First-time patients today.</p>
              <div className="kpi-spacer" />
              <div className="kpi-value">2</div>
            </div>

            <div className="kpi white kpi-short">
              <h3 className="kpi-title">Patient Collection</h3>
              <p className="kpi-sub">Cash collected at front desk today.</p>
              <div className="kpi-spacer" />
              <div className="kpi-value">$954<span className="kpi-cents">.32</span></div>
            </div>

            <div className="kpi white kpi-short">
              <h3 className="kpi-title">Unscheduled Family<br />Members</h3>
              <p className="kpi-sub">Family members of today's patients without next visit.</p>
              <div className="kpi-spacer" />
              <div className="kpi-value">9</div>
            </div>

          </div>
        </div>

        {/* ── RIGHT RAIL: Assigned To Me ── */}
        <div className="hud-col right">
          <div className="task-card">
            <div className="task-card-head">
              <h3>Assigned To Me</h3>
              <span className="task-count">{TASKS.length}</span>
            </div>
            <div className="task-card-body">
              {TASKS.map((t, i) =>
              <TaskRow key={t.id} task={t} onClick={() => onOpenTask(t.id)} />
              )}
            </div>
            <div className="task-card-foot">
              <button>View all tasks <Icon name="arrowR" size={14} /></button>
            </div>
          </div>
        </div>

      </div>
    </div>);

};

window.Huddle = Huddle;