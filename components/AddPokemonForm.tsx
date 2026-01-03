import { useState } from "react";
export function AddPokemonForm({
  onAdd,
}: {
  onAdd: (args: { pokemonName: string; nickname?: string }) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");

  return (
    <div className="space-y-2">
      <input
        placeholder="Pokémon"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border rounded px-2 py-1 w-full"
      />
      <input
        placeholder="Nickname (opcional)"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="border rounded px-2 py-1 w-full"
      />
      <button
        className="border rounded px-3 py-1"
        onClick={async () => {
          if (!name.trim()) return;
          await onAdd({ pokemonName: name, nickname });
          setName("");
          setNickname("");
        }}
      >
        Agregar
      </button>
    </div>
  );
}
