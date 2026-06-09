import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Instância única com baseURL e timeout ───────────────────────────────────
export const api = axios.create({
  baseURL: 'https://dummyjson.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Interceptor de REQUISIÇÃO — injeta o token automaticamente ───────────────
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@ministock:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor de RESPOSTA — tratamento centralizado de erros ───────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.code === 'ECONNABORTED' || !error.response) {
      // Timeout ou sem rede
      return Promise.reject(new Error('Sem conexão, tente novamente.'));
    }

    const { status } = error.response;

    if (status === 401) {
      // Sessão expirada — limpa credenciais e redireciona para login
      await AsyncStorage.multiRemove(['@ministock:token', '@ministock:user']);
      // O AuthContext detectará a ausência do token e redirecionará automaticamente
      return Promise.reject(new Error('Sessão expirada. Faça login novamente.'));
    }

    if (status === 404) {
      return Promise.reject(new Error('Recurso não encontrado.'));
    }

    if (status >= 500) {
      return Promise.reject(new Error('Erro no servidor, tente novamente.'));
    }

    return Promise.reject(error);
  }
);
