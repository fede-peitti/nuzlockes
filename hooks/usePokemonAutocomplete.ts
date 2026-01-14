import { useEffect, useState } from "react";
import { searchPokemonSpecies } from "@/services/pokemon.service";
import { PokemonSpecies } from "@/types/PokemonSpecies";

export function usePokemonAutocomplete(query: string) {
  const [results, setResults] = useState<PokemonSpecies[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await searchPokemonSpecies(query));
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [query]);

  return { results, loading };
}
