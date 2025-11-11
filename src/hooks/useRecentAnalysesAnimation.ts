"use client";

import { useEffect } from 'react';
import gsap from 'gsap';
import { RefObject } from 'react';

export function useRecentAnalysesAnimation(scope: RefObject<HTMLDivElement>) {
  
  useEffect(() => {
    // Keep checking until items are found
    let attempts = 0;
    const maxAttempts = 30; // Increase attempts
    
    const checkAndAnimate = () => {
      attempts++;
      
      if (!scope.current) {
        if (attempts < maxAttempts) {
          setTimeout(checkAndAnimate, 100);
        }
        return;
      }
      
      // Find the Link items
      const items = scope.current.querySelectorAll('a');
      
      if (items && items.length > 0) {
        console.log('✅ Animating', items.length, 'recent analyses');
        
        // Make sure items are visible first (safety fallback)
        items.forEach(item => {
          (item as HTMLElement).style.opacity = '1';
        });
        
        // Then animate them
        gsap.fromTo(items,
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
            stagger: 0.08,
            ease: 'power2.out',
            delay: 0.2
          }
        );
      } else if (attempts < maxAttempts) {
        console.log(`⏳ No items yet (attempt ${attempts}/${maxAttempts})`);
        setTimeout(checkAndAnimate, 100);
      } else {
        console.warn('❌ Timeout: No analyses found after', maxAttempts, 'attempts');
      }
    };
    
    // Start checking after small delay
    const timer = setTimeout(checkAndAnimate, 100);
    
    return () => clearTimeout(timer);
  }, [scope]);
}
