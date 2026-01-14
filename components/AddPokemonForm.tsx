"use client";

import { useState } from "react";
import { PokemonAutocomplete } from "@/components/PokemonAutocomplete";
import { PokemonSpecies } from "@/types/PokemonSpecies";

export function AddPokemonForm({
  onAdd,
}: {
  onAdd: (args: { pokemonName: string; nickname?: string }) => Promise<void>;
}) {
  const [selected, setSelected] = useState<PokemonSpecies | null>(null);
  const [nickname, setNickname] = useState("");

  return (
    <div className="space-y-2">
      <PokemonAutocomplete
        onSelect={(p) => {
          setSelected(p);
        }}
      />

      <input
        placeholder="Nickname (opcional)"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="border rounded px-2 py-1 w-full"
      />

      <button
        className="border rounded px-3 py-1 w-full disabled:opacity-50"
        disabled={!selected}
        onClick={async () => {
          if (!selected) return;

          await onAdd({
            pokemonName: selected.name,
            nickname: nickname || undefined,
          });

          setSelected(null);
          setNickname("");
        }}
      >
        Agregar
      </button>
    </div>
  );
}
