"use client";

import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  FadeIn                                                             */
/* ------------------------------------------------------------------ */

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  viewOnce?: boolean;
}

export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  y = 18,
  viewOnce = false,
}: FadeInProps) {
  const props = viewOnce
    ? {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, margin: "-60px" },
      }
    : { initial: "hidden" as const, animate: "visible" as const };

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration, delay, ease: "easeOut" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  ScaleIn                                                            */
/* ------------------------------------------------------------------ */

interface ScaleInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  initialScale?: number;
}

export function ScaleIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  initialScale = 0.85,
}: ScaleInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration,
        delay,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  SlideIn                                                            */
/* ------------------------------------------------------------------ */

type Direction = "left" | "right" | "up" | "down";

interface SlideInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: Direction;
  distance?: number;
}

const slideOffset = (dir: Direction, dist: number) => {
  switch (dir) {
    case "left":
      return { x: -dist, y: 0 };
    case "right":
      return { x: dist, y: 0 };
    case "up":
      return { x: 0, y: -dist };
    case "down":
      return { x: 0, y: dist };
  }
};

export function SlideIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  direction = "up",
  distance = 20,
}: SlideInProps) {
  const offset = slideOffset(direction, distance);
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...offset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  StaggerContainer + StaggerItem                                     */
/* ------------------------------------------------------------------ */

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  viewOnce?: boolean;
}

const containerVariants = (
  stagger: number,
  delay: number,
): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

export function StaggerContainer({
  children,
  className,
  stagger = 0.1,
  delay = 0,
  viewOnce = false,
}: StaggerContainerProps) {
  const props = viewOnce
    ? {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: { once: true, margin: "-60px" },
      }
    : { initial: "hidden" as const, animate: "visible" as const };

  return (
    <motion.div
      className={className}
      variants={containerVariants(stagger, delay)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  y?: number;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

export function StaggerItem({ children, className, y }: StaggerItemProps) {
  const variants = y
    ? {
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: "easeOut" as const },
        },
      }
    : itemVariants;

  return (
    <motion.div className={className} variants={variants}>
      {children}
    </motion.div>
  );
}
