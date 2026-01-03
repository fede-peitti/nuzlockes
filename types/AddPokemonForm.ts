export type AddPokemonFormProps = {
  onSubmit: (pokemonName: string, nickname?: string) => Promise<void>;
};
