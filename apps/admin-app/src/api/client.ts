import axios from 'axios';
import { adminEnv } from '../constants/env';

export const apiClient = axios.create({
  baseURL: adminEnv.apiUrl,
  timeout: 10000
});

export const setAdminAuthToken = (token?: string) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};
