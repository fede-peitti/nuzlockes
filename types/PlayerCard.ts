import { Player } from "@/types/Player";
import { TeamRow } from "@/types/TeamRow";
export type PlayerCardProps = {
  player: Player;
  team: TeamRow[];
  open: boolean;
  onToggleOpen: () => void;

  onAddPokemon: (args: {
    pokemonName: string;
    nickname?: string;
  }) => Promise<void>;

  onToggleDeath: (id: string, status: "alive" | "dead") => Promise<void>;
  onActivate: (poke: TeamRow) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
};
