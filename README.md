# PipeOmatiC.io

An original BME 100 Group 2 concept showcase, hosted as a static site on GitHub Pages.

Live site: https://tofu-coder.github.io/pipeomatic/

## Local editing

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

The local server is only an editing preview. GitHub hosts the published site independently of your Mac.

## Production check

```sh
BASE_PATH=/pipeomatic/ npm run build
BASE_PATH=/pipeomatic/ npm run preview
```

Open the printed address with `/pipeomatic/` appended. For root-path builds, omit `BASE_PATH` on both commands.

## Publish changes

```sh
git add .
git commit -m "Update PipeOmatiC showcase"
git push origin main
```

The existing GitHub Actions workflow builds and publishes `dist/`. It gets the correct base path from GitHub Pages metadata. No backend, persistent server, paid hosting, account system, or analytics are required.

## Presentation

The site uses a consistent set of studio renders and a 144-frame rendered transfer sequence. Images come from one original Blender source scene, including the 8 × 12 plate geometry, pipette, rack, gantry, and fixtures. Rendering happens during asset creation; visitors receive compressed static images. No real-time 3D engine is shipped.

The sequence supports scroll scrubbing, playback, manual position control, and Still view. Reduced-motion preferences enable Still view automatically. The detail gallery supports keyboard arrow navigation. The interactive Studio demo implements source/destination selection, volume checks, a transfer preview, reset and JSON copy.

The artwork illustrates a proposed system. It is not engineering CAD, clearance validation, fluid simulation or proof of fabricated hardware. The sequence begins with an attached tip; automated tip pickup/disposal, Python execution, hardware integration and bench measurements remain future work. No precision, savings or performance results are claimed.

## Source files

- `src/ProductReveal.tsx`: opening portrait and rendered transfer experience.
- `src/product-reveal.css`: that presentation’s single responsive stylesheet.
- `src/main.tsx`: gallery, Studio, engineering, team and references.
- `src/style.css`: the shared visual system.
- `art/pipeomatic-studio.blend`: original source scene.
- `art/render_scene.py`: reproducible scene and image creation.
- `public/images/`: production artwork and compressed motion frames.
- `public/documents/`: the recovered elevator pitch and pre-meeting PDFs.

All nine team names follow the supplied elevator pitch. See `ASSET-NOTES.md` for asset provenance and `QA.md` for verification.
