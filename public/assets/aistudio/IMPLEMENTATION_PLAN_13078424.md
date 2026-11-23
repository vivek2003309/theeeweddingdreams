# IMPLEMENTATION_PLAN — The Wedding Dreams

> Phased build plan. Each phase has deliverables and an **exit gate**. Do not start a phase until the previous gate passes. Estimates assume 2 engineers + 1 designer; adjust as needed.

## Phase 0 — Foundations (3–4 days)
**Deliverables**
- Next.js 15 + TS strict + Tailwind project; ESLint, Prettier, Husky, commitlint.
- `globals.css` tokens and `tailwind.config.ts` from DESIGN_SYSTEM.md; fonts via `next/font`.
- `/public/brand` assets (logo, mark, favicon).
- `lib/data` adapter interfaces + **mock adapter** with seed data (12 venues, 18 vendors, 6 hero slides).
- CI pipeline (typecheck, lint, unit, build). `.env.example`.
- Base UI kit: Button, MagneticButton (stub), Chip, Input, Drawer, GoldDivider, ArchImage, TierMarker, StatusChip, Skeleton.
**Exit gate:** `npm run dev` works with zero env keys; storybook/preview page shows all UI kit components on blush/ivory with correct tokens; Lighthouse a11y ≥ 95 on the kit page.

## Phase 1 — Shell and Hero (1 week)
**Deliverables**
- Header (glass, plinth, hide/show), MegaMenu (Venues, Vendors), MobileSheet, Footer (all sections).
- MotionProvider (Lenis + GSAP ticker sync, reduced-motion handling).
- HeroCarousel: two-layer video, crossfade + arch-mask, ChapterSwitcher with progress ring, SoundToggle, pause/play, SearchPill (+ mobile sheet), headline choreography, hero exit parallax.
- Video utilities: `useVideoGate` (IntersectionObserver attach/detach), `hls.ts`, `capability.ts` (4K gating).
**Exit gate:** hero runs at 60fps on a mid laptop (4x CPU throttle); LCP < 2.0s with poster; keyboard + screen reader navigable; reduced-motion fallback verified; logo plinth visually approved by design.

## Phase 2 — Home page sections (1.5 weeks)
**Deliverables**
- DecorGallery (pinned horizontal, parallax, mobile snap), ExperienceGrid.
- DiscoveryHub (toggle, sticky FilterBar, ListingCard with hover preview, FLIP re-flow, skeleton/empty states).
- ProcessionTimeline (path draw, elephant on path, nodes, click-to-jump; vertical mobile).
- PartnerShowcase section, newsletter wiring (stub), Real Weddings/Journal teasers.
**Exit gate:** full home page matches design; CLS < 0.05; JS budget < 220KB gz; all ScrollTriggers created in `gsap.context` and reverted on unmount (no leaks on route change).

## Phase 3 — Listings and detail pages (1.5 weeks)
**Deliverables**
- `/venues` and `/vendors` with URL-driven filters, pagination, SEO metadata, sitemap.
- Detail pages: 4K hero, sticky sub-nav, masonry gallery, Lightbox (keyboard, pinch zoom), at-a-glance sidebar, sticky quote card.
- JSON-LD, OG images, canonical URLs.
**Exit gate:** pages render from mock adapter; no contact/price strings in output (grep test passes); Lighthouse SEO ≥ 95.

## Phase 4 — Enquiry and Partner flows (1.5 weeks)
**Deliverables**
- EnquiryDrawer (3 steps) and PartnerDrawer (5 steps) with react-hook-form + Zod, auto-save drafts, gentle validation, success states with reference IDs.
- Route handlers: `/api/leads`, `/api/partner/applications`, `/api/uploads/sign`, `/api/newsletter` with Turnstile, honeypot, rate limit, hashing, email templates.
- Partner status page.
**Exit gate:** forms work end-to-end against mock + Supabase (preview); bot test (missing/invalid token) rejected; rate limit tests pass; emails render in all major clients.

