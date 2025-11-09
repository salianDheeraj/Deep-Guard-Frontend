"use client";

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { RefObject } from 'react';

// This hook animates the chart bars
export function useChartAnimation(scope: RefObject<HTMLDivElement>, dependencies: any[]) {
  
  useGSAP(() => {
    gsap.from(".chart-bar", { // This is the target class
      scaleY: 0,
      transformOrigin: 'bottom',
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.01 // Fast stagger for many bars
    });
  }, { scope: scope, dependencies: dependencies }); // Re-run if dependencies change
}