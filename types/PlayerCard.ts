import { Player } from "@/types/Player";
import { TeamRow } from "@/types/TeamRow";
export type PlayerCardProps = {
  runId: string;
  player: Player;
  team: TeamRow[];
  open: boolean;
  onToggleOpen: () => void;
  onToggleDeath: ...
  onActivate: ...
  onDeactivate: ...
};

