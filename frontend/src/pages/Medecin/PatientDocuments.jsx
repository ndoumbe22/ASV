import React, { useState, useEffect } from "react";
import { FaFileMedical, FaSearch, FaFilter, FaDownload, FaUpload, FaPlus } from "react-icons/fa";
import { api } from "../../services/api";
import { useParams } from "react-router-dom";

function PatientDocuments() {
  const { patientId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [patientInfo, setPatientInfo] = useState(null);

  useEffect(() => {
    loadPatientDocuments();
  }, [patientId]);

  useEffect(() => {
    filterDocuments();
  }, [searchTerm, typeFilter, documents]);

  const loadPatientDocuments = async () => {
    try {
      setLoading(true);
      
      // Load patient information
      // In a real implementation, you would have an endpoint to get patient info
      // For now, we'll simulate this
      
      // Load documents
      const response = await api.get("/medical-documents/");
      // Filter documents for this patient (in a real implementation, this would be done server-side)
      const patientDocs = response.data.filter(doc => 
        doc.rendez_vous && doc.rendez_vous.patient === parseInt(patientId)
      );
      setDocuments(patientDocs);
      
      // Set patient info (simulated)
      setPatientInfo({
        id: patientId,
        name: "Patient Exemple",
        email: "patient@example.com"
      });
    } catch (err) {
      setError("Erreur lors du chargement des documents: " + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
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

  const handleDownload = (fileUrl, fileName) => {
    // In a real implementation, you would handle file download
    // For now, we'll just open the file in a new tab
    window.open(fileUrl, "_blank");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2>
                <FaFileMedical className="me-2" />
                Documents médicaux du patient
              </h2>
              {patientInfo && (
                <p className="text-muted mb-0">
                  {patientInfo.name} ({patientInfo.email})
                </p>
              )}
            </div>
            <button className="btn btn-primary">
              <FaPlus className="me-2" />
              Partager un document
            </button>
          </div>
          
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}
          
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
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
            </div>
          </div>
          
          {filteredDocuments.length === 0 ? (
            <div className="card text-center p-5">
              <h4 className="text-muted">
                <FaFileMedical className="me-2" />
                Aucun document médical
              </h4>
              <p className="text-muted">
                {searchTerm || typeFilter !== "all" 
                  ? "Aucun document ne correspond à vos critères de recherche."
                  : "Ce patient n'a pas encore partagé de documents médicaux."
                }
              </p>
              <button className="btn btn-primary">
                <FaUpload className="me-2" />
                Partager un document avec le patient
              </button>
            </div>
          ) : (
            <div className="row">
              {filteredDocuments.map((doc) => (
                <div key={doc.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div>
                          <h5 className="card-title">{getDocumentTypeLabel(doc.document_type)}</h5>
                          <p className="card-text text-muted">{doc.description}</p>
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
                            <strong>Rendez-vous:</strong> {formatDate(doc.rendez_vous.date)}
                          </small>
                        </div>
                      )}
                    </div>
                    
                    <div className="card-footer">
                      <div className="btn-group w-100" role="group">
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleDownload(doc.file_url, doc.document_type)}
                        >
                          <FaDownload className="me-1" />
                          Télécharger
                        </button>
                        <button className="btn btn-outline-success btn-sm">
                          <FaPlus className="me-1" />
                          Annoter
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
  );
}

export default PatientDocuments;