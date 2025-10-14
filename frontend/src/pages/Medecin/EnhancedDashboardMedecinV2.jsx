import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaCalendarCheck, FaUserMd, FaFileMedical, FaEnvelope, 
  FaCog, FaSignOutAlt, FaUser, FaSearch, FaBell, 
  FaPills, FaRobot, FaChartLine, FaQrcode, FaStar,
  FaChevronLeft, FaChevronRight, FaStethoscope, FaHospital,
  FaPrescriptionBottle, FaHeartbeat, FaNotesMedical, FaUsers,
  FaClipboardList, FaComments, FaBookMedical
} from "react-icons/fa";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { doctorAPI } from "../../services/api";
import EnhancedChatbot from "../../components/EnhancedChatbot";
import NotificationCenter from "../../components/NotificationCenter";
import DoctorRatingsDisplay from "../../components/DoctorRatingsDisplay";

function EnhancedDashboardMedecinV2() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [fullName, setFullName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [showRatings, setShowRatings] = useState(false);

  // 🔔 Notifications
  const [notifications, setNotifications] = useState([
    "Nouveau patient en attente de confirmation.",
    "Rappel: Consultation à 14h avec M. Diop.",
    "Nouveau message de votre secrétaire.",
  ]);

  // Quick actions carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const quickActions = [
    { 
      title: "Mes rendez-vous", 
      icon: <FaCalendarCheck size={24} />, 
      color: "primary",
      path: "/medecin/rendez-vous"
    },
    { 
      title: "Mes patients", 
      icon: <FaUsers size={24} />, 
      color: "success",
      path: "/medecin/patients"
    },
    { 
      title: "Dossiers médicaux", 
      icon: <FaFileMedical size={24} />, 
      color: "info",
      path: "/medecin/dossiers-patients"
    },
    { 
      title: "Documents partagés", 
      icon: <FaClipboardList size={24} />, 
      color: "warning",
      path: "/medecin/document-partage"
    },
    { 
      title: "Mes articles", 
      icon: <FaBookMedical size={24} />, 
      color: "secondary",
      path: "/medecin/articles"
    }
  ];

  // Health tips for doctors
  const healthTips = [
    "Prenez des pauses régulières pour éviter l'épuisement professionnel.",
    "Maintenez une bonne posture pendant les consultations.",
    "Hydratez-vous régulièrement tout au long de la journée.",
    "Pratiquez une activité physique pour réduire le stress.",
    "Assurez-vous de bien dormir pour maintenir votre concentration."
  ];

  // Charger les données du médecin depuis l'API
  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would get the actual doctor ID
        // const response = await doctorAPI.getDoctor(1);
        // setDoctorData(response.data);
        // setFullName(`${response.data.user.first_name} ${response.data.user.last_name}`.trim());
        
        // For demo purposes, we'll use mock data
        setDoctorData({
          id: 1,
          user: {
            first_name: "Martin",
            last_name: "Diop",
            email: "martin.diop@example.com"
          },
          specialite: "Cardiologue",
          rating: 4.7,
          total_patients: 128,
          consultations_this_month: 42
        });
        setFullName("Dr. Martin Diop");
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des données du médecin");
        setLoading(false);
        console.error("Erreur lors du chargement des données du médecin :", err);
      }
    };

    fetchDoctorData();
  }, []);

  // Charger les rendez-vous du médecin
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // In a real implementation, you would call the API
        // const response = await doctorAPI.getAppointments();
        // setAppointments(response.data);
        
        // For demo purposes, we'll use mock data
        setAppointments([
          {
            id: 1,
            date: "2024-06-15",
            heure: "10:30",
            patient_nom: "Aminata Fall",
            motif: "Bilan de santé annuel",
            statut: "CONFIRMED"
          },
          {
            id: 2,
            date: "2024-06-15",
            heure: "11:15",
            patient_nom: "Mamadou Sow",
            motif: "Douleurs thoraciques",
            statut: "CONFIRMED"
          },
          {
            id: 3,
            date: "2024-06-15",
            heure: "14:00",
            patient_nom: "Fatou Ndiaye",
            motif: "Suivi hypertension",
            statut: "PENDING"
          }
        ]);
      } catch (err) {
        console.error("Erreur lors du chargement des rendez-vous :", err);
      }
    };

    fetchAppointments();
  }, []);

  // Charger les patients du médecin
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // In a real implementation, you would call the API
        // const response = await doctorAPI.getPatients();
        // setPatients(response.data);
        
        // For demo purposes, we'll use mock data
        setPatients([
          { id: 1, nom: "Aminata Fall", age: 35, derniere_consultation: "2024-06-10" },
          { id: 2, nom: "Mamadou Sow", age: 42, derniere_consultation: "2024-06-08" },
          { id: 3, nom: "Fatou Ndiaye", age: 28, derniere_consultation: "2024-06-05" },
          { id: 4, nom: "Ousmane Sarr", age: 55, derniere_consultation: "2024-06-01" }
        ]);
      } catch (err) {
        console.error("Erreur lors du chargement des patients :", err);
      }
    };

    fetchPatients();
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/connecter");
  };

  // Sample data for charts
  const appointmentHistoryData = [
    { mois: "Mai", rendez_vous: 38 },
    { mois: "Juin", rendez_vous: 42 },
    { mois: "Juil", rendez_vous: 35 }
  ];

  const patientAgeDistribution = [
    { range: "18-30", count: 25 },
    { range: "31-45", count: 42 },
    { range: "46-60", count: 38 },
    { range: "60+", count: 23 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % Math.ceil(quickActions.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + Math.ceil(quickActions.length / 3)) % Math.ceil(quickActions.length / 3));
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
          backgroundColor: "#1976D2",
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
            <Link to="/medecin/dashboard" className="nav-link text-white active">
              <FaChartLine className="me-2" /> Tableau de bord
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/medecin/rendez-vous" className="nav-link text-white">
              <FaCalendarCheck className="me-2" /> Rendez-vous
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/medecin/patients" className="nav-link text-white">
              <FaUsers className="me-2" /> Mes Patients
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/medecin/dossiers-patients" className="nav-link text-white">
              <FaFileMedical className="me-2" /> Dossiers Médicaux
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/medecin/document-partage" className="nav-link text-white">
              <FaClipboardList className="me-2" /> Documents Partagés
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/medecin/articles" className="nav-link text-white">
              <FaBookMedical className="me-2" /> Mes Articles
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/medecin/profile" className="nav-link text-white">
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
                  backgroundColor: "#1976D2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  marginRight: "10px",
                }}
              >
                {fullName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "500" }}>{fullName}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Médecin</div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Welcome Banner ===== */}
        <div className="card mb-4" style={{ background: "linear-gradient(135deg, #1976D2, #2196F3)", color: "white" }}>
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2>Bonjour, {fullName || "Médecin"}!</h2>
                <p className="mb-0">Bienvenue sur votre tableau de bord professionnel</p>
              </div>
              <div className="text-end">
                <div className="d-flex align-items-center">
                  <FaStethoscope size={30} className="me-2" />
                  <div>
                    <div className="fw-bold">{doctorData?.specialite || "Spécialiste"}</div>
                    <small>Note: {doctorData?.rating || "N/A"} ★</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Doctor Stats Cards ===== */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title">Patients</h5>
                    <h2>{doctorData?.total_patients || 0}</h2>
                  </div>
                  <FaUsers size={30} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title">Consultations</h5>
                    <h2>{doctorData?.consultations_this_month || 0}</h2>
                  </div>
                  <FaClipboardList size={30} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title">Note moyenne</h5>
                    <h2>{doctorData?.rating || 0}<small>/5</small></h2>
                  </div>
                  <FaStar size={30} />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card bg-warning text-dark">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="card-title">Rendez-vous</h5>
                    <h2>{appointments.filter(a => a.statut === "CONFIRMED").length}</h2>
                  </div>
                  <FaCalendarCheck size={30} />
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
            <strong>Conseil professionnel du jour:</strong> {healthTips[Math.floor(Math.random() * healthTips.length)]}
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
              className={`nav-link ${activeTab === "patients" ? "active" : ""}`}
              onClick={() => setActiveTab("patients")}
            >
              Patients
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === "ratings" ? "active" : ""}`}
              onClick={() => setShowRatings(!showRatings)}
            >
              <FaStar className="me-1" /> Évaluations
            </button>
          </li>
        </ul>

        {/* ===== Overview Tab ===== */}
        {activeTab === "overview" && (
          <div>
            <div className="row">
              <div className="col-md-8">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>Historique des consultations</h5>
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
                    <h5>Répartition des patients par âge</h5>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={patientAgeDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {patientAgeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>Prochains rendez-vous</h5>
                  </div>
                  <div className="card-body">
                    {appointments.filter(app => app.statut === "CONFIRMED").slice(0, 3).length === 0 ? (
                      <p className="text-muted">Aucun rendez-vous confirmé</p>
                    ) : (
                      appointments.filter(app => app.statut === "CONFIRMED").slice(0, 3).map(app => (
                        <div key={app.id} className="mb-3 p-3 border rounded">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="d-flex align-items-center">
                                <strong>{app.patient_nom}</strong>
                              </div>
                              <div className="text-muted small">{app.motif}</div>
                              <div>{app.date} à {app.heure}</div>
                            </div>
                            <span className="badge bg-success">Confirmé</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>Mes patients récents</h5>
                  </div>
                  <div className="card-body">
                    {patients.slice(0, 3).length === 0 ? (
                      <p className="text-muted">Aucun patient enregistré</p>
                    ) : (
                      patients.slice(0, 3).map(patient => (
                        <div key={patient.id} className="mb-3 p-3 border rounded">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <div className="d-flex align-items-center">
                                <strong>{patient.nom}</strong>
                              </div>
                              <div className="text-muted small">{patient.age} ans</div>
                              <div>Dernière consultation: {patient.derniere_consultation}</div>
                            </div>
                            <button className="btn btn-sm btn-outline-primary">
                              Voir dossier
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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
                            <th>Patient</th>
                            <th>Motif</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map(app => (
                            <tr key={app.id}>
                              <td>{app.date}</td>
                              <td>{app.heure}</td>
                              <td>{app.patient_nom}</td>
                              <td>{app.motif}</td>
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

        {/* ===== Patients Tab ===== */}
        {activeTab === "patients" && (
          <div>
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <h5>Mes Patients</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Nom</th>
                            <th>Âge</th>
                            <th>Dernière consultation</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patients.map(patient => (
                            <tr key={patient.id}>
                              <td>{patient.nom}</td>
                              <td>{patient.age} ans</td>
                              <td>{patient.derniere_consultation}</td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary me-1">
                                  Voir dossier
                                </button>
                                <button className="btn btn-sm btn-outline-secondary">
                                  Envoyer message
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

        {/* ===== Ratings Tab ===== */}
        {showRatings && (
          <div className="row">
            <div className="col-md-12">
              <div className="card">
                <div className="card-header">
                  <h5>Évaluations des patients</h5>
                </div>
                <div className="card-body">
                  <DoctorRatingsDisplay doctorId={doctorData?.id || 1} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Enhanced Chatbot */}
      <EnhancedChatbot />
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

export default EnhancedDashboardMedecinV2;