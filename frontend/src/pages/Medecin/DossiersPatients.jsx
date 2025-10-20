import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { patientAPI, doctorAPI } from "../../services/api";
import { FaUser, FaSearch, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

function DossiersPatients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les patients depuis l'API
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        
        // Get patients from the API
        const response = await patientAPI.getPatients();
        
        // Transform the data to match the expected format
        const formattedPatients = response.data.map(patient => ({
          id: patient.user.id,
          nom: patient.user.last_name || "",
          prenom: patient.user.first_name || "",
          age: calculateAge(patient.date_naissance) || 0,
          sexe: patient.sexe || "Non spécifié",
          telephone: patient.telephone || "",
          email: patient.user.email || "",
          adresse: patient.adresse || "",
          dernierRdv: "", // This would need to be fetched from appointment API
          prochainRdv: "" // This would need to be fetched from appointment API
        }));
        
        setPatients(formattedPatients);
        setFilteredPatients(formattedPatients);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des patients");
        setLoading(false);
        console.error("Erreur lors du chargement des patients :", err);
      }
    };

    if (user) {
      fetchPatients();
    }
  }, [user]);

  // Helper function to calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Filtrer selon recherche
  useEffect(() => {
    const filtered = patients.filter(
      patient =>
        `${patient.prenom} ${patient.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.telephone && patient.telephone.includes(searchTerm)) ||
        (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

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
            <h5>Patients</h5>
            <ul className="list-group">
              <li className="list-group-item active">Tous les patients</li>
              <li className="list-group-item">Nouveaux patients</li>
              <li className="list-group-item">Patients actifs</li>
              <li className="list-group-item">Patients inactifs</li>
            </ul>
          </div>
          
          <div className="card shadow-sm p-3">
            <h5>Filtres</h5>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" id="masculin" />
              <label className="form-check-label" htmlFor="masculin">
                Masculin
              </label>
            </div>
            <div className="form-check mb-2">
              <input className="form-check-input" type="checkbox" id="feminin" />
              <label className="form-check-label" htmlFor="feminin">
                Féminin
              </label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="rdvPrevu" />
              <label className="form-check-label" htmlFor="rdvPrevu">
                RDV prévu
              </label>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Liste des Patients</h2>
            <div style={{ position: "relative", width: "250px" }}>
              <input
                type="text"
                placeholder="Rechercher un patient..."
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

          {filteredPatients.length === 0 ? (
            <div className="card shadow-sm p-5 text-center">
              <h4>Aucun patient trouvé</h4>
              <p>Aucun patient ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="row">
              {filteredPatients.map((patient) => (
                <div key={patient.id} className="col-md-6 mb-4">
                  <div className="card shadow-sm p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#e9f5e9", display: "flex", alignItems: "center", justifyContent: "center" }} className="me-3">
                        <FaUser size={30} color="#2E7D32" />
                      </div>
                      <div>
                        <h5 className="mb-0">{patient.prenom} {patient.nom}</h5>
                        <p className="text-muted mb-0">{patient.age} ans, {patient.sexe}</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="mb-1"><FaPhone className="me-2" /> {patient.telephone || "Non renseigné"}</p>
                      <p className="mb-1"><FaEnvelope className="me-2" /> {patient.email || "Non renseigné"}</p>
                      <p className="mb-1"><FaMapMarkerAlt className="me-2" /> {patient.adresse || "Non renseigné"}</p>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        <small className="text-muted">Dernier RDV</small>
                        <p className="mb-0">{patient.dernierRdv ? new Date(patient.dernierRdv).toLocaleDateString('fr-FR') : "Aucun"}</p>
                      </div>
                      <div>
                        <small className="text-muted">Prochain RDV</small>
                        <p className="mb-0">{patient.prochainRdv ? new Date(patient.prochainRdv).toLocaleDateString('fr-FR') : "Aucun"}</p>
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between">
                      <button className="btn btn-outline-success btn-sm">
                        Voir le dossier
                      </button>
                      <button className="btn btn-success btn-sm">
                        Planifier un RDV
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

export default DossiersPatients;