import { TeamRow } from "@/types/TeamRow";

export function usePokemonLabel(poke: TeamRow): string {
  if (poke.nickname?.trim()) return poke.nickname;

  if (poke.pokemon_species?.name) {
    return poke.pokemon_species.name;
  }

  return "???";
}
