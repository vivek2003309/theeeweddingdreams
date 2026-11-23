# DESIGN_SYSTEM — The Wedding Dreams

> Brand and visual rules. Every UI decision must obey this file. If a rule here conflicts with a generic default, this file wins.

## 1. Design meaning

The logo is a procession: an ivory elephant (Gaja: auspicious beginnings), a crimson-and-gold chhatri (shelter, honour: our concierge), lotuses (grace, rising), and a gold flourish (craft). The interface is the **frame**; the 4K wedding media is the **painting**.

**Fusion:** Royal Indian Heritage supplies emotion (palette, ornament); Modern Blush Editorial supplies air (whitespace, oversized serif, asymmetry, full-bleed media).
**Ratio 90/10:** 90% of any screen is blush/ivory/silk with espresso text; 10% is ceremony (one crimson action, gold hairlines, a lotus accent).

### Hard rules
1. **No dark or black backgrounds. Anywhere.** Not in footer, drawers, modals, lightbox chrome, admin, or video overlays (use ivory gradients, not dark scrims).
2. **No camouflage:** the gold, crimson and lotus-pink logo parts must always be clearly visible (see section 4).
3. **Slow and refined motion only** (section 8). No bounce, elastic, shake or flashy effects.
4. **The media is the hero.** If a UI element competes with the footage, quieten it.
5. No emoji in UI. Icons are thin-line (1.5px stroke) SVG.

## 2. Colour tokens

| Role | Token | Hex | Use |
|---|---|---|---|
| Canvas | `--bg-ivory` | `#FFF9FA` | Default page background |
| Band | `--bg-blush` | `#FDEEF2` | Alternating sections, plinth centre |
| Band warm | `--bg-silk` | `#FAF5EE` | Warm sections, pull quotes |
| Footer / pressed | `--bg-rose-deep` | `#F6DCE4` | Footer, plinth edge |
| Glass | `--glass` | `rgba(255,255,255,.62)` | Cards over media |
| Glass strong | `--glass-strong` | `rgba(255,255,255,.82)` | Header, drawers, modals |
| Primary | `--crimson` | `#9E192D` | Main CTA, active nav, key links |
| Primary deep | `--crimson-deep` | `#7A1222` | Hover/pressed, italics matching tagline |
| Accent | `--lotus` | `#E05286` | Ornaments, focus glows, progress, large accents |
| Accent soft | `--lotus-soft` | `#F7C9D8` | Chips, selection, hover wash |
| Gold | `--gold` | `#C59B27` | Hairlines, ornament, icons 24px+ |
| Gold antique | `--gold-antique` | `#B8860B` | Large numerals, tier diamonds |
| Gold text | `--gold-text` | `#8A6508` | Small gold TEXT (AA) |
| Gold bright | `--gold-bright` | `#D4AF37` | Decorative shimmer only |
| Ink | `--ink` | `#241719` | Headings, body |
| Ink soft | `--ink-soft` | `#5A464A` | Secondary text |
| Ink mute | `--ink-mute` | `#7D6A6E` | Placeholders (large/UI only) |
| Hairline | `--hairline` | `rgba(197,155,39,.45)` | 1px gold borders |
| Hairline soft | `--hairline-soft` | `rgba(197,155,39,.22)` | Inner dividers |
| Success | `--success` | `#2F7D5B` | Verified/approved |
| Pending | `--pending` | `#B8860B` | Pending Verification |
| Error | `--error` | `#B3261E` | Form errors |

