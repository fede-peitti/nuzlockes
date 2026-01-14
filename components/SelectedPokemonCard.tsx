import { PokemonSpecies } from "@/types/PokemonSpecies";

export function SelectedPokemonCard({
  pokemon,
  nickname,
  onNicknameChange,
  onConfirm,
}: {
  pokemon: PokemonSpecies;
  nickname: string;
  onNicknameChange: (v: string) => void;
  onConfirm: () => void;
}) {
  return (
    <div className="border rounded-md p-3 flex gap-3 items-center bg-white">
      <img
        src={pokemon.sprite_url}
        className="w-16 h-16"
        style={{ imageRendering: "pixelated" }}
      />

      <div className="flex-1 space-y-2">
        <div className="capitalize font-semibold">{pokemon.name}</div>

        <input
          placeholder="Nickname (opcional)"
          value={nickname}
          onChange={(e) => onNicknameChange(e.target.value)}
          className="border rounded px-2 py-1 w-full text-sm"
        />

        <button
          onClick={onConfirm}
          className="border rounded px-3 py-1 text-sm w-full"
        >
          Agregar
        </button>
      </div>
    </div>
  );
}
