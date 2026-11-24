// Shared Framer Motion variants. Every usage should still gate through
// usePrefersReducedMotion() at the call site, e.g.:
//   initial={prefersReducedMotion ? false : fadeUp.initial}
//   animate={prefersReducedMotion ? false : fadeUp.animate}
//   transition={prefersReducedMotion ? undefined : fadeUp.transition}

export const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" },
};

export const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4, ease: "easeOut" },
};

export const staggerDelay = (index, base = 0.06) => ({
    transition: { duration: 0.45, ease: "easeOut", delay: index * base },
});

// For below-the-fold content, spread this onto a motion.* element instead of
// initial/animate — it plays once when scrolled into view.
export const revealOnView = (prefersReducedMotion, extra = {}) =>
    prefersReducedMotion
        ? {}
        : {
              initial: { opacity: 0, y: 28, rotateX: 10, transformPerspective: 1000 },
              whileInView: { opacity: 1, y: 0, rotateX: 0, transformPerspective: 1000 },
              viewport: { once: true, margin: "-80px" },
              transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], ...extra },
          };
