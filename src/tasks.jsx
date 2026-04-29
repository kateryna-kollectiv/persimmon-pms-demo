// Assigned-to-me tasks for the Huddle right rail
// Each task has a related patient (or null), assignor, due date, priority, status

const TASKS = [
  { id:"t1", title:"Peter Harrison — Insurance Termed. Call patient.", due:"Apr 29", assignor:"Sasha (me)", patientId:"p3", priority:"high", status:"open",
    body:"Cigna Dental DPPO eligibility came back terminated on last batch verify. Call patient to confirm current coverage, collect new carrier/member ID, and update plan on file before next visit.",
    related:["Last EOB","Eligibility check 4/28"], category:"Insurance" },
  { id:"t2", title:"Sara Ito — Insurance max reached. Call patient.", due:"Apr 29", assignor:"Sasha (me)", patientId:"p13", priority:"high", status:"open",
    body:"Guardian PPO annual maximum exhausted for 2026. Outstanding $312 balance now patient responsibility. Call to discuss payment plan and defer remaining elective work to next benefit year.",
    related:["Acct ledger","Tx plan"], category:"Insurance" },
  { id:"t3", title:"Sara Ito — Insurance COB mismatch. Call patient.", due:"Apr 29", assignor:"Sasha (me)", patientId:"p13", priority:"high", status:"open",
    body:"Coordination of benefits flagged — secondary carrier on file doesn't match Guardian's records. Call patient to confirm primary/secondary order and update both plans before resubmitting claim.",
    related:["Claim #2244","COB form"], category:"Insurance" },
];

const taskById = (id) => TASKS.find(t => t.id === id);

window.TASKS = TASKS;
window.taskById = taskById;
