"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { RefObject, useEffect } from "react";

gsap.registerPlugin(useGSAP);

export function useAccountPageAnimations(scope: RefObject<HTMLElement>) {
  useEffect(() => {
    const runAnimation = () => {
      if (!scope.current) return;

      const q = gsap.utils.selector(scope.current);

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Opening Animation
      tl.from(scope.current, {
        opacity: 0,
        scale: 0.985,
        filter: "blur(8px)",
        duration: 0.45,
      });

      // Header
      tl.from(q(".account-header"), {
        y: -25,
        opacity: 0,
        duration: 0.5,
        filter: "blur(4px)"
      });

      // Cards
      tl.from(q(".account-card"), {
        y: 20,
        opacity: 0,
        scale: 0.97,
        duration: 0.4,
        stagger: 0.12
      });

      // Avatar
      tl.from(q(".profile-pic-wrapper"), {
        scale: 0.7,
        opacity: 0,
        duration: 0.45,
        ease: "back.out(1.6)"
      });

      // Inputs + text
      tl.from(q(".account-card input, .account-card label, .account-card p"), {
        y: 10,
        opacity: 0,
        duration: 0.25,
        stagger: 0.02
      });
    };

    // Run ONLY when sidebar triggers event
    window.addEventListener("account-open", runAnimation);

    return () => {
      window.removeEventListener("account-open", runAnimation);
    };
  }, [scope]);
}
