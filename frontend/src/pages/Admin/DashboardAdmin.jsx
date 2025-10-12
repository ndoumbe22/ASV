import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaUserMd, FaUser, FaHospital, FaComments, 
  FaChartLine, FaChartPie, FaBell, FaSignOutAlt, 
  FaCog, FaSearch, FaStethoscope, FaUserNurse
} from "react-icons/fa";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { adminService } from "../../services/adminService";

function DashboardAdmin() {
  const [theme, setTheme] = useState("light");
  const [fullName, setFullName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [adminData, setAdminData] = useState(null);
  const [stats, setStats] = useState({
    medecins: 0,
    secretaires: 0,
    patients: 0,
    specialites: 0
  });
  const [userStats, setUserStats] = useState([]);
  const [userComparison, setUserComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        // Process data for the dashboard
        const processedStats = {
          medecins: statsData.total_medecins,
          secretaires: 0, // We don't have secretaries in our data model
          patients: statsData.total_patients,
          specialites: statsData.total_pathologies // Using pathologies as specialities
        };
        
        // Prepare user stats data for the chart
        const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
        const currentMonth = new Date().getMonth();
        
        // Create mock data based on actual stats
        const mockUserStats = months.map((month, index) => {
          const monthIndex = (currentMonth - 11 + index + 12) % 12;
          // Create some variation in the data
          const variation = 0.8 + Math.random() * 0.4;
          return {
            mois: month,
            medecins: Math.round(statsData.total_medecins * variation * (index + 1) / 12),
            patients: Math.round(statsData.total_patients * variation * (index + 1) / 12),
            secretaires: 0
          };
        });
        
        // Prepare user comparison data
        const mockUserComparison = [
          { subject: 'Médecins', A: statsData.total_medecins, fullMark: Math.max(30, statsData.total_medecins * 1.5) },
          { subject: 'Secrétaires', A: 0, fullMark: 15 },
          { subject: 'Patients', A: statsData.total_patients, fullMark: Math.max(200, statsData.total_patients * 1.5) }
        ];
        
        setStats(processedStats);
        setUserStats(mockUserStats);
        setUserComparison(mockUserComparison);
        setFullName("Administrateur");
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
            <h4>HealthMeet</h4>
          </div>
        </div>

        <ul className="nav flex-column">
          <li className="nav-item mb-3">
            <a href="/admin/dashboard" className="nav-link text-white active">
              <FaUser className="me-2" /> Tab_Bord
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/admin/utilisateurs" className="nav-link text-white">
              <FaUser className="me-2" /> Utilisateurs
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/admin/medecins" className="nav-link text-white">
              <FaUserMd className="me-2" /> Medecins
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/admin/medecins-specialite" className="nav-link text-white">
              <FaStethoscope className="me-2" /> Medecins Specialite
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/admin/secretaires" className="nav-link text-white">
              <FaUserNurse className="me-2" /> Secretaires
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/admin/patients" className="nav-link text-white">
              <FaUser className="me-2" /> Patients
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/admin/specialite" className="nav-link text-white">
              <FaStethoscope className="me-2" /> Specialite
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/admin/messages" className="nav-link text-white">
              <FaComments className="me-2" /> Messages
            </a>
          </li>
        </ul>
        <hr style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

        <div className="mt-auto pt-4">
          <a href="/logout" className="nav-link text-white">
            <FaSignOutAlt className="me-2" /> Deconnexion
          </a>
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
              placeholder="Search here..."
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

              {showNotifications && (
                <div
                  style={{
                    position: "absolute",
                    top: "40px",
                    right: "0",
                    width: "300px",
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    zIndex: 10,
                  }}
                >
                  <div style={{ padding: "10px", maxHeight: "200px", overflowY: "auto" }}>
                    {notifications.length === 0 ? (
                      <p className="text-muted">Aucune notification</p>
                    ) : (
                      notifications.map((note, idx) => (
                        <p key={idx} style={{ margin: "0 0 10px 0", fontSize: "14px" }}>🔔 {note}</p>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearNotifications}
                      style={{
                        width: "100%",
                        border: "none",
                        padding: "8px",
                        background: "#f5f6fa",
                        borderTop: "1px solid #ddd",
                        cursor: "pointer",
                      }}
                    >
                      Tout effacer
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="d-flex align-items-center">
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#ddd", marginRight: "10px" }}></div>
              <div>
                <strong>{fullName || "Administrateur"}</strong>
                <p className="m-0 text-muted" style={{ fontSize: "12px" }}>Administrateur</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Message de bienvenue ===== */}
        <div className="mb-4">
          <h2>Tableau de Bord Administrateur</h2>
          <p>Bienvenue, {fullName || "Administrateur"}</p>
        </div>

        {/* ===== Cards statistiques ===== */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm p-3" style={{ borderLeft: "4px solid #2E7D32" }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5>{stats.medecins}</h5>
                  <p className="mb-0 text-muted">Médecins</p>
                </div>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e9f5e9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaUserMd color="#2E7D32" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm p-3" style={{ borderLeft: "4px solid #45B7D1" }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5>{stats.secretaires}</h5>
                  <p className="mb-0 text-muted">Secrétaires</p>
                </div>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e9f5fb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaUserNurse color="#45B7D1" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm p-3" style={{ borderLeft: "4px solid #FF6B6B" }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5>{stats.patients}</h5>
                  <p className="mb-0 text-muted">Patients</p>
                </div>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#ffecec", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaUser color="#FF6B6B" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm p-3" style={{ borderLeft: "4px solid #4ECDC4" }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5>{stats.specialites}</h5>
                  <p className="mb-0 text-muted">Spécialité</p>
                </div>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#e9f9f8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FaStethoscope color="#4ECDC4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Graphiques ===== */}
        <div className="row">
          <div className="col-md-8 mb-4">
            <div className="card shadow-sm p-3">
              <h5 className="mb-4">Répartition des Utilisateurs</h5>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="medecins" 
                      stroke="#2E7D32" 
                      activeDot={{ r: 8 }} 
                      strokeWidth={2}
                      name="Médecins"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="patients" 
                      stroke="#FF6B6B" 
                      strokeWidth={2}
                      name="Patients"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="secretaires" 
                      stroke="#45B7D1" 
                      strokeWidth={2}
                      name="Secrétaires"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="col-md-4 mb-4">
            <div className="card shadow-sm p-3">
              <h5 className="mb-4">Comparaison des Utilisateurs</h5>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={userComparison}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, Math.max(200, stats.patients * 1.5)]} />
                    <Radar
                      name="Utilisateurs"
                      dataKey="A"
                      stroke="#2E7D32"
                      fill="#2E7D32"
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const iconStyle = {
  width: "35px",
  height: "35px",
  borderRadius: "50%",
  background: "#f5f6fa",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: "15px",
  cursor: "pointer",
};

const badgeStyle = {
  position: "absolute",
  top: "5px",
  right: "5px",
  width: "8px",
  height: "8px",
  background: "red",
  borderRadius: "50%",
};

export default DashboardAdmin;