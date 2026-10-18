"use client";

import { useRef } from "react";
import gsap from "gsap";

/**
 * Horizontaal slepen met de muis, met uitlopen na loslaten. Touch en touchpad scrollen gewoon native.
 * De pointer wordt pas vastgepakt na 4px beweging, zodat een gewone klik op een racket blijft werken.
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const d = useRef({ active: false, moved: false, x: 0, left: 0, lastX: 0, lastT: 0, v: 0 });

  const onPointerDown = (e: React.PointerEvent<T>) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) return;
    gsap.killTweensOf(ref.current);
    d.current = { active: true, moved: false, x: e.clientX, left: ref.current.scrollLeft, lastX: e.clientX, lastT: performance.now(), v: 0 };
  };
  const onPointerMove = (e: React.PointerEvent<T>) => {
    const s = d.current;
    const el = ref.current;
    if (!s.active || !el) return;
    const dx = e.clientX - s.x;
    if (!s.moved && Math.abs(dx) > 4) {
      s.moved = true;
      el.style.scrollSnapType = "none";
      el.setPointerCapture(e.pointerId);
    }
    if (!s.moved) return;
    el.scrollLeft = s.left - dx;
    const now = performance.now();
    s.v = (e.clientX - s.lastX) / Math.max(1, now - s.lastT);
    s.lastX = e.clientX;
    s.lastT = now;
  };
  const onPointerUp = (e: React.PointerEvent<T>) => {
    const s = d.current;
    const el = ref.current;
    if (!s.active || !el) return;
    s.active = false;
    if (!s.moved) return;
    el.releasePointerCapture(e.pointerId);
    const restore = () => {
      el.style.scrollSnapType = "";
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || Math.abs(s.v) < 0.05) return restore();
    // Uitlopen begrensd tot één schermbreedte, zodat een harde zwaai niet de hele rij overslaat
    const fling = Math.max(-el.clientWidth, Math.min(el.clientWidth, s.v * 450));
    const target = Math.max(0, Math.min(el.scrollWidth - el.clientWidth, el.scrollLeft - fling));
    gsap.to(el, { scrollLeft: target, duration: 0.9, ease: "power3.out", onComplete: restore });
  };
  // Een klik direct na slepen niet doorlaten (anders opent er per ongeluk een racket)
  const onClickCapture = (e: React.MouseEvent) => {
    if (d.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      d.current.moved = false;
    }
  };

  return {
    ref,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onClickCapture, onDragStart: (e: React.DragEvent) => e.preventDefault() },
  };
}
