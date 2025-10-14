import axios from "axios";

const API_URL = "http://localhost:8000/api/";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export const urgenceService = {
  // Patient urgences
  getPatientUrgences: async () => {
    const response = await axios.get(`${API_URL}patient/urgences/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  createUrgence: async (urgenceData) => {
    const response = await axios.post(
      `${API_URL}patient/urgences/`,
      urgenceData,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Medecin urgences
  getMedecinUrgences: async (status = "en_attente") => {
    const response = await axios.get(
      `${API_URL}medecin/urgences/?statut=${status}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  takeChargeUrgence: async (urgenceId) => {
    const response = await axios.post(
      `${API_URL}medecin/urgences/${urgenceId}/prendre-en-charge/`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  resolveUrgence: async (urgenceId, data) => {
    const response = await axios.put(
      `${API_URL}medecin/urgences/${urgenceId}/resoudre/`,
      data,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Notifications
  getMedecinNotifications: async () => {
    const response = await axios.get(
      `${API_URL}medecin/notifications-urgences/`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  markNotificationAsRead: async (notificationId) => {
    const response = await axios.put(
      `${API_URL}medecin/notifications-urgences/${notificationId}/lue/`,
      {},
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  // Health facilities
  getHealthFacilities: async () => {
    const response = await axios.get(`${API_URL}health-facilities/`);
    return response.data;
  },
  
  getNearbyHealthFacilities: async (lat, lng, radius = 10) => {
    const response = await axios.get(`${API_URL}health-facilities/nearby/?lat=${lat}&lng=${lng}&radius=${radius}`);
    return response.data;
  },
};
