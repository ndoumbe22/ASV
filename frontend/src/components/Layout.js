import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Footer from "./Footer"; // Import the Footer component
import GlobalSearch from "./GlobalSearch"; // Import the GlobalSearch component
import EnhancedChatbot from "./EnhancedChatbot"; // Import the EnhancedChatbot component
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function Layout() {
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const navigate = useNavigate();

  // Initialize map when component mounts
  useEffect(() => {
    // Dynamically load Leaflet library
    const loadLeaflet = async () => {
      try {
        // Load Leaflet CSS
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        // Load Leaflet JS
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });

        // Initialize map after Leaflet is loaded
        initializeMap();
      } catch (error) {
        console.error("Error loading Leaflet:", error);
      }
    };

    const initializeMap = () => {
      // Check if L (Leaflet) is available
      if (typeof window.L !== "undefined") {
        // Initialize the map
        const map = window.L.map("map").setView([14.6928, -17.4467], 12); // Dakar by default

        // Add tile layer
        window.L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }
        ).addTo(map);

        // Add initial marker
        const marker = window.L.marker([14.6928, -17.4467]).addTo(map);

        // Add search functionality
        const searchInput = document.getElementById("search-location");
        if (searchInput) {
          searchInput.addEventListener("change", function (e) {
            const query = e.target.value;
            if (query) {
              fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                  query
                )}`
              )
                .then((response) => response.json())
                .then((data) => {
                  if (data.length > 0) {
                    const place = data[0];
                    const lat = parseFloat(place.lat);
                    const lon = parseFloat(place.lon);

                    map.setView([lat, lon], 14);
                    marker.setLatLng([lat, lon]);
                    marker
                      .bindPopup(`<b>${place.display_name}</b>`)
                      .openPopup();
                  } else {
                    alert("Aucun résultat trouvé pour : " + query);
                  }
                })
                .catch((err) => {
                  console.error(err);
                  alert("Erreur lors de la recherche de la position.");
                });
            }
          });
        }
      }
    };

    // Load Leaflet when component mounts
    loadLeaflet();

    // Cleanup function
    return () => {
      // Remove event listeners if needed
      const searchInput = document.getElementById("search-location");
      if (searchInput) {
        searchInput.removeEventListener("change", searchInput.handler);
      }
    };
  }, []);

  const handleSearch = () => {
    const lowerQuery = query.toLowerCase();

    if (
      lowerQuery.includes("médecin généraliste") ||
      lowerQuery.includes("medecin generaliste")
    ) {
      navigate("/medecin_generaliste");
    } else if (
      lowerQuery.includes("médecin spécialiste") ||
      lowerQuery.includes("medecin specialiste")
    ) {
      navigate("/medecin_specialiste");
    } else if (
      lowerQuery.includes("médecin") ||
      lowerQuery.includes("medecin")
    ) {
      navigate("/medecin_generaliste"); // fallback si on tape juste "medecin"
    } else if (lowerQuery.includes("pharmacie")) {
      navigate("/pharmacie");
    } else if (
      lowerQuery.includes("hôpital") ||
      lowerQuery.includes("hopital")
    ) {
      navigate("/hopitaux");
    } else if (lowerQuery.includes("dentiste")) {
      navigate("/dentistes");
    } else if (lowerQuery.includes("clinique")) {
      navigate("/cliniques");
    } else {
      alert("Aucune page trouvée pour cette recherche !");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      {/* 🔹 Header */}
      <header
        className="text-white py-3"
        style={{ backgroundColor: "#103e6e" }}
      >
        <div className="container d-flex align-items-center justify-content-between">
          {/* Logo */}
          <div className="d-flex align-items-center">
            <img
              src="/images/logo.png"
              alt="Logo"
              width="120"
              height="120"
              className="me-2"
            />
          </div>

          {/* Global Search */}
          <div className="d-none d-lg-block" style={{ flex: 1, maxWidth: "500px", margin: "0 20px" }}>
            <GlobalSearch />
          </div>

          {/* Mobile menu toggle button */}
          <button
            className="navbar-toggler d-lg-none"
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{
              backgroundColor: "white",
              border: "none",
              borderRadius: "4px",
              padding: "8px 12px",
            }}
          >
            <span className="navbar-toggler-icon">
              <i
                className="bi bi-list"
                style={{ color: "#103e6e", fontSize: "1.5rem" }}
              ></i>
            </span>
          </button>

          {/* Navigation - Always visible on large screens, toggle on mobile */}
          <nav
            className={`navbar navbar-expand-lg navbar-dark ${
              showMobileMenu ? "d-block" : "d-none d-lg-block"
            }`}
            style={{
              position:
                window.innerWidth <= 991 && showMobileMenu
                  ? "absolute"
                  : "static",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "#103e6e",
              zIndex: 1000,
            }}
          >
            <div className="navbar-nav ms-auto">
              <Link
                className="nav-link active"
                to="/"
                onClick={() => setShowMobileMenu(false)}
              >
                Accueil
              </Link>
              <div className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle"
                  href="#"
                  id="medecinDropdown"
                  role="button"
                  onClick={(e) => {
                    e.preventDefault();
                    // Simple toggle for dropdown on mobile
                    const dropdown = e.target.nextElementSibling;
                    if (dropdown) {
                      dropdown.style.display =
                        dropdown.style.display === "block" ? "none" : "block";
                    }
                  }}
                >
                  Médecins
                </a>
                <ul
                  className="dropdown-menu"
                  aria-labelledby="medecinDropdown"
                  style={{ display: "none" }}
                >
                  <li>
                    <Link
                      className="dropdown-item"
                      style={{ color: "#1DA1F2" }}
                      to="/medecin_generaliste"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Médecins Généralistes
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="dropdown-item"
                      style={{ color: "#1DA1F2" }}
                      to="/medecin_specialiste"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      Spécialistes
                    </Link>
                  </li>
                </ul>
              </div>
              <Link
                className="nav-link"
                to="/pharmacie"
                onClick={() => setShowMobileMenu(false)}
              >
                Pharmacies
              </Link>
              <Link
                className="nav-link"
                to="/hopitaux"
                onClick={() => setShowMobileMenu(false)}
              >
                Hôpitaux
              </Link>
              <Link
                className="nav-link"
                to="/cliniques"
                onClick={() => setShowMobileMenu(false)}
              >
                Cliniques
              </Link>
              <Link
                className="nav-link"
                to="/dentistes"
                onClick={() => setShowMobileMenu(false)}
              >
                Dentistes
              </Link>
              <a
                className="nav-link"
                href="#contact"
                onClick={() => setShowMobileMenu(false)}
              >
                Contact
              </a>
              <Link
                className="nav-link"
                to="/articles"
                onClick={() => setShowMobileMenu(false)}
              >
                Articles
              </Link>
            </div>
          </nav>

          {/* 🔍 Barre de recherche toggle */}
          <div className="d-flex align-items-center position-relative">
            <button
              className="btn btn-light rounded-circle d-flex align-items-center justify-content-center"
              style={{
                width: "45px",
                height: "45px",
                border: "1px solid #ccc",
                backgroundColor: "transparent",
                padding: "5px",
              }}
              onClick={() => setShowSearch(!showSearch)}
            >
              <i
                className="bi bi-search"
                style={{ fontSize: "18px", color: "gray" }}
              ></i>
            </button>

            <input
              type="text"
              className={`form-control ms-2 search-input ${
                showSearch ? "show" : ""
              }`}
              placeholder="Rechercher..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          {/* Connexion */}
          <div className="text-center" style={{ marginRight: "20px" }}>
            <Link
              to="/connecter"
              className="btn d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "transparent",
                border: "1px solid white",
                color: "#4b97e9",
                width: "45px",
                height: "45px",
                margin: "0 auto",
              }}
            >
              <i className="bi bi-person-fill" style={{ fontSize: "20px" }}></i>
            </Link>
            <span
              style={{
                fontSize: "12px",
                color: "white",
                display: "block",
                marginTop: "5px",
              }}
            >
              Se connecter
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section (from base.html) */}
      <section
        className="text-white py-3"
        style={{ backgroundColor: "#103e6e" }}
      >
        <div className="container d-flex flex-lg-row flex-column align-items-center">
          {/* Text */}
          <div className="col-lg-6 col-12" style={{ marginTop: "-210px" }}>
            <h1 className="fw-bold display-5">
              Plateforme de Santé Virtuelle Intégrée pour l'Accès aux Soins
            </h1>
            <p className="mt-3">
              Avec AssitoSanté, bénéficiez d'une solution moderne et
              transparente pour accéder facilement aux médecins, cliniques,
              pharmacies et hôpitaux, tout en profitant d'un suivi personnalisé.
            </p>
            <div className="d-flex align-items-center mt-4">
              <button className="btn btn-outline-light">▶ Voir la Démo</button>
            </div>
          </div>

          <div className="col-lg-6 col-12 text-center mt-4 mt-lg-0">
            <img
              src="/images/sante.jpg"
              alt=""
              className="img-fluid"
              style={{
                borderRadius: "230px 230px 230px 230px",
                marginBottom: "80px",
                marginRight: "20px",
                padding: "100px",
                marginLeft: "40px",
                marginTop: "-80px",
              }}
            />
          </div>
        </div>
      </section>

      {/* Main content area for child routes */}
      <main className="container my-5">
        <Outlet />
      </main>

      {/* Professional Footer Component */}
      <Footer />

      {/* Bootstrap Icons */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
      />

      {/* Bouton fixe Demander un Rendez-vous */}
      <Link
        to="/rendez_vous"
        id="rendezvous-btn"
        className="btn btn-success fw-bold"
        style={{
          position: "fixed",
          bottom: "90px",
          right: "20px",
          zIndex: "1000",
        }}
      >
        Demander un Rendez-vous
      </Link>

      {/* Chatbot button will be positioned by the EnhancedChatbot component itself */}
      <EnhancedChatbot />
    </>
  );
}

export default Layout;
