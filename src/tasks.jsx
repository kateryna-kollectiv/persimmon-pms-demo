// Assigned-to-me tasks for the Huddle right rail
// Each task has a related patient (or null), assignor, due date, priority, status

const TASKS = [
  { id:"t1", title:"2025 Non-Ortho RCM Inquiry Spreadsheet/Office Support", due:"Apr 29", assignor:"Barriga, Gloria", patientId:null,  priority:"high",   status:"open",
    body:"Q1 inquiry log needs reconciliation against Office Support tickets. Pull entries flagged 'pending' and confirm payer response status. Spreadsheet shared in #rcm channel.",
    related:["RCM-2025-Q1.xlsx","Carrier mapping v3"], category:"Billing" },
  { id:"t2", title:"Post payments — Maya Hollande", due:"Apr 29", assignor:"Soto, Native",   patientId:"p1",  priority:"medium", status:"open",
    body:"Patient overpaid $142 on 4/24 visit. Apply to outstanding balance from 10/3 visit, refund remaining $48 to card on file.",
    related:["Pmt receipt #4488","Acct ledger"], category:"Billing" },
  { id:"t3", title:"Daily claims work — submit batch", due:"Apr 29", assignor:"Lopelley, Kelcy", patientId:null, priority:"high",   status:"open",
    body:"7 claims ready in queue. Confirm attachments on D2740 (Hollande) before submitting.",
    related:["Claims queue"], category:"Billing" },
  { id:"t4", title:"Verify benefits — Roberta Delacroix", due:"Apr 30", assignor:"Soto, Native", patientId:"p2", priority:"high",   status:"open",
    body:"Crown seat scheduled for Friday. MetLife requires updated x-rays + narrative for D2740 prior to seat. Call payer line, get reference number.",
    related:["Tx plan #1188","Last EOB"], category:"Insurance" },
  { id:"t5", title:"Recall outreach — overdue list", due:"May 1",  assignor:"Barriga, Gloria", patientId:null, priority:"medium", status:"open",
    body:"34 patients with no scheduled hygiene visit past due 2 weeks+. Run the recall macro and flag any with open balances for separate follow-up.",
    related:["Recall report"], category:"Hygiene" },
  { id:"t6", title:"Update consent — Ethan Park", due:"May 1",  assignor:"Dr. Whitaker", patientId:"p4", priority:"medium", status:"open",
    body:"Pre-med for amoxicillin needs signed consent before extraction visit. Flag at check-in.",
    related:["Consent template"], category:"Clinical" },
  { id:"t7", title:"Reconcile EOBs from Delta Dental", due:"May 2",  assignor:"Barriga, Gloria", patientId:null, priority:"low",    status:"open",
    body:"6 EOBs received this week. Match to claim batch IDs and post to ledger. Two have adjustments — flag for Kelcy.",
    related:["Delta EOB pkt"], category:"Billing" },
  { id:"t8", title:"Order supplies — composite shades", due:"May 5",  assignor:"Sasha (you)",     patientId:null, priority:"low",    status:"open",
    body:"A2/A3 running low. Place order through Patterson; check rebate eligibility this quarter.",
    related:[], category:"Operations" },
];

const taskById = (id) => TASKS.find(t => t.id === id);

window.TASKS = TASKS;
window.taskById = taskById;