## Phase 5 — Supabase backend and security hardening (1.5 weeks)
**Deliverables**
- Migrations from DATABASE.md, views, triggers, storage buckets, seed script.
- `policies.sql` from SECURITY.md + **pgTAP RLS tests**.
- Supabase adapter implementing `DataAdapter`; switch with `DATA_ADAPTER=supabase`.
- Security headers/CSP in middleware; bundle scan for secrets; audit triggers.
**Exit gate:** SECURITY.md release checklist items 1–6 pass in CI; anon queries against base tables fail; public site fully served from `public_*` views.

## Phase 6 — Admin CMS (2 weeks)
**Deliverables**
- Admin auth + TOTP 2FA, role guard middleware, `/admin` shell (light theme).
- Dashboard; Hero Video Manager (upload, processing states, reorder, schedule, live preview, publish/revert).
- Partner Verification Queue + ReviewDrawer (approve/request info/reject, secure docs viewer).
- Venues/Vendors editors with tabs and MediaUploader (tus, drag reorder, alt text required).
- Banners, Media Library, Leads kanban/table + notes, Team & Roles, Audit Log.
- Video pipeline integration (Mux/Cloudflare Stream) + webhook.
**Exit gate:** a non-technical admin completes the UAT script (swap hero video, approve an application, publish a venue with 4K media, work a lead) without help; every action appears in the audit log.

## Phase 7 — Performance, accessibility, QA (1 week)
**Deliverables**
- Performance pass (4K gating, decoder budget, bundle splitting, FPS guard), image/video budgets enforced in CI via Lighthouse CI.
- Accessibility audit (axe + manual screen reader), reduced-motion QA.
- Cross-browser/device QA (iOS Safari, Android Chrome, desktop browsers).
- Content QA: microcopy, alt text, legal pages.
**Exit gate:** all TESTING.md release criteria green.

## Phase 8 — Launch (3–4 days)
- Production Supabase + Vercel + video provider; DNS, SSL, domains, email SPF/DKIM/DMARC.
- Seed real listings, upload real 4K hero set.
- Monitoring (Sentry, uptime), backups verified, runbooks written.
- Soft launch to invited partners; then public launch.

## Phase 9 — Post-launch (P2 backlog)
Favourites synced to accounts, Real Weddings submissions, Journal CMS, availability calendar signals, WhatsApp Business integration for concierge, multi-language (Hindi), analytics dashboard for partners, A/B tests on hero copy.

## Build order for AI Studio / Antigravity sessions
Because agent sessions work best in small verified steps, run them in this order and commit after each:
1. Tokens + fonts + UI kit (Phase 0).
2. Header + Footer + MotionProvider.
3. Hero carousel (mock media).
4. Decor gallery + experience grid.
5. Discovery hub + listing card + filters.
6. Procession timeline.
7. Partner showcase + drawers (UI only).
8. Listing pages + SEO.
9. API routes with mock adapter.
10. Supabase schema + RLS + adapter.
11. Admin CMS screens (mock) then wire to API.
12. Performance + accessibility pass.

## Risks and mitigations
| Risk | Mitigation |
|---|---|
| 4K video hurts performance | HLS ladder, posters first, decoder cap, FPS guard, capability gating |
| GSAP pinning bugs with Next route changes | Contexts per component, `revert()`, `ScrollTrigger.refresh()` after load |
| Placeholder footage licensing | Use licensed/royalty-free or own footage only; track in `docs/MEDIA_CREDITS.md` |
| RLS mistakes leak data | pgTAP tests, CI policy diff check, public views only |
| Partner docs sensitivity | Quarantine bucket, AV scan, watermark, 90-day deletion |
| Scope creep (payments, chat) | PRD non-goals; change requests via PRD update |

## Definition of Done (per task)
Typed, linted, tested; accessible (keyboard + SR); responsive (390/768/1280); matches DESIGN_SYSTEM.md; no private data exposure; reduced-motion handled; docs updated if behaviour changed.
