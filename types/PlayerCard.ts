import { Player } from "@/types/Player";
import { TeamRow } from "@/types/TeamRow";
import { RunProgress } from "@/types/RunProgress";
import { PokemonSpecies } from "@/types/PokemonSpecies";

export type PlayerCardProps = {
  player: Player;
  team: TeamRow[];
  progress: RunProgress;

  open: boolean;

  onToggleOpen: () => void;

  onToggleDeath: (id: string, status: "alive" | "dead") => void;

  onActivate: (poke: TeamRow) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;

  onAddPokemon: (args: {
    species: PokemonSpecies;
    nickname?: string;
    player: Player;
  }) => Promise<void>;

  onDeletePokemon: (pokemonId: string) => Promise<void>;
};
