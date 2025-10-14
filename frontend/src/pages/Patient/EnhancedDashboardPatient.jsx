import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaCalendarCheck, FaUserMd, FaFileMedical, FaEnvelope, 
  FaCog, FaSignOutAlt, FaUser, FaSearch, FaBell, 
  FaPills, FaRobot, FaChartLine, FaQrcode
} from "react-icons/fa";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { patientAPI } from "../../services/api";
import EnhancedChatbot from "../../components/EnhancedChatbot";

function EnhancedDashboardPatient() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [fullName, setFullName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");

  // 🔔 Notifications
  const [notifications, setNotifications] = useState([
    "Rendez-vous demain à 10h avec Dr. Ndiaye.",
    "Votre ordonnance a été mise à jour.",
    "Résultats de votre analyse sanguine disponibles.",
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => setShowNotifications(!showNotifications);
  const clearNotifications = () => setNotifications([]);

  // Charger les données du patient depuis l'API
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would get the actual patient ID
        // const response = await patientAPI.getPatient(1);
        // setPatientData(response.data);
        // setFullName(`${response.data.user.first_name} ${response.data.user.last_name}`.trim());
        
        // For demo purposes, we'll use mock data
        setPatientData({
          id: 1,
          user: {
            first_name: "Aminata",
            last_name: "Fall",
            email: "aminata.fall@example.com"
          }
        });
        setFullName("Aminata Fall");
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des données du patient");
        setLoading(false);
        console.error("Erreur lors du chargement des données du patient :", err);
      }
    };

    fetchPatientData();
  }, []);

  // Charger les rendez-vous du patient
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // In a real implementation, you would call the API
        // const response = await patientAPI.getAppointments();
        // setAppointments(response.data);
        
        // For demo purposes, we'll use mock data
        setAppointments([
          {
            id: 1,
            date: "2024-06-15",
            heure: "10:30",
            medecin_nom: "Dr. Martin Diop",
            statut: "CONFIRMED"
          },
          {
            id: 2,
            date: "2024-06-20",
            heure: "14:00",
            medecin_nom: "Dr. Fatou Ndiaye",
            statut: "PENDING"
          }
        ]);
      } catch (err) {
        console.error("Erreur lors du chargement des rendez-vous :", err);
      }
    };

    fetchAppointments();
  }, []);

  // Charger les médicaments du patient
  useEffect(() => {
    const fetchMedications = async () => {
      try {
        // In a real implementation, you would call the API
        // const response = await medicationService.getReminders();
        // setMedications(response.data);
        
        // For demo purposes, we'll use mock data
        setMedications([
          {
            id: 1,
            medicament: "Paracétamol",
            dosage: "500mg",
            frequence: "3/jour",
            heure_rappel: "08:00"
          },
          {
            id: 2,
            medicament: "Amoxicilline",
            dosage: "1g",
            frequence: "2/jour",
            heure_rappel: "12:00"
          }
        ]);
      } catch (err) {
        console.error("Erreur lors du chargement des médicaments :", err);
      }
    };

    fetchMedications();
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/connecter");
  };

  // Sample data for charts
  const medicationAdherenceData = [
    { jour: "Lun", pris: 3, manqués: 1 },
    { jour: "Mar", pris: 4, manqués: 0 },
    { jour: "Mer", pris: 2, manqués: 2 },
    { jour: "Jeu", pris: 4, manqués: 0 },
    { jour: "Ven", pris: 3, manqués: 1 },
    { jour: "Sam", pris: 2, manqués: 2 },
    { jour: "Dim", pris: 4, manqués: 0 }
  ];

  const appointmentHistoryData = [
    { mois: "Mai", rendez_vous: 3 },
    { mois: "Juin", rendez_vous: 5 },
    { mois: "Juil", rendez_vous: 2 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
            <div
              style={{ ...iconStyle, position: "relative" }}
              onClick={toggleNotifications}
            >
              <FaBell size={18} />
              {notifications.length > 0 && <span style={badgeStyle}></span>}
            </div>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  top: "50px",
                  right: "50px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  width: "300px",
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    padding: "15px",
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <h6>Notifications</h6>
                  <button
                    onClick={clearNotifications}
                    style={{ border: "none", background: "none", color: "#888" }}
                  >
                    Effacer tout
                  </button>
                </div>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "15px", textAlign: "center", color: "#888" }}>
                      Aucune notification
                    </div>
                  ) : (
                    notifications.map((notification, index) => (
                      <div
                        key={index}
                        style={{
                          padding: "12px 15px",
                          borderBottom: "1px solid #eee",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#f5f5f5")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor = "white")
                        }
                      >
                        <div style={{ fontSize: "14px" }}>{notification}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

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
                {fullName.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "500" }}>{fullName}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Patient</div>
              </div>
            </div>
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
                        <h5 className="card-title">Documents</h5>
                        <h2>5</h2>
                      </div>
                      <FaFileMedical size={30} />
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
                        <h2>{notifications.length}</h2>
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
                        <div key={app.id} className="mb-3 p-2 border rounded">
                          <div className="d-flex justify-content-between">
                            <strong>{app.medecin_nom}</strong>
                            <span className="badge bg-success">Confirmé</span>
                          </div>
                          <div>{app.date} à {app.heure}</div>
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
                            <th>Médecin</th>
                            <th>Statut</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map(app => (
                            <tr key={app.id}>
                              <td>{app.date}</td>
                              <td>{app.heure}</td>
                              <td>{app.medecin_nom}</td>
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
                                <button className="btn btn-sm btn-outline-primary">
                                  Voir détails
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

export default EnhancedDashboardPatient;