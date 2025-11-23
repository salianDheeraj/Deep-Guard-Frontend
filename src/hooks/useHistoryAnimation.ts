"use client";

import { useEffect } from 'react';
import { debug } from '@/lib/logger';
import gsap from 'gsap';
import { RefObject } from 'react';

export function useHistoryAnimation(
  scope: RefObject<HTMLTableSectionElement>, 
  dependencies: any[]
) {
  
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 30;
    let animationComplete = false;
    
    const checkAndAnimate = () => {
      attempts++;
      
      if (!scope.current) {
        if (attempts < maxAttempts) {
          setTimeout(checkAndAnimate, 100);
        }
        return;
      }
      
      const rows = scope.current.querySelectorAll('tr');
      
      if (rows && rows.length > 0 && !animationComplete) {
        debug('✅ Animating', rows.length, 'table rows');
        
        // Kill any existing animations on these rows
        gsap.killTweensOf(rows);
        
        // Animate rows
        gsap.fromTo(rows,
          {
            opacity: 0,
            x: -30,
            scale: 0.98
          },
          {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: 'power2.out',
            delay: 0.05,
            onComplete: () => {
              animationComplete = true;
            }
          }
        );
      } else if (attempts < maxAttempts && !animationComplete) {
        setTimeout(checkAndAnimate, 100);
      }
    };
    
    const timer = setTimeout(checkAndAnimate, 50);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      if (scope.current) {
        const rows = scope.current.querySelectorAll('tr');
        gsap.killTweensOf(rows); // Stop any running animations
      }
    };
  }, dependencies);
}
