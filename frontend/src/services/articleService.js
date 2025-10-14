import axios from "axios";

const API_URL = "http://localhost:8000/api/";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export const articleService = {
  // Public articles
  getPublicArticles: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.categorie) params.append("categorie", filters.categorie);
    if (filters.search) params.append("search", filters.search);

    const response = await axios.get(
      `${API_URL}articles/?${params.toString()}`
    );
    return response.data;
  },

  getPublicArticle: async (slug) => {
    const response = await axios.get(`${API_URL}articles/${slug}/`);
    return response.data;
  },

  // Doctor articles
  getDoctorArticles: async (status = "all") => {
    const params = new URLSearchParams();
    if (status !== "all") params.append("statut", status);

    const response = await axios.get(
      `${API_URL}medecin/articles/?${params.toString()}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  getDoctorArticle: async (id) => {
    const response = await axios.get(`${API_URL}medecin/articles/${id}/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  createArticle: async (articleData) => {
    const response = await axios.post(
      `${API_URL}medecin/articles/`,
      articleData,
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  updateArticle: async (id, articleData) => {
    const response = await axios.put(
      `${API_URL}medecin/articles/${id}/`,
      articleData,
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  deleteArticle: async (id) => {
    await axios.delete(`${API_URL}medecin/articles/${id}/`, {
      headers: getAuthHeader(),
    });
  },

  submitArticleForReview: async (id) => {
    const response = await axios.post(
      `${API_URL}medecin/articles/${id}/soumettre/`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Admin articles
  getAdminArticles: async () => {
    const response = await axios.get(`${API_URL}admin/articles/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getAdminArticle: async (id) => {
    const response = await axios.get(`${API_URL}admin/articles/${id}/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  validateArticle: async (id, data = {}) => {
    const response = await axios.post(
      `${API_URL}admin/articles/${id}/valider/`,
      data,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  rejectArticle: async (id, data = {}) => {
    const response = await axios.post(
      `${API_URL}admin/articles/${id}/refuser/`,
      data,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  deactivateArticle: async (id, data = {}) => {
    const response = await axios.post(
      `${API_URL}admin/articles/${id}/desactiver/`,
      data,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  getArticleStatistics: async () => {
    const response = await axios.get(`${API_URL}admin/articles/statistics/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
