# AI Agent Playbook

## Repo Snapshot
- Next.js 15 app router build (`package.json`); single-page experience assembled in `src/app/page.jsx` with sequential hero ➜ overview ➜ timeline ➜ juries ➜ clients ➜ CTA ➜ footer sections.
- `src/app/layout.js` wraps everything in `ViewTransitions` plus `ClientLayout`, which injects Lenis smooth scrolling and the global menu.
- Aliased imports use `@/*` (`jsconfig.json`); stick to this to avoid brittle relative paths.

## Navigation, Scroll & Loading
- Lenis scroll settings are responsive (see `src/client-layout.js`); avoid bypassing `ReactLenis` when inserting new layout nodes and prefer refs passed via `pageRef` if you need scroll awareness.
- `useViewTransition` (`src/hooks/useViewTransition.js`) drives animated route changes; components like `Button/Button.jsx` and `Menu/Menu.jsx` call `navigateWithTransition` instead of `router.push`.
- Initial page load is gated by `Preloader/Preloader.jsx`; it pauses Lenis via `useLenis` and only runs once thanks to the exported `isInitialLoad`. Reuse that pattern for any new blocking overlays.

## Animation System
- GSAP + ScrollTrigger power every section. Register plugins locally (`use client`) and guard heavy work behind `window.innerWidth > 1000` when animations would break on mobile (see `Timeline/Timeline.jsx`, `JuriesCards/JuriesCards.jsx`).
- Section order matters: notice the staggered `gsap.delayedCall` offsets (e.g., `EventOverview` waits for `JunoLanding`, `Spotlight` waits for `ClientReviews`). Keep new sections from racing by delaying initialization until the preceding section finishes.
- Long-lived ScrollTriggers must be killed in cleanup; follow `useGSAP(..., { scope: ref })` or the orchestrator example in `JuriesCards.EXAMPLE.jsx` which registers cleanups through `utils/animationOrchestrator` and priority constants in `constants/animationPriorities.js`.
- `Page.jsx` forces a `ScrollTrigger.refresh` on load/visibility; if you add pinned sections, hook into that refresh rather than calling it ad hoc.

## Section Patterns Worth Reusing
- `JunoLanding/JunoLanding.jsx` drives text effects via `data-animate-type` attributes plus `SplitType`; reuse those attributes for headline animations rather than writing bespoke selectors.
- `EventOverview/EventOverview.jsx` rebuilds paragraph DOM into word wrappers before animating; if you need similar keyword highlights, extend its keyword list instead of duplicating logic.
- `Timeline/Timeline.jsx` regenerates its card DOM each init and positions cards via config arrays—update `timelineData.js` and the position matrices together to keep 3D motion coherent.
- `Spotlight/Spotlight.jsx` and `ClientReviews/ClientReviews` rely on `gsap.delayedCall` to ensure the previous pinned block released before their marquee/pinned triggers start.
- `Clients/Clients.jsx` uses the shared `scrambleText` util; prefer that helper (`src/utils/scrambleText.js`) over ad hoc randomizers so cleanup remains consistent.

## Styling, Assets & Fonts
- Global tokens and font stacks live in `src/app/globals.css` + `fonts.css`; new typography should bind to existing CSS variables (`--base-*`, `--accent-*`) for theming consistency.
- Imagery sits under `public/images` and `public/spotlight`; optimize additions with `image_optimizer.py` (run `python image_optimizer.py public/images` after ensuring Pillow + codecs are installed).
- Fonts are self-hosted from `public/fonts`; when referencing new weights ensure the corresponding `@font-face` exists or add it there.

## Routing & Access Control
- `middleware.js` whitelists `/` and `/register`, redirecting everything else—mirror any route additions in the `allowedExactPaths` set or you will immediately bounce.

## Local Workflows
- Install deps and run locally with:
  ```bash
  pnpm install
  pnpm dev
  ```
- Build with `pnpm build`; the app has no custom test suite, so manual verification is via the dev server plus scroll/animation smoke tests.
- Assets are mostly `.avif`; keep that format for performance and preview new files in `/public` to ensure Next's static serving path matches the import paths used in components.

Let me know which sections need more depth or if any workflow details are still unclear.
