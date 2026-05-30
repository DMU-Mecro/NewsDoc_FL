import api from './index';

const normalizeSimulationResponse = (data) => ({
  ...data,
  initialAmount: Number(data.initial_amount ?? 0),
  goalAmount: Number(data.goal_amount ?? 0),
  years: Number(data.years ?? 0),
  monthlyContribution: Number(data.monthly_contribution ?? 0),
  projections: Array.isArray(data.projections) ? data.projections : [],
  results: Array.isArray(data.results) ? data.results : [],
  metrics: data.metrics || null,
});

export const runSimulationAPI = async ({
  initialAmount,
  goalAmount,
  goalYear,
  monthlyContribution,
}) => {
  const payload = {
    initial_amount: Number(initialAmount || 0),
    goal_amount: Number(goalAmount || 0),
    years: Number(goalYear || 1),
    monthly_contribution: Number(monthlyContribution || 0),
  };

  const response = await api.post('/api/v1/simulation/projection', payload);

  return normalizeSimulationResponse(response.data);
};

export const getSimulationScenariosAPI = async () => {
  const response = await api.get('/api/v1/simulation/scenarios');

  return Array.isArray(response.data) ? response.data : [];
};