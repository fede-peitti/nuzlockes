import { PokemonSpecies } from "./PokemonSpecies";

// Modela un Pokemon en el equipo
export type TeamRow = {
  id: string;
  run_id: string;
  player_id: string;
  species_id: number;
  nickname: string | null;
  status: "alive" | "dead";
  is_active: boolean;
  active_slot: number | null;
  pokemon_species?: PokemonSpecies;
};
