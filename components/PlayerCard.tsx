import { ActiveSlot } from "@/components/ActiveSlot";
import { PlayerBox } from "@/components/PlayerBox";
import { PlayerCardProps } from "@/types/PlayerCard";
import { AddPokemonForm } from "@/components/AddPokemonForm";
import { addPokemonToPlayer } from "@/services/teamPokemon.service";

export function PlayerCard({
  runId,
  player,
  team,
  open,
  onToggleOpen,
  onToggleDeath,
  onActivate,
  onDeactivate,
}: PlayerCardProps) {
  const alive = team.filter((p) => p.status === "alive");
  const dead = team.filter((p) => p.status === "dead");

  const activeBySlot = new Map(
    alive
      .filter((p) => p.is_active && p.active_slot != null)
      .map((p) => [p.active_slot!, p])
  );

  return (
    <div className="border rounded-md p-4 space-y-3">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggleOpen}
      >
        <h3 className="font-semibold">{player.name}</h3>
        <span className="text-xs text-muted-foreground">☠ {dead.length}</span>
      </div>

      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((slot) => (
          <ActiveSlot key={slot} poke={activeBySlot.get(slot) ?? null} />
        ))}
      </div>

      {open && (
        <>
          <AddPokemonForm
            onAdd={async ({ species, nickname }) => {
              await addPokemonToPlayer({
                runId,
                playerId: player.id,
                species,
                nickname,
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
          />
        </>
      )}
    </div>
  );
}
