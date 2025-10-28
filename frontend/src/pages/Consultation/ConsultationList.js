import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { consultationAPI, teleconsultationAPI } from "../../services/api";
import {
  FaVideo,
  FaFileMedical,
  FaCalendar,
  FaSearch,
  FaPlus,
} from "react-icons/fa";
import { toast } from "react-toastify";

function ConsultationList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [filteredConsultations, setFilteredConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDoctor, setIsDoctor] = useState(false);
  const [isPatient, setIsPatient] = useState(false);

  // Check user role
  useEffect(() => {
    if (user) {
      const isUserDoctor = user.role === "medecin";
      const isUserPatient = user.role === "patient";
      setIsDoctor(isUserDoctor);
      setIsPatient(isUserPatient);
      console.log(
        "User role:",
        user.role,
        "Is doctor:",
        isUserDoctor,
        "Is patient:",
        isUserPatient
      );
    }
  }, [user]);

  // Load consultations
  useEffect(() => {
    const loadConsultations = async () => {
      try {
        setLoading(true);
        // Use real API instead of mock data
        const response = await consultationAPI.getConsultations();
        console.log("Consultations API response:", response);

        // Ensure we're working with an array
        let consultationsData = [];
        if (response && response.data) {
          consultationsData = Array.isArray(response.data) ? response.data : [];
        }

        console.log("Processed consultations data:", consultationsData);
        setConsultations(consultationsData);
        setFilteredConsultations(consultationsData);
        setLoading(false);
      } catch (err) {
        console.error("Error loading consultations:", err);
        setError("Erreur lors du chargement des consultations");
        toast.error("Erreur lors du chargement des consultations");
        setLoading(false);
      }
    };

    loadConsultations();
  }, []);

  // Filter consultations
  useEffect(() => {
    // Ensure consultations is an array
    let filtered = Array.isArray(consultations) ? consultations : [];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (consultation) =>
          (isDoctor
            ? `${consultation.patient_nom}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            : `${consultation.medecin_nom}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
          consultation.date.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (consultation) => consultation.statut === statusFilter
      );
    }

    setFilteredConsultations(filtered);
  }, [searchTerm, statusFilter, consultations, isDoctor]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "programmee":
        return <span className="badge bg-warning">Programmée</span>;
      case "en_cours":
        return <span className="badge bg-primary">En cours</span>;
      case "terminee":
        return <span className="badge bg-success">Terminée</span>;
      case "annulee":
        return <span className="badge bg-danger">Annulée</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const handleStartConsultation = (consultationId) => {
    navigate(`/consultation/${consultationId}`);
  };

  const handleCreateConsultation = () => {
    // Only doctors can create consultations
    if (isDoctor) {
      navigate("/medecin/consultations/new");
    }
  };

  // Helper function to check if a date is today
  const isToday = (dateString) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let appointmentDate;
      if (dateString instanceof Date) {
        appointmentDate = dateString;
      } else if (typeof dateString === "string") {
        if (dateString.includes("/")) {
          // Format: DD/MM/YYYY
          const parts = dateString.split("/");
          appointmentDate = new Date(parts[2], parts[1] - 1, parts[0]);
        } else if (dateString.includes("-")) {
          // Format: YYYY-MM-DD
          appointmentDate = new Date(dateString);
        } else {
          appointmentDate = new Date(dateString);
        }
      } else {
        appointmentDate = new Date(dateString);
      }

      if (isNaN(appointmentDate.getTime())) {
        return false;
      }

      appointmentDate.setHours(0, 0, 0, 0);
      return today.getTime() === appointmentDate.getTime();
    } catch (error) {
      console.error("Error in isToday function:", error);
      return false;
    }
  };

  const handleTeleconsultation = async (consultationId) => {
    try {
      // First, check if a teleconsultation already exists for this consultation
      let teleconsultationResponse;
      try {
        teleconsultationResponse = await teleconsultationAPI.getByConsultation(
          consultationId
        );
      } catch (err) {
        // No existing teleconsultation found
        console.log("No existing teleconsultation found, creating a new one");
      }

      let teleconsultationId;

      if (
        teleconsultationResponse &&
        teleconsultationResponse.data &&
        teleconsultationResponse.data.length > 0
      ) {
        // Use existing teleconsultation
        teleconsultationId = teleconsultationResponse.data[0].id;
      } else {
        // Create a new teleconsultation
        const createResponse = await teleconsultationAPI.create({
          consultation: consultationId,
        });
        teleconsultationId = createResponse.data.id;
      }

      // Navigate to the waiting room
      navigate(`/teleconsultation/salle-attente/${consultationId}`);
    } catch (err) {
      console.error("Error handling teleconsultation:", err);
      toast.error(
        "Erreur lors de la gestion de la téléconsultation: " +
          (err.response?.data?.error || err.message)
      );
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FaVideo className="me-2" />
          {isDoctor ? "Mes consultations" : "Mes consultations"}
        </h2>
        {isDoctor && (
          <button
            className="btn btn-primary"
            onClick={handleCreateConsultation}
          >
            <FaPlus className="me-2" />
            Nouvelle consultation
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Rechercher par ${
                    isDoctor ? "patient" : "médecin"
                  } ou date...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="programmee">Programmée</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
                <option value="annulee">Annulée</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Consultations List */}
      {Array.isArray(filteredConsultations) &&
      filteredConsultations.length === 0 ? (
        <div className="card text-center py-5">
          <div className="card-body">
            <FaVideo className="text-muted" size={48} />
            <h4 className="mt-3">Aucune consultation trouvée</h4>
            <p className="text-muted">
              {searchTerm || statusFilter !== "all"
                ? "Aucune consultation ne correspond à vos critères de recherche."
                : isDoctor
                ? "Vous n'avez pas encore de consultations programmées."
                : "Vous n'avez pas encore de consultations programmées."}
            </p>
            {isDoctor && (
              <button
                className="btn btn-primary"
                onClick={handleCreateConsultation}
              >
                <FaPlus className="me-2" />
                Créer une consultation
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="row">
          {Array.isArray(filteredConsultations) &&
            filteredConsultations.map((consultation) => (
              <div key={consultation.numero} className="col-md-6 col-lg-4 mb-4">
                <div className="card h-100">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="card-title">
                          <FaFileMedical className="me-2 text-primary" />
                          Consultation #{consultation.numero}
                        </h5>
                        <p className="card-text text-muted">
                          {isDoctor
                            ? `${consultation.patient_nom}`
                            : `Dr. ${consultation.medecin_nom}`}
                        </p>
                      </div>
                      {getStatusBadge(consultation.statut)}
                    </div>

                    <div className="mb-3">
                      <div className="d-flex align-items-center text-muted mb-1">
                        <FaCalendar className="me-2" />
                        <small>
                          {consultation.date} à {consultation.heure}
                        </small>
                      </div>
                      {/* Debug: Show raw date value */}
                      <div className="text-muted small">
                        Raw date: {consultation.date} (type:{" "}
                        {typeof consultation.date})
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      {consultation.statut === "programmee" && (
                        <button
                          className="btn btn-success"
                          onClick={() =>
                            handleStartConsultation(consultation.numero)
                          }
                        >
                          <FaVideo className="me-2" />
                          Démarrer la consultation
                        </button>
                      )}

                      {consultation.statut === "en_cours" && (
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            handleStartConsultation(consultation.numero)
                          }
                        >
                          <FaVideo className="me-2" />
                          Rejoindre la consultation
                        </button>
                      )}

                      {/* Teleconsultation button for confirmed appointments that are today */}
                      {console.log(
                        "Consultation debug:",
                        consultation.numero,
                        consultation.statut,
                        consultation.date,
                        "isToday:",
                        isToday(consultation.date),
                        "shouldShowButton:",
                        consultation.statut === "programmee" &&
                          isToday(consultation.date)
                      )}
                      {(consultation.statut === "programmee" ||
                        consultation.statut === "en_cours") &&
                        isToday(consultation.date) && (
                          <button
                            className="btn btn-info"
                            onClick={() =>
                              handleTeleconsultation(consultation.numero)
                            }
                          >
                            <FaVideo className="me-2" />
                            Téléconsultation
                          </button>
                        )}

                      <button
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() =>
                          navigate(
                            `/consultation/${consultation.numero}/details`
                          )
                        }
                      >
                        Voir les détails
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export default ConsultationList;
