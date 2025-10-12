import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaFolder, FaSearch, FaCalendarCheck, FaUserMd } from "react-icons/fa";

function Dossiers() {
  const [dossiers, setDossiers] = useState([]);
  const [filteredDossiers, setFilteredDossiers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les dossiers depuis l'API
  useEffect(() => {
    const fetchDossiers = async () => {
      try {
        setLoading(true);
        // Dans une vraie application, ces données viendraient de l'API
        // Pour l'instant, utilisons des données statiques
        const mockDossiers = [
          {
            id: 1,
            patient: "Awa Diop",
            dateCreation: "2023-01-15",
            derniereConsultation: "2023-10-15",
            consultations: 3,
            statut: "Actif"
          },
          {
            id: 2,
            patient: "Mamadou Fall",
            dateCreation: "2022-03-22",
            derniereConsultation: "2023-10-10",
            consultations: 5,
            statut: "Actif"
          },
          {
            id: 3,
            patient: "Fatou Ndiaye",
            dateCreation: "2023-05-10",
            derniereConsultation: "2023-09-28",
            consultations: 2,
            statut: "Inactif"
          },
          {
            id: 4,
            patient: "Cheikh Sow",
            dateCreation: "2021-11-05",
            derniereConsultation: "2023-10-05",
            consultations: 8,
            statut: "Actif"
          }
        ];
        
        setDossiers(mockDossiers);
        setFilteredDossiers(mockDossiers);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des dossiers");
        setLoading(false);
        console.error("Erreur lors du chargement des dossiers :", err);
      }
    };

    fetchDossiers();
  }, []);

  // Filtrer selon recherche
  useEffect(() => {
    const filtered = dossiers.filter(
      dossier =>
        dossier.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dossier.statut.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDossiers(filtered);
  }, [searchTerm, dossiers]);

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>Chargement...</div>;
  }

  if (error) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>Erreur: {error}</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <div className="card shadow-sm p-3 mb-4">
            <h5>Dossiers</h5>
            <ul className="list-group">
              <li className="list-group-item active">Tous les dossiers</li>
              <li className="list-group-item">Dossiers actifs</li>
              <li className="list-group-item">Dossiers inactifs</li>
              <li className="list-group-item">Nouveaux dossiers</li>
            </ul>
          </div>
          
          <div className="card shadow-sm p-3">
            <h5>Statistiques</h5>
            <div className="d-flex justify-content-between">
              <div>
                <h3>4</h3>
                <p className="mb-0 text-muted">Total</p>
              </div>
              <div>
                <h3>3</h3>
                <p className="mb-0 text-muted">Actifs</p>
              </div>
              <div>
                <h3>1</h3>
                <p className="mb-0 text-muted">Inactifs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Dossiers Médicaux</h2>
            <div style={{ position: "relative", width: "250px" }}>
              <input
                type="text"
                placeholder="Rechercher un dossier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
              />
              <FaSearch
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "12px",
                  transform: "translateY(-50%)",
                  color: "#888",
                }}
              />
            </div>
          </div>

          {filteredDossiers.length === 0 ? (
            <div className="card shadow-sm p-5 text-center">
              <h4>Aucun dossier trouvé</h4>
              <p>Aucun dossier ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="row">
              {filteredDossiers.map((dossier) => (
                <div key={dossier.id} className="col-md-6 mb-4">
                  <div className="card shadow-sm p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5>{dossier.patient}</h5>
                        <p className="text-muted mb-1">
                          <FaCalendarCheck className="me-2" /> 
                          Créé le {new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-muted mb-1">
                          <FaUserMd className="me-2" /> 
                          Dernière consultation: {new Date(dossier.derniereConsultation).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span className={`badge ${dossier.statut === 'Actif' ? 'bg-success' : 'bg-secondary'}`}>
                        {dossier.statut}
                      </span>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <small className="text-muted">Consultations</small>
                        <p className="mb-0">{dossier.consultations}</p>
                      </div>
                      <div>
                        <small className="text-muted">Dernière mise à jour</small>
                        <p className="mb-0">{new Date(dossier.derniereConsultation).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between">
                      <button className="btn btn-outline-success btn-sm">
                        <FaFolder className="me-2" /> Voir le dossier
                      </button>
                      <button className="btn btn-success btn-sm">
                        Ajouter une consultation
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dossiers;