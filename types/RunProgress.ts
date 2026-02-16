export type Milestone = {
  id: string;
  key: string;
  label: string;
  type: "trial" | "grand-trial" | "league" | "custom";
  order_index: number;
  icon_type: "emoji" | "image";
  icon_value: string;
  is_final: boolean;
};

export type RunMilestone = {
  id: string;
  milestone: Milestone;
  order_index: number;
};

export type PlayerMilestone = {
  player_id: string;
  milestone_id: string;
  completed_at: string | null;
};

export type RunProgress = {
  milestones: RunMilestone[];
  playerProgress: Record<string, Set<string>>;
};
