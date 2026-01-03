import { TeamRow } from "@/types/TeamRow";

// Normaliza una fila de Supabase para el equipo de Pokémon
export function normalizeTeamRow(row: any): TeamRow {
  return {
    ...row,
    pokemon_species: Array.isArray(row.pokemon_species)
      ? row.pokemon_species[0] ?? null
      : row.pokemon_species ?? null,
  };
}

// Convierte un nombre de Pokémon a un slug compatible con PokeAPI
export function normalizePokemonName(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/♀/g, "-f")
    .replace(/♂/g, "-m")
    .replace(/['’.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-");
}
