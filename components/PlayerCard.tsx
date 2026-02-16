import { ActiveSlot } from "@/components/active-slot/ActiveSlot";
import { PlayerBox } from "@/components/PlayerBox";
import { PlayerCardProps } from "@/types/PlayerCard";
import { AddPokemonForm } from "@/components/AddPokemonForm";
import { PlayerProgress } from "@/components/PlayerProgress";

export function PlayerCard({
  player,
  team,
  progress,
  open,
  onToggleOpen,
  onToggleDeath,
  onActivate,
  onDeactivate,
  onAddPokemon,
  onDeletePokemon,
}: PlayerCardProps) {
  const alive = team.filter((p) => p.status === "alive");
  const dead = team.filter((p) => p.status === "dead");

  const activeBySlot = new Map(
    alive
      .filter((p) => p.is_active && p.active_slot != null)
      .map((p) => [p.active_slot!, p]),
  );

  return (
    <div className="border rounded-md p-4 space-y-3">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggleOpen}
      >
        <div>
          <h3 className="font-semibold">{player.name}</h3>

          {progress && (
            <PlayerProgress playerId={player.id} progress={progress} />
          )}
        </div>

        <span className="text-xs text-muted-foreground">☠ {dead.length}</span>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((slot) => {
          const poke = activeBySlot.get(slot) ?? null;

          return (
            <ActiveSlot
              key={slot}
              poke={poke}
              onKill={
                poke
                  ? async (pokemonId) => {
                      await onToggleDeath(pokemonId, "alive");
                    }
                  : undefined
              }
            />
          );
        })}
      </div>

      {open && (
        <>
          <AddPokemonForm
            onAdd={async ({ species, nickname }) => {
              await onAddPokemon({
                species,
                nickname,
                player,
              });
            }}
          />

          <PlayerBox
            alive={alive}
            dead={dead}
            onToggleDeath={onToggleDeath}
            onActivate={onActivate}
            onDeactivate={onDeactivate}
            onClose={onToggleOpen}
            onDeletePokemon={onDeletePokemon}
          />
        </>
      )}
    </div>
  );
}
