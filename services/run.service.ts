import { createClient } from "@supabase/supabase-js";
import { TeamRow } from "@/types/TeamRow";
import { Player } from "@/types/Player";
import { normalizeTeamRow } from "@/utils/normalize";
import { firstFreeSlot } from "@/utils/first_free_slot";
import { getOrCreateSpecies } from "@/utils/get_create_species";

type TeamRowRaw = Omit<TeamRow, "pokemon_species"> & {
  pokemon_species:
    | {
        name: string;
        sprite_url: string;
      }[]
    | null;
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Cargar partida
export async function loadRun(game: string, mode: string) {
  const { data: run } = await supabase
    .from("runs")
    .select("id")
    .eq("game", game)
    .eq("mode", mode)
    .single();

  if (!run) throw new Error("Run no encontrada");

  const { data: runPlayers } = await supabase
    .from("run_players")
    .select("players (id, name, color)")
    .eq("run_id", run.id);

  const players: Player[] = (runPlayers ?? []).map((rp: any) => rp.players);

  const { data: teamData } = await supabase
    .from("team_pokemon")
    .select(
      `
      id,
      status,
      nickname,
      player_id,
      is_active,
      active_slot,
      pokemon_species: pokemon_species!team_pokemon_species_id_fkey (
        name,
        sprite_url
      )
    `
    )
    .eq("run_id", run.id);

  const team = (teamData ?? []).map(normalizeTeamRow);

  return { runId: run.id, players, team };
}

// Agregar Pokémon al equipo
export async function addPokemonToTeam(params: {
  runId: string;
  playerId: string;
  pokemonName: string;
  nickname?: string;
}) {
  const species = await getOrCreateSpecies(params.pokemonName);

  const { data, error } = await supabase
    .from("team_pokemon")
    .insert({
      run_id: params.runId,
      player_id: params.playerId,
      pokemon_species_id: species.id,
      nickname: params.nickname ?? null,
      status: "alive",
      is_active: false,
      active_slot: null,
    })
    .select(
      `
      id,
      status,
      nickname,
      player_id,
      is_active,
      active_slot,
      pokemon_species (name, sprite_url)
    `
    )
    .single();

  if (error) {
    if ((error as any).code === "23505") {
      throw new Error("Ese Pokémon ya fue capturado en esta run");
    }
    throw error;
  }

  return normalizeTeamRow(data as TeamRowRaw);
}

// Añadir Pokémon al equipo
export async function activatePokemon(runId: string, poke: TeamRow) {
  if (poke.status !== "alive") {
    throw new Error("Solo podés activar pokes vivos");
  }

  const { data: activeRows } = await supabase
    .from("team_pokemon")
    .select("active_slot")
    .eq("run_id", runId)
    .eq("player_id", poke.player_id)
    .eq("is_active", true);

  const used = (activeRows ?? [])
    .map((r: any) => r.active_slot)
    .filter((s: number | null) => s != null) as number[];

  const slot = firstFreeSlot(used);
  if (!slot) throw new Error("Equipo lleno (6)");

  const { data, error } = await supabase
    .from("team_pokemon")
    .update({ is_active: true, active_slot: slot })
    .eq("id", poke.id)
    .select(
      `
      id, status, nickname, player_id, is_active, active_slot,
      pokemon_species (name, sprite_url)
    `
    )
    .single();

  if (error) throw error;
  return normalizeTeamRow(data as TeamRowRaw);
}

// Desactivar Pokémon del equipo
export async function deactivatePokemon(pokeId: string) {
  const { data, error } = await supabase
    .from("team_pokemon")
    .update({ is_active: false, active_slot: null })
    .eq("id", pokeId)
    .select(
      `
      id, status, nickname, player_id, is_active, active_slot,
      pokemon_species (name, sprite_url)
    `
    )
    .single();

  if (error) throw error;
  return normalizeTeamRow(data as TeamRowRaw);
}

// Muerte
export async function togglePokemonDeath(
  pokemonId: string,
  nextStatus: "alive" | "dead"
) {
  await supabase
    .from("team_pokemon")
    .update({
      status: nextStatus,
      ...(nextStatus === "dead" ? { is_active: false, active_slot: null } : {}),
    })
    .eq("id", pokemonId);
}
