const BPS_DENOMINATOR = 10_000n;

export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_CURRENCY_SYMBOL = "$";

function assertNonNegative(amountCents: bigint, label: string): void {
  if (amountCents < 0n) {
    throw new Error(`${label} cannot be negative`);
  }
}

export function roundHalfUpDivide(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) {
    throw new Error("denominator must be positive");
  }
  if (numerator >= 0n) {
    return (numerator + denominator / 2n) / denominator;
  }
  return -((-numerator + denominator / 2n) / denominator);
}

export function splitFee(
  amountCents: bigint,
  feeBps: number,
): { netCents: bigint; feeCents: bigint } {
  assertNonNegative(amountCents, "amountCents");
  if (!Number.isInteger(feeBps) || feeBps < 0 || feeBps > 5000) {
    throw new Error("feeBps must be an integer between 0 and 5000");
  }

  const feeCents = roundHalfUpDivide(amountCents * BigInt(feeBps), BPS_DENOMINATOR);
  const netCents = amountCents - feeCents;
  return { netCents, feeCents };
}

export function formatMinorUnits(amountCents: bigint, currency: string = DEFAULT_CURRENCY): string {
  const code = (currency || DEFAULT_CURRENCY).toUpperCase();
  const sign = amountCents < 0n ? "-" : "";
  const abs = amountCents < 0n ? -amountCents : amountCents;
  const whole = abs / 100n;
  const fraction = (abs % 100n).toString().padStart(2, "0");
  return `${sign}${whole.toString()}.${fraction} ${code}`;
}

export interface MoneyFormatOptions {
  symbol?: string;
  currency?: string;
  decimals?: number;
  includeCode?: boolean;
}

export function formatCurrency(amountCents: bigint | number, options?: MoneyFormatOptions): string {
  const symbol = options?.symbol ?? DEFAULT_CURRENCY_SYMBOL;
  const currency = (options?.currency ?? DEFAULT_CURRENCY).toUpperCase();
  const decimals = options?.decimals ?? 2;
  const includeCode = options?.includeCode ?? false;

  const cents = typeof amountCents === "bigint" ? Number(amountCents) : amountCents;
  const isNegative = cents < 0;
  const absVal = Math.abs(cents) / 100;
  const formatted = absVal.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const prefix = isNegative ? `-${symbol}` : symbol;
  return includeCode ? `${prefix}${formatted} ${currency}` : `${prefix}${formatted}`;
}

export function formatDollars(amountDollars: number, options?: MoneyFormatOptions): string {
  return formatCurrency(Math.round(amountDollars * 100), options);
}
