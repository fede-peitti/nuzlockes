"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TeamRow } from "@/types/TeamRow";

export function ActiveSlotSprite({
  poke,
  fainting,
}: {
  poke: TeamRow;
  fainting: boolean;
}) {
  const sprite = poke.pokemon_species?.sprite_url ?? "/placeholder.png";

  return (
    <AnimatePresence mode="wait">
      {!fainting ? (
        <motion.img
          key="alive"
          src={sprite}
          className="w-12 h-12 pixelated"
          initial={{ y: 6, scale: 0.9, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{
            y: 20,
            rotate: 90,
            opacity: 0,
            scale: 0.7,
          }}
        />
      ) : (
        <motion.img
          key="faint"
          src={sprite}
          className="w-12 h-12 pixelated grayscale"
          initial={{ opacity: 1 }}
          animate={{
            y: 24,
            rotate: 90,
            opacity: 0,
            scale: 0.7,
          }}
          transition={{ duration: 0.45 }}
        />
      )}
    </AnimatePresence>
  );
}
