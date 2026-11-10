# WorkWasl Platform Use Cases Catalogue

This document provides a comprehensive catalogue of **all functional and operational use cases** supported by the WorkWasl platform. Each use case details the primary actors, preconditions, end-to-end workflow steps, financial ledger mutations, and business value.

---

## Use Case Classification Matrix

| ID | Use Case Title | Primary Actor | Secondary Actor | Core Subsystem | Business Value |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC-01** | Direct Client-to-Talent Milestone Contract | Enterprise Client | Specialist Freelancer | Contracts & Escrow | High-ticket phased software delivery with 100% escrow security |
| **UC-02** | Multi-Seat Agency & Team Hiring | Organization Owner | Team Members & Freelancers | Organization RBAC | Multi-stakeholder project coordination under a single billing account |
| **UC-03** | Dual-Persona Fractional Operator | Hybrid User (Client + Freelancer) | Counterpart Clients & Freelancers | Dual Switcher & Auth | Seamless transition between hiring subcontractors and delivering client work |
| **UC-04** | Fast-Turnaround Design & Creative Sprints | Marketing Director | UI/UX Designer | Real-time Workroom & Huddle | Rapid review cycles with WebRTC video huddles and artifact previews |
| **UC-05** | Cloud & DevOps Infrastructure Migration | VP of Engineering | DevOps Specialist | Git Verification & Ledger | Verifiable PR deliverables with escrow protection on production deployments |
| **UC-06** | Technical Content & Editorial Production | Editorial Lead | Technical Writer | Milestone Stepper | Batch milestone deliveries with progressive approval workflows |
| **UC-07** | AI Model Fine-Tuning & Data Annotation | AI Product Manager | ML Engineer | Milestone Escrow & Ledger | Phased dataset verification and benchmark-gated milestone releases |
| **UC-08** | Fractional CFO & Corporate Advisory Retainer | Founder / CEO | Financial Consultant | Escrow Ledger & Milestones | Predictable monthly advisory milestones with integer-cents accounting |
| **UC-09** | Phased Milestone Partial Escrow Release | Enterprise Client | Senior Developer | Double-Entry Ledger | Releasing 70% payment for completed portions while holding 30% for revisions |
| **UC-10** | Inactive Milestone Review Auto-Release | System Cron | Freelancer & Client | Automation Engine | Protecting freelancer income when clients are unresponsive for 14+ days |
| **UC-11** | Judicial Arbitration & Proportional Split | Platform Admin | Client & Freelancer | Dispute Resolver & Ledger | Objective resolution of contested deliverables with zero platform lockouts |
| **UC-12** | High-Volume Bidding Screening via Matrix | Hiring Manager | Applying Freelancers | Proposal Comparison Matrix | Side-by-side evaluation of bids, KYC badges, and screening questions |
| **UC-13** | Encrypted Workroom Video Huddle | Contract Client | Contract Freelancer | WebRTC Video Room | Synchronous screen-sharing and code walkthroughs before deliverable approval |
| **UC-14** | Double-Blind Reciprocal Reputation Review | Client | Freelancer | Reputation Engine | Honest two-way feedback revealed simultaneously upon contract completion |
| **UC-15** | Instant Stripe Connect Balance Payout | Freelancer | Stripe Connect API | Financial Ledger | Direct bank transfer of released milestone funds with flat $1 platform take-rate |

---

## Detailed Use Case Specifications

### UC-01: Direct Client-to-Talent Milestone Contract
- **Actor:** Enterprise Client & Specialist Freelancer.
- **Trigger:** Client selects a winning proposal or creates a direct contract offer.
- **Preconditions:**
  - Client has a verified payment method.
  - Freelancer has an active profile with skills and portfolio case studies.
