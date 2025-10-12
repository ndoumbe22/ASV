import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { articleService } from "../../services/articleService";

function MesArticles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState("all");

  const statuts = [
    { value: "all", label: "Tous", badge: "secondary" },
    { value: "brouillon", label: "Brouillons", badge: "secondary" },
    { value: "en_attente", label: "En attente", badge: "warning" },
    { value: "valide", label: "Validés", badge: "success" },
    { value: "refuse", label: "Refusés", badge: "danger" },
  ];

  useEffect(() => {
    loadArticles();
  }, [filterStatut]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filterStatut !== "all") filters.statut = filterStatut;

      const data = await articleService.getMyArticles(filters);
      setArticles(data);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, titre) => {
    if (window.confirm(`Supprimer l'article "${titre}" ?`)) {
      try {
        await articleService.deleteArticle(id);
        alert("Article supprimé");
        loadArticles();
      } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleSoumettre = async (id, titre) => {
    if (window.confirm(`Soumettre l'article "${titre}" pour validation ?`)) {
      try {
        await articleService.soumettreValidation(id);
        alert("Article soumis pour validation");
        loadArticles();
      } catch (error) {
        console.error("Erreur:", error);
        alert(error.response?.data?.error || "Erreur lors de la soumission");
      }
    }
  };

  const getStatusBadge = (statut) => {
    const status = statuts.find((s) => s.value === statut);
    return status ? status.badge : "secondary";
  };

  if (loading)
    return (
      <div className="text-center p-5">
        <div className="spinner-border"></div>
      </div>
    );

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>
          <i className="bi bi-file-text"></i> Mes Articles
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/medecin/articles/nouveau")}
        >
          <i className="bi bi-plus-circle"></i> Nouvel Article
        </button>
      </div>

      {/* Filtres */}
      <div className="mb-4">
        <div className="btn-group" role="group">
          {statuts.map((statut) => (
            <button
              key={statut.value}
              type="button"
              className={`btn btn-outline-${statut.badge} ${
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
      {articles.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle"></i> Aucun article dans cette
          catégorie
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Titre</th>
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
                      {/* Modifier */}
                      {(article.statut === "brouillon" ||
                        article.statut === "refuse") && (
                        <button
                          className="btn btn-outline-primary"
                          onClick={() =>
                            navigate(`/medecin/articles/${article.id}/modifier`)
                          }
                          title="Modifier"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      )}

                      {/* Soumettre */}
                      {(article.statut === "brouillon" ||
                        article.statut === "refuse") && (
                        <button
                          className="btn btn-outline-success"
                          onClick={() =>
                            handleSoumettre(article.id, article.titre)
                          }
                          title="Soumettre pour validation"
                        >
                          <i className="bi bi-send"></i>
                        </button>
                      )}

                      {/* Supprimer */}
                      {article.statut === "brouillon" && (
                        <button
                          className="btn btn-outline-danger"
                          onClick={() =>
                            handleDelete(article.id, article.titre)
                          }
                          title="Supprimer"
                        >
                          <i className="bi bi-trash"></i>
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
    </div>
  );
}

export default MesArticles;