### CSS variables
```css
:root{
  --bg-ivory:#FFF9FA; --bg-blush:#FDEEF2; --bg-silk:#FAF5EE; --bg-rose-deep:#F6DCE4;
  --glass:rgba(255,255,255,.62); --glass-strong:rgba(255,255,255,.82);
  --crimson:#9E192D; --crimson-deep:#7A1222; --lotus:#E05286; --lotus-soft:#F7C9D8;
  --gold:#C59B27; --gold-antique:#B8860B; --gold-text:#8A6508; --gold-bright:#D4AF37;
  --ink:#241719; --ink-soft:#5A464A; --ink-mute:#7D6A6E;
  --hairline:rgba(197,155,39,.45); --hairline-soft:rgba(197,155,39,.22);
  --success:#2F7D5B; --pending:#B8860B; --error:#B3261E;
  --ease-silk:cubic-bezier(.22,1,.36,1);
  --shadow-soft:0 18px 50px -24px rgba(158,25,45,.18);
  --shadow-lift:0 30px 70px -30px rgba(36,23,25,.22);
  --radius-card:20px; --radius-pill:999px; --radius-arch:200px 200px 20px 20px;
}
```
Expose all of the above in `tailwind.config.ts` under `theme.extend.colors` (e.g. `bg-ivory`, `text-ink`, `border-hairline`).

## 3. Contrast rules (on `#FFF9FA`)
Approximate ratios: Ink 16:1 · Crimson 7.7:1 · Gold-text 5:1 · Lotus 3.5:1 · Antique gold 3.1:1.
- Body and small UI text: only `ink`, `ink-soft`, `crimson`, `gold-text`.
- `lotus`, `gold`, `gold-bright`: never on small text. Use for hairlines, icons 24px+, ornaments, display numerals, focus rings.
- White text on lotus only at 18px+ bold. White/ivory text on crimson is fine at all sizes.
- Focus ring on every interactive element: 2px `crimson` outline + 3px `lotus-soft` halo.
- Overlays on video: ivory-to-transparent gradient (`rgba(255,249,250,.85)` to `0`), never dark.

## 4. Logo usage

- Asset: `logo-full-bg-rem.png` (transparent). Keep a copy in `/public/brand/`. Export also an SVG/2x PNG and an elephant-only mark (~64px) for favicon and compact states.
- **Logo plinth:** behind the header logo place `radial-gradient(ellipse at 40% 50%, #FDEEF2 0%, #F8DCE5 70%, transparent 100%)` (about 320x120). It deepens the surface so the ivory elephant separates, keeping the gold wordmark at ≥3:1.
- Header is `--glass-strong` + blur(18px); on the hero it starts at 62% and tightens to 82% after 40px of scroll.
- Min width: 168px desktop, 132px mobile. Clear space = height of the chhatri finial.
- Never place the logo directly on photography/video without the plinth.
- Footer: `--bg-rose-deep` with logo on a white-glass medallion (`rgba(255,255,255,.85)`, radius 24px).
- No inverted/white logo variant. No recolouring, rotating, stretching or outlining.

## 5. Typography

| Role | Font | Weights | Notes |
|---|---|---|---|
| Display/headings | **Cormorant Garamond** | 300, 400, 500, italic 400/500 | Echoes the logo's classical serif + italic tagline |
| UI/body | **Jost** | 300, 400, 500 | Geometric, airy |
| Devanagari accent (optional) | Tiro Devanagari Hindi | 400 | Small captions only (*Shubh Vivah*) |

Use `next/font/google` (self-hosted, `display: swap`), preload Cormorant 300/400 + Jost 400.

```css
:root{
  --fs-display: clamp(3.25rem, 1.6rem + 7vw, 8rem);
  --fs-h1: clamp(2.5rem, 1.5rem + 4vw, 5rem);
  --fs-h2: clamp(2rem, 1.3rem + 2.8vw, 3.5rem);
  --fs-h3: clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem);
  --fs-lead: clamp(1.125rem, 1rem + .5vw, 1.375rem);
  --fs-body: clamp(.975rem, .93rem + .2vw, 1.0625rem);
  --fs-label: .75rem;
}
```
| Style | Spec |
|---|---|
| Hero display | Cormorant 300, `--fs-display`, lh .95, tracking -.02em, key phrase italic crimson |
| H1/H2 | Cormorant 400, lh 1.05 |
| H3 | Cormorant 500, lh 1.15 |
| Lead | Jost 300, `--fs-lead`, lh 1.6, ink-soft |
| Body | Jost 400, `--fs-body`, lh 1.7, max 62ch |
| Eyebrow | Jost 500, uppercase, tracking .22em, gold-text |
| Button | Jost 500, uppercase, tracking .14em, .8125rem |
| Numerals | Cormorant 300, antique gold |

