import { motion } from "framer-motion";
export function Particles() {
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <motion.span
          key={i}
          className="absolute w-1 h-1 rounded-full bg-yellow-300"
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            x: Math.cos(i) * 14,
            y: Math.sin(i) * 14,
          }}
          transition={{ duration: 0.4 }}
        />
      ))}
    </>
  );
}
