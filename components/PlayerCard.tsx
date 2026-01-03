"use client";

import { PlayerCardProps } from "@/types/PlayerCard";
import { PlayerBox } from "@/components/PlayerBox";
import { AddPokemonForm } from "@/components/AddPokemonForm";
import { PokemonSprite } from "@/components/PokemonSprite";

export function PlayerCard({
  player,
  team,
  open,
  onToggleOpen,
  onAddPokemon,
  onToggleDeath,
  onActivate,
  onDeactivate,
}: PlayerCardProps) {
  const alive = team.filter((p) => p.status === "alive");
  const dead = team.filter((p) => p.status === "dead");
  const activeTeam = alive.filter((p) => p.is_active);

  return (
    <div className="border rounded p-3 space-y-3">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggleOpen}
      >
        <h3 className="font-semibold">{player.name}</h3>
        <span className="text-xs text-muted-foreground">☠ {dead.length}</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {activeTeam.map((poke) => {
          const label = poke.nickname || poke.pokemon_species?.name || "???";

          return (
            <PokemonSprite
              key={poke.id}
              poke={poke}
              onClick={() => onToggleDeath(poke.id, poke.status)}
            />
          );
        })}
      </div>
      {open && <AddPokemonForm onAdd={onAddPokemon} />}

      {open && (
        <PlayerBox
          alive={alive}
          dead={dead}
          onToggleDeath={onToggleDeath}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
          onClose={onToggleOpen}
        />
      )}
    </div>
  );
}
