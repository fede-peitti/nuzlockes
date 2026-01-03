import { PokemonSpecies } from "./pokemon_speacies";

// Modela un Pokemon en el equipo
export type TeamRow = {
  id: string;
  status: "alive" | "dead";
  nickname: string | null;
  player_id: string;
  is_active: boolean;
  active_slot: number | null;
  pokemon_species: PokemonSpecies | null;
};
