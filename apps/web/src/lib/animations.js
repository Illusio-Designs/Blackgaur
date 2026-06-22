// Framer Motion variants — section 11.3
// All animations use transform/opacity only (GPU composited).

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.04 } },
};

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export const bounceIn = {
  initial: { scale: 0.85, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: 'spring', stiffness: 280, damping: 20 },
};

export const taskDone = {
  animate: { scale: [1, 1.12, 0.96, 1] },
  transition: { duration: 0.4, times: [0, 0.3, 0.7, 1] },
};

export const shake = {
  animate: { x: [0, -5, 5, -5, 5, 0] },
  transition: { duration: 0.3 },
};

export const cardHover = {
  whileHover: { scale: 1.015 },
  transition: { duration: 0.15 },
};

export const modalScaleIn = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97, y: 6 },
  transition: { duration: 0.18, ease: 'easeOut' },
};

export const overlayFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
};

export const kanbanSpring = {
  type: 'spring',
  stiffness: 320,
  damping: 26,
};

export const slideInRight = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 24 },
  transition: { duration: 0.25 },
};
