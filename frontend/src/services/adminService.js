import axios from "axios";

const API_URL = "http://localhost:8000/api/admin/";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export const adminService = {
  getStatistics: async () => {
    const response = await axios.get(`${API_URL}statistics/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getUsers: async () => {
    const response = await axios.get(`${API_URL}users/`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  createUser: async (userData) => {
    const response = await axios.post(`${API_URL}users/`, userData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await axios.put(`${API_URL}users/${userId}/`, userData, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await axios.put(
      `${API_URL}users/${userId}/toggle-status/`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  deleteUser: async (userId) => {
    await axios.delete(`${API_URL}users/${userId}/delete/`, {
      headers: getAuthHeader(),
    });
  },
};
