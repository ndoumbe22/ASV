import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  FaCalendarCheck, FaUserMd, FaFileMedical, FaEnvelope, 
  FaCog, FaSignOutAlt, FaUser, FaSearch, FaBell, 
  FaPills, FaRobot, FaChartLine, FaQrcode, FaStar,
  FaChevronLeft, FaChevronRight, FaStethoscope, FaHospital,
  FaPrescriptionBottle, FaHeartbeat, FaNotesMedical
} from "react-icons/fa";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { patientAPI, userAPI } from "../../services/api";
import EnhancedChatbot from "../../components/EnhancedChatbot";
import RatingComponent from "../../components/RatingComponent";
import DoctorRating from "../../components/DoctorRating";
import MedicationTodayWidget from "../../components/MedicationTodayWidget";
import NotificationCenter from "../../components/NotificationCenter";

function EnhancedDashboardPatientV2() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [theme, setTheme] = useState("light");
  const [fullName, setFullName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [confirmedDoctorsCount, setConfirmedDoctorsCount] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDoctorRating, setShowDoctorRating] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [appointmentHistoryData, setAppointmentHistoryData] = useState([]);
  const [medicationAdherenceData, setMedicationAdherenceData] = useState([]);

  // Quick actions carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const quickActions = [
    { 
      title: "Prendre rendez-vous", 
      icon: <FaCalendarCheck size={24} />, 
      color: "primary",
      path: "/patient/prise-rendez-vous"
    },
    { 
      title: "Mes médicaments", 
      icon: <FaPills size={24} />, 
      color: "success",
      path: "/patient/medication-reminders"
    },
    { 
      title: "Dossier médical", 
      icon: <FaFileMedical size={24} />, 
      color: "info",
      path: "/patient/dossier-medical"
    },
    { 
      title: "Urgences", 
      icon: <FaHeartbeat size={24} />, 
      color: "danger",
      path: "/patient/urgence"
    },
    { 
      title: "Mes médecins", 
      icon: <FaUserMd size={24} />, 
      color: "warning",
      path: "/patient/mes-medecins"
    }
  ];

  // Health tips
  const healthTips = [
    "Buvez au moins 8 verres d'eau par jour pour rester hydraté.",
    "Faites 30 minutes d'exercice quotidien pour maintenir votre santé.",
    "Mangez 5 portions de fruits et légumes par jour.",
    "Dormez 7-8 heures par nuit pour un bon rétablissement.",
    "Lavez-vous les mains régulièrement pour prévenir les infections."
  ];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/connecter");
    }
  }, [isAuthenticated, navigate]);

  // Handle logout using the proper AuthContext method
  const handleLogout = () => {
    // Clear all stored data using the same names as AuthContext
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/connecter");
  };

  // Charger les données du patient depuis l'API
  useEffect(() => {
    const fetchPatientData = async () => {
      if (!isAuthenticated || !user) return;
      
      try {
        setLoading(true);
        setError(null);
        // Get current user's profile data
        const profileResponse = await userAPI.getProfile();
        console.log("User profile:", profileResponse.data);
        
        setPatientData(profileResponse.data);
        const firstName = profileResponse.data.first_name || "";
        const lastName = profileResponse.data.last_name || "";
        const username = profileResponse.data.username || "";
        setFullName(`${firstName} ${lastName}`.trim() || username || "Patient");
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement des données du patient :", err);
        // Fallback to AuthContext data
        setFullName(`${user.firstName} ${user.lastName}`.trim() || user.username || "Patient");
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchPatientData();
    }
  }, [isAuthenticated, user]);

  // Initialize mock data for charts
  useEffect(() => {
    // Mock data for appointment history
    const mockAppointmentHistory = [
      { mois: "Jan", rendez_vous: 2 },
      { mois: "Fév", rendez_vous: 3 },
      { mois: "Mar", rendez_vous: 1 },
      { mois: "Avr", rendez_vous: 4 },
      { mois: "Mai", rendez_vous: 2 },
      { mois: "Juin", rendez_vous: 3 }
    ];
    
    // Mock data for medication adherence
    const mockMedicationAdherence = [
      { jour: "Lun", pris: 3, manqués: 1 },
      { jour: "Mar", pris: 4, manqués: 0 },
      { jour: "Mer", pris: 2, manqués: 2 },
      { jour: "Jeu", pris: 4, manqués: 0 },
      { jour: "Ven", pris: 3, manqués: 1 },
      { jour: "Sam", pris: 2, manqués: 2 },
      { jour: "Dim", pris: 4, manqués: 0 }
    ];
    
    setAppointmentHistoryData(mockAppointmentHistory);
    setMedicationAdherenceData(mockMedicationAdherence);
  }, []);

  // Charger les rendez-vous du patient
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isAuthenticated) return;
      
      try {
        // Fetch both upcoming and history appointments to get a complete picture
        const [upcomingResponse, historyResponse] = await Promise.all([
          patientAPI.getAppointments(),
          patientAPI.getAppointmentHistory()
        ]);
        
        console.log("Upcoming appointments:", upcomingResponse.data);
        console.log("Appointment history:", historyResponse.data);
        
        // Combine both sets of appointments
        const allAppointments = [
          ...(upcomingResponse.data || []), 
          ...(historyResponse.data || [])
        ];
        
        setAppointments(allAppointments);
        
        // Calculate the number of doctors with confirmed appointments
        // This includes both past and future confirmed appointments
        if (allAppointments && Array.isArray(allAppointments)) {
          const confirmedAppointments = allAppointments.filter(app => 
            app.statut && app.statut === "CONFIRMED"
          );
          console.log("Confirmed appointments (all time):", confirmedAppointments);
          
          // Create a set of unique doctor names
          const uniqueDoctors = new Set();
          confirmedAppointments.forEach(app => {
            if (app.medecin_nom) {
              uniqueDoctors.add(app.medecin_nom);
            }
          });
          
          console.log("Unique doctors with confirmed appointments:", Array.from(uniqueDoctors));
          setConfirmedDoctorsCount(uniqueDoctors.size);
        } else {
          console.warn("Invalid appointments data format");
          setConfirmedDoctorsCount(0);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des rendez-vous :", err);
        // Set to 0 in case of error
        setConfirmedDoctorsCount(0);
      }
    };

    if (isAuthenticated) {
      fetchAppointments();
    }
  }, [isAuthenticated]);

  // Charger les médicaments du patient
  useEffect(() => {
    const fetchMedications = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await patientAPI.getMedications();
        setMedications(response.data);
      } catch (err) {
        console.error("Erreur lors du chargement des médicaments :", err);
      }
    };

    if (isAuthenticated) {
      fetchMedications();
    }
  }, [isAuthenticated]);

  // Charger le thème sauvegardé
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
  }, []);

  // Appliquer le thème
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Auto-slide quick actions carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % Math.ceil(quickActions.length / 3));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [quickActions.length]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % Math.ceil(quickActions.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + Math.ceil(quickActions.length / 3)) % Math.ceil(quickActions.length / 3));
  };

  const handleRateDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDoctorRating(true);
  };

  const handleRatingSubmit = (ratingData) => {
    console.log("Rating submitted:", ratingData);
    // In a real implementation, you would send this to the backend
    setShowDoctorRating(false);
    setSelectedDoctor(null);
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>Chargement...</div>;
  }

  if (error) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>Erreur: {error}</div>;
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* ===== Sidebar ===== */}
      <aside 
        style={{ 
          width: "250px", 
          padding: "20px", 
          backgroundColor: "#2E7D32",
          color: "white"
        }}
      >
        <div className="d-flex align-items-center mb-4">
          <div className="d-flex align-items-center">
            <FaUserMd size={30} className="me-2" />
            <h4>AssitoSanté</h4>
          </div>
        </div>

        <ul className="nav flex-column">
          <li className="nav-item mb-3">
            <Link to="/patient/dashboard" className="nav-link text-white active">
              <FaChartLine className="me-2" /> Tableau de bord
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/patient/rendez-vous" className="nav-link text-white">
              <FaCalendarCheck className="me-2" /> Rendez-vous
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/patient/prise-rendez-vous" className="nav-link text-white">
              <FaCalendarCheck className="me-2" /> Prise de Rendez-vous
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/patient/dossier-medical" className="nav-link text-white">
              <FaFileMedical className="me-2" /> Dossier Médical
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/patient/document-partage" className="nav-link text-white">
              <FaFileMedical className="me-2" /> Documents Partagés
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/patient/medication-reminders" className="nav-link text-white">
              <FaPills className="me-2" /> Rappels Médicaments
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/patient/profile" className="nav-link text-white">
              <FaUser className="me-2" /> Profil
            </Link>
          </li>
        </ul>
        <hr style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

        <div className="mt-auto pt-4">
          <button className="nav-link text-white btn btn-link" onClick={handleLogout}>
            <FaSignOutAlt className="me-2" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* ===== Contenu principal ===== */}
      <main className="flex-grow-1 p-4">
        {/* ===== Topbar ===== */}
        <div
          className="d-flex justify-content-between align-items-center mb-4 topbar"
          style={{ padding: "10px 20px", borderRadius: "10px", backgroundColor: "#f5f6fa" }}
        >
          {/* Barre de recherche */}
          <div style={{ position: "relative", width: "250px" }}>
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderRadius: "20px",
                border: "1px solid #ddd",
                padding: "6px 12px 6px 35px",
                width: "100%",
                backgroundColor: "white",
                outline: "none",
              }}
            />
            <FaSearch
              style={{
                position: "absolute",
                top: "50%",
                left: "12px",
                transform: "translateY(-50%)",
                color: "#888",
              }}
            />
          </div>

          {/* Icônes + Profil */}
          <div className="d-flex align-items-center">
            <div style={{ ...iconStyle }}><FaCog size={16} /></div>
            <NotificationCenter />
            <div className="d-flex align-items-center ms-3">
              <div
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  backgroundColor: "#2E7D32",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  marginRight: "10px",
                }}
              >
                {fullName?.charAt(0) || user?.username?.charAt(0) || 'P'}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "500" }}>{fullName || user?.username || "Patient"}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Patient</div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Welcome Banner ===== */}
        <div className="card mb-4" style={{ background: "linear-gradient(135deg, #2E7D32, #4CAF50)", color: "white" }}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2>Bonjour, {fullName || user?.username || "Patient"}!</h2>
                <p className="mb-0">Bienvenue sur votre tableau de bord de santé personnalisé</p>
              </div>
              <div className="text-end">
                <div className="d-flex align-items-center">
                  <FaHeartbeat size={30} className="me-2" />
                  <div>
                    <div className="fw-bold">Bon état de santé</div>
                    <small>Dernière mise à jour: Aujourd'hui</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Quick Actions Carousel ===== */}
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Actions rapides</h5>
            <div className="d-flex">
              <button className="btn btn-sm btn-outline-secondary me-1" onClick={prevSlide}>
                <FaChevronLeft />
              </button>
              <button className="btn btn-sm btn-outline-secondary" onClick={nextSlide}>
                <FaChevronRight />
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="d-flex overflow-hidden">
              <div 
                className="d-flex" 
                style={{ 
                  transform: `translateX(-${currentSlide * 100}%)`, 
                  transition: "transform 0.5s ease-in-out",
                  width: `${Math.ceil(quickActions.length / 3) * 100}%`
                }}
              >
                {Array(Math.ceil(quickActions.length / 3)).fill().map((_, groupIndex) => (
                  <div key={groupIndex} className="d-flex" style={{ width: "100%" }}>
                    {quickActions.slice(groupIndex * 3, (groupIndex + 1) * 3).map((action, index) => (
                      <div key={index} className="col-md-4 mb-3 px-2">
                        <Link 
                          to={action.path}
                          className="text-decoration-none"
                        >
                          <div 
                            className="card h-100 text-center border-0 shadow-sm"
                            style={{ 
                              backgroundColor: `var(--bs-${action.color})`,
                              color: "white",
                              transition: "transform 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                          >
                            <div className="card-body d-flex flex-column justify-content-center align-items-center">
                              <div className="mb-2">{action.icon}</div>
                              <h6 className="card-title mb-0">{action.title}</h6>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== Health Tip of the Day ===== */}
        <div className="alert alert-info d-flex align-items-center mb-4">
          <FaNotesMedical size={24} className="me-2" />
          <div>
            <strong>Conseil santé du jour:</strong> {healthTips[Math.floor(Math.random() * healthTips.length)]}
          </div>
        </div>

        {/* ===== Tabs ===== */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              Vue d'ensemble
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === "appointments" ? "active" : ""}`}
              onClick={() => setActiveTab("appointments")}
            >
              Rendez-vous
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === "medications" ? "active" : ""}`}
              onClick={() => setActiveTab("medications")}
            >
              Médicaments
            </button>
          </li>
        </ul>

        {/* ===== Overview Tab ===== */}
        {activeTab === "overview" && (
          <div>
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title">Rendez-vous</h5>
                        <h2>{appointments.length}</h2>
                      </div>
                      <FaCalendarCheck size={30} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title">Médicaments</h5>
                        <h2>{medications.length}</h2>
                      </div>
                      <FaPills size={30} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-info text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title">Médecins</h5>
                        <h2>{confirmedDoctorsCount}</h2>
                        <small>avec RDV confirmé</small>
                      </div>
                      <FaUserMd size={30} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-warning text-dark">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title">Notifications</h5>
                        <h2>0</h2>
                      </div>
                      <FaBell size={30} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-8">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>Historique des rendez-vous</h5>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={appointmentHistoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mois" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="rendez_vous" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>Prochains rendez-vous</h5>
                  </div>
                  <div className="card-body">
                    {appointments.filter(app => app.statut === "CONFIRMED").length === 0 ? (
                      <p className="text-muted">Aucun rendez-vous confirmé</p>
                    ) : (
                      appointments.filter(app => app.statut === "CONFIRMED").map(app => (
                        <div key={app.id} className="mb-3 p-3 border rounded">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="d-flex align-items-center">
                                <strong>{app.medecin_nom}</strong>
                                {app.rating && (
                                  <span className="ms-2">
                                    <RatingComponent 
                                      initialRating={app.rating}
                                      readonly={true}
                                      size="sm"
                                    />
                                  </span>
                                )}
                              </div>
                              <div className="text-muted small">{app.specialite}</div>
                              <div>{app.date} à {app.heure}</div>
                            </div>
                            <span className="badge bg-success">Confirmé</span>
                          </div>
                          {!app.rating && (
                            <button 
                              className="btn btn-sm btn-outline-primary mt-2"
                              onClick={() => handleRateDoctor(app)}
                            >
                              <FaStar className="me-1" /> Noter
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Medication Today Widget */}
                <div className="mb-4">
                  <MedicationTodayWidget />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Appointments Tab ===== */}
        {activeTab === "appointments" && (
          <div>
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <h5>Mes Rendez-vous</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Heure</th>
                            <th>Médecin</th>
                            <th>Spécialité</th>
                            <th>Statut</th>
                            <th>Note</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map(app => (
                            <tr key={app.id}>
                              <td>{app.date}</td>
                              <td>{app.heure}</td>
                              <td>{app.medecin_nom}</td>
                              <td>{app.specialite}</td>
                              <td>
                                <span className={`badge ${
                                  app.statut === "CONFIRMED" ? "bg-success" :
                                  app.statut === "PENDING" ? "bg-warning" :
                                  "bg-danger"
                                }`}>
                                  {app.statut}
                                </span>
                              </td>
                              <td>
                                {app.rating ? (
                                  <RatingComponent 
                                    initialRating={app.rating}
                                    readonly={true}
                                    size="sm"
                                  />
                                ) : (
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleRateDoctor(app)}
                                  >
                                    Noter
                                  </button>
                                )}
                              </td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary me-1">
                                  Voir détails
                                </button>
                                <button className="btn btn-sm btn-outline-secondary">
                                  Modifier
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== Medications Tab ===== */}
        {activeTab === "medications" && (
          <div>
            <div className="row">
              <div className="col-md-8">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>Adhérence aux médicaments</h5>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={medicationAdherenceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="jour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="pris" fill="#82ca9d" name="Pris" />
                        <Bar dataKey="manqués" fill="#ff8042" name="Manqués" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>Mes Médicaments</h5>
                  </div>
                  <div className="card-body">
                    {medications.length === 0 ? (
                      <p className="text-muted">Aucun médicament enregistré</p>
                    ) : (
                      medications.map(med => (
                        <div key={med.id} className="mb-3 p-2 border rounded">
                          <div className="d-flex justify-content-between">
                            <strong>{med.medicament}</strong>
                          </div>
                          <div>Dosage: {med.dosage}</div>
                          <div>Fréquence: {med.frequence}</div>
                          <div>Prochain rappel: {med.heure_rappel}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Enhanced Chatbot */}
      <EnhancedChatbot />
      
      {/* Doctor Rating Modal */}
      {showDoctorRating && selectedDoctor && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Évaluer {selectedDoctor.medecin_nom}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDoctorRating(false)}
                ></button>
              </div>
              <div className="modal-body">
                <DoctorRating 
                  doctorId={selectedDoctor.id}
                  onRatingSubmit={handleRatingSubmit}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const iconStyle = {
  width: "35px",
  height: "35px",
  borderRadius: "50%",
  backgroundColor: "#f0f0f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: "15px",
  cursor: "pointer",
  position: "relative",
};

const badgeStyle = {
  position: "absolute",
  top: "-5px",
  right: "-5px",
  backgroundColor: "red",
  color: "white",
  borderRadius: "50%",
  width: "18px",
  height: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "10px",
  fontWeight: "bold",
};

export default EnhancedDashboardPatientV2;