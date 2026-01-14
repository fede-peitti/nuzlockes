import { Player } from "@/types/Player";
import { TeamRow } from "@/types/TeamRow";
import { PokemonSpecies } from "@/types/PokemonSpecies";
export type PlayerCardProps = {
  runId: string;
  player: Player;
  team: TeamRow[];
  open: boolean;
  onToggleOpen: () => void;
  onAddPokemon: (args: {
    species: PokemonSpecies;
    nickname?: string;
  }) => Promise<void>;
  onToggleDeath: ...
  onActivate: ...
  onDeactivate: ...
};

