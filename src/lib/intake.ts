// Het advies uit de racketfinder onthouden tot de boeking, zodat de intake niet twee keer hoeft.
// Alleen in deze browser (sessionStorage); het gaat pas naar ons mee als iemand echt boekt.
export type Intake = { answers: Record<string, string>; rackets: { id: string; label: string }[]; current?: string };

const KEY = "racketlab-intake";
export const INTAKE_EVENT = "racketlab-intake";

export function saveIntake(v: Intake) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(v));
  } catch {}
  window.dispatchEvent(new CustomEvent(INTAKE_EVENT, { detail: v }));
}

export function loadIntake(): Intake | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Intake) : null;
  } catch {
    return null;
  }
}
