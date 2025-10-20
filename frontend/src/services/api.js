import axios from "axios";

// Create axios instance with default config
const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // Increased timeout to 15 seconds
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

    // Handle authentication errors
    if (error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("username");
      localStorage.removeItem("first_name");
      localStorage.removeItem("last_name");
      localStorage.removeItem("role");
      localStorage.removeItem("email");
      window.location.href = "/connecter";
      return Promise.reject(new Error("Votre session a expiré. Veuillez vous reconnecter."));
    }

    // Handle forbidden errors
    if (error.response.status === 403) {
      return Promise.reject(new Error("Vous n'avez pas les permissions nécessaires pour accéder à cette ressource."));
    }

    // Handle not found errors
    if (error.response.status === 404) {
      return Promise.reject(new Error("La ressource demandée n'a pas été trouvée."));
    }

    // Handle server errors
    if (error.response.status >= 500) {
      return Promise.reject(new Error("Une erreur serveur s'est produite. Veuillez réessayer plus tard."));
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
  getProfile: async () => {
    try {
      console.log("Fetching user profile...");
      const response = await api.get("users/profile/");
      console.log("User profile response:", response.data);
      
      // Validate response data structure
      if (!response.data) {
        console.warn("User profile response is empty, returning default structure");
        return {
          data: {
            username: localStorage.getItem("username") || "admin",
            first_name: localStorage.getItem("first_name") || "Administrateur",
            last_name: localStorage.getItem("last_name") || "",
            email: localStorage.getItem("email") || "admin@example.com"
          }
        };
      }
      
      return response;
    } catch (error) {
      console.error("Error fetching user profile:", error.response?.data || error.message);
      // Return a default user structure to prevent dashboard from breaking
      return {
        data: {
          username: localStorage.getItem("username") || "admin",
          first_name: localStorage.getItem("first_name") || "Administrateur",
          last_name: localStorage.getItem("last_name") || "",
          email: localStorage.getItem("email") || "admin@example.com"
        }
      };
    }
  },
  updateProfile: (data) => api.put("users/profile/", data),
};

// Patient APIs
export const patientAPI = {
  getAppointments: () => api.get("appointments/upcoming/"),
  getAppointmentHistory: () => api.get("appointments/history/"),
  getMedications: () => api.get("medications/"),
  cancelAppointment: (id) => api.post(`appointments/${id}/cancel/`),
  rescheduleAppointment: (id, data) =>
    api.post(`appointments/${id}/reschedule/`),
  proposeReschedule: (id, data) =>
    api.post(`appointments/${id}/propose-reschedule/`),
  validateAppointment: (id, data) => api.post(`appointments/${id}/validate/`),
  getPatients: () => api.get("patients/"),
  getPatient: (id) => api.get(`patients/${id}/`),
  updatePatient: (id, data) => api.put(`patients/${id}/`, data),
};

// Doctor APIs
export const doctorAPI = {
  getDoctors: () => api.get("medecins/"),
  getDoctor: (id) => api.get(`medecins/${id}/`),
};

// Specialty APIs
export const specialtyAPI = {
  getSpecialties: () => api.get("pathologies/"),
  getSpecialty: (id) => api.get(`pathologies/${id}/`),
};

// Appointment APIs
export const appointmentAPI = {
  getAppointments: () => api.get("rendezvous/"),
  getAppointment: (id) => api.get(`rendezvous/${id}/`),
  createAppointment: (data) => api.post("rendezvous/", data),
  updateAppointment: (id, data) => api.put(`rendezvous/${id}/`, data),
  deleteAppointment: (id) => api.delete(`rendezvous/${id}/`),
};

// Message APIs
export const messageAPI = {
  getConversations: () => api.get("messages/conversations/"),
  getMessages: (conversationId) => api.get(`messages/conversations/${conversationId}/messages/`),
  createConversation: (data) => api.post("messages/conversations/create/", data),
  sendMessage: (data) => api.post("messages/send/", data),
  markMessageAsRead: (messageId) => api.put(`messages/${messageId}/mark-read/`),
  getUnreadCount: () => api.get("messages/unread-count/"),
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

// Medical Document APIs
export const medicalDocumentAPI = {
  getDocuments: () => api.get("medical-documents/"),
  getDocument: (id) => api.get(`medical-documents/${id}/`),
  createDocument: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    return api.post("medical-documents/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updateDocument: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    return api.put(`medical-documents/${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteDocument: (id) => api.delete(`medical-documents/${id}/`),
};

// Admin APIs
export const adminAPI = {
  getStatistics: () => api.get("admin/statistics/"),
  getUsers: () => api.get("admin/users/"),
  createUser: (data) => api.post("admin/users/create/", data),
  updateUser: (id, data) => api.put(`admin/users/${id}/`, data),
  toggleUserStatus: (id) => api.put(`admin/users/${id}/toggle-status/`, {}),
  deleteUser: (id) => api.delete(`admin/users/${id}/delete/`),
};

// Export the base api instance for custom requests
export default api;