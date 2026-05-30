import api from './index';

export const loginAPI = async (email, password) => {
  const response = await api.post('/api/v1/auth/login', {
    email,
    password,
  });

  return response.data;
};

export const signupAPI = async (email, password, nickname) => {
  const response = await api.post('/api/v1/auth/register', {
    email,
    password,
    nickname,
  });

  return response.data;
};

export const getMeAPI = async (token) => {
  const response = await api.get('/api/v1/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};