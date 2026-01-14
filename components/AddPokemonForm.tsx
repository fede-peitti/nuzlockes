"use client";

import { useState } from "react";
import { PokemonAutocomplete } from "@/components/PokemonAutocomplete";
import { PokemonSpecies } from "@/types/PokemonSpecies";
import { SelectedPokemonCard } from "@/components/SelectedPokemonCard";

export function AddPokemonForm({
  onAdd,
}: {
  onAdd: (args: {
    species: PokemonSpecies;
    nickname?: string;
  }) => Promise<void>;
}) {
  const [selected, setSelected] = useState<PokemonSpecies | null>(null);
  const [nickname, setNickname] = useState("");

  return (
    <div className="space-y-3">
      <PokemonAutocomplete
        onSelect={(p) => {
          setSelected(p);
        }}
      />

      {selected && (
        <SelectedPokemonCard
          pokemon={selected}
          nickname={nickname}
          onNicknameChange={setNickname}
          onConfirm={async () => {
            await onAdd({
              species: selected,
              nickname: nickname || undefined,
            });

            setSelected(null);
            setNickname("");
          }}
        />
      )}
    </div>
  );
}
