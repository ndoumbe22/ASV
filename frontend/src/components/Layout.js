import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../assets/css/base.css";
import Map from "./Map";
import FooterForm from "./FooterForm";
import Connecter from "./Connecter"; 

function Layout() {
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  const handleSearch = () => {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes("médecin généraliste") || lowerQuery.includes("medecin generaliste")) {
    navigate("/medecin_generaliste");
  } else if (lowerQuery.includes("médecin spécialiste") || lowerQuery.includes("medecin specialiste")) {
    navigate("/medecin_specialiste");
  } else if (lowerQuery.includes("médecin") || lowerQuery.includes("medecin")) {
    navigate("/medecin_generaliste"); // fallback si on tape juste "medecin"
  } else if (lowerQuery.includes("pharmacie")) {
    navigate("/pharmacie");
  } else if (lowerQuery.includes("hôpital") || lowerQuery.includes("hopital")) {
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

          {/* Navigation */}
          <nav className="navbar navbar-expand-lg navbar-dark">
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link active" to="/">
                    Accueil
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle"
                    href="#"
                    id="medecinDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    Médecins
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="medecinDropdown">
                    <li>
                      <Link
                        className="dropdown-item"
                        style={{ color: "#1DA1F2" }}
                        to="/medecin_generaliste"
                      >
                        Médecins Généralistes
                      </Link>
                    </li>
                    <li>
                      <Link
                        className="dropdown-item"
                        style={{ color: "#1DA1F2" }}
                        to="/medecin_specialiste"
                      >
                        Spécialistes
                      </Link>
                    </li>
                  </ul>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/pharmacie">
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
                  <Link className="nav-link" to="/consultation">
                    Consultation
                  </Link>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#contact">
                    Contact
                  </a>
                </li>
              </ul>
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

      {/* Section héro */}
      <section
        className="text-white py-3"
        style={{ backgroundColor: "#103e6e" }}
      >
        <div className="container d-flex flex-lg-row flex-column align-items-center">
          <div className="col-lg-6 col-12" style={{ marginTop: "-210px" }}>
            <h1 className="fw-bold display-5">
              Plateforme de Santé Virtuelle Intégrée pour l'Accès aux Soins
            </h1>
            <p className="mt-3">
              Avec AssitoSanté, bénéficiez d'une solution moderne et transparente
              pour accéder facilement aux médecins, cliniques, pharmacies et
              hôpitaux, tout en profitant d'un suivi personnalisé.
            </p>
            <div className="d-flex align-items-center mt-4">
              <Link
                to="/chatbot"
                className="btn fw-bold me-3"
                style={{ backgroundColor: "#4f9cef", color: "white" }}
              >
                ChatSanté
              </Link>
              <button className="btn btn-outline-light">▶ Voir la Démo</button>
            </div>
          </div>
          <div className="col-lg-6 col-12 text-center mt-4 mt-lg-0">
            <img
              src="/images/sante.jpg"
              alt="Santé"
              className="img-fluid"
              style={{
                borderRadius: "230px",
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

      {/* Contenu des pages */}
      <main className="container my-5">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="text-white pt-5"
        style={{ backgroundColor: "#103e6e", margin: 0 }}
      >
        <div className="container">
          <div className="row">
            {/* Col 1 */}
            <div className="col-lg-3 col-md-6 mb-4" id="contact">
              <div className="d-flex align-items-center mb-3">
                <img
                  src="/images/logo.png"
                  alt="Logo de AssitoSanté"
                  width="120"
                  height="120"
                  className="me-2"
                />
              </div>
              <p>
                Plateforme de Santé Virtuelle Intégrée pour un accès simple,
                rapide et sécurisé aux soins.
              </p>
              <p>
                <i className="bi bi-telephone me-2"></i> +221 33 123 45 67
              </p>
              <p>
                <i className="bi bi-envelope me-2"></i> contact@assitosante.com
              </p>
              <div>
                <a
                  href="https://www.facebook.com/assitosante"
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon facebook me-2"
                >
                  <i className="bi bi-facebook"></i>
                </a>
                <a
                  href="https://twitter.com/assitosante"
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon twitter me-2"
                >
                  <i className="bi bi-twitter"></i>
                </a>
                <a
                  href="https://www.linkedin.com/company/assitosante"
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon linkedin me-2"
                >
                  <i className="bi bi-linkedin"></i>
                </a>
                <a
                  href="https://www.youtube.com/@NdeyeNdoumbeNdiaye"
                  target="_blank"
                  rel="noreferrer"
                  className="social-icon youtube"
                >
                  <i className="bi bi-youtube"></i>
                </a>
              </div>
            </div>

            {/* Col 2 */}
            <div className="col-lg-3 col-md-6 mb-4">
              <h5 className="fw-bold">Horaires d'ouverture</h5>
              <ul className="list-unstyled">
                <li>Lundi - Mardi : 9h - 17h</li>
                <li>Mercredi - Vendredi : 8h - 17h</li>
                <li>Samedi : 10h - 17h</li>
                <li>Dimanche : Urgences</li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="col-lg-3 col-md-6 mb-4">
              <h5 className="fw-bold">Nous localiser</h5>
              <input
                type="text"
                id="search-location"
                className="form-control mb-2"
                placeholder="Entrez une position..."
              />
              <Map />
            </div>

            {/* Col 4 */}
            <div className="col-lg-3 col-md-6 mb-4">
              <h5 className="fw-bold">Laissez-nous un message</h5>
              <FooterForm />
            </div>
          </div>
        </div>

        <div className="bg-dark text-center py-3" style={{ margin: 0 }}>
          <small>
            &copy; 2025 AssitoSanté. Tous droits réservés. |{" "}
            <Link
              to="/qui_sommes_nous"
              className="text-white text-decoration-underline"
            >
              Qui sommes-nous ?
            </Link>
          </small>
        </div>
      </footer>

      {/* Bouton rendez-vous */}
      <a
        href="{% url 'rendez_vous' %}"
        id="rendezvous-btn"
        className="btn btn-success fw-bold"
      >
        Demander un Rendez-vous
      </a>

      {/* ✅ Style pour animation */}
      <style>
        {`
          .search-input {
            max-width: 0;
            opacity: 0;
            transition: all 0.4s ease-in-out;
            overflow: hidden;
          }
          .search-input.show {
            max-width: 200px;
            opacity: 1;
          }
        `}
      </style>
    </>
  );
}

export default Layout;
