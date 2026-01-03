import { TeamRow } from "@/types/TeamRow";

type Props = {
  poke: TeamRow;
  size?: number;
  grayscale?: boolean;
  overlay?: React.ReactNode;
  onClick?: () => void;
};

export function PokemonSprite({
  poke,
  size = 80,
  grayscale = false,
  overlay,
  onClick,
}: Props) {
  const label = poke.nickname || poke.pokemon_species?.name || "???";
  const sprite = poke.pokemon_species?.sprite_url ?? "/placeholder.png";

  return (
    <div
      className={`relative cursor-pointer transition ${
        grayscale ? "opacity-40 grayscale" : ""
      }`}
      title={label}
      onClick={onClick}
      style={{ width: size, height: size }}
    >
      <img src={sprite} alt={label} className="pixelated w-full h-full" />

      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center">
          {overlay}
        </div>
      )}
    </div>
  );
}
