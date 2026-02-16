"use client";

import { motion, AnimatePresence } from "framer-motion";

export function ActiveSlotKillButton({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          onClick={onClick}
          className="
            absolute
            -top-2
            -right-2
            z-50
            w-5
            h-5
            rounded-full
            bg-red-500
            text-white
            text-xs
            flex
            items-center
            justify-center
            shadow-md
          "
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
        >
          ×
        </motion.button>
      )}
    </AnimatePresence>
  );
}