- **Workflow:**
  1. Client structures the agreement into discrete deliverables (e.g., Milestone 1: Architecture, Milestone 2: Core API, Milestone 3: QA & Deployment).
  2. Client deposits funds for Milestone 1 into escrow via Stripe Checkout + flat $1.00 platform fee.
  3. WorkWasl Double-Entry Ledger records:
     - `ESCROW_HOLD`: Milestone amount held in platform treasury.
     - `PLATFORM_FEE`: $1.00 credited to platform revenue ledger.
  4. Freelancer is notified and begins work within the dedicated contract workroom.
  5. Freelancer submits deliverables with live URLs, GitHub repository links, and release notes.
  6. Client reviews deliverables and clicks **"Approve & Release"**.
  7. Ledger executes `ESCROW_RELEASE`: Freelancer receives milestone funds ($1.00 contractor fee applied once per contract upon final release).
- **Post-conditions:** Contract progresses to next milestone or completes; double-blind reviews unlock.

---

### UC-02: Multi-Seat Agency & Team Hiring
- **Actor:** Organization Owner (e.g., VP of Product) and Invited Team Members.
- **Trigger:** Organization needs cross-functional team members to manage different aspects of freelance engagements.
- **Preconditions:** Client account is configured with an active Organization team.
- **Workflow:**
  1. Organization Owner creates an organization profile (e.g., "Apex Fintech Labs") and invites team members via email with assigned roles:
     - `ADMIN`: Can post jobs, interview candidates, and manage contracts.
     - `MEMBER`: Can participate in contract workrooms and review deliverables.
     - `BILLING_MANAGER`: Authorizes milestone escrow funding.
  2. Engineering Manager posts a technical specification and reviews incoming bids using the **Proposal Comparison Matrix**.
  3. Billing Manager authorizes milestone escrow funding via the company credit line.
  4. All team members can collaborate in the shared workroom chat and video huddle.
- **Post-conditions:** Unified audit logs track which team member approved deliverables or funded milestones.

---

### UC-03: Dual-Persona Fractional Operator
- **Actor:** Agency Founder or Senior Independent Consultant.
- **Trigger:** User needs to hire sub-contractors for specialized tasks while simultaneously delivering services to enterprise clients.
- **Preconditions:** Authenticated user account with dual role assignment (`CLIENT` + `FREELANCER`).
- **Workflow:**
  1. User toggles the **Persona Switcher** in the top navigation bar to **Client Mode**:
     - Posts a job for an iOS UI developer.
     - Reviews candidate proposals and funds a $1,500 milestone.
  2. User toggles the switcher to **Freelancer Mode**:
     - Checks active $8,000 backend architecture contract.
     - Submits pull request deliverables for Milestone 2.
     - Reviews newly incoming job alerts matching expert skill tags.
  3. All data (tax identity, notifications, credentials) remains unified under one security context with zero account logging switching friction.
- **Post-conditions:** User manages both payables and receivables from a single authenticated profile.

---

### UC-04: Fast-Turnaround Design & Creative Sprints
- **Actor:** Marketing Director & Product Designer.
- **Trigger:** Client requires a 5-day UI/UX brand refresh and Figma token system.
- **Workflow:**
  1. Client posts an expedited listing with an attached brief and portfolio criteria.
  2. Designer submits a proposal with direct visual portfolio attachments.
  3. Client accepts offer and deposits full sprint escrow ($3,500).
  4. Parties convene in the contract workroom and launch a 1-click **Workroom Video Huddle** to walk through Figma components and design tokens.
  5. Designer uploads deliverable Figma URL and exports.
  6. Client inspects work directly and releases escrow within 48 hours.
- **Post-conditions:** Sprint completed with zero lag; both parties leave 5-star verified reviews.

---

### UC-05: Cloud & DevOps Infrastructure Migration
- **Actor:** VP of Engineering & Kubernetes/Cloud Architect.
- **Trigger:** Enterprise migration of legacy monolithic backend to multi-region cloud infrastructure.
- **Workflow:**
  1. Contract is split into 4 verified milestones:
     - Milestone 1: Terraform IaC scripts ($3,000)
     - Milestone 2: Staging cluster spin-up & automated CI/CD pipeline ($4,000)
     - Milestone 3: Zero-downtime database migration & stress testing ($5,000)
     - Milestone 4: Production cutover & disaster recovery runbook ($3,000)
  2. Each milestone requires cryptographically verifiable GitHub commit SHAs and automated test pass reports.
  3. Milestone 1 and 2 are approved smoothly.
  4. Milestone 3 is verified via load testing logs showing 99.99% success rate under 10,000 concurrent RPS.
  5. Client approves all milestones; double-entry ledger completes with 0% drift.

