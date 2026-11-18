# Current verification

## Content and consistency

- Product views use one original Blender scene: full portrait, mechanical detail, plate macro, and 144 deterministic transfer frames.
- The scene’s plate and rack each use an 8 × 12 arrangement. Geometry does not change between views; only optical framing and intended transfer poses change.
- The scene illustrates a transfer with a tip already attached. Tip pickup/disposal, hardware operation, clearances, liquid physics, accuracy and cost validation are not claimed as completed work.
- Source PDFs, all nine team credits and all four research references remain present.

## Implementation cleanup

- Removed the real-time Three.js renderer and its runtime/type dependencies.
- Removed the earlier SVG machine and generated product image.
- Replaced the accumulated global stylesheet with a single shared design system and a dedicated rendered-presentation stylesheet.
- No legacy renderer names, generated image paths or obsolete machine presentation selectors remain in `src/`.
- Current artwork provenance and reproducible source files are documented in `ASSET-NOTES.md`.

## Browser checks

- Desktop and 390px phone layouts reviewed. At 390px, body width equals viewport width and no image is broken.
- Gallery selection works; ArrowLeft moves selection from the plate view to the mechanical view.
- Studio: volume 0 disables preview; volume 50 enables the illustrative transfer.
- The sequence loads 144 frames and exposes playback, range control and Still view. Captions derive from the displayed frame, so partially loaded sequences cannot describe an unseen pose.
- All image paths and PDF paths use the Vite base URL.
- Reduced-motion preferences enable Still view and initially load only the still frame; full motion loads if explicitly enabled. System preference switching is implemented but was not independently toggled in browser testing.

## Scope of verification

This is an academic showcase and artistic design visualization. Visual checks do not validate mechanical feasibility, deck clearance, tip fit, fluid handling or laboratory performance. GitHub Pages hosting serves only static files; no visitor requires the development computer to remain running.
