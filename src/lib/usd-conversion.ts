export function usdToPhp(usd: number): number {
  const rate = Number(process.env.USD_CONVERSION ?? "58.5");
  return Math.round(usd * rate);
}
