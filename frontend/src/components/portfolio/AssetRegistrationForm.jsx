// src/components/portfolio/AssetRegistrationForm.jsx
import { useState } from 'react';
import { Plus, Briefcase } from 'lucide-react';

import Card from '@/components/ui/Card.jsx';
import { addAssetAPI } from '@/api/portfolio.js';

export default function AssetRegistrationForm({ onAssetChanged }) {
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [type, setType] = useState('주식');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('KRW');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setTicker('');
    setType('주식');
    setQuantity('');
    setPrice('');
    setCurrency('KRW');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('자산명을 입력해 주세요.');
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      alert('수량은 0보다 큰 값으로 입력해 주세요.');
      return;
    }

    if (!price || Number(price) < 0) {
      alert('평균 단가는 0 이상으로 입력해 주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      const newAssetData = {
        name: name.trim(),
        ticker: ticker.trim() || name.trim(),
        type,
        quantity: Number(quantity),
        price: Number(price),
        currency,
      };

      await addAssetAPI(newAssetData);

      resetForm();

      if (typeof onAssetChanged === 'function') {
        await onAssetChanged();
      }
    } catch (error) {
      console.error('Asset Add Error:', error);

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        '자산 등록에 실패했습니다.';

      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8 bg-white dark:bg-[#0b1324] border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-colors duration-300">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-4 flex items-center gap-2">
        <Plus className="w-4 h-4 text-blue-500" />
        통합 자산 데이터 등록
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="자산명"
            className="p-3 bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors duration-300 md:col-span-2"
          />

          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            placeholder="티커 또는 코드"
            className="p-3 bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors duration-300"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="p-3 bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors duration-300"
          >
            <option value="주식">주식</option>
            <option value="예적금">예적금</option>
            <option value="현금">현금</option>
          </select>

          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="수량"
            min="0"
            step="0.0001"
            className="p-3 bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors duration-300"
          />

          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="평균 단가"
            min="0"
            step="0.01"
            className="p-3 bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors duration-300"
          />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="p-2.5 bg-slate-50 dark:bg-[#0d172a] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors duration-300"
          >
            <option value="KRW">KRW</option>
            <option value="USD">USD</option>
          </select>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed active:bg-blue-800 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/10 flex items-center gap-1.5"
          >
            <Briefcase className="w-3.5 h-3.5" />
            {isSubmitting ? '등록 중' : '포트폴리오에 추가'}
          </button>
        </div>
      </form>
    </Card>
  );
}