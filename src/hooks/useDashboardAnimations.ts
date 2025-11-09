"use client";

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { RefObject } from 'react';

// This hook will contain all animations for the dashboard page
export function useDashboardAnimations(scope: RefObject<HTMLDivElement>) {
  
  useGSAP(() => {
    // Stat Card Animation
    gsap.from(".stat-card", {
      opacity: 0,
      y: 50,
      stagger: 0.2,
      duration: 0.5,
      ease: 'power2.out'
    });

  }, { scope: scope }); // Pass the scope from the page
}