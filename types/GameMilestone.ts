export type GameMilestoneType = "badge" | "trial" | "z-crystal" | "league";

export type GameMilestone = {
  id: string;
  key: string;
  label: string;
  type: GameMilestoneType;
  order: number;
  icon: string; // emoji por ahora
  isFinal?: boolean;
};
