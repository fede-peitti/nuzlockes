export type RunHeaderProps = {
  game: string;
  mode: string;
};

export function RunHeader({ game, mode }: RunHeaderProps) {
  return (
    <h1 className="text-3xl font-bold mb-6">
      {game} · {mode}
    </h1>
  );
}
