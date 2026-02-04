import { Variants } from 'framer-motion';

// Card animations
export const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      duration: 0.4, 
      ease: 'easeOut' 
    } 
  },
  exit: { 
    opacity: 0, 
    y: -10, 
    scale: 0.95, 
    transition: { 
      duration: 0.2 
    } 
  },
  hover: {
    y: -4,
    transition: { 
      duration: 0.2 
    }
  }
};

// Stagger container for lists
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.05
    } 
  }
};

// Dramatic reveal for important moments
export const dramaticReveal: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8, 
    filter: 'blur(10px)' 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    filter: 'blur(0px)', 
    transition: { 
      duration: 0.6, 
      ease: 'easeOut' 
    } 
  }
};

// Fade in from different directions
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: 'easeOut' } 
  }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: 'easeOut' } 
  }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.4, ease: 'easeOut' } 
  }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.4, ease: 'easeOut' } 
  }
};

// Scale animations
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      type: 'spring', 
      stiffness: 260, 
      damping: 20 
    } 
  }
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      type: 'spring', 
      stiffness: 400, 
      damping: 15 
    } 
  }
};

// Pulse animation for glowing effects
export const pulseGlow: Variants = {
  initial: {
    boxShadow: '0 0 20px hsl(var(--bb-gold) / 0.3)'
  },
  animate: {
    boxShadow: [
      '0 0 20px hsl(var(--bb-gold) / 0.3)',
      '0 0 40px hsl(var(--bb-gold) / 0.6)',
      '0 0 20px hsl(var(--bb-gold) / 0.3)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Spotlight reveal
export const spotlightReveal: Variants = {
  hidden: { 
    clipPath: 'circle(0% at 50% 50%)',
    opacity: 0
  },
  visible: { 
    clipPath: 'circle(100% at 50% 50%)',
    opacity: 1,
    transition: { 
      duration: 0.8, 
      ease: 'easeOut' 
    } 
  }
};

// Card flip for reveals
export const cardFlip: Variants = {
  hidden: { 
    rotateY: 180,
    opacity: 0
  },
  visible: { 
    rotateY: 0,
    opacity: 1,
    transition: { 
      duration: 0.6, 
      ease: 'easeOut' 
    } 
  }
};

// Bounce in
export const bounceIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.3 
  },
  visible: { 
    opacity: 1, 
    scale: 1, 
    transition: { 
      type: 'spring', 
      stiffness: 500, 
      damping: 25 
    } 
  }
};

// Float animation
export const float: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Shimmer effect
export const shimmer: Variants = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Avatar status ring pulse
export const statusRingPulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// List item animations
export const listItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  }
};

// Page transitions
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

// Shake animation for errors or emphasis
export const shake: Variants = {
  shake: {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.4 }
  }
};

// Slide in from sides
export const slideInRight: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    x: '100%', 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

export const slideInLeft: Variants = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    x: '-100%', 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

// Countdown/timer pulse
export const timerPulse: Variants = {
  pulse: {
    scale: [1, 1.1, 1],
    transition: { duration: 0.3 }
  }
};

// Winner celebration
export const winnerCelebration: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatDelay: 1.5
    }
  }
};
