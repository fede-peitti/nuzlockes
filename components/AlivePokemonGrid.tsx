import { TeamRow } from "@/types/TeamRow";
import { PokemonSprite } from "./PokemonSprite";

export function AlivePokemonGrid({
  alive,
  onToggleDeath,
  onActivate,
  onDeactivate,
}: {
  alive: TeamRow[];
  onToggleDeath: (id: string, status: "alive" | "dead") => void;
  onActivate: (poke: TeamRow) => Promise<void>;
  onDeactivate: (id: string) => Promise<void>;
}) {
  return (
    <div>
      <h4 className="text-xs text-muted-foreground mb-2">Vivos</h4>
      <div className="flex gap-3 flex-wrap">
        {alive.map((poke) => {
          const label = poke.nickname || poke.pokemon_species?.name || "???";
          const isActive = poke.is_active && poke.active_slot != null;

          return (
            <div key={poke.id} className="space-y-1">
              <div
                className="relative cursor-pointer"
                title={label}
                onClick={() => onToggleDeath(poke.id, poke.status)}
              >
                <PokemonSprite
                  poke={poke}
                  onClick={() => onToggleDeath(poke.id, poke.status)}
                />
              </div>

              <button
                className={`text-xs px-2 py-1 rounded border ${
                  isActive ? "bg-yellow-100" : ""
                }`}
                onClick={async () => {
                  if (isActive) await onDeactivate(poke.id);
                  else await onActivate(poke);
                }}
              >
                ⭐ {isActive ? "Activo" : "Activar"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
