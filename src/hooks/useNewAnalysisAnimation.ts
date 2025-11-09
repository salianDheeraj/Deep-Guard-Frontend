"use client";

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { RefObject } from 'react';

export function useNewAnalysisAnimation(
  scope: RefObject<HTMLDivElement>, 
  isAnalyzing: boolean
) {
  
  useGSAP(() => {
    if (isAnalyzing) {
      // Start the frame counting animation
      gsap.to(".frame-counter", {
        innerText: 120,
        duration: 4.8, // Match the 5-second analysis
        ease: "none",
        round: true, // Make sure it's whole numbers
      });

      // Start the frame stack animation
      gsap.fromTo(".frame-card", 
        { 
          y: 100,
          opacity: 0,
          scale: 0.8
        },
        { 
          y: (i) => -i * 10,  // Stacks them up
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: {
            each: 0.2,
            repeat: -1, // Loop forever
          }
        }
      );
    }
  }, { scope: scope, dependencies: [isAnalyzing] }); // Re-run when isAnalyzing changes
}