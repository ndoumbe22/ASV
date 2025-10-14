import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  FaUserMd, FaCalendarCheck, FaFileMedical, FaBell, 
  FaCog, FaSignOutAlt, FaUser, FaSearch, FaChartLine,
  FaStethoscope, FaUserInjured, FaClipboardList, FaRobot
} from "react-icons/fa";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import EnhancedChatbot from "../../components/EnhancedChatbot";

function EnhancedDashboardMedecin() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [fullName, setFullName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [patients, setPatients] = useState([]);

  // 🔔 Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => setShowNotifications(!showNotifications);
  const clearNotifications = () => setNotifications([]);

  // Charger les données du médecin depuis localStorage
  useEffect(() => {
    const firstName = localStorage.getItem("first_name") || "Dr. Martin";
    const lastName = localStorage.getItem("last_name") || "Diop";
    setFullName(`Dr. ${firstName} ${lastName}`.trim());
  }, []);

  // Charger les rendez-vous du médecin
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would call the API
        // const response = await appointmentAPI.getAppointments();
        // setAppointments(response.data);
        
        // For demo purposes, we'll use mock data
        setAppointments([
          {
            id: 1,
            date: "2024-06-15",
            heure: "10:30",
            patient_nom: "Aminata Fall",
            statut: "CONFIRMED"
          },
          {
            id: 2,
            date: "2024-06-15",
            heure: "11:00",
            patient_nom: "Mamadou Diallo",
            statut: "PENDING"
          },
          {
            id: 3,
            date: "2024-06-15",
            heure: "14:00",
            patient_nom: "Fatou Ndiaye",
            statut: "CONFIRMED"
          }
        ]);
        
        // Create notifications for pending appointments
        const pendingAppointments = [
          {
            id: 2,
            date: "2024-06-15",
            heure: "11:00",
            patient_nom: "Mamadou Diallo",
            statut: "PENDING"
          }
        ];
        const appointmentNotifications = pendingAppointments.map(app => 
          `📅 Nouvelle demande de rendez-vous de ${app.patient_nom} pour le ${app.date} à ${app.heure}`
        );
        
        setNotifications(appointmentNotifications);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des rendez-vous");
        setLoading(false);
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
        // const response = await patientAPI.getPatients();
        // setPatients(response.data);
        
        // For demo purposes, we'll use mock data
        setPatients([
          { id: 1, nom: "Aminata Fall", dernier_rdv: "2024-06-10", consultations: 5 },
          { id: 2, nom: "Mamadou Diallo", dernier_rdv: "2024-06-08", consultations: 3 },
          { id: 3, nom: "Fatou Ndiaye", dernier_rdv: "2024-06-05", consultations: 7 }
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/connecter");
  };

  // Sample data for charts
  const appointmentTrendData = [
    { jour: "Lun", rendez_vous: 4 },
    { jour: "Mar", rendez_vous: 3 },
    { jour: "Mer", rendez_vous: 5 },
    { jour: "Jeu", rendez_vous: 2 },
    { jour: "Ven", rendez_vous: 6 },
    { jour: "Sam", rendez_vous: 1 },
    { jour: "Dim", rendez_vous: 0 }
  ];

  const patientStatsData = [
    { name: "Nouveaux", value: 12 },
    { name: "Réguliers", value: 45 },
    { name: "Suivi", value: 23 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

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
            <Link to="/medecin/dossiers-patients" className="nav-link text-white">
              <FaUserInjured className="me-2" /> Dossiers patients
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/medecin/document-partage" className="nav-link text-white">
              <FaFileMedical className="me-2" /> Documents partagés
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/medecin/disponibilites" className="nav-link text-white">
              <FaCalendarCheck className="me-2" /> Disponibilités
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/medecin/notifications" className="nav-link text-white">
              <FaBell className="me-2" /> Notifications
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/medecin/articles" className="nav-link text-white">
              <FaClipboardList className="me-2" /> Articles
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/medecin/profile" className="nav-link text-white">
              <FaUserMd className="me-2" /> Profil
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
                {fullName.charAt(4)} {/* First letter of first name */}
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "500" }}>{fullName}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Médecin</div>
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
              className={`nav-link ${activeTab === "patients" ? "active" : ""}`}
              onClick={() => setActiveTab("patients")}
            >
              Patients
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
                        <h5 className="card-title">Patients</h5>
                        <h2>{patients.length}</h2>
                      </div>
                      <FaUserInjured size={30} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-info text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title">Articles</h5>
                        <h2>8</h2>
                      </div>
                      <FaClipboardList size={30} />
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
                    <h5>Tendance des rendez-vous</h5>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={appointmentTrendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="jour" />
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
                    <h5>Répartition des patients</h5>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={patientStatsData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {patientStatsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
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
                                {app.statut === "PENDING" && (
                                  <button className="btn btn-sm btn-success">
                                    Confirmer
                                  </button>
                                )}
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
                            <th>Dernier RDV</th>
                            <th>Consultations</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {patients.map(patient => (
                            <tr key={patient.id}>
                              <td>{patient.nom}</td>
                              <td>{patient.dernier_rdv}</td>
                              <td>{patient.consultations}</td>
                              <td>
                                <button className="btn btn-sm btn-outline-primary me-1">
                                  Voir dossier
                                </button>
                                <button className="btn btn-sm btn-outline-success">
                                  Nouveau RDV
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

export default EnhancedDashboardMedecin;