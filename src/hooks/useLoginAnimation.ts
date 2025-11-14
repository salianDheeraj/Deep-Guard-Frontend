"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { RefObject } from "react";

export function useLoginAnimation(scope: RefObject<HTMLDivElement>) {
  useGSAP(
    (context) => {
      if (!scope.current) return;

      // kill any leftover tweens on remount
      gsap.killTweensOf("*");

      const tl = gsap.timeline({
        delay: 0.2,
        defaults: { ease: "power3.out" },
      });

      gsap.set(scope.current, { perspective: 1000 });
      gsap.set(".login-button", { y: 0 });

      // logo + title group
      tl.from(
        ".login-logo",
        {
          opacity: 0,
          y: -3,
          scale: 0.9,
          filter: "blur(5px)",
          duration: 0.8,
        },
        0
      )
        .from(
          ".login-title-group > *",
          {
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.7,
          },
          "<0.1"
        );

      // card
      tl.from(
        ".login-card",
        {
          opacity: 0,
          y: 60,
          scale: 0.96,
          transformOrigin: "center bottom",
          duration: 1,
        },
        "-=0.4"
      );

      // form elements
      const formElements = gsap.utils.toArray(
        ".login-form-element, .login-button",
        scope.current
      );
      tl.from(
        formElements,
        {
          opacity: 0,
          y: 20,
          stagger: 0.08,
          duration: 0.6,
        },
        "-=0.5"
      );

      // FIX: stop logo from shifting
      tl.to(
        [
          ".login-logo",
          ".login-title-group > *",
          ".login-card",
          ".login-form-element",
          ".login-button",
        ],
        {
          opacity: 1,
          filter: "blur(0px)",
          clearProps: "filter, opacity, transform",
        },
        "<"
      );

      // ❌ REMOVED FLOATING LOGO — stays perfectly still
    },
    { scope }
  );
}
