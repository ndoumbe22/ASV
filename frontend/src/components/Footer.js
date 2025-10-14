import React from "react";
import { Link } from "react-router-dom";
import FooterForm from "./FooterForm";

function Footer() {
  return (
    <footer className="bg-dark text-white mt-5">
      <div className="container py-4">
        <div className="row">
          {/* Colonne 1 : À propos */}
          <div className="col-md-4 mb-3">
            <h5 className="mb-3">AssitoSanté</h5>
            <p className="text-light">
              Votre plateforme de santé virtuelle pour une prise en charge
              médicale moderne et accessible.
            </p>
          </div>

          {/* Colonne 2 : Liens rapides */}
          <div className="col-md-4 mb-3">
            <h5 className="mb-3">Liens Rapides</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link
                  to="/articles"
                  className="text-light text-decoration-none"
                >
                  <i className="bi bi-chevron-right"></i> Articles de Santé
                </Link>
              </li>
              <li className="mb-2">
                <Link to="/map" className="text-light text-decoration-none">
                  <i className="bi bi-chevron-right"></i> Localiser un Centre
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/politique-confidentialite"
                  className="text-light text-decoration-none"
                >
                  <i className="bi bi-chevron-right"></i> Politique de
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Contact */}
          <div className="col-md-4 mb-3">
            <h5 className="mb-3">Contact</h5>
            <ul className="list-unstyled text-light">
              <li className="mb-2">
                <i className="bi bi-envelope"></i> contact@assistosante.sn
              </li>
              <li className="mb-2">
                <i className="bi bi-telephone"></i> +221 XX XXX XX XX
              </li>
              <li className="mb-2">
                <i className="bi bi-geo-alt"></i> Dakar, Sénégal
              </li>
            </ul>
          </div>
        </div>

        <hr className="bg-secondary" />

        {/* Copyright */}
        <div className="row">
          <div className="col-12 text-center">
            <p className="text-light mb-0">
              &copy; {new Date().getFullYear()} AssitoSanté. Tous droits
              réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
