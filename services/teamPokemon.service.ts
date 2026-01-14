import { supabase } from "@/lib/supabase";
import { PokemonSpecies } from "@/types/PokemonSpecies";
import { TeamRow } from "@/types/TeamRow";

export async function addPokemonToPlayer({
  runId,
  playerId,
  species,
  nickname,
}: {
  runId: string;
  playerId: string;
  species: PokemonSpecies;
  nickname?: string;
}): Promise<TeamRow> {
  const { data: activeAlive, error } = await supabase
    .from("team_pokemon")
    .select("active_slot")
    .eq("run_id", runId)
    .eq("player_id", playerId)
    .eq("status", "alive")
    .eq("is_active", true);

  if (error) throw error;

  const usedSlots = new Set(activeAlive.map((p) => p.active_slot));
  const hasFreeSlot = usedSlots.size < 6;

  let active_slot: number | null = null;
  let is_active = false;

  if (hasFreeSlot) {
    for (let i = 1; i <= 6; i++) {
      if (!usedSlots.has(i)) {
        active_slot = i;
        is_active = true;
        break;
      }
    }
  }

  const { data: insertedData, error: insertError } = await supabase
    .from("team_pokemon")
    .insert({
      run_id: runId,
      player_id: playerId,
      species_id: species.id,
      nickname,
      status: "alive",
      is_active,
      active_slot,
    })
    .select("*")
    .single();

  if (insertError) throw insertError;

  return insertedData as TeamRow;
}
