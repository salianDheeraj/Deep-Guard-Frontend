"use client";

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { RefObject } from 'react';

// This hook animates the results page once the data is loaded
export function useAnalysisResultsAnimation(
  scope: RefObject<HTMLDivElement>, // The element to animate inside
  isDataLoaded: boolean           // The trigger
) {
  
  useGSAP(() => {
    // Wait for data to be ready
    if (!isDataLoaded) return; 

    const tl = gsap.timeline({ delay: 0.2 });
    
    // 1. Animate the "FAKE" card
    tl.from(".deepfake-alert-card", { 
      opacity: 0, 
      scale: 0.8, 
      duration: 0.7, 
      ease: 'back.out(1.7)' 
    });
    
    // 2. Animate the Frame Analysis, Chart, and Understanding sections
    tl.from([".frame-analysis-section", ".confidence-chart", ".understanding-confidence"], {
      opacity: 0,
      y: 30,
      duration: 0.5,
      stagger: 0.2, // Animate them 0.2s apart
      ease: 'power2.out'
    }, "-=0.3"); // Overlap with the end of the first animation

  }, { 
    scope: scope, 
    dependencies: [isDataLoaded] // Re-run this animation when data loads
  });
}