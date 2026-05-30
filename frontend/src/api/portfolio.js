// src/api/portfolio.js
import api from './index';

const normalizeAssetType = (value) => {
  const type = value || '주식';

  if (['주식', '예적금', '현금'].includes(type)) {
    return type;
  }

  return '주식';
};

const normalizePortfolioItem = (item) => {
  const quantity = Number(item.quantity ?? 0);
  const price = Number(item.average_price ?? item.price ?? 0);
  const type = normalizeAssetType(item.memo || item.type);

  return {
    id: item.id,
    ticker: item.ticker,
    name: item.company_name || item.name || item.ticker || '이름 없음',
    type,
    quantity,
    price,
    currency: item.currency || 'KRW',
    total: Number(item.total ?? quantity * price),
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
};

export const getAssetsAPI = async () => {
  const response = await api.get('/api/v1/portfolio');
  const data = Array.isArray(response.data) ? response.data : [];

  return data.map(normalizePortfolioItem);
};

export const addAssetAPI = async (assetData) => {
  const payload = {
    ticker: String(assetData.ticker || assetData.name || '').trim(),
    company_name: String(assetData.name || assetData.ticker || '').trim(),
    quantity: Number(assetData.quantity || 0),
    average_price: Number(assetData.price || 0),
    currency: assetData.currency || 'KRW',
    memo: assetData.type || '주식',
  };

  const response = await api.post('/api/v1/portfolio', payload);

  return normalizePortfolioItem(response.data);
};

export const deleteAssetAPI = async (assetId) => {
  await api.delete(`/api/v1/portfolio/${assetId}`);

  return true;
};