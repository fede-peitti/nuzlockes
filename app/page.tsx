"use client";

import { useEffect, useState } from "react";

import { RunHeader } from "@/components/RunHeader";
import { PlayerCard } from "@/components/PlayerCard";
import type { Player } from "@/types/Player";
import type { TeamRow } from "@/types/TeamRow";
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
        {runId &&
          players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              runId={runId}
              team={team.filter((t) => t.player_id === player.id)}
              open={openPlayerId === player.id}
              onToggleOpen={() =>
                setOpenPlayerId((p) => (p === player.id ? null : player.id))
              }
              onToggleDeath={async (id: string, status: "alive" | "dead") => {
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
              onActivate={async (poke: TeamRow) => {
                if (!runId) return;

                const updated: TeamRow = await activatePokemon(runId, poke);

                setTeam((prev: TeamRow[]) =>
                  prev.map((p) => (p.id === poke.id ? updated : p))
                );
              }}
              onDeactivate={async (id: string) => {
                const updated: TeamRow = await deactivatePokemon(id);

                setTeam((prev: TeamRow[]) =>
                  prev.map((p) => (p.id === id ? updated : p))
                );
              }}
            />
          ))}
      </div>
    </div>
  );
}
