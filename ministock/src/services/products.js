import { api } from './api';

/**
 * Lista produtos com paginação.
 * @param {{ limit: number, skip: number }} params
 */
export async function listProducts({ limit = 10, skip = 0 } = {}) {
  const { data } = await api.get('/products', {
    params: { limit, skip },
  });
  return data; // { products: [...], total, skip, limit }
}

/**
 * Busca produtos por termo textual.
 * @param {string} q
 * @param {{ limit: number, skip: number }} params
 */
export async function searchProducts(q, { limit = 10, skip = 0 } = {}) {
  const { data } = await api.get('/products/search', {
    params: { q, limit, skip },
  });
  return data;
}

/**
 * Lista todas as categorias disponíveis.
 */
export async function listCategories() {
  const { data } = await api.get('/products/category-list');
  return data; // string[]
}

/**
 * Lista produtos de uma categoria específica.
 * @param {string} slug
 * @param {{ limit: number, skip: number }} params
 */
export async function listByCategory(slug, { limit = 10, skip = 0 } = {}) {
  const { data } = await api.get(`/products/category/${slug}`, {
    params: { limit, skip },
  });
  return data;
}

/**
 * Retorna os detalhes de um produto pelo ID.
 * @param {number|string} id
 */
export async function getProduct(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

/**
 * Cadastra um novo produto.
 * @param {{ title: string, description: string, price: number, category: string, stock: number }} payload
 */
export async function createProduct(payload) {
  const { data } = await api.post('/products/add', payload);
  return data;
}

/**
 * Atualiza um produto existente.
 * @param {number|string} id
 * @param {object} payload
 */
export async function updateProduct(id, payload) {
  const { data } = await api.put(`/products/${id}`, payload);
  return data;
}

/**
 * Remove um produto pelo ID.
 * @param {number|string} id
 */
export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}
