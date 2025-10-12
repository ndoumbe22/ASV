import axios from "axios";

const API_URL = "http://localhost:8000/api/";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export const articleService = {
  // ===== PUBLIC =====
  getArticlesPublics: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_URL}articles/${params ? "?" + params : ""}`
    );
    return response.data;
  },

  getArticleBySlug: async (slug) => {
    const response = await axios.get(`${API_URL}articles/${slug}/`);
    return response.data;
  },

  // ===== MÉDECIN =====
  getMyArticles: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_URL}medecin/articles/${params ? "?" + params : ""}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  getMyArticleDetail: async (id) => {
    const response = await axios.get(`${API_URL}medecin/articles/${id}/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  createArticle: async (articleData) => {
    const response = await axios.post(
      `${API_URL}medecin/articles/`,
      articleData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  updateArticle: async (id, articleData) => {
    const response = await axios.put(
      `${API_URL}medecin/articles/${id}/`,
      articleData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  deleteArticle: async (id) => {
    await axios.delete(`${API_URL}medecin/articles/${id}/`, {
      headers: getAuthHeader(),
    });
  },

  soumettreValidation: async (id) => {
    const response = await axios.post(
      `${API_URL}medecin/articles/${id}/soumettre/`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // ===== ADMIN =====
  getAllArticles: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_URL}admin/articles/${params ? "?" + params : ""}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  getArticleDetailAdmin: async (id) => {
    const response = await axios.get(`${API_URL}admin/articles/${id}/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  validerArticle: async (id, commentaire = "") => {
    const response = await axios.post(
      `${API_URL}admin/articles/${id}/valider/`,
      { commentaire },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  refuserArticle: async (id, commentaire) => {
    const response = await axios.post(
      `${API_URL}admin/articles/${id}/refuser/`,
      { commentaire },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  desactiverArticle: async (id, commentaire = "") => {
    const response = await axios.post(
      `${API_URL}admin/articles/${id}/desactiver/`,
      { commentaire },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getStatistics: async () => {
    const response = await axios.get(`${API_URL}admin/articles/statistics/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
