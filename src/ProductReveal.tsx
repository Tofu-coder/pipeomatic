import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./product-reveal.css";
gsap.registerPlugin(ScrollTrigger);

/** A compositor-driven camera move across one art-directed concept render. */
export default function ProductReveal() {
  const scene = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const scope = gsap.context(() => {
        const camera = gsap.timeline({
          defaults: { ease: "power1.inOut" },
          scrollTrigger: {
            trigger: scene.current,
            start: () =>
              `top top+=${window.matchMedia("(max-width: 700px)").matches ? 64 : 72}`,
            end: "bottom bottom",
            scrub: 1.15,
            invalidateOnRefresh: true,
          },
        });
        camera
          .fromTo(
            ".product-camera",
            { scale: 0.88, yPercent: 9, rotation: -2 },
            { scale: 1, yPercent: 0, rotation: 0, duration: 1 },
            0,
          )
          .fromTo(
            ".product-shade",
            { opacity: 0.42 },
            { opacity: 0.08, duration: 1 },
            0,
          )
          .to(".reveal-intro", { autoAlpha: 0, y: -50, duration: 0.6 }, 0.65)
          .to(
            ".product-camera",
            { scale: 1.34, xPercent: 17, yPercent: 4, duration: 1.4 },
            1,
          )
          .fromTo(
            ".reveal-chapter-one",
            { autoAlpha: 0, y: 35 },
            { autoAlpha: 1, y: 0, duration: 0.55 },
            1.15,
          )
          .to(".reveal-side-shade", { opacity: 0.85, duration: 0.6 }, 1)
          .to(
            ".reveal-chapter-one",
            { autoAlpha: 0, y: -25, duration: 0.45 },
            2.35,
          )
          .to(
            ".product-camera",
            { scale: 1.9, xPercent: -17, yPercent: -17, duration: 1.5 },
            2.5,
          )
          .to(".reveal-side-shade", { opacity: 0, duration: 0.5 }, 2.5)
          .to(".reveal-right-shade", { opacity: 0.9, duration: 0.6 }, 2.7)
          .fromTo(
            ".reveal-chapter-two",
            { autoAlpha: 0, y: 35 },
            { autoAlpha: 1, y: 0, duration: 0.55 },
            2.9,
          )
          .to(
            ".reveal-chapter-two",
            { autoAlpha: 0, y: -25, duration: 0.45 },
            4,
          )
          .to(".reveal-right-shade", { opacity: 0, duration: 0.7 }, 4.1)
          .to(
            ".product-camera",
            { scale: 0.84, xPercent: 0, yPercent: 15, duration: 1.3 },
            4.1,
          )
          .to(".product-shade", { opacity: 0.32, duration: 0.8 }, 4.3)
          .fromTo(
            ".reveal-outro",
            { autoAlpha: 0, y: 25 },
            { autoAlpha: 1, y: 0, duration: 0.6 },
            4.65,
          )
          .to(
            ".reveal-meter-fill",
            { scaleX: 1, duration: 5.4, ease: "none" },
            0,
          );
      }, scene);
      return () => scope.revert();
    });
    return () => media.revert();
  }, []);

  return (
    <section
      className="product-reveal"
      ref={scene}
      aria-label="PipeOmatiC cinematic design exploration"
    >
      <div className="product-stage">
        <div className="product-stage-ambient" aria-hidden="true" />
        <div className="product-camera">
          <img
            className="product-render"
            src={`${import.meta.env.BASE_URL}images/pipeomatic-concept-studio.jpg`}
            alt="Photorealistic concept visualization of a silver benchtop pipetting gantry, single pipette, blue tip rack and white well plate. This is an AI-generated design illustration, not a built prototype."
            width="1672"
            height="941"
            fetchPriority="high"
            decoding="async"
          />
        </div>
        <div className="product-shade" aria-hidden="true" />
        <div className="reveal-side-shade" aria-hidden="true" />
        <div className="reveal-right-shade" aria-hidden="true" />
        <div className="reveal-intro">
          <p className="eyebrow">
            PIPEOMATIC · A CONCEPT IN LABORATORY AUTOMATION
          </p>
          <h1>
            Made for <br />
            <span>possibility.</span>
          </h1>
          <p className="reveal-subtitle">Less repetition. More discovery.</p>
        </div>
        <div className="reveal-chapter reveal-chapter-one">
          <span className="reveal-index">01 / THE INSTRUMENT</span>
          <h2>
            Considered.
            <br />
            Down to
            <br />
            <span>the detail.</span>
          </h2>
          <p>
            An open gantry. A single pipette. A focused vision for moving liquid
            with less manual repetition.
          </p>
        </div>
        <div className="reveal-chapter reveal-chapter-two">
          <span className="reveal-index">02 / THE POSSIBILITIES</span>
          <h2>
            A small well.
            <br />
            <span>
              A place
              <br />
              to begin.
            </span>
          </h2>
          <p>
            One supported 96-well plate is the proposed starting point. Fit,
            alignment and repeatability come next.
          </p>
        </div>
        <div className="reveal-outro">
          <span className="reveal-index">03 / YOUR TURN</span>
          <h2>
            From possibility.
            <br />
            <span>To your next click.</span>
          </h2>
          <a className="button primary" href="#studio">
            Experience Studio <span>↗</span>
          </a>
        </div>
        <div className="reveal-footer">
          <span className="render-disclosure">
            AI-generated concept visualization
            <span>Proposed design · Not a built prototype</span>
          </span>
          <div className="reveal-scroll-cue" aria-hidden="true">
            <span>SCROLL TO DISCOVER</span>
            <div className="reveal-meter">
              <i className="reveal-meter-fill" />
            </div>
          </div>
          <a className="reveal-skip" href="#idea">
            Skip to the idea <span>↓</span>
          </a>
        </div>
      </div>
      <div className="reduced-story">
        <p>
          An open gantry and a single pipette. One supported 96-well plate as a
          proposed starting point. Fit, alignment and repeatability still
          require validation.
        </p>
        <a className="button primary" href="#studio">
          Experience Studio <span>↗</span>
        </a>
      </div>
    </section>
  );
}
