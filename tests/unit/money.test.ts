import { describe, expect, it } from "vitest";
import {
  formatMinorUnits,
  splitFee,
  formatCurrency,
  formatDollars,
  DEFAULT_CURRENCY,
  DEFAULT_CURRENCY_SYMBOL,
} from "@/server/lib/money";

describe("splitFee", () => {
  it("uses integer math and places remainder on the platform fee", () => {
    expect(splitFee(100n, 1000)).toEqual({ netCents: 90n, feeCents: 10n });
    expect(splitFee(1n, 1000)).toEqual({ netCents: 1n, feeCents: 0n });
    expect(splitFee(5n, 1000)).toEqual({ netCents: 4n, feeCents: 1n });
  });

  it("rejects invalid fee basis points", () => {
    expect(() => splitFee(100n, 5001)).toThrow(/feeBps/);
  });
});

describe("formatMinorUnits", () => {
  it("formats cents without floating point", () => {
    expect(formatMinorUnits(12345n, "usd")).toBe("123.45 USD");
    expect(formatMinorUnits(-50n, "USD")).toBe("-0.50 USD");
  });
});

describe("Currency Constants & Formatters", () => {
  it("defaults strictly to USD currency and $ symbol", () => {
    expect(DEFAULT_CURRENCY).toBe("USD");
    expect(DEFAULT_CURRENCY_SYMBOL).toBe("$");
  });

  it("formats currency amounts correctly with symbol and decimals", () => {
    expect(formatCurrency(50000n)).toBe("$500.00");
    expect(formatCurrency(1250, { decimals: 0 })).toBe("$13");
    expect(formatCurrency(250000, { includeCode: true })).toBe("$2,500.00 USD");
    expect(formatCurrency(-1500)).toBe("-$15.00");
  });

  it("formats whole dollars amounts accurately", () => {
    expect(formatDollars(500)).toBe("$500.00");
    expect(formatDollars(85, { decimals: 0 })).toBe("$85");
    expect(formatDollars(100, { symbol: "$", includeCode: true })).toBe("$100.00 USD");
  });
});
