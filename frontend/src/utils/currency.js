// src/utils/currency.js

export const EXCHANGE_RATES_TO_KRW = {
  KRW: 1,
  USD: 1500,
};

export const BASE_CURRENCY = 'KRW';

export const normalizeCurrency = (currency) => {
  return String(currency || BASE_CURRENCY).toUpperCase();
};

export const getExchangeRateToKRW = (currency) => {
  const normalizedCurrency = normalizeCurrency(currency);

  return EXCHANGE_RATES_TO_KRW[normalizedCurrency] || 1;
};

export const convertToKRW = (amount, currency) => {
  const numericAmount = Number(amount || 0);
  const rate = getExchangeRateToKRW(currency);

  return numericAmount * rate;
};

export const formatKRW = (value) => {
  return `₩${Math.round(Number(value || 0)).toLocaleString()}`;
};

export const formatMoney = (value, currency = 'KRW') => {
  const amount = Number(value || 0);
  const normalizedCurrency = normalizeCurrency(currency);

  if (normalizedCurrency === 'USD') {
    return `$${amount.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;
  }

  if (normalizedCurrency === 'KRW') {
    return `₩${Math.round(amount).toLocaleString()}`;
  }

  return `${normalizedCurrency} ${amount.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
};