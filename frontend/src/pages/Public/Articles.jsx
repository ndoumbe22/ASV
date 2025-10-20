import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import articleService from "../../services/articleService";

function ArticlesPublics() {
  const [articles, setArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
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

      const data = await articleService.getPublicArticles(filters);
      
      // Separate featured articles from regular articles
      const featured = data.filter(article => article.is_featured);
      const regular = data.filter(article => !article.is_featured);
      
      setFeaturedArticles(featured);
      setArticles(regular);
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading)
    return (
      <div className="text-center p-5">
        <div className="spinner-border"></div>
      </div>
    );

  return (
    <div className="container py-4">
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold mb-3">
          <i className="bi bi-file-text text-primary"></i> Articles de Santé
        </h1>
        <p className="lead text-muted">
          Découvrez les dernières informations et conseils de nos médecins experts
        </p>
      </div>

      {/* Featured Articles Section */}
      {featuredArticles.length > 0 && (
        <section className="mb-5">
          <h2 className="mb-4 pb-2 border-bottom">
            <i className="bi bi-star-fill text-warning"></i> Articles à la Une
          </h2>
          <div className="row">
            {featuredArticles.slice(0, 3).map((article) => (
              <div key={article.id} className="col-lg-4 col-md-6 mb-4">
                <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden">
                  {article.image ? (
                    <img
                      src={article.image}
                      className="card-img-top"
                      alt={article.titre}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                  ) : (
                    <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: "200px" }}>
                      <i className="bi bi-file-text text-muted" style={{ fontSize: "3rem" }}></i>
                    </div>
                  )}
                  <div className="card-body d-flex flex-column">
                    <div className="mb-2">
                      <span className="badge bg-primary">{article.categorie}</span>
                      <span className="badge bg-warning text-dark ms-2">À la Une</span>
                    </div>
                    <h5 className="card-title">{article.titre}</h5>
                    <p className="card-text text-muted flex-grow-1">{article.resume}</p>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <small className="text-muted">
                        <i className="bi bi-person"></i> {article.auteur_nom}
                      </small>
                      <small className="text-muted">
                        <i className="bi bi-calendar"></i> {formatDate(article.date_publication)}
                      </small>
                    </div>
                  </div>
                  <div className="card-footer bg-white border-0">
                    <Link
                      to={`/articles/${article.slug}`}
                      className="btn btn-primary w-100"
                    >
                      Lire l'article
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search and Filter Section */}
      <section className="mb-4">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
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
                placeholder="Rechercher des articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                <i className="bi bi-search me-1"></i> Rechercher
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Articles List */}
      <section>
        <h2 className="mb-4 pb-2 border-bottom">
          <i className="bi bi-journal-text"></i> Tous les Articles
        </h2>
        
        {articles.length === 0 ? (
          <div className="text-center py-5">
            <div className="display-1 text-muted mb-3">
              <i className="bi bi-journal-x"></i>
            </div>
            <h3 className="mb-3">Aucun article trouvé</h3>
            <p className="text-muted">
              Il n'y a aucun article correspondant à vos critères de recherche.
            </p>
          </div>
        ) : (
          <div className="row">
            {articles.map((article) => (
              <div key={article.id} className="col-lg-4 col-md-6 mb-4">
                <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden">
                  {article.image ? (
                    <img
                      src={article.image}
                      className="card-img-top"
                      alt={article.titre}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                  ) : (
                    <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: "200px" }}>
                      <i className="bi bi-file-text text-muted" style={{ fontSize: "3rem" }}></i>
                    </div>
                  )}
                  <div className="card-body d-flex flex-column">
                    <div className="mb-2">
                      <span className="badge bg-secondary">{article.categorie}</span>
                    </div>
                    <h5 className="card-title">{article.titre}</h5>
                    <p className="card-text text-muted flex-grow-1">{article.resume}</p>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <small className="text-muted">
                        <i className="bi bi-person"></i> {article.auteur_nom}
                      </small>
                      <small className="text-muted">
                        <i className="bi bi-calendar"></i> {formatDate(article.date_publication)}
                      </small>
                    </div>
                  </div>
                  <div className="card-footer bg-white border-0">
                    <Link
                      to={`/articles/${article.slug}`}
                      className="btn btn-outline-primary w-100"
                    >
                      Lire <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Responsive Design Enhancements */}
      <style jsx>{`
        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        
        @media (max-width: 768px) {
          .display-4 {
            font-size: 2rem;
          }
          
          .card-img-top {
            height: 180px !important;
          }
        }
        
        @media (max-width: 576px) {
          .card-img-top {
            height: 150px !important;
          }
          
          .btn {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
}

export default ArticlesPublics;