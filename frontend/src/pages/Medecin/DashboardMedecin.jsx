import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { appointmentAPI } from "../../services/api";
import { FaUserMd, FaCalendarCheck, FaFileMedical, FaBell, FaCog, FaSignOutAlt, FaUser, FaSearch, FaQrcode } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import QRCode from "react-qr-code";

function DashboardMedecin() {
  const navigate = useNavigate();
  const [theme, setTheme] = useState("light");
  const [fullName, setFullName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔔 Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => setShowNotifications(!showNotifications);
  const clearNotifications = () => setNotifications([]);

  // Charger les données du médecin depuis localStorage
  useEffect(() => {
    const firstName = localStorage.getItem("first_name") || "";
    const lastName = localStorage.getItem("last_name") || "";
    setFullName(`Dr. ${firstName} ${lastName}`.trim());
  }, []);

  // Charger les rendez-vous du médecin
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await appointmentAPI.getAppointments();
        setAppointments(response.data);
        
        // Create notifications for pending appointments
        const pendingAppointments = response.data.filter(app => app.statut === "PENDING");
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
            <Link to="/medecin/dashboard" className="nav-link text-white active">
              <FaUser className="me-2" /> Tableau de bord
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/medecin/rendez-vous" className="nav-link text-white">
              <FaCalendarCheck className="me-2" /> Rendez-vous
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/medecin/dossiers-patients" className="nav-link text-white">
              <FaFileMedical className="me-2" /> Dossiers patients
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
            <Link to="/medecin/profile" className="nav-link text-white">
              <FaUserMd className="me-2" /> Profil
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/medecin/urgences" className="nav-link text-white">
              <FaBell className="me-2" /> Urgences
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
                <strong>{fullName || "Médecin"}</strong>
                <p className="m-0 text-muted" style={{ fontSize: "12px" }}>
                  Médecin
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Message de bienvenue ===== */}
        <div className="mb-4">
          <h2>Bienvenue, {fullName || "Médecin"}</h2>
          <p>Gérez vos rendez-vous et dossiers patients</p>
        </div>

        {/* ===== Rendez-vous récents ===== */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Demandes de rendez-vous en attente</h4>
            <Link to="/medecin/rendez-vous" className="btn btn-outline-success btn-sm">
              Voir tous
            </Link>
          </div>
          {appointments.filter(app => app.statut === "PENDING").length > 0 ? (
            <div className="row">
              {appointments.filter(app => app.statut === "PENDING").slice(0, 3).map((app, index) => (
                <div key={index} className="col-md-4 mb-3">
                  <div className="card shadow-sm p-3" style={{ backgroundColor: "#fff3cd" }}>
                    <h6 className="mb-1"><strong>{app.date}</strong> - {app.heure}</h6>
                    <p className="mb-1"><FaUser className="me-1 text-primary" /> {app.patient_nom}</p>
                    <p className="mb-0" style={{ fontSize: "13px", color: "#ff9800" }}>⏳ En attente</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card shadow-sm p-4 text-center">
              <p>Vous n'avez aucune demande de rendez-vous en attente.</p>
              <Link to="/medecin/rendez-vous" className="btn btn-success">
                Voir tous les rendez-vous
              </Link>
            </div>
          )}
        </div>

        {/* ===== Statistiques ===== */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm p-3 text-center">
              <h3>{appointments.filter(app => app.statut === "CONFIRMED").length}</h3>
              <p>Rendez-vous confirmés</p>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm p-3 text-center">
              <h3>{appointments.filter(app => app.statut === "PENDING").length}</h3>
              <p>Demandes en attente</p>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm p-3 text-center">
              <h3>{appointments.filter(app => app.statut === "CANCELLED").length}</h3>
              <p>Rendez-vous annulés</p>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card shadow-sm p-3 text-center">
              <h3>{appointments.length}</h3>
              <p>Total rendez-vous</p>
            </div>
          </div>
        </div>

        {/* ===== QR Code ===== */}
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm p-4">
              <h5>QR Code pour contact rapide</h5>
              <div className="d-flex justify-content-center my-3">
                <div style={{ background: "white", padding: "10px" }}>
                  <QRCode value={`medecin:${localStorage.getItem("username") || 'unknown'}`} size={128} />
                </div>
              </div>
              <p className="text-center">Scannez ce QR code pour un contact rapide</p>
            </div>
          </div>
          
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm p-4">
              <h5>Prochain rendez-vous</h5>
              {appointments.filter(app => app.statut === "CONFIRMED").length > 0 ? (
                <div>
                  <p><strong>{appointments.filter(app => app.statut === "CONFIRMED")[0].patient_nom}</strong></p>
                  <p>Date: {appointments.filter(app => app.statut === "CONFIRMED")[0].date}</p>
                  <p>Heure: {appointments.filter(app => app.statut === "CONFIRMED")[0].heure}</p>
                </div>
              ) : (
                <p>Aucun rendez-vous confirmé à venir</p>
              )}
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

export default DashboardMedecin;