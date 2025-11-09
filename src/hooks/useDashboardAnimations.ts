"use client";

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { RefObject } from 'react';

// This hook will contain all animations for the dashboard page
export function useDashboardAnimations(scope: RefObject<HTMLDivElement>) {
  
  useGSAP(() => {
    
    // --- Stat Card Revolve/Flip-in Animation ---
    // 1. Set the initial state (hidden and rotated)
    gsap.set(".stat-card", { 
      opacity: 0, 
      rotateY: -90, // Start rotated 90 degrees on the Y-axis (like looking at its edge)
      y: 30,        // Start slightly below its final position
      transformOrigin: "center center" // Ensure consistent rotation point
    });

    // 2. Animate to the final state (visible and flat)
    gsap.to(".stat-card", {
      opacity: 1,
      rotateY: 0,        // Rotate back to 0 degrees (flat)
      y: 0,              // Move to its final Y position
      stagger: 0.15,     // Each card animates 0.15 seconds after the previous
      duration: 0.8,     // Duration of the animation for each card
      ease: "back.out(1.7)", // Provides a springy "revolve and settle" effect
      delay: 0.2         // A small initial delay before the first card starts
    });

    // --- Recent Analyses simple fade-in (after the cards) ---
    gsap.from(".recent-analyses", {
      opacity: 0,
      y: 50,
      duration: 0.6,
      delay: 1, // This delay ensures it starts AFTER the stat cards have revolved
      ease: 'power2.out'
    });

  }, { scope: scope }); // Scopes the animation to the `container` ref in DashboardPage
}