import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(
        0
      )}`.toUpperCase();
    }
    return user?.username?.charAt(0).toUpperCase() || "U";
  };

  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || "Utilisateur";
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary-custom">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img
            src="/logo.png"
            alt="AssitoSanté"
            className="navbar-logo"
            style={{ height: "40px", marginRight: "10px" }}
          />
          <span className="fw-bold">AssitoSanté</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Accueil
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                Médecins
              </a>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/medecins">
                    Tous les médecins
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/pharmacies">
                Pharmacies
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/hopitaux">
                Hôpitaux
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cliniques">
                Cliniques
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dentistes">
                Dentistes
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">
                Contact
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/consultation">
                Consultation
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center">
            <button className="btn btn-outline-light me-3">
              <i className="bi bi-search"></i>
            </button>

            {isAuthenticated ? (
              <div className="user-profile-dropdown">
                <button
                  className="btn btn-user-profile"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="user-avatar">{getUserInitials()}</div>
                  <span className="user-name d-none d-md-inline ms-2">
                    {getFullName()}
                  </span>
                  <i className="bi bi-chevron-down ms-2"></i>
                </button>

                {showDropdown && (
                  <div className="dropdown-menu-custom show">
                    <div className="dropdown-header">
                      <div className="user-avatar-large">
                        {getUserInitials()}
                      </div>
                      <div className="user-info">
                        <div className="user-name-large">{getFullName()}</div>
                        <div className="user-role">
                          {user?.role || "Patient"}
                        </div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    {user?.role === "medecin" ? (
                      <>
                        <Link
                          className="dropdown-item-custom"
                          to="/medecin/dashboard"
                          onClick={() => setShowDropdown(false)}
                        >
                          <i className="bi bi-speedometer2 me-2"></i>
                          Dashboard
                        </Link>
                        <Link
                          className="dropdown-item-custom"
                          to="/medecin/urgences"
                          onClick={() => setShowDropdown(false)}
                        >
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          Urgences
                        </Link>
                        <Link
                          className="dropdown-item-custom"
                          to="/medecin/rendez-vous"
                          onClick={() => setShowDropdown(false)}
                        >
                          <i className="bi bi-calendar-check me-2"></i>
                          Rendez-vous
                        </Link>
                        <Link
                          className="dropdown-item-custom"
                          to="/medecin/articles"
                          onClick={() => setShowDropdown(false)}
                        >
                          <i className="bi bi-file-text me-2"></i>
                          Mes Articles
                        </Link>
                        <Link
                          className="dropdown-item-custom"
                          to="/medecin/patients"
                          onClick={() => setShowDropdown(false)}
                        >
                          <i className="bi bi-people me-2"></i>
                          Patients
                        </Link>
                      </>
                    ) : (
                      <Link
                        className="dropdown-item-custom"
                        to={
                          user?.role === "patient"
                            ? "/interface_patient"
                            : "/interface_medecin"
                        }
                        onClick={() => setShowDropdown(false)}
                      >
                        <i className="bi bi-speedometer2 me-2"></i>
                        Tableau de bord
                      </Link>
                    )}
                    <Link
                      className="dropdown-item-custom"
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                    >
                      <i className="bi bi-person me-2"></i>
                      Mon profil
                    </Link>
                    <Link
                      className="dropdown-item-custom"
                      to="/settings"
                      onClick={() => setShowDropdown(false)}
                    >
                      <i className="bi bi-gear me-2"></i>
                      Paramètres
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-item-custom text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/connecter" className="btn btn-light">
                <i className="bi bi-person-circle me-2"></i>
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
