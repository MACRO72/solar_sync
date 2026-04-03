'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={pathname}
        initial="initialState"
        animate="animateState"
        exit="exitState"
        transition={{
          duration: 0.2, // Instant high-velocity transition
          ease: "circOut",
        }}
        variants={{
          initialState: {
            opacity: 0,
            y: 10,
          },
          animateState: {
            opacity: 1,
            y: 0,
          },
          exitState: {
            opacity: 0,
            y: -10,
          },
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
