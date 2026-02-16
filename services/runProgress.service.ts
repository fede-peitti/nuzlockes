import { supabase } from "@/lib/supabase";
import {
  RunMilestone,
  PlayerMilestone,
  RunProgress,
} from "@/types/RunProgress";

export async function getRunProgress(runId: string): Promise<RunProgress> {
  // Retrieve milestones
  const { data: runMilestonesRaw, error: milestonesError } = await supabase
    .from("run_milestones")
    .select(
      `
      id,
      order_index,
      milestone:milestone_id (
        id,
        key,
        label,
        type,
        order_index,
        icon_type,
        icon_value,
        is_final
      )
    `,
    )
    .eq("run_id", runId)
    .order("order_index");

  if (milestonesError) throw milestonesError;

  const milestones: RunMilestone[] = (runMilestonesRaw ?? []).map(
    (rm: any) => ({
      id: rm.id,
      order_index: rm.order_index,
      milestone: rm.milestone ?? null,
    }),
  );

  // Retrieve player progress
  const { data: playerMilestonesRaw, error: playerError } = await supabase
    .from("player_milestones")
    .select(
      `
      player_id,
      milestone_id,
      completed_at
    `,
    )
    .eq("run_id", runId);

  if (playerError) throw playerError;

  const playerMilestones = playerMilestonesRaw as PlayerMilestone[];

  // Build player progress map
  const playerProgress: Record<string, Set<string>> = {};

  for (const pm of playerMilestones) {
    if (!playerProgress[pm.player_id]) {
      playerProgress[pm.player_id] = new Set();
    }

    if (pm.completed_at) {
      playerProgress[pm.player_id].add(pm.milestone_id);
    }
  }

  return {
    milestones,
    playerProgress,
  };
}
