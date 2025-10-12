import React, { useState, useEffect } from "react";
import { patientAPI } from "../../services/api";
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaSave, FaEdit } from "react-icons/fa";

function Profile() {
  const [patientData, setPatientData] = useState({
    nom: "",
    prenom: "",
    telephone: "",
    email: "",
    adresse: "",
    dateNaissance: "",
    sexe: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Charger les données du patient
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        // Fetch patient data from API
        const response = await patientAPI.getPatient(1); // We'll need to get the actual patient ID
        const data = response.data;
        
        setPatientData({
          nom: data.user.last_name || "",
          prenom: data.user.first_name || "",
          telephone: data.user.telephone || "",
          email: data.user.email || "",
          adresse: data.adresse || "",
          dateNaissance: "", // This would need to come from the user model
          sexe: "" // This would need to come from the user model
        });
        
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement du profil");
        setLoading(false);
        console.error("Erreur lors du chargement du profil :", err);
      }
    };

    fetchPatientData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Update patient data through API
      const updateData = {
        user: {
          first_name: patientData.prenom,
          last_name: patientData.nom,
          telephone: patientData.telephone,
          email: patientData.email
        },
        adresse: patientData.adresse
      };
      
      await patientAPI.updatePatient(1, updateData); // We'll need to get the actual patient ID
      
      setIsEditing(false);
      setSaving(false);
      setSuccess(true);
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Erreur lors de la sauvegarde du profil");
      setSaving(false);
      console.error("Erreur lors de la sauvegarde du profil :", err);
    }
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>Chargement...</div>;
  }

  if (error) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>Erreur: {error}</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Profil Patient</h2>
            {success && (
              <div className="alert alert-success py-2 px-3 mb-0">
                Profil mis à jour avec succès !
              </div>
            )}
          </div>
          
          <div className="card shadow-sm">
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Informations Personnelles</h4>
                {!isEditing ? (
                  <button 
                    className="btn btn-outline-success"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit className="me-2" /> Modifier
                  </button>
                ) : (
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
            
            <div className="card-body">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Nom</label>
                      <input
                        type="text"
                        className="form-control"
                        name="nom"
                        value={patientData.nom}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Prénom</label>
                      <input
                        type="text"
                        className="form-control"
                        name="prenom"
                        value={patientData.prenom}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Téléphone</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="telephone"
                        value={patientData.telephone}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={patientData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date de Naissance</label>
                      <input
                        type="date"
                        className="form-control"
                        name="dateNaissance"
                        value={patientData.dateNaissance}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Sexe</label>
                      <select
                        className="form-select"
                        name="sexe"
                        value={patientData.sexe}
                        onChange={handleInputChange}
                      >
                        <option value="">Sélectionner</option>
                        <option value="Masculin">Masculin</option>
                        <option value="Féminin">Féminin</option>
                      </select>
                    </div>
                    
                    <div className="col-12 mb-3">
                      <label className="form-label">Adresse</label>
                      <textarea
                        className="form-control"
                        name="adresse"
                        value={patientData.adresse}
                        onChange={handleInputChange}
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="d-flex justify-content-end">
                    <button 
                      type="submit" 
                      className="btn btn-success"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <FaSave className="me-2" /> Enregistrer les modifications
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="row">
                  <div className="col-md-4 text-center mb-4">
                    <div className="d-flex justify-content-center mb-3">
                      <div style={{ width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "#e9f5e9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FaUser size={60} color="#2E7D32" />
                      </div>
                    </div>
                    <h4>{patientData.prenom} {patientData.nom}</h4>
                    <p className="text-muted">Patient</p>
                  </div>
                  
                  <div className="col-md-8">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="d-flex">
                          <div className="me-3 text-success">
                            <FaPhone size={20} />
                          </div>
                          <div>
                            <small className="text-muted">Téléphone</small>
                            <p className="mb-0">{patientData.telephone || "Non renseigné"}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <div className="d-flex">
                          <div className="me-3 text-success">
                            <FaEnvelope size={20} />
                          </div>
                          <div>
                            <small className="text-muted">Email</small>
                            <p className="mb-0">{patientData.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <div className="d-flex">
                          <div className="me-3 text-success">
                            <FaMapMarkerAlt size={20} />
                          </div>
                          <div>
                            <small className="text-muted">Adresse</small>
                            <p className="mb-0">{patientData.adresse || "Non renseignée"}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <div className="d-flex">
                          <div className="me-3 text-success">
                            <FaUser size={20} />
                          </div>
                          <div>
                            <small className="text-muted">Date de Naissance</small>
                            <p className="mb-0">{patientData.dateNaissance ? new Date(patientData.dateNaissance).toLocaleDateString('fr-FR') : "Non renseignée"}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-6 mb-3">
                        <div className="d-flex">
                          <div className="me-3 text-success">
                            <FaUser size={20} />
                          </div>
                          <div>
                            <small className="text-muted">Sexe</small>
                            <p className="mb-0">{patientData.sexe || "Non renseigné"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="card shadow-sm mt-4">
            <div className="card-header bg-white">
              <h4 className="mb-0">Sécurité du Compte</h4>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h6 className="mb-0">Mot de passe</h6>
                  <p className="text-muted mb-0">Dernière mise à jour il y a 3 mois</p>
                </div>
                <button className="btn btn-outline-success">Changer le mot de passe</button>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">Authentification à deux facteurs</h6>
                  <p className="text-muted mb-0">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;