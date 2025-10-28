import axios from "axios";

// Add a global request interceptor to include token if available
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "Global interceptor - Token ajouté au header:",
        token.substring(0, 20) + "..."
      );
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
      console.log(
        "API instance interceptor - Token ajouté au header:",
        token.substring(0, 20) + "..."
      );
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
      // Don't redirect to login for public endpoints
      const publicEndpoints = [
        "admin/statistics/",
        "patients/",
        "medecins/",
        "cliniques/",
        "pharmacies/",
        "auth/login/", // Add login endpoint to public endpoints to avoid interference
      ];

      const requestUrl = error.config?.url || "";
      const isPublicEndpoint = publicEndpoints.some((endpoint) =>
        requestUrl.includes(endpoint)
      );

      if (!isPublicEndpoint) {
        // Clear local storage and redirect to login for protected endpoints
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        localStorage.removeItem("first_name");
        localStorage.removeItem("last_name");
        localStorage.removeItem("role");
        localStorage.removeItem("email");
        window.location.href = "/connecter";

        return Promise.reject(
          new Error("Votre session a expiré. Veuillez vous reconnecter.")
        );
      } else {
        // For login endpoint, let the specific error message pass through
        if (requestUrl.includes("auth/login/")) {
          return Promise.reject(new Error("Identifiants incorrects"));
        }
        // For other public endpoints, use the original error
        return Promise.reject(error);
      }
    }

    // Handle forbidden errors
    if (error.response.status === 403) {
      return Promise.reject(
        new Error(
          "Vous n'avez pas les permissions nécessaires pour accéder à cette ressource."
        )
      );
    }

    // Handle not found errors
    if (error.response.status === 404) {
      // More detailed 404 error message
      const requestUrl = error.config?.url || "";
      console.error("404 Error for URL:", requestUrl);
      return Promise.reject(
        new Error(
          `La ressource demandée n'a pas été trouvée. URL: ${requestUrl}`
        )
      );
    }

    // Handle server errors
    if (error.response.status >= 500) {
      return Promise.reject(
        new Error(
          "Une erreur serveur s'est produite. Veuillez réessayer plus tard."
        )
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
  getProfile: async () => {
    try {
      console.log("Fetching user profile...");
      const response = await api.get("users/profile/");
      console.log("User profile response:", response.data);

      // Validate response data structure
      if (!response.data) {
        console.warn(
          "User profile response is empty, returning default structure"
        );
        return {
          data: {
            username: localStorage.getItem("username") || "admin",
            first_name: localStorage.getItem("first_name") || "Administrateur",
            last_name: localStorage.getItem("last_name") || "",
            email: localStorage.getItem("email") || "admin@example.com",
          },
        };
      }

      return response;
    } catch (error) {
      console.error(
        "Error fetching user profile:",
        error.response?.data || error.message
      );
      // Return a default user structure to prevent dashboard from breaking
      return {
        data: {
          username: localStorage.getItem("username") || "admin",
          first_name: localStorage.getItem("first_name") || "Administrateur",
          last_name: localStorage.getItem("last_name") || "",
          email: localStorage.getItem("email") || "admin@example.com",
        },
      };
    }
  },
  updateProfile: (data) => api.put("users/profile/", data),
};

// Patient APIs
export const patientAPI = {
  getAppointments: () => api.get("appointments/upcoming/"),
  getAppointmentHistory: () => api.get("appointments/history/"),
  getMedications: (patientId) => api.get(`medications/${patientId}/`),
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
  doctorRescheduleAppointment: (id, data) =>
    api.post(`appointments/${id}/doctor-reschedule/`, data),
  getAvailableSlots: (medecinId, date) =>
    api.get(
      `rendezvous/creneaux_disponibles/?medecin_id=${medecinId}&date=${date}`
    ),
};

// Message APIs
export const messageAPI = {
  getConversations: () => api.get("messages/conversations/"),
  getMessages: (conversationId) =>
    api.get(`messages/conversations/${conversationId}/messages/`),
  createConversation: (data) =>
    api.post("messages/conversations/create/", data),
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

// Consultation APIs
export const consultationAPI = {
  getConsultations: () => api.get("consultations/"),
  getConsultation: (id) => api.get(`consultations/${id}/`),
  createConsultation: (data) => api.post("consultations/", data),
  updateConsultation: (id, data) => api.put(`consultations/${id}/`, data),
  deleteConsultation: (id) => api.delete(`consultations/${id}/`),
  startConsultation: (id) => api.post(`consultations/${id}/start/`),
  endConsultation: (id) => api.post(`consultations/${id}/end/`),
};

// Consultation Message APIs
export const consultationMessageAPI = {
  getMessages: (consultationId) =>
    api.get(`consultation-messages/?consultation=${consultationId}`),
  sendMessage: (data) => api.post("consultation-messages/", data),
};

// Teleconsultation APIs
export const teleconsultationAPI = {
  getTeleconsultations: () => api.get("teleconsultations/"),
  getTeleconsultation: (id) => api.get(`teleconsultations/${id}/`),
  getByConsultation: (consultationId) =>
    api.get(`teleconsultations/?consultation=${consultationId}`),
  create: (data) => api.post("teleconsultations/", data),
  update: (id, data) => api.put(`teleconsultations/${id}/`, data),
  delete: (id) => api.delete(`teleconsultations/${id}/`),
  generateToken: (id) => api.post(`teleconsultations/${id}/generate_token/`),
  endTeleconsultation: (id) => api.post(`teleconsultations/${id}/end/`),
};

// Disponibilité Médecin APIs
export const disponibiliteMedecinAPI = {
  // Pour médecins
  getMesDisponibilites: () => {
    const token = localStorage.getItem("access_token");
    console.log(
      "Token envoyé pour disponibilités:",
      token ? "Présent" : "MANQUANT"
    );
    if (token) {
      console.log(
        "Token value (first 20 chars):",
        token.substring(0, 20) + "..."
      );
    }

    return api.get("medecins/mes-disponibilites/");
  },
  createDisponibilite: (data) => api.post("medecins/mes-disponibilites/", data),
  updateDisponibilite: (id, data) =>
    api.put(`medecins/mes-disponibilites/${id}/`, data),
  deleteDisponibilite: (id) => api.delete(`medecins/mes-disponibilites/${id}/`),

  // Pour patients
  getCreneauxDisponibles: (medecinId, date) =>
    api
      .get(
        `rendezvous/creneaux_disponibles/?medecin_id=${medecinId}&date=${date}`
      )
      .catch((error) => {
        // Enhanced error handling for slot availability
        console.error("Error fetching available slots:", error);
        if (error.response && error.response.status === 404) {
          // Check if this might be due to a doctor not found issue
          throw new Error(
            `Créneaux indisponibles: Médecin #${medecinId} non trouvé ou pas de disponibilité pour cette date.`
          );
        }
        throw error;
      }),
  getProchainsCreneaux: (medecinId, limit = 5) =>
    api.get(`medecins/${medecinId}/prochains-creneaux/?limit=${limit}`),
};

export const indisponibiliteMedecinAPI = {
  // Pour médecins
  getMesIndisponibilites: () => {
    const token = localStorage.getItem("access_token");
    console.log(
      "Token envoyé pour indisponibilités:",
      token ? "Présent" : "MANQUANT"
    );
    if (token) {
      console.log(
        "Token value (first 20 chars):",
        token.substring(0, 20) + "..."
      );
    }

    return api.get("medecins/mes-indisponibilites/");
  },
  createIndisponibilite: (data) =>
    api.post("medecins/mes-indisponibilites/", data),
  deleteIndisponibilite: (id) =>
    api.delete(`medecins/mes-indisponibilites/${id}/`),
};

// Export the base api instance for custom requests
export default api;
