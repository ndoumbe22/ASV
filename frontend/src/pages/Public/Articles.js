import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { articleService } from "../../services/articleService";

function ArticlesPublics() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategorie, setSelectedCategorie] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = [
    { value: "all", label: "Toutes" },
    { value: "prevention", label: "Prévention" },
    { value: "nutrition", label: "Nutrition" },
    { value: "maladies", label: "Maladies" },
    { value: "bien_etre", label: "Bien-être" },
    { value: "grossesse", label: "Grossesse" },
    { value: "pediatrie", label: "Pédiatrie" },
    { value: "geriatrie", label: "Gériatrie" },
    { value: "autre", label: "Autre" },
  ];

  useEffect(() => {
    loadArticles();
  }, [selectedCategorie]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (selectedCategorie !== "all") filters.categorie = selectedCategorie;
      if (searchTerm) filters.search = searchTerm;

      const data = await articleService.getArticlesPublics(filters);
      setArticles(data);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du chargement des articles");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadArticles();
  };

  if (loading)
    return (
      <div className="text-center p-5">
        <div className="spinner-border"></div>
      </div>
    );

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">
        <i className="bi bi-file-text text-primary"></i> Articles de Santé
      </h1>

      {/* Filtres */}
      <div className="row mb-4">
        <div className="col-md-4">
          <select
            className="form-select"
            value={selectedCategorie}
            onChange={(e) => setSelectedCategorie(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-8">
          <form onSubmit={handleSearch} className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">
              <i className="bi bi-search"></i>
            </button>
          </form>
        </div>
      </div>

      {/* Liste */}
      {articles.length === 0 ? (
        <div className="alert alert-info">Aucun article trouvé</div>
      ) : (
        <div className="row">
          {articles.map((article) => (
            <div key={article.id} className="col-md-4 mb-4">
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
                  <span className="badge bg-primary mb-2">
                    {article.categorie}
                  </span>
                  <h5 className="card-title">{article.titre}</h5>
                  <p className="card-text text-muted">{article.resume}</p>
                  <small className="text-muted">
                    <i className="bi bi-person"></i> {article.auteur_nom}
                    <br />
                    <i className="bi bi-eye"></i> {article.vues} vues
                  </small>
                </div>
                <div className="card-footer">
                  <Link
                    to={`/articles/${article.slug}`}
                    className="btn btn-outline-primary w-100"
                  >
                    Lire <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ArticlesPublics;
