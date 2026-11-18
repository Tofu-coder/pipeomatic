# Artwork and consistency

All current product imagery is rendered from one original source scene in Blender 4.5.16. No Apple, Meta or Lusion imagery, logos, models, fonts or code are reused. Those sites were reviewed as visual references for image scale, pacing, product detail and restrained typography.

The low-detail real-time model, Three.js dependency, original SVG machine and earlier generated product image have been removed from the current implementation. The source PDFs retain their original supplied content.

## Current asset set

- `studio-portrait.webp`: full-machine portrait with transparency and a contact shadow.
- `studio-hero.jpg`: photographic studio composition for the framed detail gallery.
- `studio-detail.jpg`: mechanical detail from the same model.
- `studio-macro.jpg`: pipette/plate close-up from the same model.
- `transfer/frame-000.webp` through `frame-143.webp`: 144 frames of one continuous, deterministic transfer illustration.

All frames retain the same geometry and fixtures. The plate and tip rack each contain an 8 × 12 arrangement. Liquid indicators, pipette travel and camera motion follow the source script rather than independently generated frames. The artwork contains no measured engineering or performance claims.

## Reproducibility

`art/pipeomatic-studio.blend` contains the source scene. `art/render_scene.py` builds the geometry, materials, optics, studio lights and transfer poses. It accepts `test`, `hero`, `details`, `gallery`, or `sequence` after Blender’s `--` separator. Blender is needed only to regenerate imagery, not to build or serve the site.

The portrait is rendered at 2200 × 1500 with 80 Cycles samples. Gallery details use 1600 × 1200 and 64 samples. Transfer frames use 1024 × 720 and 24 samples, with denoising. Production frames are WebP, quality 82. Their total transfer size is approximately a few megabytes.

## Scope

The model is an artistic interpretation of the team’s proposed open-gantry system. Dimensions, material choices, fixture fit, plate compatibility and clearances have not been validated. It is not a photograph of an existing prototype or a physical fluid simulation. The sequence starts with a tip attached; pickup and disposal are future work described separately in the engineering story.

Phone motion frames are resized to 720 × 506 from the same source frames. Alpha compression is set to 70. The same 144 poses play over six seconds or scrub with scrolling.
