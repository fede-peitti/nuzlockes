"use client";

import { motion } from "framer-motion";

export function ActiveSlotEmpty() {
  return (
    <motion.img
      src="/pokeball-closed.png"
      className="w-10 h-10 opacity-70"
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.7 }}
    />
  );
}
