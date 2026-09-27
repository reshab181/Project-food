import axios from 'axios';
import { customerEnv } from '../constants/env';

export const apiClient = axios.create({
  baseURL: customerEnv.apiUrl,
  timeout: 10000
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message;
    if (typeof message === 'string') {
      error.message = message;
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token?: string) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};
