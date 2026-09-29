export function StoreError({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="store-error">{error}</p>;
}
