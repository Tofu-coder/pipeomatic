# Current 3D presentation

The main product presentation is now an original Three.js geometric scene authored in `src/MachineScene.ts`, not a generated image. It uses actual independent geometry for the frame, rails, carriage, pipette, tip, 96-well plate, rack, and waste opening. Materials, image-based studio lighting, lights, shadows and a perspective camera render in the visitor's browser. No 3D asset or external environment file is downloaded.

The motion illustrates aspiration, lift, horizontal travel, dispense, and retraction. It is not engineering CAD, validated clearance checking, fluid simulation or hardware operation. The former generated image is retained only as an automatic no-WebGL fallback. Its original prompt and provenance follow.

# Product asset history

The previous website opening used a generated concept visualization, created with the built-in image generation tool. The original PNG was exported as a JPEG for delivery (about a few hundred KB). This is an artistic interpretation of the team's gantry concept, not CAD or a photograph of built hardware. The well geometry in the render is illustrative; the actual interactive interface separately implements exactly 96 wells.

Asset: `public/images/pipeomatic-concept-studio.jpg`.

The camera sequence pans and scales this image with GSAP while crossfading editorial chapters and lighting overlays. It does not claim to be a physically simulated robot or an interactive 3D model. Motion reverses with scrolling. Reduced motion replaces the extended sequence with a static view and an accessible explanation.

## Generation prompt

Use case: product-mockup. Asset type: premium website cinematic product hero, landscape 16:9, high resolution.
Create an exceptionally photorealistic industrial design concept render of a compact benchtop automated pipetting machine. This is a proposed student engineering concept, not a commercial product. Original design based on an open rectangular Cartesian gantry: four satin bead-blasted aluminum structural columns, precision linear rails, a brushed silver crossbeam, black cable chain, one vertical single-channel pipette carriage with a single transparent narrow disposable pipette tip hovering above a white standard 8-row by 12-column 96-well microplate. A blue disposable tip rack at left and a modest recessed waste receptacle at right on a dark anodized aluminum deck. Include realistic countersunk fasteners, machined joints, linear bearings, subtle material grain, precise mechanical details, restrained elegant geometry. No robotic arm, no multi-channel pipette, no touchscreen, no invented logo or text.
Scene: seamless near-black charcoal studio backdrop (#080a0d), no environment, no room. Whole instrument centered, entirely visible with generous negative space on all sides and extra dark space at top. Front three-quarter camera from slightly above deck height, compelling elegant perspective without wide-angle distortion. Instrument fills approximately 65 percent of image width, 70 percent image height. On a subtly reflective dark ground with a delicate contact shadow.
Lighting: cinematic large softbox key from upper left, thin cool-white rim on right, very subtle ice-blue accents reflected in silver, deep rich blacks but legible functional details. Premium launch photography, refined physical realism, ray-traced metal reflections, very sharp pipette and plate, smooth tonal falloff. Not futuristic fantasy, not illustration, not cartoon, no labels, no graphics, no watermarks.
