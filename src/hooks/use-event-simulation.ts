"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ─── Event types ──────────────────────────────────────────────────────────────

export type SimEventType = "dust" | "cloud" | "overheat";

export interface SimEvent {
  id: string;
  type: SimEventType;
  emoji: string;
  title: string;
  message: string;
  /** ms timestamp when event fired */
  firedAt: number;
}

export interface SimDelta {
  powerFactor: number;       // multiplier 0–1  (1 = no change)
  tempOffset: number;        // °C added on top of real reading
  dustOffset: number;        // µg/m³ added
}

// ─── Event catalogue ──────────────────────────────────────────────────────────

const EVENTS: Record<SimEventType, Omit<SimEvent, "id" | "firedAt">> = {
  dust: {
    type: "dust" as const,
    emoji: "⚠️",
    title: "Dust Accumulation Detected",
    message: "Particulate matter building up. Panel efficiency degrading.",
  },
  cloud: {
    type: "cloud" as const,
    emoji: "☁️",
    title: "Cloud Cover Detected",
    message: "Sudden drop in solar irradiance. Output temporarily reduced.",
  },
  overheat: {
    type: "overheat" as const,
    emoji: "🔥",
    title: "Temperature Rising",
    message: "Panel surface heat exceeding optimal range. Monitor closely.",
  },
};

const EVENT_TYPES: SimEventType[] = ["dust", "cloud", "overheat"];

// ─── Simulation delta targets per event ──────────────────────────────────────

const DELTA_TARGETS: Record<SimEventType, SimDelta> = {
  dust: { powerFactor: 0.78, tempOffset: 3,   dustOffset: 80  },
  cloud: { powerFactor: 0.25, tempOffset: -2,  dustOffset: 10  },
  overheat: { powerFactor: 0.88, tempOffset: 18,  dustOffset: 5   },
};

const NEUTRAL_DELTA: SimDelta = { powerFactor: 1, tempOffset: 0, dustOffset: 0 };

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseEventSimulationResult {
  /** Whether simulation is running */
  active: boolean;
  toggle: () => void;
  /** Current smooth delta to overlay on real sensor data */
  delta: SimDelta;
  /** Queue of recent notifications (newest first) */
  notifications: SimEvent[];
  dismissNotification: (id: string) => void;
  /** Which event type is currently active (null if recovering) */
  currentEvent: SimEventType | null;
}

/** Linearly interpolates between two SimDelta objects by factor t ∈ [0,1] */
function lerpDelta(a: SimDelta, b: SimDelta, t: number): SimDelta {
  return {
    powerFactor: a.powerFactor + (b.powerFactor - a.powerFactor) * t,
    tempOffset:  a.tempOffset  + (b.tempOffset  - a.tempOffset)  * t,
    dustOffset:  a.dustOffset  + (b.dustOffset  - a.dustOffset)  * t,
  };
}

const TRANSITION_MS = 3000; // 3 s ramp-in / ramp-out
const HOLD_MS       = 8000; // 8 s hold at peak
const MIN_GAP_MS    = 10000;
const MAX_GAP_MS    = 20000;

