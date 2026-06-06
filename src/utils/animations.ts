import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const EASE_OUT_POWER3 = "power3.out";

// Debounced ScrollTrigger.refresh on resize
let resizeTimer: ReturnType<typeof setTimeout> | null = null;
if (typeof window !== "undefined") {
  window.addEventListener(
    "resize",
    () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
    },
    { passive: true }
  );
}

/**
 * Initializes all GSAP animations for the landing page.
 * Call once on DOMContentLoaded from the page level.
 */
export function initAnimations(): void {
  animateHero();
  scrollReveal(".reveal", { stagger: 0.12, y: 32, duration: 0.8 });
  cardHoverEffects();
}

/**
 * Animates hero section elements with sequential stagger.
 */
function animateHero(): void {
  const tl = gsap.timeline({ defaults: { ease: EASE_OUT_POWER3 } });

  tl.fromTo(
    ".hero-name",
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 1 }
  )
    .fromTo(
      ".hero-tagline",
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.4"
    )
    .fromTo(
      ".hero-subtext",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7 },
      "-=0.3"
    )
    .fromTo(
      ".hero-desc",
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.7 },
      "-=0.2"
    )
    .fromTo(
      ".hero-links",
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.6 },
      "-=0.1"
    );
}

/**
 * Observes elements matching selector and reveals them on scroll with GSAP ScrollTrigger.
 * Also applies a subtle glow pulse micro-interaction on appear.
 */
export function scrollReveal(
  selector: string,
  options?: { stagger?: number; y?: number; duration?: number }
): void {
  const { stagger = 0.12, y = 32, duration = 0.8 } = options ?? {};

  gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });

    // Fade + slide in
    tl.fromTo(
      el,
      { opacity: 0, y },
      { opacity: 1, y: 0, duration, ease: EASE_OUT_POWER3 }
    );

    // Glow micro-interaction: subtle glow pulse on elements with glass class
    if (el.classList.contains("glass") || el.closest(".glass")) {
      // Only apply glow pulse to interactive elements (cards, not section wrappers)
      const target = el.matches('[data-project-card], .skill-item, .glass-rounded')
        ? el
        : el.querySelector('[data-project-card], .skill-item') || null;

      if (target) {
        // Instead of animating a CSS var, apply a brief glow via filter
        tl.fromTo(
          target,
          { filter: "brightness(1) drop-shadow(0 0 0px rgba(201,168,76,0))" },
          {
            filter: "brightness(1.03) drop-shadow(0 0 6px rgba(201,168,76,0.08))",
            duration: 1.2,
            ease: "power1.out",
          },
          "-=0.4"
        );
      }
    }
  });
}

/**
 * Sets up hover effects for interactive cards: scale and pseudo-element glow.
 * Uses CSS custom property (--card-glow-opacity) instead of boxShadow to avoid repaints.
 */
function cardHoverEffects(): void {
  if (typeof window === "undefined") return;

  // Only apply on devices with fine pointer (mouse)
  const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (!mq.matches) return;

  const cards = document.querySelectorAll<HTMLElement>(".hover-card");

  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      gsap.to(card, {
        scale: 1.02,
        duration: 0.35,
        ease: EASE_OUT_POWER3,
      });
      gsap.to(card, {
        "--card-glow-opacity": 1,
        duration: 0.35,
        ease: EASE_OUT_POWER3,
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(card, {
        scale: 1,
        duration: 0.35,
        ease: EASE_OUT_POWER3,
      });
      gsap.to(card, {
        "--card-glow-opacity": 0,
        duration: 0.35,
        ease: EASE_OUT_POWER3,
      });
    });
  });
}
