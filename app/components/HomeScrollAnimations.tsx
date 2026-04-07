"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function HomeScrollAnimations() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const root = document.querySelector(".home-page");
    if (!root) {
      return;
    }

    const ctx = gsap.context(() => {
      const reveal = (
        trigger: string,
        targets: string,
        options?: gsap.TweenVars,
      ) => {
        const section = root.querySelector(trigger);
        if (!section) {
          return;
        }

        const nodes = section.querySelectorAll(targets);
        if (!nodes.length) {
          return;
        }

        gsap.fromTo(nodes, {
          y: 48,
          opacity: 0,
        }, {
          y: 0,
          opacity: 1,
          duration: 0.95,
          ease: "power3.out",
          stagger: 0.12,
          immediateRender: false,
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
          ...options,
        });
      };

      const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      heroTimeline
        .from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.65 })
        .from(".hero-title", { y: 42, opacity: 0, duration: 0.9 }, "-=0.25")
        .from(".hero-sub", { y: 28, opacity: 0, duration: 0.7 }, "-=0.45")
        .from(".hero-actions > *", { y: 22, opacity: 0, duration: 0.55, stagger: 0.1 }, "-=0.35")
        .from(".hero-trust", { y: 18, opacity: 0, duration: 0.6 }, "-=0.3")
        .from(".hero-visual .card-main", { y: 38, scale: 0.96, opacity: 0, duration: 0.9 }, "-=0.7")
        .from(".hero-visual .float-card", { y: 24, opacity: 0, duration: 0.7, stagger: 0.14 }, "-=0.5")
        .from(
          ".progress-bar-fill",
          { scaleX: 0, transformOrigin: "left center", duration: 1.05, ease: "power2.out" },
          "-=0.5",
        )
        .from(".contract-items .citem", { y: 16, opacity: 0, duration: 0.45, stagger: 0.07 }, "-=0.7");

      gsap.fromTo(".stat-cell", {
        y: 40,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.14,
        immediateRender: false,
        scrollTrigger: {
          trigger: ".stats-row",
          start: "top 80%",
          once: true,
        },
      });

      reveal(".features-section", ".features-head > *, .feat-card");
      reveal(".how-section", ".section-eyebrow, .section-title, .section-sub, .step-row", { stagger: 0.1 });

      gsap.fromTo(".mock-form", {
        y: 54,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".how-section",
          start: "top 72%",
          once: true,
        },
      });

      gsap.fromTo(".home-proof-note", {
        y: 32,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".home-proof-note",
          start: "top 84%",
          once: true,
        },
      });

      reveal(".pricing-section", ".pricing-head > *, .pricing-card", { stagger: 0.12 });
      reveal(".testi-section", ".testi-head > *, .testi-card", { stagger: 0.14 });

      gsap.fromTo(".cta-box", {
        y: 54,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: {
          trigger: ".cta-wrap",
          start: "top 78%",
          once: true,
        },
      });

      gsap.to(".cta-deco-1", {
        yPercent: -16,
        ease: "none",
        scrollTrigger: {
          trigger: ".cta-wrap",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.1,
        },
      });

      gsap.to(".cta-deco-2", {
        yPercent: 14,
        ease: "none",
        scrollTrigger: {
          trigger: ".cta-wrap",
          start: "top bottom",
          end: "bottom top",
          scrub: 1.1,
        },
      });

      ScrollTrigger.refresh();
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

  return null;
}