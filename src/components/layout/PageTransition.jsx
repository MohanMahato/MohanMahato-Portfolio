
import { motion, useReducedMotion } from 'framer-motion'

export default function PageTransition({ children }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 0, y: 16 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.45,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  )
}
