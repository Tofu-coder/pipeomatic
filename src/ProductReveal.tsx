import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./product-reveal.css";
import type { createMachineScene } from "./MachineScene";
gsap.registerPlugin(ScrollTrigger);
const captions = [
  [
    "A CONCEPT IN MOTION",
    "Every movement.",
    "A new possibility.",
    "An original exploration of automated pipetting.",
  ],
  [
    "01 / ASPIRATE",
    "Start with a well.",
    "Draw up possibility.",
    "The pipette lowers to the source. An illustrative liquid transfer begins.",
  ],
  [
    "02 / TRAVEL",
    "Rise. Move.",
    "Find the next well.",
    "The tip lifts before the carriage travels across the plate.",
  ],
  [
    "03 / DISPENSE",
    "A measured idea.",
    "A visible movement.",
    "The tip lowers again. Liquid appears in the destination well.",
  ],
  [
    "04 / EXPLORE",
    "Less repetition.",
    "More discovery.",
    "Explore the interaction in PipeOmatiC Studio.",
  ],
];
export default function ProductReveal() {
  const section = useRef<HTMLElement>(null),
    host = useRef<HTMLDivElement>(null);
  const engine = useRef<ReturnType<typeof createMachineScene> | null>(null);
  const play = useRef<gsap.core.Tween | null>(null);
  const manual = useRef(false),
    value = useRef({ p: 0 });
  const [ready, setReady] = useState(false),
    [playing, setPlaying] = useState(false),
    [failed, setFailed] = useState(false);
  const [still, setStill] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const paint = useRef((p: number) => {
    void p;
  });
  useLayoutEffect(() => {
    let disposed = false;
    paint.current = (p: number) => {
      const phase = p < 0.17 ? 0 : p < 0.38 ? 1 : p < 0.6 ? 2 : p < 0.8 ? 3 : 4;
      engine.current?.draw(p);
      section.current
        ?.querySelectorAll<HTMLElement>(".operation-caption")
        .forEach((el, i) => {
          el.style.opacity = i === phase ? "1" : "0";
          el.style.visibility = i === phase ? "visible" : "hidden";
        });
      section.current
        ?.querySelectorAll<HTMLElement>(".operation-step")
        .forEach((el, i) =>
          el.classList.toggle("current", i === Math.max(0, phase - 1)),
        );
      const bar = section.current?.querySelector<HTMLElement>(
        ".operation-progress i",
      );
      if (bar) bar.style.transform = `scaleX(${p})`;
    };
    import("./MachineScene")
      .then(({ createMachineScene }) => {
        if (disposed || !host.current) return;
        try {
          engine.current = createMachineScene(host.current);
          paint.current(value.current.p);
          setReady(true);
        } catch {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));
    const onChange = (e: MediaQueryListEvent) => setStill(e.matches);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    media.addEventListener("change", onChange);
    return () => {
      disposed = true;
      media.removeEventListener("change", onChange);
      play.current?.kill();
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);
  useEffect(() => {
    if (still) {
      play.current?.kill();
      manual.current = false;
      setPlaying(false);
      value.current.p = 0;
      paint.current(0);
      return;
    }
    const tween = gsap.to(value.current, {
      p: 1,
      ease: "none",
      onUpdate: () => {
        if (!manual.current) paint.current(value.current.p);
      },
      scrollTrigger: {
        trigger: section.current,
        start: () => `top top+=${innerWidth < 701 ? 64 : 72}`,
        end: "bottom bottom",
        scrub: 0.85,
      },
    });
    const resumeScroll = (event: Event) => {
      if (
        event instanceof KeyboardEvent &&
        event.target instanceof Element &&
        event.target.closest("button, input, textarea, select, a")
      )
        return;
      if (
        event instanceof KeyboardEvent &&
        ![
          "ArrowDown",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
          " ",
        ].includes(event.key)
      )
        return;
      if (!manual.current) return;
      play.current?.kill();
      manual.current = false;
      setPlaying(false);
      paint.current(value.current.p);
    };
    window.addEventListener("wheel", resumeScroll, { passive: true });
    window.addEventListener("touchmove", resumeScroll, { passive: true });
    window.addEventListener("keydown", resumeScroll);
    window.addEventListener("hashchange", resumeScroll);
    return () => {
      window.removeEventListener("wheel", resumeScroll);
      window.removeEventListener("touchmove", resumeScroll);
      window.removeEventListener("keydown", resumeScroll);
      window.removeEventListener("hashchange", resumeScroll);
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [still, ready]);
  function togglePlayback() {
    if (playing) {
      play.current?.kill();
      manual.current = true;
      setPlaying(false);
      return;
    }
    manual.current = true;
    setPlaying(true);
    const frame = { p: 0 };
    paint.current(0);
    play.current = gsap.to(frame, {
      p: 1,
      duration: 15,
      ease: "none",
      onUpdate: () => paint.current(frame.p),
      onComplete: () => {
        setPlaying(false);
        manual.current = true;
      },
    });
  }
  return (
    <section
      ref={section}
      className={`product-reveal spatial-reveal ${still ? "still-view" : ""}`}
      aria-label="Operating pipetting machine concept"
    >
      <div className="product-stage spatial-stage">
        <div className="spatial-heading" aria-live="off">
          {captions.map(([tag, line1, line2, description], i) => (
            <div
              key={tag}
              className={`operation-caption ${i === 0 ? "initial" : ""}`}
            >
              <p className="eyebrow">{tag}</p>
              {i === 0 ? (
                <h1>
                  {line1}
                  <br />
                  <span>{line2}</span>
                </h1>
              ) : (
                <h2>
                  {line1}
                  <br />
                  <span>{line2}</span>
                </h2>
              )}
              <p className="operation-description">{description}</p>
              {i === 4 && (
                <a className="spatial-studio-link" href="#studio">
                  Experience Studio ↗
                </a>
              )}
            </div>
          ))}
        </div>
        <div
          ref={host}
          className="machine-viewport"
          role="img"
          aria-label="Original animated 3D pipetting concept. A carriage moves between source and destination wells, lowers its tip, and illustrates aspiration and dispensing. Not a hardware or fluid simulation."
        />
        {(!ready || failed) && (
          <div className="spatial-fallback">
            <img
              src={`${import.meta.env.BASE_URL}images/pipeomatic-concept-studio.jpg`}
              alt="AI-generated illustrative pipetting machine concept"
            />
            <p>
              {failed
                ? "3D is unavailable on this device. Explore the software concept below."
                : "Preparing the instrument…"}
            </p>
          </div>
        )}
        <div className="spatial-vignette" aria-hidden="true" />
        <div className="operation-controls">
          <div
            className="operation-steps"
            aria-label="Illustrated transfer sequence"
          >
            {["Aspirate", "Travel", "Dispense", "Retract"].map((s, i) => (
              <span className="operation-step" key={s}>
                <b>0{i + 1}</b>
                {s}
              </span>
            ))}
          </div>
          <div className="operation-actions">
            <button
              onClick={togglePlayback}
              disabled={!ready || failed || still}
              aria-pressed={playing}
            >
              {playing ? "Pause cycle" : "Play transfer"}
              <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span>
            </button>
            <button onClick={() => setStill(!still)} aria-pressed={still}>
              {still ? "Enable motion" : "Still view"}
            </button>
          </div>
          <div className="operation-progress" aria-hidden="true">
            <i />
          </div>
        </div>
        <div className="reveal-footer">
          <span className="render-disclosure">
            {failed ? "AI-generated concept image" : "Interactive 3D concept"}
            <span>Illustrative motion · Not built or validated hardware</span>
          </span>
          <span className="spatial-scroll-hint">
            {still ? "STATIC PRESENTATION" : "SCROLL TO OPERATE"}
          </span>
          <a className="reveal-skip" href="#idea">
            Skip to the idea ↓
          </a>
        </div>
      </div>
      {still && (
        <div className="spatial-static-story">
          <p>
            The proposed workflow selects a source, lifts the pipette, travels
            to a destination, and dispenses. This geometric animation
            illustrates that intent. Hardware motion, clearances and volume
            accuracy require engineering validation.
          </p>
          <a href="#studio" className="button primary">
            Experience Studio ↗
          </a>
        </div>
      )}
    </section>
  );
}
