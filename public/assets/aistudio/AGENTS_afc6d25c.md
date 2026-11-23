# AGENTS.md — Instructions for coding agents

> For Google AI Studio, Google Antigravity, Claude Code, Cursor, Copilot and any other AI coding agent working in this repository. **Read this file first, then PRD.md and DESIGN_SYSTEM.md before writing code.**

## 1. Project in one paragraph
"The Wedding Dreams" (*A complete event solution*) is an ultra-luxury, concierge-led wedding planning and venue/vendor marketplace for India. Visitors browse verified venues and vendors with 4K video and galleries, and submit enquiries that go **only** to our concierge team. Venue/vendor owners apply through "Become a Partner" and stay `pending_verification` until an Admin approves. A custom Admin CMS manages hero 4K videos, banners, partners, listings and leads. Stack: Next.js (App Router) + TypeScript + Tailwind + Lenis + GSAP/ScrollTrigger + Supabase.

## 2. Document map (read in this order)
1. `PRD.md` what and why · 2. `DESIGN_SYSTEM.md` look and motion rules · 3. `ARCHITECTURE.md` how it is built · 4. `DATABASE.md` schema · 5. `SECURITY.md` permissions · 6. `API_SPEC.md` endpoints · 7. `IMPLEMENTATION_PLAN.md` order of work · 8. `TESTING.md` how we verify.
If documents conflict: **SECURITY.md > DESIGN_SYSTEM.md > PRD.md > ARCHITECTURE.md > others.**

## 3. Non-negotiable rules (never violate)

### Brand and visual
1. **No dark or black backgrounds anywhere** (site, drawers, lightbox chrome, footer, admin). Use ivory/blush/silk/rose-deep tokens only.
2. The logo (`/public/brand/logo-full-bg-rem.png`, transparent PNG) must always be clearly visible: place it on the **logo plinth** gradient in the header, on a white-glass medallion in the footer. Never recolour, redraw, stretch or place it directly on imagery.
3. Use only tokens from `DESIGN_SYSTEM.md` (CSS variables / Tailwind theme). Do not invent new colours. Small text may only be `ink`, `ink-soft`, `crimson`, `gold-text`. Gold and lotus are for hairlines, large text, icons 24px+, ornaments.
4. Fonts: Cormorant Garamond (display) + Jost (UI/body) via `next/font`. Headlines use ONE italic crimson phrase.
5. 90/10 rule: mostly blush/ivory/silk + espresso text; crimson reserved for the primary action.
6. No emoji in UI; thin-line SVG icons only.

### Motion
7. Easing is always `cubic-bezier(0.22, 1, 0.36, 1)` (`silk`). Durations 0.7–1.6s. **Never** use bounce, elastic, back, spring-overshoot, shake, or flashy effects.
8. Animate only `transform` and `opacity`. Max travel 24px (text) / 50px (cards) / ±6% parallax.
9. Lenis drives scroll and is synced to `gsap.ticker`. All ScrollTriggers live inside `gsap.context()` and are reverted on unmount.
10. Respect `prefers-reduced-motion` (no Lenis, no pinning, no parallax, 300ms fades; hero shows poster).
11. Magnetic buttons: primary pills only, desktop pointer only.

### Media performance
12. Never put raw 4K files in the DOM. Use posters first, HLS (hls.js) adaptive streams, and 720p preview clips for hover. 2160p only on capable connections (`downlink >= 10`, width >= 1600, not `saveData`).
13. Max 2 concurrent video decoders; attach/detach `src` with IntersectionObserver; pause when hidden or < 40% visible. Autoplay videos are muted and pausable; sound toggle defaults OFF.
14. Dynamic-import GSAP plugins, hls.js and the lightbox. Initial JS < 220KB gz.

### Security and privacy (highest priority)
15. **Never expose partner phone, email, WhatsApp, exact pricing, GST/PAN, internal notes, application data, or lead data in any public page, API response, type, JSON-LD, bundle, log or error.** Public UI shows tier diamonds, not prices.
16. Public reads go through `public_*` views / `Public*` types only. Never `select *`. Never query base tables from public code.
17. Anonymous writes (`/api/leads`, `/api/partner/applications`, `/api/newsletter`, `/api/uploads/sign`) go only through server route handlers with: Zod validation, Turnstile verification, honeypot + min-time check, rate limiting, IP hashing, generic responses.
18. Secrets only in env vars; `SUPABASE_SERVICE_ROLE_KEY` and other secrets are **server-only** (never `NEXT_PUBLIC_*`, never imported in client components).
19. Admin routes require role check + 2FA (`aal2`); re-check role server-side in every handler; write an `audit_log` entry for every admin mutation.
20. Every table has RLS. Do not weaken or disable RLS to "make it work". If a query fails due to RLS, fix the query or add a narrowly-scoped policy plus a pgTAP test.
21. Never add analytics/trackers/third-party scripts without consent gating and CSP update.

### Code quality
22. TypeScript strict, no `any` (use `unknown` + Zod). ESLint/Prettier clean. No unused code.
23. Server Components by default; add `"use client"` only for interactivity (motion, drawers, video).
24. Accessibility is a feature: semantic HTML, real `<button>`/`<a>`, labelled inputs, focus traps in drawers, `aria-live` for step changes, visible focus ring, 44px touch targets.
25. Everything must work at 390px, 768px, 1280px, 1440px.
26. Use the `DataAdapter` interface. The mock adapter must keep working (`DATA_ADAPTER=mock`) so the app runs with zero keys.

