import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./product-reveal.css";
gsap.registerPlugin(ScrollTrigger);
const FRAME_COUNT = 144;
const chapters = [
  {
    label: "01 / READY",
    title: "A familiar starting point.",
    text: "One pipette. One plate. A deliberately focused concept.",
  },
  {
    label: "02 / ASPIRATE",
    title: "Begin at the source.",
    text: "The pipette lowers. The illustrative transfer begins.",
  },
  {
    label: "03 / TRAVEL",
    title: "Lift. Then move.",
    text: "The tip rises before moving to the destination well.",
  },
  {
    label: "04 / DISPENSE",
    title: "A new destination.",
    text: "The pipette lowers again and the liquid indicator changes.",
  },
  {
    label: "05 / EXPLORE",
    title: "Now, make it yours.",
    text: "Explore source, destination and volume in the Studio demo.",
  },
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
    shown = useRef(-1),
    preloadFull = useRef(() => {});
  const [chapter, setChapter] = useState(0),
    [loaded, setLoaded] = useState(0),
    [playing, setPlaying] = useState(false),
    [still, setStill] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  const motionReady = loaded === FRAME_COUNT;
  useLayoutEffect(() => {
    let disposed = false,
      started = false,
      next = 0,
      limit = matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 1
        : FRAME_COUNT;
    const images: (HTMLImageElement | undefined)[] = [];
    setLoaded(0);
    shown.current = -1;
    const el = canvas.current;
    if (!el || !section.current) return;
    const ctx = el.getContext("2d", { alpha: false });
    if (!ctx) return;
    const draw = (p: number, force = false) => {
      const target = Math.round(p * (FRAME_COUNT - 1));
      let index = target;
      if (!images[index]) {
        let nearest = images.findIndex(Boolean);
        for (let i = 0; i < images.length; i++) {
          if (images[i] && Math.abs(i - target) < Math.abs(nearest - target))
            nearest = i;
        }
        index = nearest;
      }
      if (index < 0 || (!force && shown.current === index)) return;
      shown.current = index;
      const img = images[index];
      if (!img) return;
      ctx.fillStyle = "#080b10";
      ctx.fillRect(0, 0, el.width, el.height);
      const fit = Math.min(
        el.width / img.naturalWidth,
        el.height / img.naturalHeight,
      );
      const w = img.naturalWidth * fit,
        h = img.naturalHeight * fit;
      ctx.drawImage(img, (el.width - w) / 2, (el.height - h) / 2, w, h);
      const presented = index / (FRAME_COUNT - 1);
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
      section.current!.dataset.frame = String(index);
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
    const loadNext = () => {
      if (disposed || next >= limit) return;
      const i = next++;
      const img = new Image();
      img.decoding = "async";
      img.fetchPriority = "low";
      img.onload = () => {
        if (disposed) return;
        images[i] = img;
        setLoaded((c) => c + 1);
        draw(
          manual.current
            ? Number(range.current?.value || 0) / (FRAME_COUNT - 1)
            : proxy.current.p,
          true,
        );
        loadNext();
      };
      img.onerror = () => {
        if (!disposed) loadNext();
      };
      img.src = `${import.meta.env.BASE_URL}images/${matchMedia("(max-width: 700px)").matches ? "transfer-mobile" : "transfer"}/frame-${String(i).padStart(3, "0")}.webp`;
    };
    preloadFull.current = () => {
      if (limit === FRAME_COUNT) return;
      limit = FRAME_COUNT;
      if (started) for (let i = 0; i < 4; i++) loadNext();
    };
    const preload = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !started) {
          started = true;
          for (let i = 0; i < 4; i++) loadNext();
          preload.disconnect();
        }
      },
      { rootMargin: "600px" },
    );
    preload.observe(section.current);
    resize();
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const preference = (e: MediaQueryListEvent) => setStill(e.matches);
    media.addEventListener("change", preference);
    return () => {
      disposed = true;
      sizeObserver.disconnect();
      preload.disconnect();
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
    preloadFull.current();
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
        scrub: 0.65,
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
      duration: 6,
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
            src={`${import.meta.env.BASE_URL}images/studio-portrait.webp`}
            alt="Studio-rendered full view of the proposed PipeOmatiC gantry system, with a single pipette, a 96-well plate, a tip rack, and a disposal opening"
            width="2200"
            height="1500"
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
        aria-label="Illustrated pipetting transfer"
      >
        <div className="sequence-stage">
          <div className="sequence-title">
            <p className="eyebrow">THE DESIGN IN MOTION</p>
            <h2>
              From one well.
              <br />
              <span>To the next.</span>
            </h2>
          </div>
          <div className="sequence-media">
            <img
              src={`${import.meta.env.BASE_URL}images/transfer/frame-000.webp`}
              alt=""
              aria-hidden="true"
            />
            <canvas
              ref={canvas}
              role="img"
              aria-label="Rendered transfer sequence. The same pipette lowers to a source, lifts and travels, then lowers to a destination. Illustrative motion, not a physical robot simulation."
            />
          </div>
          <div className="sequence-caption">
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
              aria-label="Transfer sequence position"
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
            <span>Rendered concept · Illustrative transfer</span>
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
              pipette, travels, and dispenses into a destination. This rendered
              sequence illustrates that intent. Mechanical dimensions, deck
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
