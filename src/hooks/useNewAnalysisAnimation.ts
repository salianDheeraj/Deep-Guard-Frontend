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
      // 1. Animate the frame counter text
      gsap.to(".frame-counter", {
        innerText: 30,
        duration: 2.8, // <-- REDUCED from 4.8s
        ease: "none",
        round: true, 
      });

      // 2. Animate the stack of cards
      gsap.fromTo(".frame-card", 
        { 
          y: 100,
          opacity: 0,
          scale: 0.8
        },
        { 
          y: (i) => -i * 10,
          opacity: 1,
          scale: 1,
          duration: 0.4, // <-- REDUCED from 0.5s
          ease: "power2.out",
          stagger: {
            each: 0.1, // <-- REDUCED from 0.2s
            repeat: -1, 
          }
        }
      );
    }
  }, { scope: scope, dependencies: [isAnalyzing] });
}