## 4. Working method for agents
1. **Plan first:** state which phase/task from `IMPLEMENTATION_PLAN.md` you are doing and list the files you will touch.
2. **Small steps:** one component or route per change; keep diffs reviewable; commit after each working step with a conventional commit message (`feat(hero): add arch-mask transition`).
3. **Run checks before declaring done:** `npm run typecheck && npm run lint && npm run test`; for UI work also view it at mobile and desktop widths.
4. **Do not invent product requirements.** If something is unspecified, choose the simplest option consistent with the docs and note the assumption in the PR/summary. Ask only when a decision is irreversible or affects security.
5. **Do not rewrite unrelated code.** Do not rename tokens, tables or routes defined in the docs.
6. **Update docs** (`/docs` notes or the relevant `.md`) when you change behaviour, schema or API.
7. **Mock first, real second:** build UI against the mock adapter, then implement Supabase adapter and policies.
8. Never commit secrets, real personal data, or copyrighted media. Placeholder media must be clearly licensed/royalty-free or generated gradients with the same data shape.

## 5. Conventions

### Naming
- Components `PascalCase.tsx`, hooks `useThing.ts`, utilities `camelCase.ts`, routes lowercase-hyphen.
- DB: `snake_case` tables/columns; TS types in `camelCase` via mappers (`lib/data/mappers.ts`).
- CSS variables: `--kebab-case` exactly as in DESIGN_SYSTEM.md.

### File placement
See `ARCHITECTURE.md` section 3. Shell in `components/shell`, hero in `components/hero`, etc. Shared primitives in `components/ui`. Motion utilities in `lib/motion`.

### Tailwind usage
Use theme tokens (`bg-ivory`, `bg-blush`, `text-ink`, `text-crimson`, `border-hairline`, `rounded-arch`). Avoid arbitrary hex values. Add the `ease-silk` timing function and `duration-700/1200` utilities to the theme.

### Component contract examples
```tsx
// ArchImage: arch-masked, alt required, aspect fixed to avoid CLS
<ArchImage src={poster} alt="Lotus mandap at dusk" ratio="4/5" priority={false} />
// TierMarker: never a price
<TierMarker tier="royal" />  // renders ◇◇◇ Royal in gold-antique
// ListingCard: only public fields
<ListingCard item={publicVenue} onQuote={() => openEnquiry({ venueSlug })} />
```

### Forms
react-hook-form + shared Zod schemas from `lib/validation`. Gentle inline errors (`--error`, short sentence). Draft auto-save in `sessionStorage` (guarded with try/catch). Success state shows the reference code.

### Error and empty states
Skeleton = slow ivory shimmer. Empty = lotus illustration + "Let our concierge find it for you" + enquiry button. Errors never expose internals.

## 6. Environment and commands
```
npm install
cp .env.example .env.local        # DATA_ADAPTER=mock works without keys
npm run dev                       # http://localhost:3000
npm run typecheck | lint | test | test:e2e | build
npm run db:migrate | db:seed | db:test   # Supabase local (when DATA_ADAPTER=supabase)
```

## 7. Google AI Studio notes
- AI Studio builds are preview-first: **use the mock adapter and placeholder media** (gradient tiles labelled "4K placeholder" with realistic `hls_url`, `preview_mp4_url`, `poster_url` fields) so the UI renders without external services.
- Build in the order listed in `IMPLEMENTATION_PLAN.md` ("Build order for AI Studio / Antigravity sessions"). Do the full home page before admin.
- Keep each generation focused (one section per prompt) and keep files modular; avoid single giant files.
- Include the Admin CMS screens as functional mock views (in-memory state) so they can be reviewed visually before backend wiring.
- Do not use `localStorage` for anything critical in sandboxed previews; wrap storage in try/catch.

## 8. Google Antigravity notes
- Use the **Planning mode**: produce a task list and implementation plan artifact referencing the docs before editing files; execute phase by phase.
- Let the agent run `typecheck`, `lint`, `test` and browser verification (screenshots at 390 and 1440) after each phase; attach screenshots to the walkthrough.
- When verifying visuals, explicitly check the brand rules in section 3 (no dark backgrounds, logo visible, slow motion, tokens only).
- Keep terminal commands inside the repo; never run destructive commands against Supabase production; never paste secrets into prompts or commit them.

## 9. Definition of done (every task)
- [ ] Matches DESIGN_SYSTEM.md and the PRD requirement ID(s) it implements.
- [ ] Typed, linted, tested; no console errors/warnings.
- [ ] Accessible (keyboard + screen reader) and responsive at 390/768/1280/1440.
- [ ] Reduced-motion handled; 60fps preserved; no leaked ScrollTriggers.
- [ ] No private data exposed (partner contact, pricing, docs, leads).
- [ ] Docs updated if behaviour/schema/API changed.

## 10. When in doubt
Choose **privacy over convenience**, **brightness over drama**, **slowness over flash**, **the media over the interface**, and **the documented rule over your default**.
