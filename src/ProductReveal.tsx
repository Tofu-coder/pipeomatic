import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./product-reveal.css";
gsap.registerPlugin(ScrollTrigger);
const FRAME_COUNT = 1001;
const chapters = [
  { label: "01 / THE INSTRUMENT", title: "One focused idea.", text: "A single pipette. A familiar plate. A clearer workflow." },
  { label: "02 / THE PIPETTE", title: "Small movements. Big purpose.", text: "A proposed single-pipette system, designed around deliberate transfers." },
  { label: "03 / THE DECK", title: "Every well has a place.", text: "A 96-well plate and a dedicated tip rack give the concept its starting point." },
  { label: "04 / THE STRUCTURE", title: "A path above the plate.", text: "An open gantry concept. Alignment and clearance remain to be validated." },
  { label: "05 / EXPLORE", title: "Now, make it yours.", text: "Explore source, destination and volume in the Studio demo." },
];
// Camera crops of one approved still; no generated frames or simulated hardware motion.
const shots = [
  { p: 0, scale: 1, x: .5, y: .5 },
  { p: .27, scale: 1.5, x: .55, y: .49 },
  { p: .52, scale: 1.5, x: .50, y: .70 },
  { p: .76, scale: 1.4, x: .54, y: .32 },
  { p: 1, scale: 1, x: .5, y: .5 },
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
  const motionReady = loaded === 1;
  useLayoutEffect(() => {
    let disposed = false;
    const img = new Image();
    img.decoding = "async";
    setLoaded(0);
    shown.current = -1;
    const el = canvas.current;
    if (!el || !section.current) return;
    const ctx = el.getContext("2d", { alpha: false });
    if (!ctx) return;
    const draw = (p: number, force = false) => {
      const presented = Math.max(0, Math.min(1, p));
      const target = Math.round(presented * (FRAME_COUNT - 1));
      if (!img.complete || !img.naturalWidth || (!force && shown.current === presented)) return;
      shown.current = presented;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#080b10";
      ctx.fillRect(0, 0, el.width, el.height);
      const fit = Math.min(
        el.width / img.naturalWidth,
        el.height / img.naturalHeight,
      );
      const nextShot = shots.findIndex((shot) => shot.p > presented);
      const end = shots[nextShot < 0 ? shots.length - 1 : nextShot];
      const start = shots[Math.max(0, (nextShot < 0 ? shots.length - 1 : nextShot) - 1)];
      const t = Math.min(1, (presented - start.p) / (end.p - start.p));
      const ease = t * t * (3 - 2 * t);
      const mix = (a: number, b: number) => a + (b - a) * ease;
      const scale = mix(start.scale, end.scale);
      const w = img.naturalWidth * fit * scale;
      const h = img.naturalHeight * fit * scale;
      ctx.drawImage(img, el.width / 2 - mix(start.x, end.x) * w,
        el.height / 2 - mix(start.y, end.y) * h, w, h);
      const phase =
        presented < 0.16
          ? 0
          : presented < 0.38
            ? 1
            : presented < 0.59
              ? 2
              : presented < 0.82
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
    img.onload = () => {
      if (disposed) return;
      setLoaded(1);
      draw(proxy.current.p, true);
    };
    img.src = `${import.meta.env.BASE_URL}images/studio-opening.jpg`;
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
      duration: 12,
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
              aria-label="Cinematic close-ups of the approved machine concept image: the full instrument, pipette, plate and gantry. Camera movement only; hardware is not operating."
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
            <span>AI concept image · Camera movement only</span>
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
              pipette, travels, and dispenses into a destination. This image study presents the proposed design. Mechanical dimensions, deck
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
