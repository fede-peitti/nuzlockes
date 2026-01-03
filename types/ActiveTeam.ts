import { TeamRow } from "./TeamRow";

export type ActiveTeamProps = {
  team: TeamRow[];
  onToggleDeath: (id: string, status: "alive" | "dead") => void;
};
