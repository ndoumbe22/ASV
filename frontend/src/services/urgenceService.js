import axios from "axios";

const API_URL = "http://localhost:8000/api/";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export const urgenceService = {
  // PATIENT
  getMyUrgences: async () => {
    const response = await axios.get(`${API_URL}patient/urgences/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  createUrgence: async (urgenceData) => {
    const response = await axios.post(
      `${API_URL}patient/urgences/`,
      urgenceData,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // MÉDECIN
  getUrgencesMedecin: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await axios.get(
      `${API_URL}medecin/urgences/${params ? "?" + params : ""}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  prendreEnCharge: async (id) => {
    const response = await axios.post(
      `${API_URL}medecin/urgences/${id}/prendre-en-charge/`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  resoudreUrgence: async (id, notes) => {
    const response = await axios.put(
      `${API_URL}medecin/urgences/${id}/resoudre/`,
      { notes },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  getNotifications: async () => {
    const response = await axios.get(
      `${API_URL}medecin/notifications-urgences/`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  marquerNotificationLue: async (id) => {
    await axios.post(
      `${API_URL}medecin/notifications-urgences/${id}/lue/`,
      {},
      { headers: getAuthHeader() }
    );
  },

  // ADMIN
  getDashboard: async () => {
    const response = await axios.get(`${API_URL}admin/urgences/dashboard/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
