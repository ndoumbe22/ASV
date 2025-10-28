import api from "./api";

const articleService = {
  // Public articles with pagination support
  getPublicArticles: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.categorie) params.append("categorie", filters.categorie);
    if (filters.search) params.append("search", filters.search);
    if (filters.page) params.append("page", filters.page);
    if (filters.page_size) params.append("page_size", filters.page_size);

    // Fix the endpoint to match the backend URL
    const response = await api.get(`articles/?${params.toString()}`);
    return response.data;
  },

  getPublicArticle: async (slug) => {
    // Fix the endpoint to match the backend URL
    const response = await api.get(`articles/${slug}/`);
    return response.data;
  },

  // Doctor articles
  getMyArticles: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.statut) params.append("statut", filters.statut);

    const response = await api.get(`medecin/articles/?${params.toString()}`);
    return response.data;
  },

  getMyArticleDetail: async (id) => {
    const response = await api.get(`medecin/articles/${id}/`);
    return response.data;
  },

  createArticle: async (articleData) => {
    // Send as JSON data, not FormData
    const response = await api.post(`medecin/articles/`, articleData);
    return response.data;
  },

  updateArticle: async (id, articleData) => {
    // Send as JSON data, not FormData
    const response = await api.put(`medecin/articles/${id}/`, articleData);
    return response.data;
  },

  deleteArticle: async (id) => {
    await api.delete(`medecin/articles/${id}/`);
  },

  soumettreValidation: async (id) => {
    const response = await api.post(`medecin/articles/${id}/soumettre/`, {});
    return response.data;
  },

  // Admin articles
  getAdminArticles: async () => {
    const response = await api.get(`admin/articles/`);
    return response.data;
  },

  getAdminArticle: async (id) => {
    const response = await api.get(`admin/articles/${id}/`);
    return response.data;
  },

  validateArticle: async (id, data = {}) => {
    const response = await api.post(`admin/articles/${id}/valider/`, data);
    return response.data;
  },

  rejectArticle: async (id, data = {}) => {
    const response = await api.post(`admin/articles/${id}/refuser/`, data);
    return response.data;
  },

  deactivateArticle: async (id, data = {}) => {
    const response = await api.post(`admin/articles/${id}/desactiver/`, data);
    return response.data;
  },

  // Admin can also delete articles completely
  deleteAdminArticle: async (id) => {
    const response = await api.delete(`admin/articles/${id}/`);
    return response.data;
  },

  getArticleStatistics: async () => {
    const response = await api.get(`admin/articles/statistics/`);
    return response.data;
  },

  // Featured articles
  featureArticle: async (id) => {
    const response = await api.post(
      `admin/articles/${id}/mettre_en_avant/`,
      {}
    );
    return response.data;
  },

  unfeatureArticle: async (id) => {
    const response = await api.post(`admin/articles/${id}/retirer_avant/`, {});
    return response.data;
  },
};

export default articleService;