**Editorial signature (repeat per section):** small gold eyebrow, oversized serif headline with ONE italic word, short sans lead, gold divider.

## 6. Ornament kit
- **Gold divider:** hairline, dot, diamond, dot, hairline (copied from the logo rule). SVG, stroke `--gold`, animates with stroke-dashoffset.
- **Chhatri-arch mask:** `border-radius: 200px 200px 20px 20px` for hero thumbnails and decor images.
- **Lotus-bud bullet:** 10px SVG replacing bullets and carousel pagination.
- **Corner brackets:** 1px gold, 14px legs, fade in on card hover.
- **Tier marker:** `◇ Classic`, `◇◇ Grand`, `◇◇◇ Royal` in antique gold (never show prices).

## 7. Layout and components

- Max width 1440px; 12-col grid; gutters 24px mobile / 64px desktop. Section rhythm 140px desktop / 88px mobile. Sections alternate ivory, blush, silk, separated by the gold divider (no hard colour blocks).
- **Buttons:** pills, min height 44px. Primary = crimson fill/ivory text; hover crimson-deep, magnetic on desktop. Secondary = ghost, gold hairline, crimson text; hover fills crimson via a clip-path circle (500ms).
- **Cards:** radius 20px, `--glass`, 1px hairline-soft border, `--shadow-soft`. Hover: lift 8px, image scale 1.03, corner brackets.
- **Chips:** pills, hairline border; selected = lotus-soft with crimson label.
- **Inputs:** 52px tall, ivory fill, 1px hairline, focus ring as above, floating small-caps labels, errors in `--error` with a short sentence.
- **Drawers/modals:** glass-strong, slide 700ms; scrim is a light blush veil `rgba(253,238,242,.6)`.
- **Status chips:** Pending Verification (antique gold), Under review (lotus), Approved (success), Rejected (crimson), Needs info (ink-soft).
- **Skeletons:** slow ivory shimmer (never grey).
- **Empty states:** lotus illustration + "Let our concierge find it for you" + enquiry button.

## 8. Motion principles
- Easing everywhere: `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease-silk`). Durations 0.7–1.6s.
- Max travel: 24px text, 50px cards, ±6% parallax. Opacity carries most reveals.
- Nothing moves faster than 0.4 viewport-heights/second while a 4K clip is the focal point.
- Animate only `transform` and `opacity`. Static blur only.
- `prefers-reduced-motion`: disable Lenis, pinning, parallax, magnetic; use 300ms fades.
- Full choreography lives in ARCHITECTURE.md section "Motion system".

## 9. Imagery and media rules
- 4K video: muted autoplay with poster; always provide pause; never autoplay audio (sound toggle default OFF, fades in 1.2s when enabled).
- Photography treatment: natural, warm, high-key; no heavy filters or dark vignettes.
- Alt text mandatory for every image; hero slides need text descriptions.
- Placeholders until real media: blush/gold gradient tiles labelled "4K placeholder" with the same aspect ratios and data shape.

## 10. Microcopy voice
Warm, assured, unhurried. Short sentences. No slang, no exclamation marks. Examples: "Begin your story." · "Let our concierge hold the details." · "Curated, verified, personally introduced." · "Welcome to the circle." Navigation labels are plain English; Hindi accents only as small italic captions.

## 11. Responsive behaviour
- Breakpoints: 390 (phone), 768, 1024, 1280, 1440+.
- Hero: frame becomes 4:5 arch-top card; headline sits below the video; chapter switcher becomes chip row; search pill becomes "Plan your celebration" bottom sheet.
- Decor gallery: snap carousel. Procession: vertical timeline. Mega-menu: full-screen sheet.
- Touch targets ≥ 44px. No hover-only functionality.

## 12. Definition of "on-brand"
A screen is on-brand if: it is bright; crimson appears only on key actions; gold appears as hairline or ornament; the serif headline has one italic word; the logo is clearly visible; motion is slow; and the media leads.
