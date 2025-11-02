import React, { useState, useEffect } from "react";
import { medicalDocumentAPI, rendezVousAPI, doctorAPI } from "../../services/api";
import { FaFileMedical, FaDownload, FaTrash, FaUpload } from "react-icons/fa";

function DocumentPartage() {
  const [documents, setDocuments] = useState([]);
  const [doctors, setDoctors] = useState([]); // Doctors with confirmed appointments
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    doctor: "",
    file: null,
    document_type: "",
    description: ""
  });

  useEffect(() => {
    loadDocuments();
    loadDoctorsWithConfirmedAppointments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await medicalDocumentAPI.getDocuments();
      // Ensure documents is an array
      const documentsData = Array.isArray(response.data) ? response.data : [];
      setDocuments(documentsData);
    } catch (err) {
      setError("Erreur lors du chargement des documents");
      console.error(err);
      // Set documents to empty array on error
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorsWithConfirmedAppointments = async () => {
    try {
      // Load appointments
      const appointmentsData = await rendezVousAPI.mesRendezVous();
      // Ensure appointmentsData is an array
      const appointmentsArray = Array.isArray(appointmentsData) ? appointmentsData : [];
      
      // Extract doctors with confirmed appointments
      const doctorsWithConfirmedAppointments = {};
      appointmentsArray
        .filter(app => app.statut === "CONFIRMED" || app.statut === "TERMINE")
        .forEach(appointment => {
          if (appointment.medecin && appointment.medecin_nom) {
            doctorsWithConfirmedAppointments[appointment.medecin] = {
              id: appointment.medecin,
              name: appointment.medecin_nom,
              specialite: appointment.specialite
            };
          }
        });
      
      setDoctors(Object.values(doctorsWithConfirmedAppointments));
    } catch (err) {
      setError("Erreur lors du chargement des médecins");
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      if (!uploadData.doctor) {
        throw new Error("Veuillez sélectionner un médecin");
      }
      
      const formData = new FormData();
      formData.append('medecin', uploadData.doctor);
      formData.append('file', uploadData.file);
      formData.append('document_type', uploadData.document_type);
      formData.append('description', uploadData.description);
      
      await medicalDocumentAPI.createDocument(formData);
      setShowUploadModal(false);
      setUploadData({ doctor: "", file: null, document_type: "", description: "" });
      loadDocuments();
    } catch (err) {
      setError("Erreur lors de l'upload du document: " + (err.message || err.response?.data?.error || ""));
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await medicalDocumentAPI.deleteDocument(id);
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (err) {
      setError("Erreur lors de la suppression du document");
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return <div className="text-center py-5">Chargement...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Erreur: {error}</div>;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <FaFileMedical className="me-2" />
          Documents Partagés
        </h2>
        <button
          className="btn btn-success"
          onClick={() => setShowUploadModal(true)}
        >
          <FaUpload className="me-1" />
          Partager Document
        </button>
      </div>

      {documents.length === 0 ? (
        <div className="alert alert-info">Aucun document partagé disponible.</div>
      ) : (
        <div className="row">
          {documents.map((document) => (
            <div key={document.id} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{document.document_type}</h5>
                  <p className="card-text">{document.description}</p>
                  <p className="card-text">
                    <small className="text-muted">
                      Partagé le {formatDate(document.uploaded_at)} avec Dr. {document.medecin_nom}
                    </small>
                  </p>
                  <div className="d-flex justify-content-between">
                    <a
                      href={document.file_url}
                      className="btn btn-primary btn-sm"
                      download
                    >
                      <FaDownload className="me-1" />
                      Télécharger
                    </a>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(document.id)}
                    >
                      <FaTrash className="me-1" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Partager Document Médical</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowUploadModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpload}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Sélectionner un médecin</label>
                    <select
                      className="form-control"
                      value={uploadData.doctor}
                      onChange={(e) => setUploadData({...uploadData, doctor: e.target.value})}
                      required
                    >
                      <option value="">Sélectionnez un médecin</option>
                      {doctors.map(doctor => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.name} ({doctor.specialite})
                        </option>
                      ))}
                    </select>
                    <small className="form-text text-muted">
                      Vous pouvez uniquement partager des documents avec des médecins avec lesquels vous avez des rendez-vous confirmés.
                    </small>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Fichier</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(e) => setUploadData({...uploadData, file: e.target.files[0]})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type de document</label>
                    <input
                      type="text"
                      className="form-control"
                      value={uploadData.document_type}
                      onChange={(e) => setUploadData({...uploadData, document_type: e.target.value})}
                      required
                      placeholder="Ex: Ordonnance, Bilan sanguin, etc."
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      value={uploadData.description}
                      onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                      placeholder="Description du document..."
                      rows="3"
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowUploadModal(false)}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!uploadData.doctor || !uploadData.file || !uploadData.document_type}
                  >
                    Partager
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentPartage;