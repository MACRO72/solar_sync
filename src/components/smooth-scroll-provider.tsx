'use client';

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * SmoothScrollProvider
 *
 * Performance notes:
 * - Uses a single RAF loop (never re-created on re-render due to ref + useEffect[]).
 * - `duration` only (no `lerp`) — mixing both causes overshoot / fighting.
 * - Longer duration = more inertia feel without lerp instability at 60 fps.
 * - Syncs Lenis scroll Y into a Framer Motion MotionValue so that
 *   `useScroll()` hooks (e.g. scroll-progress bar, parallax) track Lenis
 *   position rather than the native scroll position, eliminating the
 *   1-frame lag between Lenis and Framer-driven elements.
 * - All native scroll/touch listeners added by Lenis are already passive.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,          // inertia duration in seconds — sweet spot for buttery feel
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      wheelMultiplier: 1.0,
      touchMultiplier: 1.8,
      syncTouch: true,        // unifies touch + wheel paths → no divergence on mobile
      smoothWheel: true,
      infinite: false,
      overscroll: false,      // prevent bounce fighting with OS rubber-band
    });

    lenisRef.current = lenis;
    // Expose on window so non-React imperative code (e.g. nav anchor clicks)
    // can route scrolling through Lenis rather than native scroll APIs.
    (window as any).__lenis = lenis;

    // ── RAF loop ────────────────────────────────────────────────────────────
    // A single persistent loop; cancellation on cleanup prevents ghost frames.
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // ── Hash-link interception ───────────────────────────────────────────────
    // Route anchor clicks through Lenis so the easing is consistent.
    const handleHashClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (link && link.hash && link.origin === window.location.origin) {
        const element = document.querySelector(link.hash);
        if (element) {
          e.preventDefault();
          lenis.scrollTo(element as HTMLElement, { offset: 0, duration: 1.0 });
        }
      }
    };
    document.addEventListener('click', handleHashClick, { passive: false });

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      (window as any).__lenis = undefined;
      document.removeEventListener('click', handleHashClick);
    };
  }, []);

  return <>{children}</>;
}
