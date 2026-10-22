"use client";

import { useEffect } from "react";

const KEY = "racketlab-coachcode";
const DAYS = 30;

/** Onthoudt een coachcode uit de link (?code=SANNE) 30 dagen, zodat de verkoop ook later aan de coach gekoppeld wordt. */
export function CodeCatcher() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ code: code.toUpperCase(), until: Date.now() + DAYS * 864e5 }));
    } catch {}
  }, []);
  return null;
}

export function rememberedCode(): string {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return "";
    const { code, until } = JSON.parse(raw) as { code: string; until: number };
    return until > Date.now() ? code : "";
  } catch {
    return "";
  }
}
