"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const noop = () => () => {};

/** prefers-reduced-motion, safe for SSR */
export function useReducedMotion() {
  return useSyncExternalStore(
    noop,
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** Adds `is-in` once the element enters the viewport. */
export function useInView<T extends Element>(threshold = 0.18) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es[0].isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

/**
 * Runs `fn` on scroll / resize, throttled to one call per animation frame.
 * (The original ran its whole scroll engine on every frame, forever.)
 */
export function useScrollFrame(fn: () => void, deps: unknown[] = []) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    let raf = 0;
    const run = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        fnRef.current();
      });
    };
    run();
    addEventListener("scroll", run, { passive: true });
    addEventListener("resize", run);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", run);
      removeEventListener("resize", run);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
