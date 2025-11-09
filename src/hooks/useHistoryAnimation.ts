"use client";

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { RefObject } from 'react';

export function useHistoryAnimation(
  scope: RefObject<HTMLTableSectionElement>, 
  dependencies: any[] // The data that, when changed, triggers the animation
) {
  
  useGSAP(() => {
    // 1. Set the initial state for all rows
    gsap.set(".table-row", { 
      opacity: 0, 
      y: 30 
    });

    // 2. Animate to the final state
    gsap.to(".table-row", {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
      stagger: 0.05 // Animate each row 0.05s after the previous
    });

  }, { scope: scope, dependencies: [dependencies] }); // Re-run when the data changes
}