// src/pages/QuiSommesNous.js
import React from "react";

function QuiSommeNous() {
  return (
    <div className="container my-5">
      <h1 className="fw-bold text-center mb-4">Qui sommes-nous ?</h1>
      <p className="lead text-center">
        AssitoSanté est une plateforme de santé virtuelle intégrée qui facilite
        l’accès aux soins pour tous.  
        Nous mettons en relation les patients avec les médecins, cliniques,
        pharmacies et hôpitaux à travers une solution moderne, rapide et
        sécurisée.
      </p>

      <div className="row mt-5">
        <div className="col-md-6">
          <h3 className="fw-bold">Notre Mission</h3>
          <p>
            Offrir aux patients une solution simple pour prendre rendez-vous,
            consulter un médecin à distance, accéder à leur dossier médical et
            bénéficier de conseils personnalisés grâce à notre chatbot
            intelligent.
          </p>
        </div>
        <div className="col-md-6">
          <h3 className="fw-bold">Nos Valeurs</h3>
          <ul>
            <li>Accessibilité aux soins pour tous</li>
            <li>Fiabilité et sécurité des données</li>
            <li>Innovation grâce aux technologies modernes</li>
            <li>Transparence et accompagnement personnalisé</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default QuiSommeNous;
