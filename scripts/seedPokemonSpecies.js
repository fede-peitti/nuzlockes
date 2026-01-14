import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  // Lista de Pokémon PokéAPI
  const listRes = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000");
  const list = await listRes.json();

  for (const p of list.results) {
    const res = await fetch(p.url);
    const data = await res.json();

    // si no tiene sprite, saltar
    if (!data.sprites?.front_default) continue;

    const row = {
      id: data.id,
      name: data.name,
      sprite_url: data.sprites.front_default,
    };

    const { error } = await supabase
      .from("pokemon_species")
      .upsert(row, { onConflict: "id" });

    if (error) {
      console.error("Error:", row.name, error.message);
    } else {
      console.log("OK:", row.name);
    }
  }
}

run().then(() => {
  console.log("Seed terminado");
  process.exit(0);
});
