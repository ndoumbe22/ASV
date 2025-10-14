import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaEdit, FaEye, FaPaperPlane, FaSearch } from "react-icons/fa";
import { articleService } from "../../services/articleService";

function Articles() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadArticles();
  }, [statusFilter]);

  useEffect(() => {
    filterArticles();
  }, [searchTerm, articles]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await articleService.getDoctorArticles(statusFilter);
      setArticles(data);
    } catch (err) {
      setError("Erreur lors du chargement des articles: " + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterArticles = () => {
    let filtered = articles;
    
    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.resume.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.tags && article.tags.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredArticles(filtered);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "brouillon":
        return <span className="badge bg-secondary">Brouillon</span>;
      case "en_attente":
        return <span className="badge bg-warning">En attente</span>;
      case "valide":
        return <span className="badge bg-success">Validé</span>;
      case "refuse":
        return <span className="badge bg-danger">Refusé</span>;
      case "desactive":
        return <span className="badge bg-dark">Désactivé</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSubmitForReview = async (articleId) => {
    if (window.confirm("Êtes-vous sûr de vouloir soumettre cet article pour validation ?")) {
      try {
        await articleService.submitArticleForReview(articleId);
        loadArticles(); // Refresh the list
        alert("Article soumis pour validation");
      } catch (err) {
        alert("Erreur lors de la soumission: " + (err.response?.data?.error || err.message));
        console.error(err);
      }
    }
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
            <h2>Articles de Santé</h2>
            <Link to="/medecin/articles/create" className="btn btn-primary">
              <FaPlus className="me-2" />
              Créer un article
            </Link>
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
                <div className="col-md-6">
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaSearch />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher des articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={handleStatusChange}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="brouillon">Brouillons</option>
                    <option value="en_attente">En attente de validation</option>
                    <option value="valide">Validés</option>
                    <option value="refuse">Refusés</option>
                    <option value="desactive">Désactivés</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {filteredArticles.length === 0 ? (
            <div className="card text-center p-5">
              <h4 className="text-muted">
                Aucun article trouvé
              </h4>
              <p className="text-muted">
                {statusFilter === "all" 
                  ? "Vous n'avez pas encore créé d'articles." 
                  : `Aucun article avec le statut "${statusFilter}"`}
              </p>
              <Link to="/medecin/articles/create" className="btn btn-primary">
                <FaPlus className="me-2" />
                Créer votre premier article
              </Link>
            </div>
          ) : (
            <div className="row">
              {filteredArticles.map((article) => (
                <div key={article.id} className="col-md-6 col-lg-4 mb-4">
                  <div className="card h-100">
                    {article.image && (
                      <img 
                        src={article.image} 
                        className="card-img-top" 
                        alt={article.titre}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                    )}
                    <div className="card-body">
                      <h5 className="card-title">{article.titre}</h5>
                      <p className="card-text">{article.resume}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          {getStatusBadge(article.statut)}
                        </div>
                        <small className="text-muted">
                          {new Date(article.date_modification).toLocaleDateString('fr-FR')}
                        </small>
                      </div>
                    </div>
                    <div className="card-footer">
                      <div className="btn-group w-100" role="group">
                        <Link 
                          to={`/medecin/articles/${article.id}`} 
                          className="btn btn-outline-primary btn-sm"
                          title="Voir"
                        >
                          <FaEye />
                        </Link>
                        <Link 
                          to={`/medecin/articles/${article.id}/edit`} 
                          className="btn btn-outline-success btn-sm"
                          title="Modifier"
                        >
                          <FaEdit />
                        </Link>
                        {article.statut === "brouillon" && (
                          <button 
                            type="button"
                            className="btn btn-outline-warning btn-sm"
                            title="Soumettre pour validation"
                            onClick={() => handleSubmitForReview(article.id)}
                          >
                            <FaPaperPlane />
                          </button>
                        )}
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

export default Articles;