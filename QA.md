# Verification

- TypeScript and Vite production build passed with the default root path.
- Production build passed with `BASE_PATH=/pipeomatic/`.
- Served the production build under `/pipeomatic/`; confirmed rendering, correctly prefixed PDF URLs, and no duplicate SVG IDs.
- HTTP 200 for the project entry point and both source PDFs.
- Browser: selected B2 as source and C3 as destination; confirmed updated selection labels.
- Volume 0 displayed the validation error and disabled preview/export.
- Volume 75 re-enabled playback; completed all four steps and reported 75 µL from B2 to C3 with an explicit no-liquid-moved message.
- Copy demo JSON showed the copied confirmation; reset restored the initial configuration.
- DOM contained exactly 96 well controls.
- At a 390px mobile viewport, body width equaled viewport width (no horizontal overflow). Reviewed stacked controls and mobile navigation.
- Desktop layout checked at larger breakpoints; body width equaled viewport width at 1440px.
- Reduced-motion behavior is implemented through GSAP media matching and CSS overrides; operating-system preference switching was not exercised in browser testing.
- GitHub Pages deployment was verified on November 13. The workflow uses GitHub Pages metadata for its base path.
- External reference links were checked against the official Opentrons and NVIDIA documentation. The journal DOI was preserved from the pre-meeting; its resolver returned 403 to automated retrieval.

## Content provenance

The `/mnt/data` location was unavailable. The elevator pitch attachment was recovered through the referenced conversation. The pre-meeting was recovered from an earlier local artifact named `Muhammad Latif - BME 100 Pre-Meeting 4.pdf`. Both are bundled for review. No performance data or team roles were invented.

## November 17 visual refinement

Reworked the centered product introduction, system typography, neutral backgrounds, blue actions, editorial spacing, dark engineering section, Studio surfaces, and team/reference layouts. Added section-aware navigation, Escape-to-close mobile navigation, scroll progress, and softer scoped reveal motion.

Production TypeScript/Vite build passed with the GitHub Pages base path. Browser checks at desktop and mobile breakpoints confirmed 96 wells and no horizontal overflow. Mobile menu keyboard dismissal and transfer playback were exercised. Academic source links, all team credits, and concept labels remain present.

## Cinematic product reveal

- Replaced the opening schematic with an original photorealistic concept image (257 KB JPEG), disclosed on screen and in alt text as AI-generated and not a built prototype.
- Added a sticky, scroll-linked GSAP camera sequence: shadow reveal, instrument detail, plate detail, and Studio invitation. The camera uses image transforms, not a real 3D model. Existing technical schematic remains in Engineering.
- Browser verification: full-machine desktop opening; instrument and plate chapters; camera transforms changing with scroll; reverse scroll restoring the instrument chapter; mobile opening and 390px body width with no horizontal overflow; skip link reaching the idea section.
- Reduced-motion media query removes the extended scroll distance and sticky scene, presents the static render, and exposes a concise story and Studio link. Preference switching was reviewed in code, not toggled in the browser.
- The asset is served from the configured Vite base path. Production TypeScript/Vite build passed with `/pipeomatic/`.

## Operating 3D scene

- Replaced image panning with an original, lazy-loaded Three.js model. Frame, guide rods, carriage, gantry, pipette, rack, and plate are distinct geometric objects. The plate contains 96 instanced well rings and recesses.
- Verified a single canvas in the browser and a 390px viewport with matching body width. Full machine framing was visually reviewed on phone and desktop, including camera orbit.
- Browser playback verification: aspiration at progress 0.280 with vertical offset -0.420; paused state stayed unchanged across observations. Dispensing at progress 0.660, carriage X 0.932, vertical offset -0.412; the source starts at X 0.008. Completion reaches progress 1.000 with the tip retracted to offset 0.
- Still view toggles the static layout; reduced-motion preferences use the same layout by default. Playback controls are disabled while Still view is active. Operating-system preference switching was not independently toggled.
- Scroll-driven camera and mechanism transitions were verified; manual playback holds its final/paused state until a fresh scroll input or navigation. Keyboard navigation ignores form/button input when resuming scroll control.
- Added no-WebGL fallback to the previous generated image; fallback failure handling was reviewed in code, not forced in the browser.
- Production build passes under `/pipeomatic/`. Three.js is in a separate lazy-loaded chunk, approximately 137 KB compressed. Rendering is event-driven; there is no permanent animation loop when the scene is idle.
- Scope: geometric illustration of the transfer portion, with a tip already attached. No real robot operation, fluid physics, validated dimensions, clearances, accuracy, or automated tip disposal is claimed.
