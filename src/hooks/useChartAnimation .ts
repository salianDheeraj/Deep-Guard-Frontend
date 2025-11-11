"use client";

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { RefObject } from 'react';

export function useChartAnimation(scope: RefObject<HTMLDivElement>, dependencies: any[]) {
  
  useGSAP(() => {
    const bars = scope.current?.querySelectorAll('.chart-bar');
    
    if (bars && bars.length > 0) {
      gsap.from(bars, {
        scaleY: 0,
        transformOrigin: 'bottom',
        duration: 1.2,
        ease: 'power2.out',
        stagger: 0.005
      });
    }
  }, { 
    scope: scope, 
    dependencies: dependencies,
    revertOnUpdate: true // ✅ Revert and re-run animation when dependencies change
  });
}
