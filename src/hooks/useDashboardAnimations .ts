"use client";

import { useEffect } from 'react';
import { debug } from '@/lib/logger';
import gsap from 'gsap';
import { RefObject } from 'react';

export function useDashboardAnimations(scope: RefObject<HTMLDivElement>) {
  
  useEffect(() => {
    // Keep checking until cards are found
    let attempts = 0;
    const maxAttempts = 20;
    
    const checkAndAnimate = () => {
      attempts++;
      
      if (!scope.current) {
        if (attempts < maxAttempts) {
          setTimeout(checkAndAnimate, 100);
        }
        return;
      }
      
      const cards = scope.current.querySelectorAll('.stat-card');
      
      if (cards && cards.length > 0) {
        debug('✅ Animating', cards.length, 'cards');
        
        // Animate cards
        gsap.fromTo(cards, 
          {
            opacity: 0,
            y: 30,
            rotateY: -90,
            transformOrigin: "center center"
          },
          {
            opacity: 1,
            y: 0,
            rotateY: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: 'back.out(1.7)',
            delay: 0.1
          }
        );
      } else if (attempts < maxAttempts) {
        // Cards not found yet, try again
        setTimeout(checkAndAnimate, 100);
      }
    };
    
    // Start checking
    const timer = setTimeout(checkAndAnimate, 50);
    
    return () => clearTimeout(timer);
  }, [scope]);
}
