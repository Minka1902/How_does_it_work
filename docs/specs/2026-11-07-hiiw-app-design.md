# HIIW — "How is it working" app design

## Context
MSR project **HIIW** ("A site to teach how things work"), task **HIIW-1 "Plan the app flow"**. Goal: a web app of visual, interactive lessons that explain how things work, for curious adults. Each lesson is self-contained, lessons are searchable, and a Contribute page lets people request lessons or send lessons in.

### Decisions (from Q&A)
| Area | Decision |
|---|---|
| Audience | Curious adults, no prior knowledge |
| Platform | Responsive web + installable PWA |
| Frontend | React + Vite |
| Topics | Tech, physics/engineering, everyday things, biology/nature/economy |
| Lesson format | Scrollytelling: text steps on one side, sticky interactive visual that reacts to scroll and can be played with |
| Visuals | SVG + React, Canvas 2D, 3D (R3F), Framer Motion |
| Lesson isolation | One folder per lesson, auto-discovered, lazy-loaded, own URL |
| Extras | Quiz, progress, related lessons, difficulty + read time. **All toggleable in Preferences** |
| Search | Instant fuzzy (Fuse.js) + filter chips; big bar on home; Ctrl/Cmd+K palette; "not found → request it" |
| Style | Blueprint/technical; light (paper + blue grid) and dark (navy blueprint) |
| Language | English + Hebrew (RTL), per-lesson text files |
| Backend | Node/Express + MongoDB (Mongoose) on Render |
| Accounts | Learning is anonymous. Requesting, upvoting and submitting need an account |
| Sign-in | Google, GitHub, email + password, magic link |
| Submissions | Own backend + `/admin` page. Lesson sent as a .zip (template format) or a link |
| Request form | Topic + description, category, upvotes on a public board (email comes from the account) |
| v1 lessons | Fridge, Wi-Fi/internet, car engine, vaccines, AR-15 (cycle of operation only, see note) |

## Architecture

```
client/                      React + Vite + vite-plugin-pwa
  src/
    app/                     App.jsx, routes.jsx, Layout.jsx
    components/              shared UI, one component per file (SearchBar, LessonCard, FilterChips, CommandPalette, Toggle...)
    lesson-kit/              building blocks for lessons (see below)
    lessons/<slug>/          one folder per lesson
    pages/                   Home, Lesson, Contribute, Preferences, Login, Account, Admin, NotFound
    context/                 PreferencesContext, AuthContext
    hooks/                   useLessonSearch, useProgress, useT, useScrollStep, useAnimationFrame
    i18n/                    en.js, he.js (UI strings)
    lib/                     lessonRegistry.js, api.js, searchIndex.js
    styles/                  tokens.css (blueprint light/dark variables), global.css
server/                      Express + Mongoose
  src/  config/ models/ routes/ controllers/ middleware/ services/ (email, storage, oauth)
lesson-template/             starter lesson folder, zipped at build for download
scripts/                     lesson-new.js (scaffold), lesson-check.js (validate meta + structure)
docs/specs/                  this design as a spec
```
Code style throughout: one component per file; consts → functions → hooks → return; components built for customization via props; no unused imports/consts/comments.

### Lesson folder contract
```
lessons/fridge/
  meta.js        { slug, category, tags, keywords, difficulty, readMinutes, visuals:['svg'], languages:['en','he'], author, publishedAt }
  text/en.js     { title, summary, steps:[{ id, heading, body }], quiz:[...] }
  text/he.js     same keys (optional; a lesson can ship one language)
  Lesson.jsx     composes lesson-kit pieces; maps step ids → visual state
  components/    the lesson's own visuals
```
- `lib/lessonRegistry.js`: `import.meta.glob('../lessons/*/meta.js', { eager: true })` + eager `text/*.js` titles/summaries for the search index; `import.meta.glob('../lessons/*/Lesson.jsx')` for lazy loading. Adding a folder = adding a lesson, no registry edits.
- Route `/lesson/:slug` loads the lesson chunk; 3D/R3F only loads inside lessons that use it.

### Lesson kit (shared, customizable)
- `ScrollyLesson` — layout with sticky visual stage + step column; reports active step (IntersectionObserver); props for layout side, stage size, mobile stacking.
- `Step`, `Callout`, `Figure`
- Controls: `Slider`, `Toggle`, `SegmentedControl`, `PlayPause`, `DragHandle` (SVG)
- Stages: `SvgStage` (viewBox, grid background), `CanvasStage` (+ `useAnimationFrame`, DPR handling, pause offscreen), `Scene3D` (R3F canvas wrapper, lazy)
- `Quiz`, `LessonFooter` (related lessons, completion) — each hidden if the preference is off
- Respects `prefers-reduced-motion`