---

### UC-06: Technical Content & Editorial Production Pipeline
- **Actor:** Head of Content & Technical Writer.
- **Trigger:** Ongoing technical documentation, whitepapers, and developer guides.
- **Workflow:**
  1. Client creates a recurring batch contract with 5 article milestones ($600 per technical deep-dive).
  2. Writer delivers Article 1 in Markdown format.
  3. Client requests a minor revision via the workroom with concrete comments.
  4. Status changes to `REVISION_REQUESTED`; writer updates draft within 24 hours.
  5. Client approves revised milestone; funds are immediately released.
  6. Subsequent milestones are unlocked sequentially.

---

### UC-07: AI Model Fine-Tuning & Data Annotation
- **Actor:** AI Research Lead & Machine Learning Specialist.
- **Trigger:** Fine-tuning an open-source LLM on proprietary domain-specific financial documents.
- **Workflow:**
  1. Milestone 1 ($2,500): Data cleaning, synthetic generation, and JSONL formatting.
  2. Milestone 2 ($4,000): LoRA fine-tuning run with checkpoint evaluation curves.
  3. Milestone 3 ($3,500): Benchmark evaluation against baseline accuracy metrics.
  4. Deliverables include HuggingFace/W&B run logs, loss curves, and model weights.
  5. Escrow safeguards the client against incomplete training runs, while guaranteeing the ML engineer that compute expenses and time are fully funded in escrow.

---

### UC-08: Fractional CFO & Corporate Advisory Retainer
- **Actor:** Series A Startup Founder & Fractional CFO.
- **Trigger:** Monthly financial modeling, 409A valuation readiness, and board deck preparation.
- **Workflow:**
  1. Client sets up a staged 3-month advisory engagement ($4,000/month).
  2. Each month represents a discrete milestone funded at the start of the 30-day cycle.
  3. Deliverables: Updated cash-burn model, investor updates, and financial statements.
  4. Escrow releases automatically on schedule upon deliverable submission.

---

### UC-09: Phased Milestone Partial Escrow Release
- **Actor:** Client, Freelancer, and Double-Entry Ledger.
- **Trigger:** Deliverable is 80% complete and functionally production-ready, but minor non-blocking polish remains.
- **Workflow:**
  1. Milestone value is $5,000 in escrow.
  2. Client chooses **"Partial Release"** and specifies $3,500 release to the freelancer.
  3. WorkWasl Ledger executes:
     - `PARTIAL_RELEASE`: $3,500 credited to freelancer balance.
     - `ESCROW_RETAIN`: $1,500 remains locked in milestone escrow.
  4. Milestone status updates to `PARTIALLY_RELEASED`.
  5. Freelancer finishes remaining polish; client releases the residual $1,500 balance.
- **Post-conditions:** Eliminates all-or-nothing payment gridlock; maintains continuous cash flow for talent while protecting client leverage.

---

### UC-10: Inactive Milestone Review Auto-Release
- **Actor:** System Automated Cron & Freelancer.
- **Trigger:** Freelancer submitted full deliverables, but client became unresponsive and has not reviewed or requested revisions after 14 calendar days.
- **Workflow:**
  1. Automated daily cron job executes at `0 0 * * *`.
  2. Cron scans for milestones where `status = "SUBMITTED"` and `submittedAt < now() - 14 days`.
  3. System triggers auto-approval:
     - Releases milestone escrow to freelancer's available balance.
     - Records automated release audit entry with timestamp and ledger transaction hash.
     - Dispatches notification to both parties: *"Milestone auto-approved after 14 days of client inactivity."*
- **Post-conditions:** Freelancers never suffer from client ghosting or indefinitely locked escrow funds.

---

