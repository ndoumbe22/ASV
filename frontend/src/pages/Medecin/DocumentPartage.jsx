import React, { useState, useEffect } from "react";
import { medicalDocumentAPI, appointmentAPI } from "../../services/api";
import { FaFileMedical, FaUpload, FaDownload, FaTrash } from "react-icons/fa";

function DocumentPartage() {
  const [documents, setDocuments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Charger les documents et rendez-vous
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get documents
        const documentsResponse = await medicalDocumentAPI.getDocuments();
        setDocuments(documentsResponse.data);
        
        // Get confirmed appointments
        const appointmentsResponse = await appointmentAPI.getAppointments();
        const confirmedAppointments = appointmentsResponse.data.filter(
          app => app.statut === "CONFIRMED"
        );
        setAppointments(confirmedAppointments);
        
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des données");
        setLoading(false);
        console.error("Erreur lors du chargement des données :", err);
      }
    };

    fetchData();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedAppointment || !documentType || !file) {
      setError("Veuillez remplir tous les champs requis");
      return;
    }
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("rendez_vous", selectedAppointment);
      formData.append("document_type", documentType);
      formData.append("description", description);
      formData.append("file", file);
      
      const response = await medicalDocumentAPI.createDocument(formData);
      setDocuments([response.data, ...documents]);
      
      // Reset form
      setSelectedAppointment("");
      setDocumentType("");
      setDescription("");
      setFile(null);
      setShowUploadForm(false);
      setError(null);
      
      setUploading(false);
    } catch (err) {
      setError("Erreur lors de l'upload du document");
      setUploading(false);
      console.error("Erreur lors de l'upload du document :", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        await medicalDocumentAPI.deleteDocument(id);
        setDocuments(documents.filter(doc => doc.id !== id));
      } catch (err) {
        setError("Erreur lors de la suppression du document");
        console.error("Erreur lors de la suppression du document :", err);
      }
    }
  };

  const downloadDocument = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <FaFileMedical className="me-2" />
              Documents Médicaux
            </h2>
            <button 
              className="btn btn-success" 
              onClick={() => setShowUploadForm(!showUploadForm)}
            >
              <FaUpload className="me-2" />
              {showUploadForm ? "Annuler" : "Partager un document"}
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire d'upload */}
      {showUploadForm && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm p-4">
              <h4>Partager un nouveau document</h4>
              <form onSubmit={handleUpload}>
                <div className="mb-3">
                  <label className="form-label">Rendez-vous concerné *</label>
                  <select
                    className="form-select"
                    value={selectedAppointment}
                    onChange={(e) => setSelectedAppointment(e.target.value)}
                    required
                  >
                    <option value="">Sélectionnez un rendez-vous</option>
                    {appointments.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.date} à {app.heure} - {app.patient_nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Type de document *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    placeholder="Ex: Ordonnance, Bilan, etc."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    placeholder="Description du document..."
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label">Fichier *</label>
                  <input
                    type="file"
                    className="form-control"
                    onChange={handleFileChange}
                    required
                  />
                </div>

                <div className="d-flex justify-content-end">
                  <button 
                    type="button" 
                    className="btn btn-secondary me-2"
                    onClick={() => setShowUploadForm(false)}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Upload en cours...
                      </>
                    ) : (
                      <>
                        <FaUpload className="me-2" />
                        Partager le document
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Liste des documents */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header">
              <h5>
                <FaFileMedical className="me-2" />
                Documents partagés
              </h5>
            </div>
            <div className="card-body">
              {documents.length === 0 ? (
                <div className="text-center py-5">
                  <FaFileMedical size={48} className="text-muted mb-3" />
                  <h5>Aucun document partagé</h5>
                  <p className="text-muted">
                    Vous n'avez pas encore partagé de documents médicaux.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Rendez-vous</th>
                        <th>Date d'upload</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map(doc => (
                        <tr key={doc.id}>
                          <td>{doc.document_type}</td>
                          <td>{doc.description || "-"}</td>
                          <td>
                            {doc.rendez_vous.date} à {doc.rendez_vous.heure}
                            <br />
                            <small className="text-muted">
                              {doc.rendez_vous.patient_nom}
                            </small>
                          </td>
                          <td>
                            {new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}
                            <br />
                            <small className="text-muted">
                              {new Date(doc.uploaded_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </small>
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              {doc.file_url && (
                                <button
                                  className="btn btn-outline-primary btn-sm me-1"
                                  onClick={() => downloadDocument(doc.file_url, `${doc.document_type}.pdf`)}
                                  title="Télécharger"
                                >
                                  <FaDownload />
                                </button>
                              )}
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(doc.id)}
                                title="Supprimer"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentPartage;