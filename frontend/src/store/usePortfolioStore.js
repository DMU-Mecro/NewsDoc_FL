// src/store/usePortfolioStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { convertToKRW, formatMoney } from '@/utils/currency.js';

export const usePortfolioStore = create(
  persist(
    (set, get) => ({
      assets: [],

      setAssets: (newAssets) => {
        set({
          assets: Array.isArray(newAssets) ? newAssets : [],
        });
      },

      addAsset: (newAsset) =>
        set((state) => ({
          assets: [
            ...state.assets,
            {
              ...newAsset,
              id: newAsset.id || Date.now(),
              quantity: Number(newAsset.quantity || 0),
              price: Number(newAsset.price || 0),
              currency: newAsset.currency || 'KRW',
              total:
                Number(newAsset.total || 0) ||
                Number(newAsset.price || 0) * Number(newAsset.quantity || 0),
            },
          ],
        })),

      removeAsset: (id) =>
        set((state) => ({
          assets: state.assets.filter((asset) => asset.id !== id),
        })),

      clearAssets: () => {
        set({
          assets: [],
        });
      },

      getAssetTotalInKRW: (asset) => {
        return convertToKRW(asset.total, asset.currency);
      },

      getTotalBalance: () => {
        return get().assets.reduce((sum, asset) => {
          return sum + convertToKRW(asset.total, asset.currency);
        }, 0);
      },

      getTotalBalanceByCurrency: () => {
        return get().assets.reduce((acc, asset) => {
          const currency = asset.currency || 'KRW';
          const total = Number(asset.total || 0);

          acc[currency] = (acc[currency] || 0) + total;

          return acc;
        }, {});
      },

      getDisplayTotalBalance: () => {
        const totalKRW = get().getTotalBalance();

        return `₩${Math.round(totalKRW).toLocaleString()}`;
      },

      getDisplayTotalBalanceByCurrency: () => {
        const totals = get().getTotalBalanceByCurrency();
        const entries = Object.entries(totals);

        if (entries.length === 0) {
          return [];
        }

        return entries.map(([currency, amount]) => ({
          currency,
          amount,
          label: `${currency} ${formatMoney(amount, currency)}`,
        }));
      },

      getRiskScore: () => {
        const assets = get().assets;
        const total = get().getTotalBalance();

        if (total === 0) {
          return 0;
        }

        const stockTotal = assets
          .filter((asset) => asset.type === '주식')
          .reduce((sum, asset) => {
            return sum + convertToKRW(asset.total, asset.currency);
          }, 0);

        const stockRatio = stockTotal / total;

        return Math.min(100, Math.round(stockRatio * 100 * 1.2));
      },

      getChartData: () => {
        const assets = get().assets;

        const groups = {
          주식: 0,
          예적금: 0,
          현금: 0,
        };

        assets.forEach((asset) => {
          if (groups[asset.type] !== undefined) {
            groups[asset.type] += convertToKRW(asset.total, asset.currency);
          }
        });

        return [
          { name: '주식', value: groups['주식'], color: '#3b82f6' },
          { name: '예적금', value: groups['예적금'], color: '#10b981' },
          { name: '현금', value: groups['현금'], color: '#f59e0b' },
        ].filter((item) => item.value > 0);
      },
    }),
    {
      name: 'portfolio-storage',
    }
  )
);