"use client";

import { useEffect, useState } from "react";

import { RunHeader } from "@/components/RunHeader";
import { PlayerCard } from "@/components/PlayerCard";
import type { Player } from "@/types/Player";
import type { TeamRow } from "@/types/TeamRow";
import { addPokemonToPlayer } from "@/services/teamPokemon.service";
import { PokemonSpecies } from "@/types/PokemonSpecies";

import {
  loadRun,
  activatePokemon,
  deactivatePokemon,
  togglePokemonDeath,
} from "@/services/run.service";

const RUN_GAME = "Pokémon Sol y Luna";
const RUN_MODE = "Wonderlocke";

export default function RunDashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [team, setTeam] = useState<TeamRow[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const [openPlayerId, setOpenPlayerId] = useState<string | null>(null);

  async function handleAddPokemon({
    species,
    nickname,
    currentPlayer,
  }: {
    species: PokemonSpecies;
    nickname?: string;
    currentPlayer: Player;
  }) {
    if (!runId) return;
    const newPoke = await addPokemonToPlayer({
      runId: runId!,
      playerId: currentPlayer.id,
      species,
      nickname,
    });

    // Refrescamos el estado local
    setTeam((prev) => [...prev, newPoke]);
  }

  useEffect(() => {
    loadRun(RUN_GAME, RUN_MODE).then(({ runId, players, team }) => {
      setRunId(runId);
      setPlayers(players);
      setTeam(team);
    });
  }, []);

  return (
    <div className="p-6">
      <RunHeader game={RUN_GAME} mode={RUN_MODE} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            runId={runId}
            team={team.filter((t) => t.player_id === player.id)}
            open={openPlayerId === player.id}
            onToggleOpen={() =>
              setOpenPlayerId((p) => (p === player.id ? null : player.id))
            }
            onToggleDeath={async (id, status) => {
              const next = status === "alive" ? "dead" : "alive";
              await togglePokemonDeath(id, next);
              setTeam((prev) =>
                prev.map((p) =>
                  p.id === id
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
            }}
            onActivate={async (poke) => {
              if (!runId) return;
              const updated = await activatePokemon(runId, poke);
              setTeam((prev) =>
                prev.map((p) => (p.id === poke.id ? updated : p))
              );
            }}
            onDeactivate={async (id) => {
              const updated = await deactivatePokemon(id);
              setTeam((prev) => prev.map((p) => (p.id === id ? updated : p)));
            }}
          />
        ))}
      </div>
    </div>
  );
}
