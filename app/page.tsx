"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";

import { Player } from "@/types/player";

import { TeamRow } from "@/types/teamrow";
import { normalizeTeamRow } from "@/utils/normalize";
import { firstFreeSlot } from "@/utils/first_free_slot";
import { PlayerBox } from "@/components/player_box";
import { getOrCreateSpecies } from "@/utils/get_create_species";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RUN_GAME = "Pokémon Sol y Luna";
const RUN_MODE = "Wonderlocke";

export default function RunDashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [runId, setRunId] = useState<string | null>(null);

  const [pokemonNameByPlayer, setPokemonNameByPlayer] = useState<
    Record<string, string>
  >({});
  const [nicknameByPlayer, setNicknameByPlayer] = useState<
    Record<string, string>
  >({});
  const [errorByPlayer, setErrorByPlayer] = useState<Record<string, string>>(
    {}
  );
  const [openPlayerId, setOpenPlayerId] = useState<string | null>(null);

  useEffect(() => {
    loadRun();
  }, []);

  async function loadRun() {
    // 1️⃣ obtener run
    const { data: run } = await supabase
      .from("runs")
      .select("id")
      .eq("game", RUN_GAME)
      .eq("mode", RUN_MODE)
      .single();

    if (!run) return;
    setRunId(run.id);

    // 2️⃣ traer jugadores de la run
    const { data: runPlayers } = await supabase
      .from("run_players")
      .select("players (id, name, color)")
      .eq("run_id", run.id);

    const playersFlat: Player[] = (runPlayers ?? []).map(
      (rp: any) => rp.players
    );
    setPlayers(playersFlat);

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
      .eq("run_id", run.id)
      .returns<TeamRow[]>();

    setTeam((teamData ?? []).map(normalizeTeamRow));
  }

  async function addPokemon({
    runId,
    playerId,
    pokemonName,
    nickname,
  }: {
    runId: string;
    playerId: string;
    pokemonName: string;
    nickname?: string;
  }) {
    const species = await getOrCreateSpecies(pokemonName);

    const { data: inserted, error } = await supabase
      .from("team_pokemon")
      .insert({
        /* ... */
      })
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
      .single()
      .returns<TeamRow>();

    if (error) {
      if ((error as any).code === "23505") {
        throw new Error("Ese Pokémon ya fue capturado en esta run");
      }
      throw error;
    }

    return inserted as TeamRow;
  }

  // ✅ Activar consultando DB para evitar colisión de slots
  async function activatePokemon(poke: TeamRow) {
    if (!runId) throw new Error("Run no cargada");
    if (poke.status !== "alive")
      throw new Error("Solo podés activar pokes vivos");

    // 1) Consultar slots activos reales en DB
    const { data: activeRows, error: qError } = await supabase
      .from("team_pokemon")
      .select("active_slot")
      .eq("run_id", runId)
      .eq("player_id", poke.player_id)
      .eq("is_active", true);

    if (qError) throw qError;

    const used = (activeRows ?? [])
      .map((r: any) => r.active_slot)
      .filter((s: number | null) => s != null) as number[];

    // 2) Elegir primer slot libre
    let slot = firstFreeSlot(used);
    if (!slot) throw new Error("Equipo lleno (6). Liberá un slot.");

    // 3) Intentar activar y, si hay colisión (23505), reintentar con slots recalculados
    const tryUpdate = async (targetSlot: number) => {
      return await supabase
        .from("team_pokemon")
        .update({ is_active: true, active_slot: targetSlot })
        .eq("id", poke.id)
        .select(
          `
          id, status, nickname, player_id, is_active, active_slot,
          pokemon_species (name, sprite_url)
        `
        )
        .single();
    };

    let { data, error } = await tryUpdate(slot);

    if (error && (error as any).code === "23505") {
      const { data: activeRows2 } = await supabase
        .from("team_pokemon")
        .select("active_slot")
        .eq("run_id", runId)
        .eq("player_id", poke.player_id)
        .eq("is_active", true);

      const used2 = (activeRows2 ?? [])
        .map((r: any) => r.active_slot)
        .filter((s: number | null) => s != null) as number[];

      const slot2 = firstFreeSlot(used2);
      if (!slot2) throw new Error("Equipo lleno (6). Liberá un slot.");

      const res2 = await tryUpdate(slot2);
      data = res2.data;
      error = res2.error;
    }

    if (error) throw error;

    if (!data) throw new Error("No data returned");

    const normalized = normalizeTeamRow(data);

    setTeam((prev) => prev.map((p) => (p.id === poke.id ? normalized : p)));
  }

  async function deactivatePokemon(pokeId: string) {
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

    if (!data) throw new Error("No data returned");

    const normalized = normalizeTeamRow(data);

    setTeam((prev) => prev.map((p) => (p.id === pokeId ? normalized : p)));
  }

  async function toggleDeath(
    pokemonId: string,
    currentStatus: "alive" | "dead"
  ) {
    const next = currentStatus === "alive" ? "dead" : "alive";

    // Update estado
    await supabase
      .from("team_pokemon")
      .update({ status: next })
      .eq("id", pokemonId);

    // Si muere, lo removemos del equipo activo
    if (next === "dead") {
      await supabase
        .from("team_pokemon")
        .update({ is_active: false, active_slot: null })
        .eq("id", pokemonId);
    }

    setTeam((prev) =>
      prev.map((p) =>
        p.id === pokemonId
          ? {
              ...p,
              status: next,
              ...(next === "dead"
                ? { is_active: false, active_slot: null }
                : {}),
            }
          : p
      )
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        {RUN_GAME} · {RUN_MODE}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {players.map((player) => {
          const playerTeam = team.filter((p) => p.player_id === player.id);
          const alive = playerTeam.filter((p) => p.status === "alive");
          const dead = playerTeam.filter((p) => p.status === "dead");
          const activeTeam = alive.filter((p) => p.is_active); // sin orden
          const deaths = dead.length;

          return (
            <Card key={player.id}>
              <CardContent className="p-4 space-y-4">
                {/* Header con nombre y conteo de muertes */}
                <div className="flex items-center justify-between">
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: player.color }}
                  >
                    {player.name}
                  </h2>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      Muertes: {deaths}
                    </span>
                    <button
                      className="text-lg"
                      title="Ver caja"
                      onClick={() =>
                        setOpenPlayerId((prev) =>
                          prev === player.id ? null : player.id
                        )
                      }
                    >
                      🧰
                    </button>
                  </div>
                </div>

                {/* Equipo principal: SOLO activos (máximo 6) y se puede matar/revivir con click */}
                <div className="flex gap-3 flex-wrap">
                  {activeTeam.map((poke) => {
                    const label =
                      poke.nickname || poke.pokemon_species?.name || "???";
                    return (
                      <div
                        key={poke.id}
                        className="relative cursor-pointer transition"
                        title={label}
                        onClick={() => toggleDeath(poke.id, poke.status)}
                      >
                        <img
                          src={
                            poke.pokemon_species?.sprite_url ??
                            "/placeholder.png"
                          }
                          alt={label}
                          className="w-20 h-20 pixelated"
                        />
                      </div>
                    );
                  })}
                  {activeTeam.length === 0 && (
                    <div className="text-xs text-muted-foreground">
                      Sin activos
                    </div>
                  )}
                </div>

                {/* Inputs para agregar */}
                <input
                  placeholder="Nombre del Pokémon"
                  value={pokemonNameByPlayer[player.id] || ""}
                  onChange={(e) =>
                    setPokemonNameByPlayer((prev) => ({
                      ...prev,
                      [player.id]: e.target.value,
                    }))
                  }
                  className="w-full border rounded px-2 py-1"
                />
                <input
                  placeholder="Nickname (opcional)"
                  value={nicknameByPlayer[player.id] || ""}
                  onChange={(e) =>
                    setNicknameByPlayer((prev) => ({
                      ...prev,
                      [player.id]: e.target.value,
                    }))
                  }
                  className="w-full border rounded px-2 py-1"
                />
                <button
                  className="border rounded px-3 py-1"
                  onClick={async () => {
                    const name = pokemonNameByPlayer[player.id]?.trim();

                    if (!name) {
                      setErrorByPlayer((p) => ({
                        ...p,
                        [player.id]: "Tenés que escribir un Pokémon",
                      }));
                      return;
                    }

                    try {
                      const inserted = await addPokemon({
                        runId: runId!,
                        playerId: player.id,
                        pokemonName: name,
                        nickname: nicknameByPlayer[player.id],
                      });

                      // Optimistic update con el row real
                      setTeam((prev) => [...prev, inserted]);

                      setPokemonNameByPlayer((p) => ({
                        ...p,
                        [player.id]: "",
                      }));
                      setNicknameByPlayer((p) => ({ ...p, [player.id]: "" }));
                      setErrorByPlayer((p) => ({ ...p, [player.id]: "" }));

                      // Refresco por las dudas
                      loadRun();
                    } catch (e: any) {
                      setErrorByPlayer((p) => ({
                        ...p,
                        [player.id]: e.message,
                      }));
                    }
                  }}
                >
                  Agregar
                </button>
                {errorByPlayer[player.id] && (
                  <div className="text-xs text-red-500">
                    {errorByPlayer[player.id]}
                  </div>
                )}

                {/* Caja del jugador seleccionado */}
                {openPlayerId === player.id && (
                  <PlayerBox
                    alive={alive}
                    dead={dead}
                    onToggleDeath={toggleDeath}
                    onActivate={activatePokemon}
                    onDeactivate={deactivatePokemon}
                    onClose={() => setOpenPlayerId(null)}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
