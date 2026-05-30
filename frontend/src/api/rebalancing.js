import api from './index';
import { convertToKRW } from '@/utils/currency.js';

const normalizeAssetType = (value) => {
  if (['주식', '예적금', '현금'].includes(value)) {
    return value;
  }

  return '주식';
};

const normalizeActionColor = (actionType) => {
  if (actionType === 'SELL') {
    return 'border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 text-amber-600 dark:text-amber-400';
  }

  if (actionType === 'HOLD') {
    return 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400';
  }

  return 'border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400';
};

const buildAssetPayload = (currentAssets) => {
  return currentAssets.map((asset) => ({
    id: asset.id,
    name: asset.name || asset.company_name || asset.ticker || '이름 없음',
    ticker: asset.ticker || asset.name || '',
    type: normalizeAssetType(asset.type),
    quantity: Number(asset.quantity || 0),
    price: Number(asset.price || asset.average_price || 0),
    total: convertToKRW(asset.total, asset.currency),
    currency: 'KRW',
  }));
};

const normalizeRebalancingResponse = (data) => {
  const gaps = Array.isArray(data.gaps) ? data.gaps : [];
  const actions = Array.isArray(data.actions) ? data.actions : [];

  return {
    summary: data.summary || null,
    gapData: gaps.map((item) => ({
      name: item.name,
      현재비중: Number(item.current_weight || 0),
      추천비중: Number(item.target_weight || 0),
      현재금액: Number(item.current_amount || 0),
      목표금액: Number(item.target_amount || 0),
      차이금액: Number(item.difference_amount || 0),
      차이비중: Number(item.gap_weight || 0),
    })),
    actions: actions.map((item) => ({
      id: item.id,
      assetType: item.asset_type,
      actionType: item.action_type,
      title: item.title,
      description: item.description,
      amount: Number(item.amount || 0),
      gapWeight: Number(item.gap_weight || 0),
      priority: item.priority || 'LOW',
      color: normalizeActionColor(item.action_type),
    })),
    logicList: Array.isArray(data.logic_list) ? data.logic_list : [],
    targetWeights: Array.isArray(data.target_weights) ? data.target_weights : [],
  };
};

export const getRebalancingRecommendationAPI = async (
  currentAssets = [],
  marketRegime = 'risk_off'
) => {
  const payload = {
    assets: buildAssetPayload(currentAssets),
    market_regime: marketRegime,
    min_action_amount: 10000,
  };

  const response = await api.post('/api/v1/rebalancing/recommendation', payload);

  return normalizeRebalancingResponse(response.data);
};