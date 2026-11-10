export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.name === 'ChunkLoadError' ||
    /Loading chunk .+ failed|Failed to fetch dynamically imported module|Importing a module script failed/i.test(error.message);
}