### UC-11: Judicial Arbitration & Proportional Split
- **Actor:** Platform Admin, Client, and Freelancer.
- **Trigger:** Fundamental disagreement regarding deliverable scope compliance on a $4,000 milestone.
- **Workflow:**
  1. Client requests revision; freelancer disputes the feedback as out-of-scope; parties reach an impasse.
  2. Either party clicks **"Open Formal Dispute"**.
  3. Escrow funds are locked in `DISPUTED` state.
  4. Platform Admin reviews the case in the **Judicial Arbitration Desk**:
     - Inspects contract milestones, initial scope brief, workroom chat logs, and submitted code.
     - Determines freelancer completed 65% of agreed work, but remaining 35% requires significant refactoring.
  5. Admin selects **"Split Escrow"** ruling:
     - Sets slider: 65% to Freelancer ($2,600), 35% to Client ($1,400).
     - Enters required official judicial reasoning note.
  6. Double-entry ledger executes simultaneous split distribution:
     - $2,600 released to freelancer balance.
     - $1,400 refunded to client escrow credit.
  7. Dispute closes with status `RESOLVED_SPLIT`.
- **Post-conditions:** Both parties receive prompt, fair resolution without costly legal proceedings or external credit card chargebacks.

---

### UC-12: High-Volume Bidding Screening via Matrix
- **Actor:** Hiring Manager.
- **Trigger:** Job posting receives 25+ proposals within 48 hours.
- **Workflow:**
  1. Client navigates to `/client/jobs/[id]/proposals`.
  2. Client launches the **Proposal Comparison Matrix**.
  3. Matrix displays candidate side-by-side cards:
     - Bid amount and estimated delivery days.
     - Identity verification status and KYC badges.
     - Star ratings and completed contract counts.
     - Direct answers to client's custom screening questions.
  4. Client shortlists top 3 candidates with 1-click and immediately initiates direct workroom chats.
- **Post-conditions:** Sourcing time reduced from hours to under 15 minutes.

---

### UC-13: Encrypted Workroom Video Huddle
- **Actor:** Contract Client & Freelancer.
- **Trigger:** Parties need synchronous alignment, sprint planning, or visual QA review.
- **Workflow:**
  1. Inside the contract workroom, either party clicks **"Workroom Huddle"**.
  2. System initializes a secure WebRTC peer-to-peer connection channel.
  3. Video, microphone, and desktop screen-sharing controls activate.
  4. Participants discuss code architecture and demo the running application.
  5. Call duration is logged in contract activity timeline.
- **Post-conditions:** Real-time alignment without leaving the WorkWasl interface or exchanging external meeting links.

---

### UC-14: Double-Blind Reciprocal Reputation Review
- **Actor:** Client & Freelancer.
- **Trigger:** Final milestone approved and contract reaches `COMPLETED` status.
- **Workflow:**
  1. System invites both parties to submit a final rating (1 to 5 stars) and qualitative review.
  2. Reviews remain concealed (`double-blind`) until either:
     - Both parties have submitted their respective review, OR
     - 14 days have elapsed from contract completion.
  3. Once unlocked, reviews appear on:
     - Freelancer's public portfolio and profile.
     - Client's company profile (reputation for timely payments and clear communication).
- **Post-conditions:** Prevents retaliatory negative reviews; fosters authentic platform trust.

---

### UC-15: Instant Stripe Connect Balance Payout
- **Actor:** Freelancer & Stripe Connect API.
- **Trigger:** Freelancer requests payout of accumulated milestone earnings.
- **Workflow:**
  1. Freelancer navigates to `/freelancer/payouts`.
  2. System displays available balance (funds released from approved milestone escrow).
  3. Freelancer clicks **"Withdraw to Bank"**.
  4. Platform triggers payout transfer to freelancer's verified Stripe Express / Custom connected account.
  5. Ledger creates `PAYOUT_INITIATED` record and decrements user's platform balance.
- **Post-conditions:** Funds arrive in freelancer's local bank account with standard 1–2 business day ACH / SEPA settlement.
