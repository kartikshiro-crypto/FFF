# SkillBridge Bathinda — Multi-Role Institute Ecosystem (Admin, Teacher, Student, Parent)

An integrated educational management and learning platform for SkillBridge Institute in Bathinda, Punjab, supporting 4 specialized roles: **Institute Admin**, **Teacher**, **Student**, and **Parent**, featuring role-based workflows, interactive roll-call attendance, assignment grading rubrics, linked-child parent monitoring, printable verified certificates, and a multi-model AI tutor.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed during requirements clarification:
> - **Navigation & Role Switching**: Top bar role switcher with seeded linked personas:
>   - *Admin*: Er. Gurpreet Singh Brar (Institute Director / Owner)
>   - *Teacher*: Er. Sukhman Gill (Senior Full-Stack Architect & HOD Tech)
>   - *Student*: Harpreet Singh (Enrolled in Full-Stack MERN, Roll #SB-2026-042)
>   - *Parent*: S. Balwinder Singh (Father of Harpreet Singh, linked to Roll #SB-2026-042)
> - **Teacher Attendance & Grading**: Interactive daily roll-call sheet with 1-click Present/Absent toggles, auto parent absence alerts, and an instant assignment evaluation modal with numerical marks and rubric feedback.
> - **Student Certificates**: Printable, verified Course Completion Certificate featuring the SkillBridge Bathinda seal, director signature, student roll number, and verification code with QR badge.
> - **Parent Portal Privacy**: Strict child linkage—parents strictly view attendance, grades, announcements, and fee payment receipts of their own linked child.

---

### 1. Overview & Core Concept

- **What It Does**: SkillBridge provides a 360-degree institute operating system replacing fragmented WhatsApp groups, paper registers, and offline receipt books with dedicated portals for:
  - **A. Institute Admin**: Oversee seat capacity, manage teachers & students, configure courses & batches, collect fees with GST invoices, broadcast WhatsApp replacements, review revenue analytics, and manage SaaS subscription plans.
  - **B. Teacher**: View assigned cohorts, conduct interactive daily roll-calls, upload handouts, create assignments, evaluate student submissions with marks/rubrics, and monitor performance.
  - **C. Student**: Access course modules, submit homework, track attendance and progress, consult the multi-model AI tutor (Gemini, Claude, GPT, Grok) with fee awareness, pay fees, and print course completion certificates.
  - **D. Parent**: Monitor their child’s live attendance %, view teacher assignment remarks, inspect fee balances and download GST invoices, and connect directly with the institute desk.
- **Location Context**: SkillBridge Institute, SCF 24-25, Ajit Road Coaching Complex, Bathinda, Punjab (Pin: 151001, State Code: 03).

---

### 2. User Experience & Visual Design

#### Key User Flows by Role
1. **Admin Workspace**:
   - Overview metrics (Seats, Enrollments, Fee Collections, Outstanding Dues).
   - Staff & Teacher Management: View teacher directory, assign batches, add new faculty.
   - Batch & Seat Inventory: Visual occupancy bars, adjust seat limits.
   - Fee Management: GST Tax Invoices (SAC 999293, CGST 9% + SGST 9%), payment collection simulator, WhatsApp reminder dispatch.
   - Platform Subscription: Basic (₹399/mo), Standard (₹799/mo), Premium (₹1,199/mo) with SaaS software tax receipt.
   - Institute Customizer: Edit institute name, phone, UPI ID, address, and director details.
2. **Teacher Workspace**:
   - Timetable view of assigned batches (e.g. MERN Alpha Morning, Python Weekend).
   - **Interactive Roll-Call Sheet**: Mark Present/Absent/Late with 1-click for all students in the batch; generates automated parent absence notification.
   - **Assignment Evaluation Desk**: View student submissions, test links, input score (e.g., 48/50), write pedagogical feedback, and update status to Graded.
   - Study Material Publisher: Add lecture handouts and code repository links.
3. **Student Workspace**:
   - View syllabus modules, lesson summaries, and interactive video simulators.
   - Submit assignments (written solution, code editor, GitHub repository link).
   - AI Tutor: Switch between Gemini 2.5 Flash, Claude 3.7 Sonnet, GPT-4o, and Grok-3, or compare answers in the 4-Model Arena.
   - Certificate Hub: Generate & print verified SkillBridge completion certificate with Bathinda campus seal.
4. **Parent Workspace**:
   - Child Selector (linked to Harpreet Singh or Amanjot Sharma).
   - Real-time Attendance Monitor with alert indicator if attendance falls below 85%.
   - Academic Progress: View teacher remarks and scores on recent submissions.
   - Fee & Invoice Desk: Outstanding dues, payment history, and printable GST tax receipts.
   - Direct WhatsApp Helpline to Institute Administration.

#### Visual Identity & Theme
- **Clean Aesthetic**: Utilitarian, high-trust EdTech design adhering to strict anti-slop rules (no decorative pulsing dots, zero pill wrappers on static metadata, 60-30-10 color distribution).
- **Color Palette**: Deep Punjab Indigo (`#1e3a8a` / `#2563eb`), slate canvas (`#f8fafc` / `#090d16`), warm amber gold accents (`#d97706`), and emerald status indicators.
- **Print Optimization**: Dedicated `@media print` stylesheets for both **GST Tax Invoices** and **Course Completion Certificates** ensuring clean, high-resolution physical printing.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Unified State Store with Role-Specific Perspectives**
  - *Approach*: Extend `src/data/store.ts` to manage teachers, daily attendance logs, teacher assignment evaluations, and student certificates in a cohesive reactive store.
  - *Why*: Enables instant data propagation—when a teacher marks a student absent or grades an assignment, the student and parent portals reflect the change immediately without page reload.
- **Decision 2: Seamless Role Switcher in Top Bar**
  - *Approach*: Top navigation contains a clean 4-role switcher button group with active persona indicators (`Admin: Er. Brar`, `Teacher: Er. Gill`, `Student: Harpreet`, `Parent: S. Balwinder Singh`), while maintaining the strict 3-zone Top Bar Contract.
  - *Why*: Allows instant demonstration and testing of all 4 perspectives without tedious logout/login steps.
- **Decision 3: Printable Certificate Engine with SVG Security Seal**
  - *Approach*: High-fidelity certificate component with decorative guilloche border, gold institute seal, QR code verification badge, and director signature block.
  - *Why*: Provides tangible value for students completing tech bootcamps or IELTS prep.

---

### 4. Technical Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SkillBridge Bathinda Core                         │
├─────────────────────────────────────────────────────────────────────────────┤
│ Top Bar: Role Switcher (Admin · Teacher · Student · Parent) | Theme Toggle  │
└─────────────────────────────────────────────────────────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  Admin Portal    │    │  Teacher Portal  │    │  Student Portal  │
│ - Seat Inventory │    │ - Roll-Call Sheet│    │ - Modules & Work │
│ - Staff / Roster │    │ - Grade Rubrics  │    │ - Submit Tasks   │
│ - Fees & GST Inv │    │ - Study Handouts │    │ - Multi-AI Tutor │
│ - SaaS Plans     │    │ - Batch Notices  │    │ - Certificate    │
└──────────────────┘    └──────────────────┘    └──────────────────┘
                                  ▲                        ▲
                                  │                        │
                                  └──────────┬─────────────┘
                                             │
                                             ▼
                                  ┌──────────────────┐
                                  │  Parent Portal   │
                                  │ - Linked Child   │
                                  │ - Live Attendance│
                                  │ - Grades & Marks │
                                  │ - Fees & Receipts│
                                  └──────────────────┘
```

#### Core New Data Entities
- **Teacher**: `id`, `name`, `email`, `phone`, `designation`, `assignedBatchIds`, `qualification`, `joiningDate`.
- **AttendanceRecord**: `id`, `batchId`, `date`, `records: Record<studentId, 'Present' | 'Absent' | 'Late'>`, `markedByTeacherId`.
- **Certificate**: `id`, `studentId`, `studentName`, `courseName`, `issueDate`, `completionScore`, `verificationCode`, `directorName`.
- **Parent**: `id`, `name`, `phone`, `email`, `linkedStudentId`, `relationship`.
