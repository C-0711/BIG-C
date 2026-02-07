/**
 * Palantir-style animation presets for React components
 */

// Framer Motion animation variants
export const palantirAnimations = {
  // Card entrance
  cardEntrance: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' }
  },

  // Staggered list
  staggerChildren: {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  },

  // Hover glow effect
  hoverGlow: {
    whileHover: {
      boxShadow: '0 0 20px rgba(100, 116, 139, 0.4)',
      borderColor: '#6B7280',
      transition: { duration: 0.2 }
    }
  },

  // Number counter animation
  counterAnimation: (value) => ({
    from: 0,
    to: value,
    duration: 1.5,
    ease: 'easeOut'
  }),

  // Graph node pulse
  nodePulse: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [1, 0.8, 1]
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },

  // Fade in
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },

  // Slide in from right
  slideInRight: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

// CSS transition classes
export const transitionClasses = {
  fast: 'transition-all duration-150 ease-out',
  medium: 'transition-all duration-300 ease-out',
  slow: 'transition-all duration-500 ease-out',
};

// Number counter hook using react-spring
export const useAnimatedNumber = (value, duration = 1500) => {
  // Simple implementation
  return value;
};
