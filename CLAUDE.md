# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BHC-Admin is a React admin dashboard for managing a climbing club (베하클) — handles meetup scheduling, member management, and attendance tracking. Deployed to GitHub Pages.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format with Prettier
npm run preview      # Preview production build
```

No test suite exists in this project.

## Architecture

**Stack:** React 18 + Vite, Ant Design 5, Supabase (PostgreSQL), react-big-calendar, dayjs. JavaScript only (no TypeScript).

**Deployment:** GitHub Actions deploys to GitHub Pages on push to `master`. Vite base path is `/BHC-Admin/`.

### Data Layer

All backend communication goes through Supabase. Custom hooks in `src/hooks/` encapsulate all queries and mutations:
- `useEvents.js` — meetup CRUD, attendee management
- `useMembers.js` — member CRUD
- `useMemberAutoComplete.js` — member search for autocomplete

Env vars required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.

### Key Database Tables

- `meetups` — id, date, start_time, title, type, level, status, cancel_reason, review, leader_id, leader_nickname, sub_leader_member_ids, course
- `members` — id, nickname, name, baby_name, region, naver_id, joined_at
- `meetup_attendees` — meetup_id, member_id, donation_paid, donation_amount

### Component Structure

`src/App.jsx` renders `MainLayout` which provides the sidebar navigation and routes between three views:
- **Schedule** (`Schedule.jsx`) — Calendar view with create/edit/delete meetups via `MeetupModal.jsx`
- **Meetup Management** (`MeetupTable.jsx`) — Filterable table of all meetups
- **Member Management** (`MemberTable.jsx`) — Member directory with search

Shared components: `AttendeeManager.jsx` (attendee list in modal), `MemberAutoComplete.jsx` (member picker), `Calendar.jsx` (react-big-calendar wrapper with Korean locale).

### Utilities

- `src/utils/meetupTypes.js` — Meetup type definitions (정기모임, 특별세션, 번개, etc.) with color mappings
- `src/utils/eventStyles.js` — Calendar event styling; cancelled events render with strikethrough

### Code Style

Prettier enforces: single quotes, 2-space indent, trailing commas (ES5), no semicolons... actually semicolons are on (`"semi": true`). ESLint is integrated with Prettier — run `npm run lint:fix` before committing.
