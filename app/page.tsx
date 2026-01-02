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

export default function RunDashboard() {
  const [players, setPlayers] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
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

  async function getOrCreateSpecies(name: string) {
    const normalized = normalizePokemonName(name);

    // 1️⃣ buscar local
    let { data: species } = await supabase
      .from("pokemon_species")
      .select("*")
      .eq("name", normalized)
      .single();

    if (species) return species;

    // 2️⃣ fetch PokeAPI
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${normalized}`);

    if (!res.ok) throw new Error("Pokémon no existe");

    const poke = await res.json();

    const sprite = poke.sprites.front_default;

    // 3️⃣ guardar
    const { data: inserted } = await supabase
      .from("pokemon_species")
      .insert({
        id: poke.id,
        name: normalized,
        sprite_url: sprite,
      })
      .select()
      .single();

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

    const { error } = await supabase.from("team_pokemon").insert({
      run_id: runId,
      player_id: playerId,
      species_id: species.id,
      nickname,
    });

    if (error) {
      if (error.code === "23505") {
        throw new Error("Ese Pokémon ya fue capturado en esta run");
      }
      throw error;
    }
  }

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

    const playersFlat = runPlayers?.map((rp) => rp.players) ?? [];
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

    setTeam(teamData ?? []);
  }

  async function toggleDeath(pokemonId: string, currentStatus: string) {
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

          return (
            <Card key={player.id}>
              <CardContent className="p-4 space-y-4">
                <h2
                  className="text-xl font-semibold"
                  style={{ color: player.color }}
                >
                  {player.name}
                </h2>

                <div className="flex gap-3 flex-wrap">
                  {playerTeam.map((poke) => {
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
                </div>

                <input
                  placeholder="Nombre del Pokémon"
                  value={pokemonNameByPlayer[player.id] || ""}
                  onChange={(e) =>
                    setPokemonNameByPlayer((prev) => ({
                      ...prev,
                      [player.id]: e.target.value,
                    }))
                  }
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
                />

                <button
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
                      await addPokemon({
                        runId: runId!,
                        playerId: player.id,
                        pokemonName: pokemonNameByPlayer[player.id],
                        nickname: nicknameByPlayer[player.id],
                      });

                      setTeam((prev) => [
                        ...prev,
                        {
                          id: crypto.randomUUID(),
                          status: "alive",
                          nickname: nicknameByPlayer[player.id],
                          player_id: player.id,
                          pokemon_species: {
                            name: pokemonNameByPlayer[player.id].toLowerCase(),
                            sprite_url:
                              "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png",
                          },
                        },
                      ]);

                      setPokemonNameByPlayer((p) => ({
                        ...p,
                        [player.id]: "",
                      }));
                      setNicknameByPlayer((p) => ({ ...p, [player.id]: "" }));
                      setErrorByPlayer((p) => ({ ...p, [player.id]: "" }));

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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
