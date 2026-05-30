import { useState, useEffect } from 'react';

// 데이터를 불러올 때 사용하는 공통 커스텀 훅 (임시)
export const useFetch = (fetchFunction) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // 임시 딜레이 및 로직
      setIsLoading(false);
    };
    loadData();
  }, [fetchFunction]);

  return { data, isLoading, error };
};