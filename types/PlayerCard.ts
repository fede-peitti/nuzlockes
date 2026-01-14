import { Player } from "@/types/Player";
import { TeamRow } from "@/types/TeamRow";
export type PlayerCardProps = {
  runId: string;
  player: Player;
  team: TeamRow[];
  open: boolean;
  onToggleOpen: () => void;
  onToggleDeath: (id: string, status: "alive" | "dead") => void;
  onActivate: (poke: TeamRow) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
};
