import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./product-reveal.css";
import { samplePipetteMotion } from "./pipette-motion";
gsap.registerPlugin(ScrollTrigger);
const FRAME_COUNT = 1001;
const chapters = [
  { label: "01 / APPROACH", title: "A deliberate beginning.", text: "The pipette aligns above the source well." },
  { label: "02 / ASPIRATE", title: "Down to the detail.", text: "A controlled vertical stroke. An illustrative liquid pickup." },
  { label: "03 / TRANSFER", title: "Lift. Travel. Settle.", text: "The tip clears the plate before the carriage moves to its destination." },
  { label: "04 / DISPENSE", title: "One well to the next.", text: "The pipette lowers again. The liquid indicator shifts to the destination." },
  { label: "05 / COMPLETE", title: "Ready for what’s next.", text: "Explore your own source, destination and volume in Studio." },
];
// Layered illustration of the proposed mechanism, using the approved photographic still.
// Distances and liquid indicators communicate the concept; they are not calibrated physics.
const carriageOutline = [
  [883,176],[913,173],[913,157],[929,154],[929,136],[943,136],
  [944,155],[978,157],[983,172],[983,216],[960,230],[940,230],
  [940,278],[958,281],[981,292],[981,383],[960,408],[856,403],
  [849,391],[849,296],[864,281],[892,278],[892,230],[883,226],
];
const pipetteOutline = [
  [893,405],[938,407],[938,523],[930,531],[927,550],[923,559],
  [921,594],[916,638],[912,638],[907,594],[905,559],[901,550],
  [902,531],[893,523],
];
export default function ProductReveal() {
  const section = useRef<HTMLElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    range = useRef<HTMLInputElement>(null);
  const proxy = useRef({ p: 0 }),
    manual = useRef(false),
    playback = useRef<gsap.core.Tween | null>(null),
    paint = useRef((p: number) => {
      void p;
    }),
    shown = useRef(-1);
  const [chapter, setChapter] = useState(0),
    [loaded, setLoaded] = useState(0),
    [playing, setPlaying] = useState(false),
    [still, setStill] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  const motionReady = loaded === 2;
  useLayoutEffect(() => {
    let disposed = false;
    const img = new Image();
    img.decoding = "async";
    const base = new Image();
    base.decoding = "async";
    setLoaded(0);
    shown.current = -1;
    const el = canvas.current;
    if (!el || !section.current) return;
    const ctx = el.getContext("2d", { alpha: false });
    if (!ctx) return;
    // Rasterize each masked layer once. Subpixel feathering avoids a hard paper edge.
    const sprite = (outline: number[][]) => {
      const output = document.createElement("canvas");
      output.width = 1672; output.height = 941;
      const layer = output.getContext("2d")!;
      const mask = document.createElement("canvas");
      mask.width = output.width; mask.height = output.height;
      const edge = mask.getContext("2d")!;
      edge.filter = "blur(0.55px)";
      edge.beginPath();
      outline.forEach(([px, py], i) => i ? edge.lineTo(px, py) : edge.moveTo(px, py));
      edge.closePath(); edge.fill();
      layer.drawImage(img, 0, 0);
      layer.globalCompositeOperation = "destination-in";
      layer.drawImage(mask, 0, 0);
      return output;
    };
    let carriageSprite: HTMLCanvasElement, pipetteSprite: HTMLCanvasElement;
    const draw = (p: number, force = false) => {
      const presented = Math.max(0, Math.min(1, p));
      const target = Math.round(presented * (FRAME_COUNT - 1));
      if (!img.complete || !img.naturalWidth || !base.complete || !base.naturalWidth || !carriageSprite || !pipetteSprite || (!force && shown.current === presented)) return;
      shown.current = presented;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#080b10";
      ctx.fillRect(0, 0, el.width, el.height);
      const fit = Math.min(
        el.width / img.naturalWidth,
        el.height / img.naturalHeight,
      );
      const { x, z, liquid } = samplePipetteMotion(presented);
      // A restrained optical push supports the mechanism, rather than replacing its motion.
      const scale = 1 + .035 * (1 - Math.cos(presented * Math.PI * 2)) / 2;
      const unit = fit * scale;
      ctx.save();
      ctx.translate(el.width / 2 - img.naturalWidth * unit / 2,
        el.height / 2 - img.naturalHeight * unit / 2);
      ctx.scale(unit, unit);
      ctx.drawImage(base, 0, 0, img.naturalWidth, img.naturalHeight);
      // Flexible cable follows the carriage; the structural frame and labware stay fixed.
      ctx.beginPath();
      ctx.moveTo(937, 232);
      ctx.bezierCurveTo(952 + x * .25, 255, 951 + x * .7, 221, 952 + x, 203 + x * .04);
      ctx.strokeStyle = "#12161b";
      ctx.lineWidth = 18;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.strokeStyle = "#4b5159";
      ctx.lineWidth = 1.3;
      ctx.stroke();
      // Contact and ambient shadows tie the moving head to the rail and plate.
      const proximity = 1 + z / 72;
      ctx.save();
      ctx.translate(920 + x, 641 + x * .04);
      ctx.scale(1, .28);
      const shadow = ctx.createRadialGradient(0, 0, 1, 0, 0, 24 - proximity * 12);
      shadow.addColorStop(0, `rgba(8,16,23,${.10 + proximity * .22})`);
      shadow.addColorStop(1, "rgba(8,16,23,0)");
      ctx.fillStyle = shadow;
      ctx.fillRect(-28, -28, 56, 56);
      ctx.restore();
      ctx.save();
      ctx.shadowColor = "#0009";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 3;
      ctx.fillStyle = "#10182055";
      ctx.fillRect(859 + x, 294 + x * .04, 107, 30);
      ctx.restore();
      const layer = (sprite: HTMLCanvasElement, dx: number, dy: number) => {
        ctx.drawImage(sprite, dx, dy);
      };
      // The lower spindle telescopes into the housing during the Z lift.
      layer(pipetteSprite, x, z + x * .04);
      layer(carriageSprite, x, x * .04);
      // Small, physically located liquid cues; no decorative floating droplets.
      if (liquid > .01) {
        ctx.save();
        ctx.globalAlpha = liquid * .38;
        ctx.beginPath();
        ctx.moveTo(911 + x, 592 + z + x * .04);
        ctx.lineTo(918 + x, 592 + z + x * .04);
        ctx.lineTo(915 + x, 627 + z + x * .04);
        ctx.closePath();
        const meniscus = ctx.createLinearGradient(911 + x, 0, 919 + x, 0);
        meniscus.addColorStop(0, "#386a7b");
        meniscus.addColorStop(.45, "#a3d8e1");
        meniscus.addColorStop(1, "#487786");
        ctx.fillStyle = meniscus;
        ctx.fill();
        ctx.restore();
      }
      if (presented > .79) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - liquid) * .55;
        ctx.beginPath();
        ctx.ellipse(1027, 643, 8.5, 3.4, .025, 0, Math.PI * 2);
        ctx.fillStyle = "#5aa4b9";
        ctx.fill();
        ctx.restore();
      }
      // The near rim occludes the last millimetres of tip at insertion depth.
      if (z > -8) {
        ctx.save();
        ctx.globalAlpha = (z + 8) / 8 * .65;
        ctx.beginPath();
        ctx.ellipse(914 + x, 638 + x * .04, 9, 3.5, .025, 0, Math.PI);
        ctx.strokeStyle = "#c2ccd1";
        ctx.lineWidth = 1.25;
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
      const phase =
        presented < 0.16
          ? 0
          : presented < 0.38
            ? 1
            : presented < 0.66
              ? 2
              : presented < 0.90
                ? 3
                : 4;
      setChapter((old) => (old === phase ? old : phase));
      if (range.current) range.current.value = String(target);
      section.current!.dataset.frame = String(target);
      section.current!.dataset.progress = presented.toFixed(3);
      section.current!.dataset.phase = String(phase);
    };
    paint.current = draw;
    const resize = () => {
      const rect = el.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio, 1.5);
      el.width = Math.round(rect.width * dpr);
      el.height = Math.round(rect.height * dpr);
      draw(
        manual.current
          ? Number(range.current?.value || 0) / (FRAME_COUNT - 1)
          : proxy.current.p,
        true,
      );
    };
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(el);
    const ready = () => {
      if (disposed) return;
      setLoaded((count) => count + 1);
      draw(proxy.current.p, true);
    };
    img.onload = () => {
      if (disposed) return;
      carriageSprite = sprite(carriageOutline);
      pipetteSprite = sprite(pipetteOutline);
      ready();
    };
    base.onload = ready;
    img.src = `${import.meta.env.BASE_URL}images/studio-opening.jpg`;
    base.src = `${import.meta.env.BASE_URL}images/studio-motion-base.jpg`;
    resize();
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const preference = (e: MediaQueryListEvent) => setStill(e.matches);
    media.addEventListener("change", preference);
    return () => {
      disposed = true;
      sizeObserver.disconnect();
      media.removeEventListener("change", preference);
      playback.current?.kill();
    };
  }, []);
  useEffect(() => {
    if (still) {
      playback.current?.kill();
      manual.current = false;
      setPlaying(false);
      proxy.current.p = 0;
      shown.current = -1;
      paint.current(0);
      ScrollTrigger.refresh();
      return;
    }
    const scroll = gsap.to(proxy.current, {
      p: 1,
      ease: "none",
      onUpdate: () => {
        if (!manual.current) paint.current(proxy.current.p);
      },
      scrollTrigger: {
        trigger: section.current,
        start: () => `top top+=${innerWidth < 701 ? 60 : 68}`,
        end: "bottom bottom",
        scrub: 0.9,
      },
    });
    const resume = (event: Event) => {
      if (
        event instanceof KeyboardEvent &&
        ((event.target instanceof Element &&
          event.target.closest("button,input,a")) ||
          ![
            "ArrowDown",
            "ArrowUp",
            "PageDown",
            "PageUp",
            "Home",
            "End",
            " ",
          ].includes(event.key))
      )
        return;
      if (!manual.current) return;
      manual.current = false;
      playback.current?.kill();
      setPlaying(false);
      paint.current(proxy.current.p);
    };
    window.addEventListener("wheel", resume, { passive: true });
    window.addEventListener("touchmove", resume, { passive: true });
    window.addEventListener("hashchange", resume);
    window.addEventListener("keydown", resume);
    ScrollTrigger.refresh();
    return () => {
      scroll.scrollTrigger?.kill();
      scroll.kill();
      window.removeEventListener("wheel", resume);
      window.removeEventListener("touchmove", resume);
      window.removeEventListener("hashchange", resume);
      window.removeEventListener("keydown", resume);
    };
  }, [still]);
  function watch() {
    if (playing) {
      playback.current?.kill();
      setPlaying(false);
      return;
    }
    manual.current = true;
    setPlaying(true);
    const position = { p: 0 };
    paint.current(0);
    playback.current = gsap.to(position, {
      p: 1,
      duration: 14,
      ease: "none",
      onUpdate: () => paint.current(position.p),
      onComplete: () => setPlaying(false),
    });
  }
  return (
    <>
      <section className="launch-hero" aria-labelledby="launch-title">
        <div className="launch-copy">
          <p className="eyebrow">PIPEOMATIC / BME 100 · GROUP 2</p>
          <h1 id="launch-title">
            Less repetition.
            <br />
            <span>More discovery.</span>
          </h1>
          <p className="launch-description">
            A vision for more accessible laboratory automation.
          </p>
          <div className="launch-actions">
            <a href="#studio" className="button launch-button">
              Experience Studio <span>↗</span>
            </a>
            <a href="#design-sequence">
              Follow the design <span>↓</span>
            </a>
          </div>
        </div>
        <figure className="launch-portrait">
          <img
            src={`${import.meta.env.BASE_URL}images/studio-opening.jpg`}
            alt="AI-generated concept visualization of the proposed PipeOmatiC gantry system, with a single pipette above a 96-well plate and a blue tip rack"
            width="1672"
            height="941"
            fetchPriority="high"
          />
          <figcaption>
            DESIGN VISUALIZATION{" "}
            <span>Proposed system · Not built or validated hardware</span>
          </figcaption>
        </figure>
      </section>
      <section
        ref={section}
        className={`design-sequence ${still ? "sequence-still" : ""}`}
        id="design-sequence"
        aria-label="Cinematic machine design study"
      >
        <div className="sequence-stage">
          <div className="sequence-title">
            <p className="eyebrow">THE DESIGN IN MOTION</p>
            <h2>
              A closer look.
              <br />
              <span>At the possibility.</span>
            </h2>
          </div>
          <div className="sequence-media">
            <img
              src={`${import.meta.env.BASE_URL}images/studio-opening.jpg`}
              alt=""
              aria-hidden="true"
            />
            <canvas
              ref={canvas}
              role="img"
              aria-label="Illustrative pipetting cycle using layered concept imagery: the pipette lowers, lifts clear of the plate, travels to a destination well, dispenses and retracts. Not a validated physical simulation."
            />
          </div>
          <div key={chapter} className="sequence-caption">
            <span>{chapters[chapter].label}</span>
            <h3>{chapters[chapter].title}</h3>
            <p>{chapters[chapter].text}</p>
          </div>
          <div className="sequence-control">
            <button
              onClick={watch}
              disabled={!motionReady || still}
              aria-pressed={playing}
            >
              {playing
                ? "Pause sequence"
                : motionReady
                  ? "Watch the sequence"
                  : "Preparing motion…"}{" "}
              <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>
            </button>
            <input
              ref={range}
              type="range"
              min="0"
              max={FRAME_COUNT - 1}
              defaultValue="0"
              aria-label="Design reveal position"
              disabled={!motionReady || still}
              onChange={(e) => {
                manual.current = true;
                playback.current?.kill();
                setPlaying(false);
                paint.current(Number(e.target.value) / (FRAME_COUNT - 1));
              }}
            />
            <button onClick={() => setStill(!still)} aria-pressed={still}>
              {still ? "Enable motion" : "Still view"}
            </button>
          </div>
          <div className="sequence-foot">
            <span>Animated concept · Illustrative mechanism</span>
            <span className="scroll-instruction">
              {still ? "STATIC VIEW" : "SCROLL TO EXPLORE"}
            </span>
            <a href="#idea">Continue to the idea ↓</a>
          </div>
        </div>
        {still && (
          <div className="sequence-static-note">
            <p>
              The proposed workflow draws liquid from a source, lifts the
              pipette, travels, and dispenses into a destination. This layered animation illustrates that intent. Mechanical dimensions, deck
              clearance, volume accuracy, tip pickup and disposal require
              further development and validation.
            </p>
            <a href="#studio">Explore Studio ↗</a>
          </div>
        )}
      </section>
    </>
  );
}
