"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { SimEvent, SimEventType } from "@/hooks/use-event-simulation";
import { cn } from "@/lib/utils";

// ─── Palette ──────────────────────────────────────────────────────────────────

const typeMeta: Record<
  SimEventType,
  { border: string; glow: string; bar: string }
> = {
  dust: {
    border: "border-yellow-400/40",
    glow: "shadow-yellow-400/20",
    bar: "bg-yellow-400",
  },
  cloud: {
    border: "border-cyan-400/40",
    glow: "shadow-cyan-400/20",
    bar: "bg-cyan-400",
  },
  overheat: {
    border: "border-rose-500/40",
    glow: "shadow-rose-500/20",
    bar: "bg-rose-500",
  },
};

// ─── Single notification card ─────────────────────────────────────────────────

const AUTO_DISMISS_MS = 6000;

function NotifCard({
  notif,
  onDismiss,
}: {
  notif: SimEvent;
  onDismiss: (id: string) => void;
}) {
  const meta = typeMeta[notif.type];

  // auto-dismiss after AUTO_DISMISS_MS
  useEffect(() => {
    const t = setTimeout(() => onDismiss(notif.id), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [notif.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9, transition: { duration: 0.25 } }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
      className={cn(
        "relative w-80 rounded-2xl border backdrop-blur-xl bg-[#0B1220]/90",
        "shadow-2xl overflow-hidden pointer-events-auto",
        meta.border,
        meta.glow,
        "shadow-lg"
      )}
    >
      {/* Progress bar — shrinks over AUTO_DISMISS_MS */}
      <motion.div
        className={cn("absolute top-0 left-0 h-0.5 rounded-full", meta.bar)}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: AUTO_DISMISS_MS / 1000, ease: "linear" }}
      />

      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Emoji */}
        <span className="text-xl leading-none mt-0.5 shrink-0">{notif.emoji}</span>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm leading-snug">{notif.title}</p>
          <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{notif.message}</p>
        </div>

        {/* Dismiss */}
        <button
          onClick={() => onDismiss(notif.id)}
          className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Notification stack ───────────────────────────────────────────────────────

interface SimNotificationStackProps {
  notifications: SimEvent[];
  onDismiss: (id: string) => void;
}

export function SimNotificationStack({
  notifications,
  onDismiss,
}: SimNotificationStackProps) {
  return (
    /* Fixed top-right, above everything */
    <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2.5 pointer-events-none">
      <AnimatePresence mode="popLayout" initial={false}>
        {notifications.map((n) => (
          <NotifCard key={n.id} notif={n} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
