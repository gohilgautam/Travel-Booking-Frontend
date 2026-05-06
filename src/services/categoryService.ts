import api from './api';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  active: boolean;
}

export const categoryService = {
  getAll: async () => {
    const { data } = await api.get('/categories');
    return data?.data as Category[];
  },
  create: async (payload: Partial<Category>) => {
    const { data } = await api.post('/categories', payload);
    return data?.data as Category;
  },
  update: async (id: string, payload: Partial<Category>) => {
    const { data } = await api.put(`/categories/${id}`, payload);
    return data?.data as Category;
  },
  delete: async (id: string) => {
    await api.delete(`/categories/${id}`);
  },
};
