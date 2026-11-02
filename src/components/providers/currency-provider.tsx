"use client";

import React, { createContext, useContext, useMemo } from "react";
import {
  DEFAULT_CURRENCY,
  DEFAULT_CURRENCY_SYMBOL,
  formatCurrency,
  formatDollars,
} from "@/server/lib/money";

interface CurrencyContextType {
  currency: string;
  symbol: string;
  formatAmount: (amountCents: bigint | number, decimals?: number, includeCode?: boolean) => string;
  formatDollars: (amountDollars: number, decimals?: number, includeCode?: boolean) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: DEFAULT_CURRENCY,
  symbol: DEFAULT_CURRENCY_SYMBOL,
  formatAmount: (amountCents, decimals = 2, includeCode = false) =>
    formatCurrency(amountCents, {
      symbol: DEFAULT_CURRENCY_SYMBOL,
      currency: DEFAULT_CURRENCY,
      decimals,
      includeCode,
    }),
  formatDollars: (amountDollars, decimals = 2, includeCode = false) =>
    formatDollars(amountDollars, {
      symbol: DEFAULT_CURRENCY_SYMBOL,
      currency: DEFAULT_CURRENCY,
      decimals,
      includeCode,
    }),
});

export function CurrencyProvider({
  children,
  currency = DEFAULT_CURRENCY,
  symbol = DEFAULT_CURRENCY_SYMBOL,
}: {
  children: React.ReactNode;
  currency?: string;
  symbol?: string;
}) {
  const value = useMemo<CurrencyContextType>(
    () => ({
      currency: currency || DEFAULT_CURRENCY,
      symbol: symbol || DEFAULT_CURRENCY_SYMBOL,
      formatAmount: (amountCents, decimals = 2, includeCode = false) =>
        formatCurrency(amountCents, {
          symbol: symbol || DEFAULT_CURRENCY_SYMBOL,
          currency: currency || DEFAULT_CURRENCY,
          decimals,
          includeCode,
        }),
      formatDollars: (amountDollars, decimals = 2, includeCode = false) =>
        formatDollars(amountDollars, {
          symbol: symbol || DEFAULT_CURRENCY_SYMBOL,
          currency: currency || DEFAULT_CURRENCY,
          decimals,
          includeCode,
        }),
    }),
    [currency, symbol],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function CurrencyDisplay({
  cents,
  dollars,
  decimals = 0,
  includeCode = false,
  className,
}: {
  cents?: number | bigint;
  dollars?: number;
  decimals?: number;
  includeCode?: boolean;
  className?: string;
}) {
  const { formatAmount, formatDollars: fmtDollars, symbol } = useCurrency();
  let text = symbol;
  if (cents !== undefined) {
    text = formatAmount(cents, decimals, includeCode);
  } else if (dollars !== undefined) {
    text = fmtDollars(dollars, decimals, includeCode);
  }
  return <span className={className}>{text}</span>;
}
