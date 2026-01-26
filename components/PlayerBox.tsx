import { TeamRow } from "@/types/TeamRow";
import { AlivePokemonGrid } from "./AlivePokemonGrid";
import { DeadPokemonGrid } from "./DeadPokemonGrid";
import { PlayerBoxHeader } from "./PlayerBoxHeader";

export function PlayerBox({
  alive,
  dead,
  onToggleDeath,
  onActivate,
  onDeactivate,
  onClose,
  onDeletePokemon,
}: {
  alive: TeamRow[];
  dead: TeamRow[];
  onToggleDeath: (pokemonId: string, currentStatus: "alive" | "dead") => void;
  onActivate: (poke: TeamRow) => Promise<void>;
  onDeactivate: (pokeId: string) => Promise<void>;
  onClose: () => void;
  onDeletePokemon: (pokeId: string) => Promise<void>;
}) {
  return (
    <div className="mt-4 border rounded-md p-4 space-y-4">
      <PlayerBoxHeader onClose={onClose} />

      <AlivePokemonGrid
        alive={alive}
        onToggleDeath={onToggleDeath}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
        onDeletePokemon={onDeletePokemon}
      />

      <DeadPokemonGrid dead={dead} onToggleDeath={onToggleDeath} />
    </div>
  );
}
