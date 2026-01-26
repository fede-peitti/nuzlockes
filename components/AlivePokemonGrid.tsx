"use client";

import React from "react";
import { TeamRow } from "@/types/TeamRow";
import { PokemonSprite } from "./PokemonSprite";
import { usePokemonLabel } from "@/hooks/usePokemonLabel";
import { PokemonKebab } from "./PokemonKebab";

export function AlivePokemonGrid({
  alive,
  onToggleDeath,
  onActivate,
  onDeactivate,
  onDeletePokemon,
}: {
  alive: TeamRow[];
  onToggleDeath: (id: string, status: "alive" | "dead") => void;
  onActivate: (poke: TeamRow) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
  onDeletePokemon: (id: string) => Promise<void>;
}) {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  return (
    <div>
      <h4 className="text-xs text-muted-foreground mb-2">Vivos</h4>

      <div className="flex gap-4 flex-wrap" onClick={() => setOpenMenuId(null)}>
        {alive.map((poke) => {
          const label = usePokemonLabel(poke);
          const isActive = poke.is_active && poke.active_slot != null;

          return (
            <div key={poke.id} className="flex flex-col items-center gap-200">
              {/* sprite + kebab */}
              <div className="relative" title={label}>
                <div onClick={() => onToggleDeath(poke.id, poke.status)}>
                  <PokemonSprite poke={poke} />
                </div>

                <PokemonKebab
                  open={openMenuId === poke.id}
                  onOpen={() => setOpenMenuId(poke.id)}
                  onClose={() => setOpenMenuId(null)}
                  onDelete={() => onDeletePokemon(poke.id)}
                />
              </div>

              {/* activar */}
              <button
                className={`text-xs py-1 rounded border w-16 ${
                  isActive ? "bg-yellow-100" : ""
                }`}
                onClick={async () => {
                  if (isActive) await onDeactivate(poke.id);
                  else await onActivate(poke);
                }}
              >
                ⭐ {isActive ? "Activo" : "Activar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
