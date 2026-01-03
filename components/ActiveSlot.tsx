"use client";

import { motion, AnimatePresence } from "framer-motion";
import { TeamRow } from "@/types/TeamRow";
import { Particles } from "@/components/animations/Particles";
import { useState, useEffect } from "react";

export function ActiveSlot({ poke }: { poke: TeamRow | null }) {
  const [showPokeball, setShowPokeball] = useState(false);

  // Cada vez que cambia poke de null → algo, mostramos la pokebola un instante
  useEffect(() => {
    if (poke) {
      setShowPokeball(true);
      const timeout = setTimeout(() => setShowPokeball(false), 300); // dura 300ms
      return () => clearTimeout(timeout);
    }
  }, [poke]);

  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      {/* Pokébola cerrada si no hay Pokémon */}
      <AnimatePresence mode="wait">
        {!poke && (
          <motion.img
            key="pokeball-closed"
            src="/pokeball-closed.png"
            className="w-12 h-12"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Si hay Pokémon */}
      {poke && (
        <>
          {/* Pokébola abierta */}
          <AnimatePresence>
            {showPokeball && (
              <motion.img
                key={`pokeball-open-${poke.id}`}
                src="/pokeball-open.png"
                className="absolute inset-0 w-12 h-12"
                initial={{ scale: 0.9, rotate: 0, opacity: 0 }}
                animate={{ scale: 1.1, rotate: -15, opacity: 1 }}
                exit={{ scale: 0.8, rotate: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              />
            )}
          </AnimatePresence>

          {/* Partículas */}
          <AnimatePresence>
            {showPokeball && <Particles key={`particles-${poke.id}`} />}
          </AnimatePresence>

          {/* Pokémon */}
          <AnimatePresence>
            <motion.img
              key={`poke-${poke.id}`}
              src={poke.pokemon_species?.sprite_url ?? "/placeholder.png"}
              className="relative w-14 h-14 pixelated"
              initial={{ y: 10, scale: 0, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 10, scale: 0, opacity: 0 }}
              transition={{
                delay: 0.2, // aparezca justo después de la Pokébola
                type: "spring",
                stiffness: 260,
                damping: 18,
              }}
            />
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
