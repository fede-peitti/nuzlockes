"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const RUN_GAME = "Pokémon Sol y Luna";
const RUN_MODE = "Wonderlocke";

function normalizePokemonName(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-");
}

type Player = { id: string; name: string; color: string };
type TeamRow = {
  id: string;
  status: "alive" | "dead";
  nickname: string | null;
  player_id: string;
  pokemon_species: { name: string; sprite_url: string };
};

async function getOrCreateSpecies(name: string) {
  const normalized = normalizePokemonName(name);

  // 1️⃣ buscar local
  const { data: species } = await supabase
    .from("pokemon_species")
    .select("*")
    .eq("name", normalized)
    .single();

  if (species) return species;

  // 2️⃣ fetch PokeAPI
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${normalized}`);
  if (!res.ok) throw new Error("Pokémon no existe");
  const poke = await res.json();
  const sprite = poke.sprites?.front_default ?? "";

  // 3️⃣ guardar
  const { data: inserted, error } = await supabase
    .from("pokemon_species")
    .insert({
      id: poke.id, // opcional si tu PK es autoincremental; si no, úsalo
      name: normalized,
      sprite_url: sprite,
    })
    .select()
    .single();

  if (error) throw error;
  return inserted;
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
      run_id: runId,
      player_id: playerId,
      species_id: species.id,
      nickname,
      status: "alive",
    })
    .select(
      `
      id,
      status,
      nickname,
      player_id,
      pokemon_species (
        name,
        sprite_url
      )
    `
    )
    .single();

  if (error) {
    if ((error as any).code === "23505") {
      throw new Error("Ese Pokémon ya fue capturado en esta run");
    }
    throw error;
  }

  return inserted as TeamRow;
}

function PlayerBox({
  alive,
  dead,
  onToggleDeath,
  onClose,
}: {
  alive: TeamRow[];
  dead: TeamRow[];
  onToggleDeath: (pokemonId: string, currentStatus: "alive" | "dead") => void;
  onClose: () => void;
}) {
  return (
    <div className="mt-4 border rounded-md p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Caja del jugador</h3>
        <button className="text-sm" onClick={onClose}>
          ✕
        </button>
      </div>

      <div>
        <h4 className="text-xs text-muted-foreground mb-2">Vivos</h4>
        <div className="flex gap-3 flex-wrap">
          {alive.map((poke) => {
            const label = poke.nickname || poke.pokemon_species.name;
            return (
              <div
                key={poke.id}
                className="relative cursor-pointer transition"
                title={label}
                onClick={() => onToggleDeath(poke.id, poke.status)}
              >
                <img
                  src={poke.pokemon_species.sprite_url}
                  alt={label}
                  className="w-20 h-20 pixelated"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-xs text-muted-foreground mb-2">
          Muertos ({dead.length})
        </h4>
        <div className="flex gap-3 flex-wrap">
          {dead.map((poke) => {
            const label = poke.nickname || poke.pokemon_species.name;
            return (
              <div
                key={poke.id}
                className="relative cursor-pointer transition opacity-40 grayscale"
                title={label}
                onClick={() => onToggleDeath(poke.id, poke.status)}
              >
                <img
                  src={poke.pokemon_species.sprite_url}
                  alt={label}
                  className="w-20 h-20 pixelated"
                />
                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                  ☠
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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

    // 3️⃣ traer equipo completo
    const { data: teamData } = await supabase
      .from("team_pokemon")
      .select(
        `
        id,
        status,
        nickname,
        player_id,
        pokemon_species (
          name,
          sprite_url
        )
      `
      )
      .eq("run_id", run.id);

    setTeam((teamData ?? []) as TeamRow[]);
  }

  async function toggleDeath(
    pokemonId: string,
    currentStatus: "alive" | "dead"
  ) {
    await supabase
      .from("team_pokemon")
      .update({
        status: currentStatus === "alive" ? "dead" : "alive",
      })
      .eq("id", pokemonId);

    setTeam((prev) =>
      prev.map((p) =>
        p.id === pokemonId
          ? { ...p, status: p.status === "alive" ? "dead" : "alive" }
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
          const activeTeam = alive.slice(0, 6);
          const dead = playerTeam.filter((p) => p.status === "dead");
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
                      +
                    </button>
                  </div>
                </div>

                {/* Equipo principal (hasta 6 vivos) */}
                <div className="flex gap-3 flex-wrap">
                  {activeTeam.map((poke) => {
                    const label = poke.nickname || poke.pokemon_species.name;
                    return (
                      <div
                        key={poke.id}
                        className={`relative cursor-pointer transition ${
                          poke.status === "dead" ? "opacity-40 grayscale" : ""
                        }`}
                        title={label}
                        onClick={() => toggleDeath(poke.id, poke.status)}
                      >
                        <img
                          src={poke.pokemon_species.sprite_url}
                          alt={label}
                          className="w-20 h-20 pixelated"
                        />
                        {poke.status === "dead" && (
                          <div className="absolute inset-0 flex items-center justify-center text-2xl">
                            ☠
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {activeTeam.length === 0 && (
                    <div className="text-xs text-muted-foreground">
                      Sin vivos en el equipo
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

                      // Refrescar por las dudas
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
