// src/api/dashboard.js
import api from './index';

const MARKET_ECHO_ENDPOINT = '/api/v1/analysis/marketecho-index?max_items=5';

let marketEchoCache = null;
let marketEchoCacheTime = 0;
let marketEchoInFlightPromise = null;

const CACHE_TTL_MS = 30 * 1000;

const formatPercent = (value) => {
  const number = Number(value ?? 0);
  const sign = number >= 0 ? '+' : '';
  return `${sign}${number.toFixed(2)}%`;
};

const toIndicatorId = (factorName, index) => {
  const normalizedName = String(factorName ?? '')
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');

  if (normalizedName) {
    return normalizedName;
  }

  const fallbackIds = ['gold_price', 'wti_price', 'sp500', 'us_10y_yield'];
  return fallbackIds[index] || `factor_${index + 1}`;
};

const fetchMarketEchoIndexRaw = async ({ forceRefresh = false } = {}) => {
  const now = Date.now();
  const isCacheValid =
    marketEchoCache && now - marketEchoCacheTime < CACHE_TTL_MS;

  if (!forceRefresh && isCacheValid) {
    return marketEchoCache;
  }

  if (!forceRefresh && marketEchoInFlightPromise) {
    return marketEchoInFlightPromise;
  }

  const endpoint = forceRefresh
    ? `${MARKET_ECHO_ENDPOINT}&force_refresh=true`
    : MARKET_ECHO_ENDPOINT;

  marketEchoInFlightPromise = api
    .get(endpoint)
    .then((response) => {
      marketEchoCache = response.data;
      marketEchoCacheTime = Date.now();
      return response.data;
    })
    .finally(() => {
      marketEchoInFlightPromise = null;
    });

  return marketEchoInFlightPromise;
};

export const clearMarketEchoCache = () => {
  marketEchoCache = null;
  marketEchoCacheTime = 0;
  marketEchoInFlightPromise = null;
};

export const getMarketIndicatorsAPI = async ({ forceRefresh = false } = {}) => {
  const data = await fetchMarketEchoIndexRaw({ forceRefresh });
  const factors = data?.factors || [];

  return factors.map((factor, index) => ({
    id: toIndicatorId(factor.name, index),
    name: factor.name,
    label: factor.name,
    value: Number(factor.impact_score ?? 0).toFixed(2),
    change: formatPercent(factor.weighted_score),
    up: Number(factor.weighted_score ?? 0) >= 0,
    enabled: true,
  }));
};

export const getMarketEchoAPI = async (
  period,
  { forceRefresh = false } = {}
) => {
  const data = await fetchMarketEchoIndexRaw({ forceRefresh });
  const indexScore = Number(data?.index_score ?? 0);

  return [
    {
      time: period || '현재',
      지수: Number(indexScore.toFixed(2)),
    },
  ];
};