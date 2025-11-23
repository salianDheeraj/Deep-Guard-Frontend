"use client";

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { RefObject } from 'react';

export function useAccountPageAnimations(scope: RefObject<HTMLElement>) {

 useGSAP(() => {
    // Ensure the scope is defined before trying to find elements within it
    if (!scope.current) return;
 gsap.from(".account-header > *", { opacity: 0,
      y: 20,
      duration: 0.6,
       stagger: 0.1,
      ease: "power3.out",
      scope: scope.current // Ensure animations are scoped
    });

    gsap.from(".account-card", {
      opacity: 0,
      y: 30,
      duration: 0.7,
      stagger: 0.2,
      ease: "power3.out",
      delay: 0.3, // Start after header
      scope: scope.current // Ensure animations are scoped
    });

    // 2. Input Field Focus Glow
    const inputs = gsap.utils.toArray<HTMLInputElement | HTMLTextAreaElement>("input[type='text'], input[type='email'], input[type='password']", scope.current);
    inputs.forEach(input => {
      // Set initial state for the focus animation (e.g., no shadow)
      gsap.set(input, { boxShadow: "0 0 0px rgba(66, 153, 225, 0)" });

      input.addEventListener('focus', () => {
        gsap.to(input, {
          boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.5)", // Blue glow
          borderColor: "#4299e1", // Tailwind's blue-500
          duration: 0.3,
          ease: "power2.out"
        });
      });

      input.addEventListener('blur', () => {
        gsap.to(input, {
          boxShadow: "0 0 0px rgba(66, 153, 225, 0)", // Remove glow
          borderColor: "#d1d5db", // Tailwind's gray-300
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });

    // 3. Toggle Switch Bounce (This needs to be integrated into the component state for real clicks)
    // For now, the toggle switch animation logic is best handled *inside* the ToggleSwitch component
    // itself, as it relies on state changes. We'll leave it out of this hook for now to avoid complexity.

    // 4. Save/Cancel Buttons Hover (Fixed using closure to store animation instance)
    const actionButtons = gsap.utils.toArray<HTMLElement>(".action-button", scope.current);
    actionButtons.forEach(button => {
        // Store the animation instance in a variable
      const hoverAnimation = gsap.to(button, {
        scale: 1.02,
        duration: 0.2,
        ease: "power1.out",
        paused: true,
      }).reverse(); // Initialize in reversed state

      button.addEventListener('mouseenter', () => hoverAnimation.play()); // Use the stored instance
      button.addEventListener('mouseleave', () => hoverAnimation.reverse()); // Use the stored instance
    });

    // 5. Danger Zone Buttons Hover (Subtle Shake) (Fixed using closure)
    const dangerButtons = gsap.utils.toArray<HTMLElement>(".danger-button", scope.current);
    dangerButtons.forEach(button => {
        // Store the animation instance in a variable
      const shakeAnimation = gsap.to(button, {
        x: -2, // Move left slightly
        yoyo: true, // Go back and forth
        repeat: 1, // Shake twice (left-right-left)
        duration: 0.1,
        ease: "power1.inOut",
        paused: true,
      }).reverse(); // Initialize in reversed state

      button.addEventListener('mouseenter', () => shakeAnimation.play()); // Use the stored instance
      button.addEventListener('mouseleave', () => shakeAnimation.reverse()); // Use the stored instance
    });

  }, { scope: scope, revertOnUpdate: true }); // revertOnUpdate is good for managing multiple GSAP instances
}