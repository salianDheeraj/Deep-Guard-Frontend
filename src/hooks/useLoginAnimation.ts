"use client";

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { RefObject } from 'react';

export function useLoginAnimation(scope: RefObject<HTMLDivElement>) {
  
  useGSAP(() => {
    const tl = gsap.timeline({ delay: 0.2 });

    // 1. Fade in the logo
    tl.from(".login-logo", {
      opacity: 0,
      scale: 0.8,
      duration: 0.5,
      ease: 'power2.out'
    });

    // 2. Fade in the title
    tl.from(".login-title", {
      opacity: 0,
      y: 20,
      duration: 0.4
    }, "-=0.3"); // Overlap with previous

    // 3. Fade in the subtitle
    tl.from(".login-subtitle", {
      opacity: 0,
      y: 20,
      duration: 0.4
    }, "-=0.3");

    // 4. Slide up and fade in the login card
    tl.from(".login-card", {
      opacity: 0,
      y: 50,
      duration: 0.6,
      ease: 'power2.out'
    }, "-=0.3");

  }, { scope: scope });
}