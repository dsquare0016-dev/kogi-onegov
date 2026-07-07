## Kogi GovOS — Phase 2 Blueprint Build-Out

This expands the existing platform into the full Digital Government Operating System (DGOS) described in the blueprint. The current build already has the shell, role-based dashboards, login, and core modules. Phase 2 layers the missing governance intelligence, evidence workflows, and executive war-room capabilities on top.

### What gets built

**1. Strategic Alignment Spine (mock data refactor)**
Rebuild `src/lib/mock-data.ts` so every record traces:
Vision → Pillar → Objective → Programme → Project → Activity → Task → Budget Line → Evidence → KPI. Two flagship programmes seeded end-to-end as the live prototype:
- Ministry of Education — Classroom Construction Programme
- Ministry of Water Resources — Five Boreholes Deployment Programme

**2. Budget vs Development Plan Intelligence**
New route `dashboard.spi.tsx` (State Performance Index): expected vs actual development contribution, contribution gap, strategic achievement index, AI recommendation per pillar.

**3. Activities → Tasks → Evidence workflow**
- New `dashboard.activities.tsx` — every activity card shows budget, officer, dates, deliverables, KPI, % complete.
- New `dashboard.tasks.$activityId.tsx` — task list with status (Green/Amber/Red), evidence uploader (photos, video, report, GPS), approval action (Approve / Reject / Request More).
- "Cannot complete without verified evidence" guard enforced in UI.

**4. Project Authenticity & Verification Engine**
Upgrade `dashboard.projects.tsx`: verification status column (Verified / Pending / Rejected / Under Review), evidence checklist drawer, AI flag for incomplete evidence.

**5. Delay Detection & Bottleneck Analysis**
New `dashboard.bottlenecks.tsx`: delay source breakdown (Governor / Commissioner / PS / Procurement / Funding / Contractor / Staff), duration, risk score, responsible officer, escalation level — with charts.

**6. Executive War Room**
Promote the Governor dashboard to a true War Room: add MDA Ranking, Commissioner Ranking, State Performance Score gauge, Risk Alerts feed, AI Executive Insights panel, one-click "Generate Briefing".

**7. GDU Command Center upgrade**
Add State Delivery Scorecard, Ministry/Agency Ranking engines, Escalation Monitor, Executive Approval Tracker.

**8. E-Memo & Digital Letter Management**
New `dashboard.e-memo.tsx`: draft memo/letter, routing chain (Officer → Secretary → Director → PS → Commissioner → Governor), digital signature stamp, comments, version history, audit log.

**9. Government Group Communication Hub**
Upgrade `dashboard.communications.tsx`: groups (Exco, Commissioners, PS Forum, Ministry/Agency/Project/GDU teams), messaging thread, voice-note / call / video-call placeholder buttons, broadcasts, read receipts, unread counters.

**10. Geo-Spatial Project Monitoring**
New `dashboard.map.tsx`: stylized SVG Kogi State map with 21 LGAs, project pins colored by status, click-to-inspect side panel, project heat map toggle, dev-plan coverage toggle.

**11. AI Government Intelligence Assistant upgrade**
Enhance `dashboard.ai-assistant.tsx` with curated prompt chips ("Which ministry is performing best?", "Generate Governor brief", "Which projects are delayed?", "Current Dev Plan progress?") that return data-driven mock answers stitched from the same mock-data spine.

**12. Executive One-Page Briefing**
New `dashboard.briefings.tsx`: Daily / Weekly / Monthly / Quarterly / Annual tabs, auto-generated one-page brief (budget utilization, dev-plan progress, rankings, delayed projects, risks, AI recommendations), "Download PDF" stub.

**13. Performance Management Engine view**
New `dashboard.performance.tsx`: staff → dept → agency → ministry → state cascade with weighted scoring (task completion, project delivery, budget utilization, report compliance, KPI achievement, dev-plan contribution).

**14. GDU Change Request workflow**
New `dashboard.service-requests.tsx`: ministries submit historical-data/report requests; Request → Review → Approval → Costing → Payment → Delivery pipeline.

**15. Desk Officer Certification**
New `dashboard.desk-officers.tsx`: assignments, training status, certification, replacement/redeployment requests, competency records.

**16. Navigation & role gating**
Update `AppShell` sidebar with new sections grouped:
- Executive Intelligence (War Room, SPI, Briefings, Map)
- Delivery (Activities, Tasks, Projects, Bottlenecks, Verification)
- Governance Workflow (E-Memo, Communications, Service Requests)
- People (Staff, Desk Officers, Performance)
- Strategy & Money (Development Plan, Budget, Procurement, Analytics)
- AI Assistant

Visibility per role per blueprint (Governor sees intelligence only, Staff sees own workspace only, etc.).

### Out of scope (this phase)
- Real backend / database / auth — stays on the localStorage session and seeded mock data, consistent with the current build.
- Real file upload to storage, real voice/video calls, real PDF generation — UI affordances and toasts only.
- Real GIS tiles — stylized SVG map of Kogi LGAs.

### Technical notes
- All new routes are TanStack Start file routes under `src/routes/dashboard.*.tsx`.
- One expanded `src/lib/mock-data.ts` is the single source of truth so every screen references the same Vision→Task→Evidence spine.
- Charts continue using Recharts; design tokens from `src/styles.css` (navy / gold / green) — no hardcoded colors.
- Role gating reuses `src/lib/roles.ts` `scope` field; sidebar items get a `roles` allowlist.

Confirm and I will build it.
