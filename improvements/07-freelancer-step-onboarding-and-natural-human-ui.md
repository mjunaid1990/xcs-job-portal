# 07 - Multi-Step Freelancer Onboarding & Natural Human UI Overhaul

**Author:** UI/UX & Platform Architecture Team  
**Date:** November 2026  
**Status:** In Progress

---

## 1. Executive Summary & Problem Diagnosis

### The "AI-Generated" Visual Trap

Modern users and engineering contractors immediately identify platforms that feel like generic AI generator outputs. The telltale patterns include:

- **Gradient Overdose**: Purple-to-indigo gradient CTAs (`bg-gradient-to-r from-purple-600 to-indigo-600`) and glowing background radial orbs on every card.
- **Icon Container Spam**: Every single card header has a colored square box (`bg-indigo-50 text-indigo-600 dark:bg-indigo-950`) with an icon, regardless of whether it adds value.
- **Robotic Copywriting**: Phrases like _"Find vetted opportunities, manage active contracts with milestone escrow, and track your take-home earnings"_ or _"Verified Double-Entry Escrow Ledger Engine"_.
- **Oversized Empty Whitespace**: Monolithic cards floating in the center of the page with minimal information density.
- **Badge Clutter**: Stacking 4-5 colorful pills on a single line (`100% JSS`, `EXPERT`, `NATIVE`, `Top Rated Plus`, `VERIFIED`).

### The Natural Human Design Benchmark (Linear, Stripe, Contra, GitHub)

Human-designed enterprise products rely on:

1. **Monochrome Rigor**: 90% neutral scale (`zinc-900`, `zinc-700`, `zinc-500`, `zinc-200`, `zinc-100`, `zinc-50`). Accents (e.g., emerald for active/funds, indigo for selection) are used sparingly for status, never as decorative rainbow gradients.
2. **Solid, Confident CTAs**: High-contrast, tactile buttons (`bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900`).
3. **Conversational, Direct Language**: Plainspoken English:
   - _Before:_ "Manage your active contracts with milestone escrow and track take-home earnings"
   - _After:_ "You have 1 active contract and 2 proposals under review."
4. **Information Density**: Crisp tables, clear milestone checklists, and real activity timestamps.

---

## 2. Multi-Step Freelancer Onboarding Wizard

Rather than dropping a newly registered freelancer into an empty dashboard with a 0% profile completeness alert, registration for freelancers is split into an intuitive, high-converting 4-step wizard:

```
[ Step 1: Account ] ──> [ Step 2: Rate & Seniority ] ──> [ Step 3: Bio & Tags ] ──> [ Step 4: Skills & Proof ] ──> [ Ready! ]
```

### Step Breakdown

#### Step 1: Account Credentials & Identity

- Full Legal Name
- Work Email
- Secure Password (min 8 chars)
- Country / Location

#### Step 2: Role, Rate & Seniority

- Professional Headline (e.g., _"Full-Stack TypeScript & Node.js Engineer"_)
- Baseline Hourly Rate ($ USD) with transparent flat $1 escrow fee callout
- Seniority Level (`Entry`, `Intermediate`, `Expert`, `Principal`)
- Years of Experience in Tech
- Current Availability (`Full-time & Part-time`, `Part-time only`, `Advisory only`)

#### Step 3: Executive Bio & Specialization Tags

- Professional Bio textarea with real-time character guidance ($30$ to $5,000$ chars)
- Core specialization keywords (e.g., `nextjs15`, `stripe-connect`, `microservices`, `postgresql`) with 1-click suggested tags

#### Step 4: Skills & Optional Portfolio/Links

- Multi-select technology pills with search filter
- Optional: Profile headshot photo upload
- Optional: GitHub and LinkedIn URLs
- "Finish Setup" CTA that directly activates their public marketplace presence and redirects to their dashboard.

---

## 3. Natural Human Dashboard Redesign

### Freelancer Dashboard (`/freelancer`)

- **Header**: Natural contextual greeting: _"Good evening, Noah. You have 1 active contract and 2 proposals under client review."_
- **KPI Summary Strip**: 4 clean metric boxes without colored icon squares:
  - Active Contracts ($1$)
  - Proposals Submitted ($2$)
  - Hourly Rate ($\$95$/hr)
  - Escrow Balance ($\$0.00$)
- **Active Contracts Table / Card**: Clean list with client company, current milestone name, due date, progress bar, and "Open Workroom" link.
- **Recent Proposals**: Candidate pitch status (`Under Review`, `Shortlisted`, `Accepted`).
- **Quick Links**: "Browse Jobs", "Update Profile & Rates", "View Public Profile".

### Client Dashboard (`/client`)

- **Header**: _"Good evening, Ava. 1 active contract in progress across your team."_
- **KPI Strip**: Active Jobs ($1$), Total Proposals to Review ($2$), Hired Contractors ($1$), Total Escrow Deposited.
- **Active Hires & Contract Workrooms**: Direct access to ongoing contracts, milestone approval actions, and direct chat links.
- **Open Job Postings**: Quick view of posted jobs with proposal count and review button.

---

## 4. Execution Plan & File Targets

1. **New Freelancer Stepper Component**: `src/components/forms/freelancer-onboarding-wizard.tsx`
2. **Registration Route Update**: `src/app/(auth)/register/page.tsx` & `src/components/forms/register-form.tsx`
3. **Freelancer Dashboard De-AI Overhaul**: `src/app/(dashboard)/freelancer/page.tsx`
4. **Client Dashboard De-AI Overhaul**: `src/app/(dashboard)/client/page.tsx`
5. **Server Action & Profile Synchronization**: `src/server/actions/auth.actions.ts` & `src/server/actions/profile.actions.ts`
6. **Verification**: `pnpm tsc --noEmit`, `pnpm eslint`, `pnpm vitest run`.
