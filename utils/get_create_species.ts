import { createClient } from "@supabase/supabase-js";
import { normalizePokemonName } from "./normalize";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Obtiene una especie de Pokémon desde la DB o la crea usando PokeAPI si no existe
export async function getOrCreateSpecies(name: string) {
  const normalized = normalizePokemonName(name);

  const { data: species } = await supabase
    .from("pokemon_species")
    .select("*")
    .eq("name", normalized)
    .single();

  if (species) return species;

  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${normalized}`);
  if (!res.ok) throw new Error("Pokémon no existe");

  const poke = await res.json();
  const sprite = poke.sprites?.front_default ?? "";

  const { data: inserted, error } = await supabase
    .from("pokemon_species")
    .insert({
      id: poke.id,
      name: normalized,
      sprite_url: sprite,
    })
    .select()
    .single();

  if (error) throw error;
  return inserted;
}
