import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { patientAPI } from "../../services/api";
import { FaCalendarCheck, FaUserMd, FaFileMedical, FaEnvelope, FaCog, FaSignOutAlt, FaUser, FaSearch, FaQrcode, FaBell, FaMapMarkerAlt } from "react-icons/fa";
import { MdFeedback } from "react-icons/md";
import { IoMdNotificationsOutline } from "react-icons/io";
import QRCode from "react-qr-code";

function DashboardPatient() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [fullName, setFullName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]); // Added appointments state

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
        const response = await patientAPI.getPatient(1); // We'll need to get the actual patient ID
        setPatientData(response.data);
        setFullName(`${response.data.user.first_name} ${response.data.user.last_name}`.trim());
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
        const response = await patientAPI.getAppointments();
        setAppointments(response.data);
        
        // Add appointment notifications
        const appointmentNotifications = response.data
          .filter(app => app.statut === "CONFIRMED" || app.statut === "CANCELLED")
          .map(app => {
            if (app.statut === "CONFIRMED") {
              return `✅ Votre rendez-vous avec ${app.medecin_nom} le ${app.date} à ${app.heure} a été confirmé.`;
            } else {
              return `❌ Votre rendez-vous avec ${app.medecin_nom} le ${app.date} à ${app.heure} a été annulé.`;
            }
          });
        
        setNotifications(prev => [...appointmentNotifications, ...prev]);
      } catch (err) {
        console.error("Erreur lors du chargement des rendez-vous :", err);
      }
    };

    fetchAppointments();
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

  // Spécialités médicales
  const specialites = [
    "Médecine Générale",
    "Cardiologie",
    "Dermatologie",
    "Gynécologie",
    "Pédiatrie",
    "Orthopédie",
    "Ophtalmologie",
    "Neurologie"
  ];

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
            <Link to="/patient/dashboard" className="nav-link text-white active">
              <FaUser className="me-2" /> Tab_Bord
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/patient/rendez-vous" className="nav-link text-white">
              <FaCalendarCheck className="me-2" /> Rendez-Vous
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/patient/prise-rendez-vous" className="nav-link text-white">
              <FaCalendarCheck className="me-2" /> Prise De Rendez-vous
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/patient/dossier-medical" className="nav-link text-white">
              <FaFileMedical className="me-2" /> Dossier Medical
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/patient/document-partage" className="nav-link text-white">
              <FaFileMedical className="me-2" /> Documents Partagés
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/patient/profile" className="nav-link text-white">
              <FaUser className="me-2" /> Profile
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/patient/boite-email" className="nav-link text-white">
              <FaEnvelope className="me-2" /> Boite Email
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/patient/medication-reminders" className="nav-link text-white">
              <FaBell className="me-2" /> Rappels Médicaments
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/patient/localiser-centres" className="nav-link text-white">
              <FaMapMarkerAlt className="me-2" /> Localiser Centres
            </Link>
          </li>
        </ul>
        <hr style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />

        <div className="mt-auto pt-4">
          <button className="nav-link text-white btn btn-link" onClick={() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("username");
            localStorage.removeItem("first_name");
            localStorage.removeItem("last_name");
            localStorage.removeItem("role");
            localStorage.removeItem("email");
            navigate("/connecter");
          }}>
            <FaSignOutAlt className="me-2" /> Deconnexion
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
            <div style={{ ...iconStyle }}><FaEnvelope size={16} /></div>
            <div
              style={{ ...iconStyle, position: "relative" }}
              onClick={toggleNotifications}
            >
              <IoMdNotificationsOutline size={18} />
              {notifications.length > 0 && <span style={badgeStyle}></span>}
            </div>

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
                <div style={{ padding: "10px", maxHeight: "300px", overflowY: "auto" }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6>Notifications</h6>
                    <button className="btn btn-sm btn-outline-secondary" onClick={clearNotifications}>
                      Tout effacer
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="text-muted">Aucune notification</p>
                  ) : (
                    notifications.map((note, idx) => (
                      <div key={idx} className="border-bottom pb-2 mb-2">
                        <p className="m-0" style={{ fontSize: "14px" }}>🔔 {note}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="d-flex align-items-center">
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "#ddd", marginRight: "10px" }}></div>
              <div>
                <strong>{fullName || "Patient"}</strong>
                <p className="m-0 text-muted" style={{ fontSize: "12px" }}>Patient</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Message de bienvenue ===== */}
        <div className="mb-4">
          <h2>Bienvenue, {fullName || "Patient"}</h2>
          <p>Sélectionnez une catégorie ci-dessous pour commencer</p>
        </div>

        {/* ===== Rendez-vous récents ===== */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Rendez-vous à venir</h4>
            <Link to="/patient/rendez-vous" className="btn btn-outline-success btn-sm">
              Voir tous
            </Link>
          </div>
          {appointments.filter(app => app.statut === "CONFIRMED").slice(0, 3).length > 0 ? (
            <div className="row">
              {appointments.filter(app => app.statut === "CONFIRMED").slice(0, 3).map((app, index) => (
                <div key={index} className="col-md-4 mb-3">
                  <div className="card shadow-sm p-3" style={{ backgroundColor: "#d4edda" }}>
                    <h6 className="mb-1"><strong>{app.date}</strong> - {app.heure}</h6>
                    <p className="mb-1"><FaUserMd className="me-1 text-primary" /> {app.medecin_nom}</p>
                    <p className="mb-0" style={{ fontSize: "13px", color: "green" }}>✔ Confirmé</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card shadow-sm p-4 text-center">
              <p>Vous n'avez aucun rendez-vous confirmé à venir.</p>
              <Link to="/patient/prise-rendez-vous" className="btn btn-success">
                Prendre un rendez-vous
              </Link>
            </div>
          )}
        </div>

        {/* ===== Spécialités médicales ===== */}
        <div className="mb-4">
          <h4>Spécialités Médicales</h4>
          <div className="row">
            {specialites.map((specialite, index) => (
              <div key={index} className="col-md-3 mb-3">
                <div className="card shadow-sm p-3 text-center" style={{ cursor: "pointer", transition: "all 0.3s" }}>
                  <div className="d-flex justify-content-center mb-2">
                    <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "#e9f5e9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FaUserMd color="#2E7D32" />
                    </div>
                  </div>
                  <h6>{specialite}</h6>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== QR Code et Contact ===== */}
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm p-4">
              <h5>QR Code pour contact rapide</h5>
              <div className="d-flex justify-content-center my-3">
                <div style={{ background: "white", padding: "10px" }}>
                  <QRCode value={`patient:${patientData?.id || 'unknown'}`} size={128} />
                </div>
              </div>
              <p className="text-center">Scannez ce QR code pour un contact rapide</p>
            </div>
          </div>
          
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm p-4">
              <h5>Contactez-Nous</h5>
              <div className="d-flex flex-column align-items-center justify-content-center" style={{ height: "100%" }}>
                <div className="mb-3">
                  <h1>SCAN ME</h1>
                </div>
                <button className="btn btn-success" style={{ backgroundColor: "#2E7D32" }}>
                  Contacter le support
                </button>
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

export default DashboardPatient;