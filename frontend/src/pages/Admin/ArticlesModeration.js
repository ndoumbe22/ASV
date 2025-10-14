import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaBan, FaSearch, FaChartBar } from "react-icons/fa";
import { articleService } from "../../services/articleService";

function ArticlesModeration() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadArticles();
    loadStatistics();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [searchTerm, articles]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await articleService.getAdminArticles();
      setArticles(data);
    } catch (err) {
      setError(
        "Erreur lors du chargement des articles: " +
          (err.response?.data?.error || err.message)
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await articleService.getArticleStatistics();
      setStats(data);
    } catch (err) {
      console.error("Erreur lors du chargement des statistiques:", err);
    }
  };

  const filterArticles = () => {
    // Filter only articles waiting for validation
    const pendingArticles = articles.filter(
      (article) => article.statut === "en_attente"
    );

    if (searchTerm) {
      const filtered = pendingArticles.filter(
        (article) =>
          article.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.auteur_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (article.tags &&
            article.tags.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(pendingArticles);
    }
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

  const handleValidate = async (articleId) => {
    if (window.confirm("Êtes-vous sûr de vouloir valider cet article ?")) {
      try {
        await articleService.validateArticle(articleId);
        loadArticles();
        loadStatistics();
        alert("Article validé avec succès");
      } catch (err) {
        alert(
          "Erreur lors de la validation: " +
            (err.response?.data?.error || err.message)
        );
        console.error(err);
      }
    }
  };

  const handleReject = async (articleId) => {
    if (window.confirm("Êtes-vous sûr de vouloir refuser cet article ?")) {
      try {
        await articleService.rejectArticle(articleId, {
          commentaire: rejectionReason,
        });
        setShowRejectModal(false);
        setRejectionReason("");
        loadArticles();
        loadStatistics();
        alert("Article refusé");
      } catch (err) {
        alert(
          "Erreur lors du refus: " + (err.response?.data?.error || err.message)
        );
        console.error(err);
      }
    }
  };

  const handleDeactivate = async (articleId) => {
    const reason = prompt("Motif de désactivation (optionnel):");
    if (reason !== null) {
      try {
        await articleService.deactivateArticle(articleId, {
          commentaire: reason,
        });
        loadArticles();
        loadStatistics();
        alert("Article désactivé");
      } catch (err) {
        alert(
          "Erreur lors de la désactivation: " +
            (err.response?.data?.error || err.message)
        );
        console.error(err);
      }
    }
  };

  const openRejectModal = (article) => {
    setSelectedArticle(article);
    setShowRejectModal(true);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
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
          <h2 className="mb-4">
            <FaCheck className="me-2" />
            Modération des Articles
          </h2>

          {error && (
            <div
              className="alert alert-danger alert-dismissible fade show"
              role="alert"
            >
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError(null)}
              ></button>
            </div>
          )}

          {/* Statistics */}
          {stats && (
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card bg-primary text-white">
                  <div className="card-body">
                    <h5 className="card-title">Total</h5>
                    <h2>{stats.total}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-warning text-dark">
                  <div className="card-body">
                    <h5 className="card-title">En attente</h5>
                    <h2>{stats.en_attente}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-success text-white">
                  <div className="card-body">
                    <h5 className="card-title">Validés</h5>
                    <h2>{stats.valides}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-info text-white">
                  <div className="card-body">
                    <h5 className="card-title">Vues</h5>
                    <h2>{stats.total_vues}</h2>
                  </div>
                </div>
              </div>
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
                      placeholder="Rechercher des articles en attente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="card text-center p-5">
              <h4 className="text-muted">
                <FaCheck className="me-2" />
                Aucun article en attente de validation
              </h4>
              <p className="text-muted">Tous les articles ont été traités.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Titre</th>
                    <th>Auteur</th>
                    <th>Catégorie</th>
                    <th>Date de soumission</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredArticles.map((article) => (
                    <tr key={article.id}>
                      <td>
                        <div>
                          <strong>{article.titre}</strong>
                        </div>
                        <div className="text-muted">
                          {article.extrait_contenu}
                        </div>
                      </td>
                      <td>{article.auteur_nom}</td>
                      <td>
                        <span className="badge bg-secondary">
                          {article.categorie}
                        </span>
                      </td>
                      <td>
                        {new Date(article.date_modification).toLocaleDateString(
                          "fr-FR"
                        )}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          <button
                            type="button"
                            className="btn btn-success btn-sm me-1"
                            onClick={() => handleValidate(article.id)}
                            title="Valider"
                          >
                            <FaCheck />
                          </button>
                          <button
                            type="button"
                            className="btn btn-danger btn-sm me-1"
                            onClick={() => openRejectModal(article)}
                            title="Refuser"
                          >
                            <FaTimes />
                          </button>
                          <button
                            type="button"
                            className="btn btn-dark btn-sm"
                            onClick={() => handleDeactivate(article.id)}
                            title="Désactiver"
                          >
                            <FaBan />
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

      {/* Rejection Modal */}
      {showRejectModal && selectedArticle && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Refuser l'article</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRejectModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Titre de l'article</label>
                  <input
                    type="text"
                    className="form-control"
                    value={selectedArticle.titre}
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Motif du refus *</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Expliquez pourquoi cet article est refusé..."
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRejectModal(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleReject(selectedArticle.id)}
                  disabled={!rejectionReason.trim()}
                >
                  Refuser l'article
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArticlesModeration;
