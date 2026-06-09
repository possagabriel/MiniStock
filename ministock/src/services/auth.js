import { api } from './api';

/**
 * Autentica o usuário na DummyJSON e retorna token + dados do usuário.
 * @param {string} username
 * @param {string} password
 */
export async function login(username, password) {
  const { data } = await api.post('/auth/login', {
    username,
    password,
    expiresInMins: 60,
  });
  return data; // { id, username, email, firstName, lastName, token, refreshToken, ... }
}