### Pages & flows
- **Home**: big search bar, category + difficulty chips, lesson grid (cards show badges if enabled, progress tick if enabled). Empty result → "Can't find it? Request this lesson" → `/contribute?request=<query>`.
- **Ctrl/Cmd+K palette**: same search hook, opens from anywhere.
- **Lesson**: scrollytelling, progress saved per step, quiz, related (by shared tags/category).
- **Contribute** (tabs):
  1. *Request a lesson* — topic, category, description (login required; query pre-fill).
  2. *Requested lessons* — public board, sort Top/New, upvote toggle (login to vote), status badges (open / planned / published / declined, published links to the lesson).
  3. *Send a lesson* — guide + download template, then upload .zip or paste a link + title/description (login required).
- **Preferences**: theme (system/light/dark), language (en/he), show quiz, track progress, show related, show badges, reduce motion, reset progress. Stored in localStorage.
- **Login / Signup**: Google, GitHub, email+password, magic link.
- **Account**: my requests, my submissions + their status.
- **Admin** (`role: admin`): submissions queue (download zip / open link, approve / reject with note), requests list (set status, link to published slug).

### Search
`lib/searchIndex.js` builds one Fuse index from metas + titles/summaries in both languages (weights: title > tags/keywords > summary). `useLessonSearch(query, filters)` returns results, debounce-free (index is small and in memory).

### Backend (Express + MongoDB)
Models:
- `User` { email (unique), name, avatar, passwordHash?, googleId?, githubId?, emailVerified, role }
- `LessonRequest` { title, description, category, user, votes (counter), status, lessonSlug? } — index { status, votes }
- `Vote` { request, user } — unique compound index; vote toggle = insert/delete + `$inc` on the request (no voter arrays)
- `Submission` { user, title, description, kind: 'zip'|'link', link?, fileId?, status, adminNote }
- `AuthToken` { hash, user/email, type: verify|magic|reset, expiresAt } — TTL index

Routes:
- `/api/auth`: register, login, logout, me, verify-email, magic-link (request/verify), google + callback, github + callback
- `/api/requests`: GET list, POST create (auth), POST `/:id/vote` (auth, toggle)
- `/api/submissions`: POST (auth, multipart), GET `/mine`
- `/api/admin/*`: submissions list/file/patch, requests patch (admin)

Implementation choices (efficiency first):
- Session = JWT in httpOnly, SameSite cookie; OAuth via `arctic` (light, no passport sessions); bcrypt for passwords; tokens stored hashed.
- Zip uploads streamed with `busboy` straight into MongoDB **GridFS** (Render disk is ephemeral; no extra storage service). 10 MB cap, magic-byte check, central-directory scan to confirm `meta.js` + `Lesson.jsx` exist. Zips are never executed server-side; you review and copy into `client/src/lessons/` manually (lessons are code).
- Email via Resend: verification, magic link, admin ping on new request/submission, requester ping when status → published.
- `helmet`, CORS locked to client origin, `express-rate-limit` on auth + write routes, `zod` validation, admin = `ADMIN_EMAILS` env.

### Deploy
Client → Render static site (SPA rewrite). Server → Render web service. DB → MongoDB Atlas. Env: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, Google/GitHub OAuth ids, `RESEND_API_KEY`, `ADMIN_EMAILS`.

### Note on the AR-15 lesson
Scoped as a mechanical explainer of the cycle of operation (fire → gas → unlock → extract → eject → cock → feed → lock), the same level as encyclopedias/museums. No assembly, modification or manufacturing content.

## Phases (each becomes an HIIW task)
1. **Foundation** — monorepo, Vite, router, layout, blueprint theme tokens light/dark, i18n + RTL, Preferences context/page.
2. **Lesson system** — registry, lesson kit, template, `lesson:new` / `lesson:check` scripts, **Fridge** reference lesson (SVG).
3. **Search** — index, home grid + chips, Ctrl/Cmd+K palette, empty → request.
4. **Backend core + auth** — Express, Mongo models, 4 sign-in methods, Resend emails, client auth pages.
5. **Contribute** — request form, public board + votes, submission upload (GridFS), Account page.
6. **Admin** — submissions/requests review.
7. **Progress, quiz, related, PWA** — wired to preferences; offline cache of visited lessons.
8. **Lessons** — Wi-Fi/internet (SVG + motion), car engine (3D), vaccines (Canvas), AR-15 (SVG cycle).
9. **Deploy** — Render + Atlas.

## Verification
- Client: Vitest + React Testing Library (registry discovery, search ranking/filters, preferences toggles hide quiz/related/badges, RTL switch).
- Server: Vitest + supertest + mongodb-memory-server (auth flows, vote toggle idempotency, zip validation rejects bad files, admin-only routes).
- E2E: Playwright smoke — search → open lesson → scroll steps → quiz; signup → request → upvote; upload zip → appears in admin.
- Manual: Lighthouse PWA/install check, mobile width, Hebrew RTL on home + a lesson.
