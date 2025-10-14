// src/components/InterfaceMedecin.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Added useAuth import
import {
  FaUserMd,
  FaUser,
  FaHospital,
  FaCalendarCheck,
  FaFileMedical,
  FaBell,
  FaSignOutAlt,
  FaCog,
  FaSearch,
} from "react-icons/fa";

function InterfaceMedecin() {
  const navigate = useNavigate();
  const { logout } = useAuth(); // Added logout from useAuth
  const [theme, setTheme] = useState("light");
  const [fullName, setFullName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // 🔔 Notifications
  const [notifications, setNotifications] = useState([
    "Nouvelle demande de rendez-vous de Awa Diop.",
    "Résultats d'analyse disponibles pour Mamadou Fall.",
    "Nouveau message de l'administrateur.",
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => setShowNotifications(!showNotifications);
  const clearNotifications = () => setNotifications([]);

  // Charger nom depuis localStorage
  useEffect(() => {
    const firstName = localStorage.getItem("first_name") || "";
    const lastName = localStorage.getItem("last_name") || "";
    setFullName(`Dr. ${firstName} ${lastName}`.trim());
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

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* ===== Sidebar ===== */}
      <aside style={{ width: "250px", padding: "20px" }}>
        <div className="d-flex align-items-center mb-4">
          <img
            src="/images/logo.png"
            alt="Logo"
            width="120"
            height="120"
            className="me-2"
          />
        </div>

        <ul className="nav flex-column">
          <li className="nav-item mb-3">
            <Link to="/medecin/dashboard" className="nav-link text-white">
              <FaUser className="me-2" /> Tableau de bord
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link to="/medecin/rendez-vous" className="nav-link text-white">
              <FaCalendarCheck className="me-2" /> Rendez-vous
            </Link>
          </li>
          <li className="nav-item mb-3">
            <Link
              to="/medecin/dossiers-patients"
              className="nav-link text-white"
            >
              <FaFileMedical className="me-2" /> Dossiers patients
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
              <FaHospital className="me-2" /> Urgences
            </Link>
          </li>
        </ul>
        <hr />

        <div className="mt-auto pt-4">
          <button
            className="nav-link text-white btn btn-link"
            onClick={() => {
              logout(); // Using logout from useAuth instead of manual localStorage removal
              navigate("/connecter");
            }}
          >
            <FaSignOutAlt className="me-2" /> Déconnexion
          </button>
        </div>

        {/* Switch Light/Dark */}
        <div className="d-flex justify-content-center align-items-center mt-4">
          <i
            className="bi bi-sun"
            style={{ fontSize: "20px", marginRight: "10px" }}
          ></i>
          <div
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            style={{
              cursor: "pointer",
              background: theme === "light" ? "#ccc" : "#0e1216ff",
              borderRadius: "20px",
              width: "60px",
              height: "30px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "3px",
                left: theme === "light" ? "5px" : "35px",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: "white",
                transition: "all 0.3s ease",
              }}
            ></div>
          </div>
          <i
            className="bi bi-moon"
            style={{ fontSize: "20px", marginLeft: "10px" }}
          ></i>
        </div>
      </aside>

      {/* ===== Contenu principal ===== */}
      <main className="flex-grow-1 p-4">
        {/* ===== Topbar ===== */}
        <div
          className="d-flex justify-content-between align-items-center mb-4 topbar"
          style={{ padding: "10px 20px", borderRadius: "10px" }}
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
                backgroundColor: "#f5f6fa",
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
            <div style={iconStyle}>
              <FaCog size={16} />
            </div>
            <div
              style={{ ...iconStyle, position: "relative" }}
              onClick={toggleNotifications}
            >
              <FaBell size={16} />
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
                  <div
                    style={{
                      padding: "10px",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {notifications.length === 0 ? (
                      <p className="text-muted">Aucune notification</p>
                    ) : (
                      notifications.map((note, idx) => (
                        <p
                          key={idx}
                          style={{ margin: "0 0 10px 0", fontSize: "14px" }}
                        >
                          🔔 {note}
                        </p>
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
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "#ddd",
                  marginRight: "10px",
                }}
              ></div>
              <div>
                <strong>{fullName || "Médecin"}</strong>
                <p className="m-0 text-muted" style={{ fontSize: "12px" }}>
                  Médecin
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Titre Dashboard ===== */}
        <div className="mb-4">
          <h5>
            <span style={{ color: "gray" }}>
              {" "}
              Tableau de Bord Médecin &gt;{" "}
            </span>
            <strong>Dashboard</strong>
          </h5>
        </div>

        {/* ===== Message de bienvenue ===== */}
        <div className="mb-4">
          <h2>Bienvenue, {fullName || "Médecin"}</h2>
          <p>Gérez vos rendez-vous et dossiers patients</p>
        </div>

        {/* ===== Contenu principal ===== */}
        <div className="card shadow-sm p-5 text-center">
          <h3>Espace Médecin</h3>
          <p>
            Utilisez le menu de navigation pour accéder aux différentes
            fonctionnalités.
          </p>
          <div className="d-flex justify-content-center">
            <Link to="/medecin/dashboard" className="btn btn-primary">
              Accéder au tableau de bord
            </Link>
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

export default InterfaceMedecin;
