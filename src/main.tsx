import React, { useEffect, useId, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./style.css";
gsap.registerPlugin(ScrollTrigger);
const wells = Array.from(
  { length: 96 },
  (_, i) => `${"ABCDEFGH"[Math.floor(i / 12)]}${(i % 12) + 1}`,
);
const team = [
  "Muhammad Latif",
  "Hasan Asif",
  "Raphael Dawson",
  "Valentina Vera",
  "Maya Chan",
  "Saba Kochlamazashvili",
  "Kylie Wen",
  "Nicholas Velasco",
  "Zachary Lin",
];
function Machine() {
  const id = useId().replaceAll(":", "");
  return (
    <svg
      className="machine"
      viewBox="0 0 900 590"
      role="img"
      aria-labelledby={`${id}-machine-title`}
    >
      <title id={`${id}-machine-title`}>
        Original schematic concept of an open gantry pipetting system, with
        pipette, tip rack and well plate
      </title>
      <defs>
        <linearGradient id={`${id}-metal`} x2="1" y2="1">
          <stop stopColor="#e7edf3" />
          <stop offset=".35" stopColor="#758a9a" />
          <stop offset=".55" stopColor="#c3d2dd" />
          <stop offset="1" stopColor="#354858" />
        </linearGradient>
        <linearGradient id={`${id}-deck`} x2="0" y2="1">
          <stop stopColor="#536673" />
          <stop offset="1" stopColor="#192832" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop stopColor="#72c9ef" stopOpacity=".22" />
          <stop offset="1" stopColor="#72c9ef" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="450" cy="460" rx="420" ry="125" fill={`url(#${id}-glow)`} />
      <g className="machine-body">
        <path
          d="M140 390 615 330 790 433 310 520Z"
          fill={`url(#${id}-deck)`}
          stroke="#a8bbc7"
        />
        <path
          d="m140 390 170 130 480-87v26L310 548 140 417Z"
          fill="#1e2c36"
          stroke="#647b8c"
        />
        <g
          stroke={`url(#${id}-metal)`}
          strokeWidth="15"
          fill="none"
          strokeLinejoin="bevel"
        >
          <path d="M160 398V125L610 70v270M310 504V225L770 166v270M160 125l150 100M610 70l160 96M160 141l450-55M310 243l460-59" />
          <path d="m204 195 437-55 79 52-439 58Z" strokeWidth="9" />
        </g>
        <path
          d="m445 167 61-8 35 25v116l-61 9-35-25Z"
          fill={`url(#${id}-metal)`}
          stroke="#b5c9d6"
        />
        <path d="m480 209 61-9v100l-61 9Z" fill="#233747" />
        <path d="m492 303 28-4v43l-14 4-14-9Z" fill="#a5c3d2" />
        <path d="m500 342 14-2-5 49Z" fill="#8ed4fa" />
        <path d="m222 369 112-15 67 40-113 18Z" fill="#78a9be" />
        <g fill="#203f51">
          {Array.from({ length: 48 }, (_, i) => (
            <ellipse
              key={i}
              cx={235 + (i % 8) * 13 + Math.floor(i / 8) * 10}
              cy={369 - (i % 8) * 1.7 + Math.floor(i / 8) * 6}
              rx="3.5"
              ry="2.4"
            />
          ))}
        </g>
        <path d="m407 410 165-23 87 49-165 29Z" fill="#e0e9ed" />
        <g fill="#4c8caf" stroke="#a2d1e8">
          {wells.map((w, i) => (
            <ellipse
              key={w}
              cx={423 + (i % 12) * 12 + Math.floor(i / 12) * 9}
              cy={412 - (i % 12) * 1.7 + Math.floor(i / 12) * 5}
              rx="4"
              ry="2.5"
            />
          ))}
        </g>
        <path d="m644 369 46-6 48 30-47 7Z" fill="#667f8d" />
        <text x="326" y="526" fill="#a6bbc8" fontSize="10" letterSpacing="4">
          PIPEOMATIC / CONCEPT 01
        </text>
      </g>
    </svg>
  );
}
function Studio() {
  const [source, setSource] = useState("A1"),
    [destination, setDestination] = useState("H12"),
    [mode, setMode] = useState<"source" | "destination">("source"),
    [volume, setVolume] = useState("50"),
    [phase, setPhase] = useState(0),
    [message, setMessage] = useState("Ready to preview your transfer."),
    [copied, setCopied] = useState(false);
  const running = phase > 0 && phase < 5,
    valid =
      Number.isFinite(Number(volume)) &&
      Number(volume) >= 1 &&
      Number(volume) <= 200 &&
      source !== destination;
  useEffect(() => {
    if (!running) return;
    const timer = setTimeout(
      () => {
        setPhase((p) => p + 1);
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 180 : 850,
    );
    return () => clearTimeout(timer);
  }, [phase, running]);
  useEffect(() => {
    if (phase === 5)
      setMessage(
        `Preview complete: ${volume} µL from ${source} to ${destination}. No liquid was moved.`,
      );
  }, [phase, volume, source, destination]);
  function select(w: string) {
    setCopied(false);
    setPhase(0);
    if (mode === "source") {
      setSource(w);
      setMode("destination");
    } else setDestination(w);
    setMessage("Selection updated. Preview when ready.");
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(
          {
            kind: "illustrative-browser-demo",
            source,
            destination,
            volume_uL: Number(volume),
            hardwareConnected: false,
          },
          null,
          2,
        ),
      );
      setCopied(true);
    } catch {
      setMessage(
        "Clipboard unavailable in this browser. Your configuration is displayed above.",
      );
    }
  }
  return (
    <div className="studio">
      <div className="studio-bar">
        <span>
          <span className="status-dot" /> PipeOmatiC Studio
        </span>
        <span className="pill">INTERACTIVE CONCEPT</span>
      </div>
      <div className="studio-body">
        <div className="plate-area">
          <div className="flex justify-between items-start">
            <div>
              <p className="eyebrow">01 / MAP YOUR TRANSFER</p>
              <h3>Small wells. Big possibilities.</h3>
            </div>
            <span className="plate-count">8 × 12</span>
          </div>
          <p className="muted">
            Choose a source, then a destination. Use Tab and Enter to select a
            well.
          </p>
          <div className="plate-wrap">
            <div className="plate" aria-label="96-well plate">
              <span />
              {Array.from({ length: 12 }, (_, i) => (
                <span className="axis" key={i}>
                  {i + 1}
                </span>
              ))}
              {"ABCDEFGH".split("").map((r, row) => (
                <React.Fragment key={r}>
                  <span className="axis">{r}</span>
                  {wells.slice(row * 12, row * 12 + 12).map((w) => (
                    <button
                      key={w}
                      disabled={running}
                      className={`well ${source === w ? "source" : ""} ${destination === w ? "destination" : ""} ${phase === 5 && destination === w ? "filled" : ""} ${running && ((phase < 3 && w === source) || (phase >= 3 && w === destination)) ? "active" : ""}`}
                      onClick={() => select(w)}
                      aria-label={`${w}${source === w ? ", source" : ""}${destination === w ? ", destination" : ""}`}
                      aria-pressed={source === w || destination === w}
                    />
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="legend">
            <span>
              <i className="source-key" /> Source
            </span>
            <span>
              <i className="dest-key" /> Destination
            </span>
            <span>Illustrative liquid transfer</span>
          </div>
        </div>
        <div className="controls">
          <p className="eyebrow">TRANSFER SETTINGS</p>
          <div className="mode">
            <button
              disabled={running}
              aria-pressed={mode === "source"}
              onClick={() => setMode("source")}
            >
              Source <b>{source}</b>
            </button>
            <button
              disabled={running}
              aria-pressed={mode === "destination"}
              onClick={() => setMode("destination")}
            >
              Destination <b>{destination}</b>
            </button>
          </div>
          <label htmlFor="volume">
            Transfer volume <span>µL</span>
          </label>
          <input
            disabled={running}
            id="volume"
            type="number"
            min="1"
            max="200"
            value={volume}
            onChange={(e) => {
              setVolume(e.target.value);
              setPhase(0);
              setCopied(false);
            }}
          />
          <p className="small muted">
            Demo range: 1–200 µL. This is an interface limit, not a validated
            pipette specification.
          </p>
          {!valid && (
            <p className="error" role="alert">
              Choose different wells and a volume from 1 to 200 µL.
            </p>
          )}
          <button
            className="button primary"
            disabled={!valid || running}
            onClick={() => {
              setPhase(1);
              setMessage("Preview running.");
            }}
          >
            {running ? "Previewing…" : "Preview transfer"} <span>↗</span>
          </button>
          <div className="sequence">
            {["Pick up tip", "Aspirate", "Dispense", "Discard tip"].map(
              (s, i) => (
                <span
                  key={s}
                  className={
                    phase === i + 1 ? "current" : phase > i + 1 ? "done" : ""
                  }
                >
                  {phase > i + 1 ? "✓" : `0${i + 1}`} {s}
                </span>
              ),
            )}
          </div>
          <p className="small feedback" role="status" aria-live="polite">
            {message}
          </p>
          <div className="flex gap-4">
            <button
              className="text-button"
              disabled={running || !valid}
              onClick={copy}
            >
              {copied ? "Copied ✓" : "Copy demo JSON"}
            </button>
            <button
              className="text-button"
              disabled={running}
              onClick={() => {
                setSource("A1");
                setDestination("H12");
                setVolume("50");
                setMode("source");
                setPhase(0);
                setCopied(false);
                setMessage("Demo reset.");
              }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      <div className="studio-note">
        BROWSER DEMO ONLY{" "}
        <span>
          No robot connection, Python execution, physical simulation, or
          validated liquid handling.
        </span>
      </div>
    </div>
  );
}
function App() {
  const root = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -55% 0px" },
    );
    document
      .querySelectorAll("main section[id]")
      .forEach((section) => observer.observe(section));
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", close);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", close);
    };
  }, []);
  useEffect(() => {
    const progress = gsap.to(".reading-progress", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: true },
    });
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) =>
        gsap.from(el, {
          y: 24,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        }),
      );
      gsap.to(".hero .machine-body", {
        y: -35,
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    });
    return () => {
      mm.revert();
      progress.scrollTrigger?.kill();
      progress.kill();
    };
  }, []);
  return (
    <div ref={root}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="reading-progress" aria-hidden="true" />
      <header>
        <a className="brand" href="#">
          PipeOmatiC<span>.io</span>
        </a>
        <button
          className="menu-button"
          aria-expanded={menu}
          aria-controls="navigation"
          onClick={() => setMenu(!menu)}
        >
          {menu ? "Close" : "Menu"}
        </button>
        <nav
          id="navigation"
          className={menu ? "open" : ""}
          aria-label="Main navigation"
        >
          {[
            ["The idea", "idea"],
            ["Engineering", "engineering"],
            ["Our team", "team"],
          ].map(([t, id]) => (
            <a
              key={id}
              href={`#${id}`}
              aria-current={activeSection === id ? "location" : undefined}
              onClick={() => setMenu(false)}
            >
              {t}
            </a>
          ))}
          <a href="#studio" className="nav-cta" onClick={() => setMenu(false)}>
            Explore Studio <span>↗</span>
          </a>
        </nav>
      </header>
      <main id="main">
        <section className="hero">
          <div className="hero-copy reveal">
            <p className="eyebrow">BME 100 · GROUP 2 · A DESIGN EXPLORATION</p>
            <h1>
              Less repetition.
              <br />
              <span>More discovery.</span>
            </h1>
            <p className="hero-description">
              A considered approach to automated pipetting.
              <br />
              Designed around the people behind the science.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#studio">
                Experience Studio <span>↗</span>
              </a>
              <a className="text-link" href="#idea">
                Explore the idea <span>↓</span>
              </a>
            </div>
          </div>
          <div className="hero-art">
            <div className="orbital" />
            <Machine />
            <span className="art-label">
              PIPEOMATIC / CONCEPT 01
              <br />
              <b>Proposed design · Original schematic</b>
            </span>
          </div>
          <div className="hero-bottom">
            <span>ACCESSIBLE AUTOMATION. AN OPEN POSSIBILITY.</span>
            <span>SCROLL TO EXPLORE ↓</span>
          </div>
        </section>
        <div className="overview-strip" aria-label="Project at a glance">
          <div>
            <strong>96 wells.</strong>
            <span>One familiar starting point.</span>
          </div>
          <div>
            <strong>A clearer workflow.</strong>
            <span>Source. Destination. Volume.</span>
          </div>
          <div>
            <strong>Built to explore.</strong>
            <span>An interactive concept, in your browser.</span>
          </div>
        </div>
        <section className="light section" id="idea">
          <div className="section-heading reveal">
            <p className="eyebrow">01 / THE REASON</p>
            <h2>
              Repetition belongs
              <br />
              in the protocol.
              <br />
              <span>Not in your day.</span>
            </h2>
            <p>
              Manual pipetting asks researchers to repeat the same small
              movement, again and again. Our group identified operator fatigue,
              opportunities for error, and the cost of automation as barriers
              worth exploring.
            </p>
          </div>
          <div className="principles reveal">
            {[
              [
                "Accessible by intention.",
                "Track component and consumable costs before choosing custom parts. Affordability is a design goal, not a measured result.",
              ],
              [
                "Simple by design.",
                "Select where liquid starts, where it goes, and how much to transfer. Make the workflow understandable before adding complexity.",
              ],
              [
                "Evidence before claims.",
                "Start with one plate model. Check alignment, test water transfers, and measure error and repeatability.",
              ],
            ].map(([h, p], i) => (
              <article key={h}>
                <span>0{i + 1}</span>
                <h3>{h}</h3>
                <p>{p}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="section engineering" id="engineering">
          <div className="reveal">
            <p className="eyebrow">02 / THE ENGINEERING</p>
            <h2>
              A clear path.
              <br />
              <span>From well to well.</span>
            </h2>
            <p className="intro">
              An open gantry concept, informed by the Opentrons OT-2. A familiar
              plate. A deliberately focused first step.
            </p>
          </div>
          <div className="engineering-grid reveal">
            <div className="diagram">
              <Machine />
              <p>
                Illustrative layout based on the pitch’s gantry concept.
                <br />
                Not CAD, a fabricated prototype, or a clearance-verified model.
              </p>
            </div>
            <div className="component-list">
              {[
                [
                  "01",
                  "Motion & pipette",
                  "Proposed controlled travel above the deck, with a disposable tip for each transfer. Mechanical dimensions and pipette selection remain to be determined.",
                ],
                [
                  "02",
                  "96-well plate",
                  "Begin with one supported plate model and verify fixture fit and well alignment before expanding compatibility.",
                ],
                [
                  "03",
                  "Tip rack & disposal",
                  "The intended sequence picks up a clean tip, aspirates, dispenses, and discards the used tip. Deck clearance still requires evaluation.",
                ],
              ].map(([n, h, p]) => (
                <article key={n}>
                  <span>{n}</span>
                  <div>
                    <h3>{h}</h3>
                    <p>{p}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="architecture reveal">
            <p className="eyebrow">PROPOSED SOFTWARE PATH</p>
            <div>
              {[
                [
                  "Browser interface",
                  "Choose wells & volume",
                  "Demonstrated here",
                ],
                [
                  "Python workflow",
                  "Translate selections to commands",
                  "Future implementation",
                ],
                [
                  "Robot platform",
                  "Execute & validate transfers",
                  "Future implementation",
                ],
              ].map(([h, p, s], i) => (
                <React.Fragment key={h}>
                  {i > 0 && <span className="arrow">→</span>}
                  <article>
                    <h3>{h}</h3>
                    <p>{p}</p>
                    <span className={i === 0 ? "built" : "future"}>{s}</span>
                  </article>
                </React.Fragment>
              ))}
            </div>
            <p className="small muted">
              This website previews the interaction only. An OT-2-inspired
              Python workflow is proposed in the pre-meeting; no hardware
              adapter is implemented.
            </p>
          </div>
        </section>
        <section className="section software" id="studio">
          <div className="section-heading reveal">
            <p className="eyebrow">03 / MEET THE EXPERIENCE</p>
            <h2>
              Your next transfer.
              <br />
              <span>Starts with a click.</span>
            </h2>
            <p>
              Explore the proposed interaction in PipeOmatiC Studio. Map two
              wells, set a volume, and step through an illustrative transfer.
            </p>
          </div>
          <Studio />
        </section>
        <section className="light section" id="validation">
          <div className="reveal">
            <p className="eyebrow">04 / WHAT COMES NEXT</p>
            <h2>
              Designed with ambition.
              <br />
              <span>Grounded in testing.</span>
            </h2>
          </div>
          <div className="validation reveal">
            <div>
              <span className="pill dark-pill">BUILT FOR THIS SHOWCASE</span>
              <h3>The experience is working.</h3>
              <p>
                A responsive website, selectable 96-well plate, input checks,
                transfer preview, and demo configuration export run entirely in
                your browser.
              </p>
            </div>
            <div>
              <span className="pill dark-pill">
                PROPOSED · NOT YET VALIDATED
              </span>
              <h3>The engineering needs evidence.</h3>
              <ol>
                <li>
                  Track the pipette, fixtures, electronics, and consumable
                  costs.
                </li>
                <li>
                  Evaluate Isaac Sim for travel and deck-clearance checks.
                </li>
                <li>
                  Verify the fit and alignment of one 96-well plate model.
                </li>
                <li>
                  Weigh repeated water dispenses to assess volume error and
                  repeatability.
                </li>
              </ol>
              <p className="small">
                No accuracy, savings, safety, or performance results are
                claimed.
              </p>
            </div>
          </div>
        </section>
        <section className="section team" id="team">
          <div className="reveal">
            <p className="eyebrow">05 / THE PEOPLE BEHIND THE POSSIBILITY</p>
            <h2>
              Nine perspectives.
              <br />
              <span>One shared direction.</span>
            </h2>
            <p className="intro">
              BME 100 · Group 2<br />
              An introductory engineering design showcase.
            </p>
          </div>
          <div className="team-grid reveal">
            {team.map((name, i) => (
              <div key={name}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <h3>{name}</h3>
              </div>
            ))}
          </div>
          <p className="small muted">
            Team membership follows the elevator pitch. Names are listed without
            inferred project roles.
          </p>
        </section>
        <section className="section sources" id="references">
          <p className="eyebrow">06 / RESEARCH & SOURCE MATERIAL</p>
          <h2 className="reveal">
            Built on a foundation.
            <br />
            <span>Open to exploration.</span>
          </h2>
          <div className="source-grid">
            <div>
              <h3>The team’s starting point</h3>
              <a
                href={`${import.meta.env.BASE_URL}documents/elevator-pitch.pdf`}
              >
                Elevator Pitch · Group 2 <span>PDF ↗</span>
              </a>
              <a href={`${import.meta.env.BASE_URL}documents/pre-meeting.pdf`}>
                Pre-Meeting 4 · Muhammad Latif <span>PDF ↗</span>
              </a>
              <p className="small muted">
                Source for design intent, workflow, validation plans, and team
                credits. Pitch imagery is marked as generated by ChatGPT in the
                original slides.
              </p>
            </div>
            <div>
              <h3>References from the pre-meeting</h3>
              <a href="https://doi.org/10.1016/j.slast.2024.100205">
                01 · Moukarzel et al. · SLAS Technology (2024) ↗
              </a>
              <p className="small muted">
                “Automation of biochemical assays using an open-sourced,
                inexpensive robotic liquid handler.” 29, 100205.
              </p>
              <a href="https://docs.opentrons.com/python-api/tutorial/">
                02 · Opentrons Python API tutorial ↗
              </a>
              <a href="https://docs.opentrons.com/ot-2/labware/types/">
                03 · Opentrons OT-2 labware types ↗
              </a>
              <a href="https://docs.isaacsim.omniverse.nvidia.com/latest/robot_simulation/index.html">
                04 · NVIDIA Isaac Sim robot simulation ↗
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <a className="brand" href="#">
          PipeOmatiC<span>.io</span>
        </a>
        <p>
          BME 100 · GROUP 2<br />A concept in laboratory automation.
        </p>
        <a href="#">Back to top ↑</a>
        <p className="footer-note">
          Independent academic concept. No affiliation with Opentrons, NVIDIA,
          Apple, Meta, or Ray-Ban. PipeOmatiC.io is the project name; domain
          ownership is not implied.
        </p>
      </footer>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
