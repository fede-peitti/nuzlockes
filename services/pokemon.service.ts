import { supabase } from "@/lib/supabase";
import { PokemonSpecies } from "@/types/PokemonSpecies";

export async function searchPokemonSpecies(query: string) {
  if (!query || query.length < 2) return [];

  const { data, error } = await supabase
    .from("pokemon_species")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("id")
    .limit(10);

  if (error) throw error;
  return data as PokemonSpecies[];
}
