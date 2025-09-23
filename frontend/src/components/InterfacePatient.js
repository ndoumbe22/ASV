// src/pages/PatientInterface.js
import React from "react";
import {
  FaCalendarCheck,
  FaUserMd,
  FaFileMedical,
  FaComments,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdDashboard, MdFeedback } from "react-icons/md";
import { IoMdNotificationsOutline } from "react-icons/io"; // notification

function PatientInterface({ user }) {
  return (
    <div
      className="d-flex"
      style={{ minHeight: "100vh", backgroundColor: "#f5f7fb" }}
    >
      {/* ===== Sidebar ===== */}
      <aside
        style={{
          width: "250px",
          backgroundColor: "#103e6e",
          color: "white",
          padding: "20px",
        }}
      >
        {/* Logo + Nom */}
        <div className="d-flex align-items-center mb-4">
          <img
            src="/images/logo.png"
            alt="Logo"
            width="120"
            height="120"
            className="me-2"
          />
        </div>

        {/* Menu */}
        <ul className="nav flex-column">
          <li className="nav-item mb-3">
            <div
              
              style={{
              backgroundColor: "green",
              color: "white",
              borderRadius: "6px",
              padding: "10px 15px",
              display: "flex",
              alignItems: "center",
              }}
            >
              <MdDashboard className="me-2" /> Tableau de bord
            </div>
          </li>
          <li className="nav-item mb-3">
            <a href="/rendezvous" className="nav-link text-white">
              <FaCalendarCheck className="me-2" /> Mes Rendez-vous
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/prise-rendezvous" className="nav-link text-white">
              <FaUserMd className="me-2" /> Prise de rendez-vous
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/dossier-medical" className="nav-link text-white">
              <FaFileMedical className="me-2" /> Dossier médical
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/messages" className="nav-link text-white">
              <FaComments className="me-2" /> Messages
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/profil" className="nav-link text-white">
              <FaUserMd className="me-2" /> Profil
            </a>
          </li>
          <li className="nav-item mb-3">
            <a href="/feedback" className="nav-link text-white">
              <MdFeedback className="me-2" /> Avis
            </a>
          </li>
        </ul>

        <div className="mt-auto pt-4">
          <a href="/parametres" className="nav-link text-white mb-3">
            <FaCog className="me-2" /> Paramètres
          </a>
          <a href="/" className="nav-link text-white">
            <FaSignOutAlt className="me-2" /> Déconnexion
          </a>
        </div>
      </aside>

      {/* ===== Contenu principal ===== */}
      <main className="flex-grow-1 p-4">
        {/* ===== Topbar ===== */}
        <div
          className="d-flex justify-content-between align-items-center mb-4"
          style={{ backgroundColor: "white", padding: "10px 20px", borderRadius: "10px" }}
        >
          {/* Dashboard title */}
          <h5 className="m-0">Dashboard</h5>

          {/* Barre de recherche */}
          <input
            type="text"
            placeholder="Search here..."
            style={{
              borderRadius: "8px",
              border: "1px solid #ddd",
              padding: "5px 12px",
              width: "300px",
              outline: "none",
            }}
          />

          {/* Notifications + Profil */}
          <div className="d-flex align-items-center">
            <IoMdNotificationsOutline
              size={24}
              style={{ marginRight: "20px", cursor: "pointer" }}
            />

            <div className="d-flex align-items-center">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profil"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    marginRight: "10px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#ddd",
                    marginRight: "10px",
                  }}
                ></div>
              )}
              <div>
                <strong>{user?.fullName || "Patient"}</strong>
                <p className="m-0 text-muted" style={{ fontSize: "12px" }}>
                  {user?.role || "Utilisateur"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exemple de tableau de bord */}
        <div className="card p-3 shadow-sm mb-4">
          <h5>📊 Suivi Médical</h5>
          <p>Exemple de graphiques et statistiques sur la santé du patient...</p>
        </div>
      </main>
    </div>
  );
}

export default PatientInterface;
