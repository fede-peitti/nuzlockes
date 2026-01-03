import { TeamRow } from "@/types/TeamRow";

export function DeadPokemonGrid({
  dead,
  onToggleDeath,
}: {
  dead: TeamRow[];
  onToggleDeath: (id: string, status: "alive" | "dead") => void;
}) {
  return (
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
              className="relative cursor-pointer opacity-40 grayscale"
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
  );
}
