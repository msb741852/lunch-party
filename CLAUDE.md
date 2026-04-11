# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

The active project lives in [lunch-party/](lunch-party/). Run all commands from that directory:

```bash
cd lunch-party
npm install
npm run dev       # Vite dev server (http://localhost:5173)
npm run build     # Production build → dist/
npm run preview   # Serve the built bundle
npm run lint      # ESLint (flat config; react-hooks plugin is strict)
```

There is no test runner configured — do not invent `npm test` commands.

## Environment setup

Firebase config is loaded from `lunch-party/.env` via `import.meta.env.VITE_FIREBASE_*`. Copy `.env.example` and fill it with values from the Firebase console. Missing env vars do **not** fail `npm run build` — failures only surface at runtime when `initializeApp` runs. If you change env var names, update both [firebase.js](lunch-party/src/firebase.js) and `.env.example`.

## Architecture

**Stack**: React 18 + Vite, React Router v6, Zustand, Tailwind CSS v3, Firebase v10 (Auth + Firestore), react-hot-toast. All UI strings are Korean.

**Data flow is realtime-first.** The app never manually refetches — every list and detail view subscribes to Firestore via `onSnapshot` and re-renders on change:
- [useParties.js](lunch-party/src/hooks/useParties.js) subscribes to `parties` filtered to today's `meetingTime` range (Timestamp `>=` start-of-day, `<=` end-of-day). The home page only ever shows today.
- [usePartyDetail.js](lunch-party/src/hooks/usePartyDetail.js) subscribes to a single doc. It uses the React-recommended *reset-state-during-render* pattern (tracking `partyId` inside the state object) to avoid the `react-hooks/set-state-in-effect` lint rule — don't refactor back to `setLoading(true)` inside `useEffect`.

**Auth is global Zustand state.** [App.jsx](lunch-party/src/App.jsx) installs a single `onAuthStateChanged` listener that writes to [useAuthStore](lunch-party/src/store/useAuthStore.js). The store has an `initialized` flag — `ProtectedRoute` must wait for it before redirecting, otherwise a logged-in user bounces to `/login` on page refresh. Login happens via `signInWithPopup` and upserts the user into the `users` collection with `{ merge: true }`.

**Party status is computed at render time, not stored.** [getPartyStatus()](lunch-party/src/utils/partyHelpers.js) derives `"open" | "full" | "closed"` from `meetingTime` and `currentMembers.length` vs `maxMembers`. The Firestore `status` field exists and is written on create/join/leave, but **the UI always calls `getPartyStatus(party)` for display** so that time passing automatically flips a party to "종료". When adding features that depend on status, use the helper — never read `party.status` directly for UI.

**Join/leave go through Firestore transactions.** [PartyDetail.jsx](lunch-party/src/components/party/PartyDetail.jsx) uses `runTransaction` (not `updateDoc` with `arrayUnion` alone) because it must re-check `currentMembers.length < maxMembers` under contention. Keep this pattern for any mutation that needs to enforce capacity or uniqueness.

**Firestore security rules** ([firestore.rules](lunch-party/firestore.rules)) allow any authenticated user to update *only* `currentMembers` and `status` on a party via the `onlyUpdatingMembers()` function — everything else requires `hostUid` ownership. If you add fields a non-host should be able to touch, you must extend `hasOnly([...])` or joins will fail silently.

## Firestore data shape

Party documents: `title`, `restaurantName`, `restaurantCategory`, `location`, `meetingTime` (Timestamp), `maxMembers` (2–8), `currentMembers` (array of `{uid, displayName, photoURL}`), `hostUid`, `hostName`, `description`, `status`, `createdAt`. Members are stored as embedded objects, not uid references — meaning `arrayUnion`/`arrayRemove` must pass the *exact same object shape* used at insert time or they silently no-op. When removing self, read the member object from the snapshot first (see `handleLeave` in PartyDetail).

## Conventions

- Tailwind brand color is `brand-*` (orange palette) defined in [tailwind.config.js](lunch-party/tailwind.config.js). Use `bg-brand-500` for primary CTAs.
- Times display in Korean 12-hour format via `formatMeetingTime()`; don't hand-roll date formatting.
- Error surfaces go through `react-hot-toast` — wrap Firestore calls in `try/catch` and `toast.error(...)` on failure, matching existing hooks/components.
- Components generally stay under ~100 lines; push business logic into `hooks/` or `utils/partyHelpers.js`.
