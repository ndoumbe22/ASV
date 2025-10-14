import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaCalendar, FaUser, FaEye } from "react-icons/fa";
import { articleService } from "../../services/articleService";

function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await articleService.getPublicArticle(slug);
      setArticle(data);
    } catch (err) {
      setError(
        "Erreur lors du chargement de l'article: " +
          (err.response?.data?.error || err.message)
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = {
    prevention: "Prévention",
    nutrition: "Nutrition",
    maladies: "Maladies",
    bien_etre: "Bien-être",
    grossesse: "Grossesse",
    pediatrie: "Pédiatrie",
    geriatrie: "Gériatrie",
    autre: "Autre",
  };

  const getCategoryLabel = (category) => {
    return categories[category] || category;
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

  if (error) {
    return (
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
            <Link to="/articles" className="btn btn-secondary">
              <FaArrowLeft className="me-2" />
              Retour aux articles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <Link to="/articles" className="btn btn-secondary mb-4">
            <FaArrowLeft className="me-2" />
            Retour aux articles
          </Link>

          {article && (
            <article className="card">
              <div className="card-body">
                <div className="mb-3">
                  <span className="badge bg-secondary">
                    {getCategoryLabel(article.categorie)}
                  </span>
                </div>

                <h1 className="card-title mb-4">{article.titre}</h1>

                <div className="d-flex flex-wrap align-items-center mb-4 text-muted">
                  <div className="me-4">
                    <FaUser className="me-2" />
                    {article.auteur_nom}
                  </div>
                  <div className="me-4">
                    <FaCalendar className="me-2" />
                    {new Date(article.date_publication).toLocaleDateString(
                      "fr-FR"
                    )}
                  </div>
                  <div>
                    <FaEye className="me-2" />
                    {article.vues} vues
                  </div>
                </div>

                {article.image && (
                  <div className="text-center mb-4">
                    <img
                      src={article.image}
                      className="img-fluid rounded"
                      alt={article.titre}
                      style={{ maxHeight: "400px" }}
                    />
                  </div>
                )}

                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: article.contenu }}
                ></div>
              </div>

              {article.tags && (
                <div className="card-footer">
                  <strong>Tags:</strong> {article.tags}
                </div>
              )}
            </article>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArticleDetail;
