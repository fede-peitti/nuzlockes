import { TeamRow } from "@/types/teamrow";

// Muestra la caja del jugador
export function PlayerBox({
  alive,
  dead,
  onToggleDeath,
  onActivate,
  onDeactivate,
  onClose,
}: {
  alive: TeamRow[];
  dead: TeamRow[];
  onToggleDeath: (pokemonId: string, currentStatus: "alive" | "dead") => void;
  onActivate: (poke: TeamRow) => Promise<void>;
  onDeactivate: (pokeId: string) => Promise<void>;
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
            const label = poke.nickname || poke.pokemon_species?.name || "???";
            const isActive = poke.is_active && poke.active_slot != null;

            return (
              <div key={poke.id} className="space-y-1">
                <div
                  className="relative cursor-pointer transition"
                  title={label}
                  onClick={() => onToggleDeath(poke.id, poke.status)}
                >
                  <img
                    src={poke.pokemon_species?.sprite_url ?? "/placeholder.png"}
                    alt={label}
                    className="w-20 h-20 pixelated"
                  />
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    className={`px-2 py-1 rounded border ${
                      isActive ? "bg-yellow-100" : ""
                    }`}
                    onClick={async () => {
                      try {
                        if (isActive) await onDeactivate(poke.id);
                        else await onActivate(poke);
                      } catch (e: any) {
                        alert(e.message);
                      }
                    }}
                  >
                    ⭐ {isActive ? "Activo" : "Activar"}
                  </button>
                </div>
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
            const label = poke.nickname || poke.pokemon_species?.name || "???";

            return (
              <div
                key={poke.id}
                className="relative cursor-pointer transition opacity-40 grayscale"
                title={label}
                onClick={() => onToggleDeath(poke.id, poke.status)}
              >
                <img
                  src={poke.pokemon_species?.sprite_url ?? "/placeholder.png"}
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
