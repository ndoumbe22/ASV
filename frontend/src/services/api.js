import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to include token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject(
        new Error(
          "Erreur de réseau. Veuillez vérifier votre connexion internet."
        )
      );
    }

    // Handle timeout errors
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      console.error("Timeout error:", error.message);
      return Promise.reject(
        new Error("La requête a expiré. Veuillez réessayer.")
      );
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (data) => api.post("auth/login/", data),
  register: (data) => api.post("auth/register/", data),
  refreshToken: (data) => api.post("token/refresh/", data),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get("users/profile/"),
  updateProfile: (data) => api.put("users/profile/", data),
};

// Patient APIs
export const patientAPI = {
  getAppointments: () => api.get("appointments/upcoming/"),
  getMedications: () => api.get("medications/"),
  cancelAppointment: (id) => api.post(`appointments/${id}/cancel/`),
  rescheduleAppointment: (id, data) =>
    api.post(`appointments/${id}/reschedule/`),
  getPatients: () => api.get("patients/"),
  getPatient: (id) => api.get(`patients/${id}/`),
};

// Doctor APIs
export const doctorAPI = {
  getDoctors: () => api.get("medecins/"),
  getDoctor: (id) => api.get(`medecins/${id}/`),
};

// Appointment APIs
export const appointmentAPI = {
  getAppointments: () => api.get("rendezvous/"),
  getAppointment: (id) => api.get(`rendezvous/${id}/`),
  createAppointment: (data) => api.post("rendezvous/", data),
  updateAppointment: (id, data) => api.put(`rendezvous/${id}/`, data),
  deleteAppointment: (id) => api.delete(`rendezvous/${id}/`),
};

// Hospital APIs
export const hospitalAPI = {
  getHospitals: () => api.get("hopitaux/"),
  getHospital: (id) => api.get(`hopitaux/${id}/`),
};

// Clinic APIs
export const clinicAPI = {
  getClinics: () => api.get("cliniques/"),
  getClinic: (id) => api.get(`cliniques/${id}/`),
};

// Pharmacy APIs
export const pharmacyAPI = {
  getPharmacies: () => api.get("pharmacies/"),
  getPharmacy: (id) => api.get(`pharmacies/${id}/`),
};

// Dentist APIs
export const dentistAPI = {
  getDentists: () => api.get("dentistes/"),
  getDentist: (id) => api.get(`dentistes/${id}/`),
};

// Article APIs
export const articleAPI = {
  getArticles: () => api.get("articles/"),
  getArticle: (id) => api.get(`articles/${id}/`),
};

// Export the base api instance for custom requests
export default api;
