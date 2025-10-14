import React, { useState, useEffect } from "react";
import { medicalDocumentAPI, appointmentAPI } from "../../services/api";
import { FaFileMedical, FaUpload, FaDownload, FaTrash, FaSearch, FaFilter } from "react-icons/fa";

function DocumentPartage() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [documentType, setDocumentType] = useState("analyse");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

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

  // Filter documents when search term or type filter changes
  useEffect(() => {
    let filtered = documents;
    
    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (typeFilter !== "all") {
      filtered = filtered.filter(doc => doc.document_type === typeFilter);
    }
    
    setFilteredDocuments(filtered);
  }, [searchTerm, typeFilter, documents]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!documentType || !file) {
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
      setFilteredDocuments([response.data, ...filteredDocuments]);
      
      // Reset form
      setSelectedAppointment("");
      setDocumentType("analyse");
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
        setFilteredDocuments(filteredDocuments.filter(doc => doc.id !== id));
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const documentTypes = [
    { value: "all", label: "Tous les types" },
    { value: "analyse", label: "Analyses médicales" },
    { value: "radio", label: "Radiographies" },
    { value: "ordonnance", label: "Ordonnances" },
    { value: "certificat", label: "Certificats médicaux" },
    { value: "compte_rendu", label: "Comptes rendus" },
    { value: "autre", label: "Autre" }
  ];

  const getDocumentTypeLabel = (type) => {
    const typeObj = documentTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
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
              Mes Documents Médicaux
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

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher des documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <FaFilter />
            </span>
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
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
                  <label className="form-label">Type de document *</label>
                  <select
                    className="form-select"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    required
                  >
                    {documentTypes.filter(t => t.value !== "all").map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Rendez-vous concerné</label>
                  <select
                    className="form-select"
                    value={selectedAppointment}
                    onChange={(e) => setSelectedAppointment(e.target.value)}
                  >
                    <option value="">Aucun rendez-vous</option>
                    {appointments.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.date} à {app.heure} - Dr. {app.medecin_nom}
                      </option>
                    ))}
                  </select>
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
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    required
                  />
                  <div className="form-text">
                    Formats acceptés: PDF, JPG, PNG, DOC, DOCX (max 10MB)
                  </div>
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
                Documents médicaux
              </h5>
            </div>
            <div className="card-body">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-5">
                  <FaFileMedical size={48} className="text-muted mb-3" />
                  <h5>Aucun document trouvé</h5>
                  <p className="text-muted">
                    {searchTerm || typeFilter !== "all" 
                      ? "Aucun document ne correspond à vos critères de recherche."
                      : "Vous n'avez pas encore partagé de documents médicaux."
                    }
                  </p>
                  <button 
                    className="btn btn-success"
                    onClick={() => setShowUploadForm(true)}
                  >
                    <FaUpload className="me-2" />
                    Partager votre premier document
                  </button>
                </div>
              ) : (
                <div className="row">
                  {filteredDocuments.map(doc => (
                    <div key={doc.id} className="col-md-6 col-lg-4 mb-4">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                              <h5 className="card-title">{getDocumentTypeLabel(doc.document_type)}</h5>
                              <p className="card-text text-muted">{doc.description || "-"}</p>
                            </div>
                            <span className="badge bg-secondary">
                              {doc.document_type}
                            </span>
                          </div>
                          
                          <div className="mb-3">
                            <small className="text-muted">
                              <strong>Téléchargé par:</strong> {doc.uploaded_by_name}
                            </small>
                          </div>
                          
                          <div className="mb-3">
                            <small className="text-muted">
                              <strong>Date:</strong> {formatDate(doc.uploaded_at)}
                            </small>
                          </div>
                          
                          {doc.rendez_vous && (
                            <div className="mb-3">
                              <small className="text-muted">
                                <strong>Rendez-vous:</strong> {doc.rendez_vous.date} à {doc.rendez_vous.heure}
                                <br />
                                <small className="text-muted">
                                  Dr. {doc.rendez_vous.medecin_nom}
                                </small>
                              </small>
                            </div>
                          )}
                        </div>
                        
                        <div className="card-footer">
                          <div className="btn-group w-100" role="group">
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
                        </div>
                      </div>
                    </div>
                  ))}
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