import React, { useState, useEffect } from "react";
import { articleService } from "../../services/articleService";

function ArticlesModeration() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState("en_attente");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [modalAction, setModalAction] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [statistics, setStatistics] = useState(null);

  const statuts = [
    { value: "all", label: "Tous" },
    { value: "en_attente", label: "En attente" },
    { value: "valide", label: "Validés" },
    { value: "refuse", label: "Refusés" },
    { value: "desactive", label: "Désactivés" },
  ];

  useEffect(() => {
    loadArticles();
    loadStatistics();
  }, [filterStatut]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterStatut !== "all") filters.statut = filterStatut;

      const data = await articleService.getAllArticles(filters);
      setArticles(data);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await articleService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Erreur stats:", error);
    }
  };

  const openModal = (article, action) => {
    setSelectedArticle(article);
    setModalAction(action);
    setCommentaire("");
  };

  const closeModal = () => {
    setSelectedArticle(null);
    setModalAction("");
    setCommentaire("");
  };

  const handleValider = async () => {
    try {
      await articleService.validerArticle(selectedArticle.id, commentaire);
      alert("Article validé");
      closeModal();
      loadArticles();
      loadStatistics();
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la validation");
    }
  };

  const handleRefuser = async () => {
    if (!commentaire) {
      alert("Le commentaire est obligatoire pour refuser un article");
      return;
    }

    try {
      await articleService.refuserArticle(selectedArticle.id, commentaire);
      alert("Article refusé");
      closeModal();
      loadArticles();
      loadStatistics();
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du refus");
    }
  };

  const handleDesactiver = async () => {
    try {
      await articleService.desactiverArticle(selectedArticle.id, commentaire);
      alert("Article désactivé");
      closeModal();
      loadArticles();
      loadStatistics();
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la désactivation");
    }
  };

  const getStatusBadge = (statut) => {
    const badges = {
      en_attente: "warning",
      valide: "success",
      refuse: "danger",
      desactive: "secondary",
    };
    return badges[statut] || "secondary";
  };

  if (loading && !statistics) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">
        <i className="bi bi-shield-check"></i> Modération des Articles
      </h2>

      {/* Statistiques */}
      {statistics && (
        <div className="row mb-4">
          <div className="col-md-2">
            <div className="card text-center">
              <div className="card-body">
                <h3>{statistics.total}</h3>
                <small>Total</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center border-warning">
              <div className="card-body">
                <h3 className="text-warning">{statistics.en_attente}</h3>
                <small>En attente</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center border-success">
              <div className="card-body">
                <h3 className="text-success">{statistics.valides}</h3>
                <small>Validés</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center border-danger">
              <div className="card-body">
                <h3 className="text-danger">{statistics.refuses}</h3>
                <small>Refusés</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center">
              <div className="card-body">
                <h3>{statistics.desactives}</h3>
                <small>Désactivés</small>
              </div>
            </div>
          </div>
          <div className="col-md-2">
            <div className="card text-center border-info">
              <div className="card-body">
                <h3 className="text-info">{statistics.total_vues}</h3>
                <small>Vues totales</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="mb-4">
        <div className="btn-group" role="group">
          {statuts.map((statut) => (
            <button
              key={statut.value}
              className={`btn btn-outline-primary ${
                filterStatut === statut.value ? "active" : ""
              }`}
              onClick={() => setFilterStatut(statut.value)}
            >
              {statut.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="alert alert-info">
          Aucun article dans cette catégorie
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Auteur</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Vues</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>
                    <strong>{article.titre}</strong>
                  </td>
                  <td>{article.auteur_nom}</td>
                  <td>
                    <span className="badge bg-info">{article.categorie}</span>
                  </td>
                  <td>
                    <span
                      className={`badge bg-${getStatusBadge(article.statut)}`}
                    >
                      {article.statut}
                    </span>
                  </td>
                  <td>
                    {new Date(article.date_publication).toLocaleDateString(
                      "fr-FR"
                    )}
                  </td>
                  <td>
                    <i className="bi bi-eye"></i> {article.vues}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      {/* Valider */}
                      {article.statut === "en_attente" && (
                        <button
                          className="btn btn-success"
                          onClick={() => openModal(article, "valider")}
                          title="Valider"
                        >
                          <i className="bi bi-check-circle"></i>
                        </button>
                      )}

                      {/* Refuser */}
                      {article.statut === "en_attente" && (
                        <button
                          className="btn btn-danger"
                          onClick={() => openModal(article, "refuser")}
                          title="Refuser"
                        >
                          <i className="bi bi-x-circle"></i>
                        </button>
                      )}

                      {/* Désactiver */}
                      {article.statut === "valide" && (
                        <button
                          className="btn btn-warning"
                          onClick={() => openModal(article, "desactiver")}
                          title="Désactiver"
                        >
                          <i className="bi bi-pause-circle"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de confirmation */}
      {selectedArticle && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalAction === "valider" && "✅ Valider l'article"}
                  {modalAction === "refuser" && "❌ Refuser l'article"}
                  {modalAction === "desactiver" && "⏸️ Désactiver l'article"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Article :</strong> {selectedArticle.titre}
                </p>
                <p>
                  <strong>Auteur :</strong> {selectedArticle.auteur_nom}
                </p>

                <div className="mb-3">
                  <label className="form-label">
                    Commentaire{" "}
                    {modalAction === "refuser" && (
                      <span className="text-danger">*</span>
                    )}
                  </label>
                  <textarea
                    className="form-control"
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    rows="3"
                    placeholder={
                      modalAction === "refuser"
                        ? "Expliquez la raison du refus..."
                        : "Commentaire optionnel..."
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>
                  Annuler
                </button>
                {modalAction === "valider" && (
                  <button className="btn btn-success" onClick={handleValider}>
                    <i className="bi bi-check-circle"></i> Valider
                  </button>
                )}
                {modalAction === "refuser" && (
                  <button className="btn btn-danger" onClick={handleRefuser}>
                    <i className="bi bi-x-circle"></i> Refuser
                  </button>
                )}
                {modalAction === "desactiver" && (
                  <button
                    className="btn btn-warning"
                    onClick={handleDesactiver}
                  >
                    <i className="bi bi-pause-circle"></i> Désactiver
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArticlesModeration;
