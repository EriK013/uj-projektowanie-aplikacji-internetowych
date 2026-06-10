export function pln(value: string): string {
  const n = Number(value);
  return n.toLocaleString("pl-PL", {
    style: "currency",
    currency: "PLN",
  });
}
