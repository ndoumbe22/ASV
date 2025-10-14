import React, { useState, useEffect } from "react";
import { 
  FaUserMd, FaUser, FaHospital, FaComments, 
  FaChartLine, FaChartPie, FaBell, FaSignOutAlt, 
  FaCog, FaSearch, FaStethoscope, FaUserNurse,
  FaCalendarCheck, FaFileMedical, FaPills, FaRobot
} from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { adminService } from "../../services/adminService";
import { useNavigate } from "react-router-dom";

function EnhancedDashboardAdmin() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [fullName, setFullName] = useState("Administrateur");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // 🔔 Notifications
  const [notifications, setNotifications] = useState([
    "Nouvelle inscription de médecin en attente de validation.",
    "Mise à jour système disponible.",
    "Rapport mensuel prêt à être généré."
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => setShowNotifications(!showNotifications);
  const clearNotifications = () => setNotifications([]);

  // Charger les données de l'administrateur depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch admin statistics
        const statsData = await adminService.getStatistics();
        setStats(statsData);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des données de l'administrateur");
        setLoading(false);
        console.error("Erreur lors du chargement des données de l'administrateur :", err);
      }
    };

    fetchData();
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

  // Sample data for charts
  const userGrowthData = [
    { mois: "Jan", utilisateurs: 40, medecins: 5, patients: 35 },
    { mois: "Fév", utilisateurs: 65, medecins: 8, patients: 57 },
    { mois: "Mar", utilisateurs: 90, medecins: 12, patients: 78 },
    { mois: "Avr", utilisateurs: 120, medecins: 18, patients: 102 },
    { mois: "Mai", utilisateurs: 150, medecins: 22, patients: 128 },
    { mois: "Juin", utilisateurs: 180, medecins: 28, patients: 152 }
  ];

  const appointmentStatusData = [
    { name: "Confirmés", value: 45 },
    { name: "En attente", value: 12 },
    { name: "Annulés", value: 8 },
    { name: "Reprogrammés", value: 5 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/connecter");
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
            <a href="/admin/dashboard" className="nav-link text-white active">
              <FaChartLine className="me-2" /> Tableau de bord
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/admin/utilisateurs" className="nav-link text-white">
              <FaUser className="me-2" /> Utilisateurs
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/admin/medecins" className="nav-link text-white">
              <FaUserMd className="me-2" /> Médecins
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/admin/patients" className="nav-link text-white">
              <FaUser className="me-2" /> Patients
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/admin/articles" className="nav-link text-white">
              <FaFileMedical className="me-2" /> Articles
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/admin/centres-sante" className="nav-link text-white">
              <FaHospital className="me-2" /> Centres de santé
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/admin/chatbot" className="nav-link text-white">
              <FaRobot className="me-2" /> Chatbot
            </a>
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
                A
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: "500" }}>{fullName}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>Administrateur</div>
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
              className={`nav-link ${activeTab === "users" ? "active" : ""}`}
              onClick={() => setActiveTab("users")}
            >
              Utilisateurs
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
                        <h5 className="card-title">Utilisateurs</h5>
                        <h2>{stats?.total_users || 0}</h2>
                      </div>
                      <FaUser size={30} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title">Médecins</h5>
                        <h2>{stats?.total_medecins || 0}</h2>
                      </div>
                      <FaUserMd size={30} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-info text-white">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="card-title">Patients</h5>
                        <h2>{stats?.total_patients || 0}</h2>
                      </div>
                      <FaUser size={30} />
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
                        <h2>{stats?.total_rendez_vous || 0}</h2>
                      </div>
                      <FaCalendarCheck size={30} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-8">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>Croissance des utilisateurs</h5>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mois" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="utilisateurs" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="medecins" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="patients" stroke="#ffc658" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card mb-4">
                  <div className="card-header">
                    <h5>Statut des rendez-vous</h5>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={appointmentStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {appointmentStatusData.map((entry, index) => (
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

        {/* ===== Users Tab ===== */}
        {activeTab === "users" && (
          <div>
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card">
                  <div className="card-header">
                    <h5>Répartition des utilisateurs</h5>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { name: 'Médecins', count: stats?.total_medecins || 0 },
                        { name: 'Patients', count: stats?.total_patients || 0 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="col-md-8">
                <div className="card">
                  <div className="card-header">
                    <h5>Activité récente</h5>
                  </div>
                  <div className="card-body">
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Utilisateur</th>
                            <th>Rôle</th>
                            <th>Date d'inscription</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Dr. Martin Diop</td>
                            <td>Médecin</td>
                            <td>12/06/2024</td>
                            <td><span className="badge bg-success">Actif</span></td>
                          </tr>
                          <tr>
                            <td>Aminata Fall</td>
                            <td>Patient</td>
                            <td>10/06/2024</td>
                            <td><span className="badge bg-success">Actif</span></td>
                          </tr>
                          <tr>
                            <td>Dr. Fatou Ndiaye</td>
                            <td>Médecin</td>
                            <td>08/06/2024</td>
                            <td><span className="badge bg-warning">En attente</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
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
                    <h5>Statistiques des rendez-vous</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <div className="text-center p-3">
                          <h3>{stats?.rendez_vous_today || 0}</h3>
                          <p>Aujourd'hui</p>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center p-3">
                          <h3>{stats?.rendez_vous_week || 0}</h3>
                          <p>Cette semaine</p>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center p-3">
                          <h3>{stats?.rendez_vous_month || 0}</h3>
                          <p>Ce mois</p>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="text-center p-3">
                          <h3>{stats?.total_rendez_vous || 0}</h3>
                          <p>Total</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h6>Répartition par statut</h6>
                      <div className="table-responsive">
                        <table className="table table-striped">
                          <thead>
                            <tr>
                              <th>Statut</th>
                              <th>Nombre</th>
                              <th>Pourcentage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats?.rendez_vous_by_status?.map((status, index) => (
                              <tr key={index}>
                                <td>{status.statut}</td>
                                <td>{status.count}</td>
                                <td>
                                  {stats.total_rendez_vous > 0 
                                    ? `${Math.round((status.count / stats.total_rendez_vous) * 100)}%` 
                                    : '0%'}
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
          </div>
        )}
      </main>
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

export default EnhancedDashboardAdmin;