export function useEventSimulation(): UseEventSimulationResult {
  const [active, setActive]             = useState(false);
  const [delta, setDelta]               = useState<SimDelta>(NEUTRAL_DELTA);
  const [notifications, setNotifs]      = useState<SimEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<SimEventType | null>(null);

  // refs to avoid stale closures in intervals
  const activeRef       = useRef(false);
  const deltaRef        = useRef<SimDelta>(NEUTRAL_DELTA);
  const targetDeltaRef  = useRef<SimDelta>(NEUTRAL_DELTA);
  const rafRef          = useRef<number | null>(null);
  const scheduleRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionStart = useRef<number>(0);
  const phase           = useRef<"ramp-in" | "hold" | "ramp-out" | "idle">("idle");

  // keep delta ref synced
  const updateDelta = useCallback((d: SimDelta) => {
    try {
      deltaRef.current = d;
      setDelta({ ...d });
    } catch (e: any) {
      console.error("Simulation Delta Update Failure:", e.message);
    }
  }, []);

  // ── RAF smooth interpolation loop ────────────────────────────────────────
  const stopRaf = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const runInterpolation = useCallback(() => {
    try {
      const now = Date.now();
      const elapsed = now - transitionStart.current;

      if (phase.current === "ramp-in") {
        const t = Math.min(elapsed / TRANSITION_MS, 1);
        updateDelta(lerpDelta(NEUTRAL_DELTA, targetDeltaRef.current, easeInOut(t)));
        if (t >= 1) {
          phase.current = "hold";
          transitionStart.current = now;
          rafRef.current = requestAnimationFrame(runInterpolation);
        } else {
          rafRef.current = requestAnimationFrame(runInterpolation);
        }
      } else if (phase.current === "hold") {
        if (elapsed >= HOLD_MS) {
          phase.current = "ramp-out";
          transitionStart.current = now;
          // capture current peak
          const peak = { ...deltaRef.current };
          targetDeltaRef.current = NEUTRAL_DELTA;
          // start ramp-out with from=peak
          const rampOut = () => {
            try {
              const e2 = Date.now() - transitionStart.current;
              const t2 = Math.min(e2 / TRANSITION_MS, 1);
              updateDelta(lerpDelta(peak, NEUTRAL_DELTA, easeInOut(t2)));
              if (t2 >= 1) {
                phase.current = "idle";
                setCurrentEvent(null);
                scheduleNextEvent();
              } else {
                rafRef.current = requestAnimationFrame(rampOut);
              }
            } catch (err: any) {
              console.error("Simulation Ramp-out Loop Failure:", err.message);
              phase.current = "idle";
              updateDelta(NEUTRAL_DELTA);
            }
          };
          rafRef.current = requestAnimationFrame(rampOut);
        } else {
          rafRef.current = requestAnimationFrame(runInterpolation);
        }
      }
    } catch (err: any) {
      console.error("Simulation Interpolation Loop Failure:", err.message);
      stopRaf();
    }
  }, [updateDelta]);

  // ── Event scheduler ───────────────────────────────────────────────────────
  const scheduleNextEvent = useCallback(() => {
    try {
      if (!activeRef.current) return;
      const gap = MIN_GAP_MS + Math.random() * (MAX_GAP_MS - MIN_GAP_MS);
      scheduleRef.current = setTimeout(() => {
        if (!activeRef.current) return;
        const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
        fireEvent(type);
      }, gap);
    } catch (e: any) {
      console.error("Simulation Scheduler Failure:", e.message);
    }
  }, []);

  const fireEvent = useCallback((type: SimEventType) => {
    try {
      const id = `${type}-${Date.now()}`;
      const event: SimEvent = { ...EVENTS[type], id, firedAt: Date.now() };

      // push notification
      setNotifs((prev) => [event, ...prev].slice(0, 5));
      setCurrentEvent(type);

      // set target delta and start ramp-in
      targetDeltaRef.current = DELTA_TARGETS[type];
      phase.current = "ramp-in";
      transitionStart.current = Date.now();

      stopRaf();
      rafRef.current = requestAnimationFrame(runInterpolation);
    } catch (e: any) {
      console.error("Simulation Event Fire Failure:", e.message);
    }
  }, [runInterpolation]);

  // ── Toggle ────────────────────────────────────────────────────────────────
  const toggle = useCallback(() => {
    try {
      setActive((prev) => {
        const next = !prev;
        activeRef.current = next;
        if (next) {
          scheduleNextEvent();
        } else {
          // stop everything and reset
          if (scheduleRef.current) clearTimeout(scheduleRef.current);
          stopRaf();
          phase.current = "idle";
          setCurrentEvent(null);
          updateDelta(NEUTRAL_DELTA);
          setNotifs([]);
        }
        return next;
      });
    } catch (e: any) {
      console.error("Simulation Toggle Failure:", e.message);
    }
  }, [scheduleNextEvent, updateDelta]);

  const dismissNotification = useCallback((id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      activeRef.current = false;
      if (scheduleRef.current) clearTimeout(scheduleRef.current);
      stopRaf();
    };
  }, []);

  return { active, toggle, delta, notifications, dismissNotification, currentEvent };
}

// ─── Easing util ──────────────────────────────────────────────────────────────
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
