import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { articleService } from "../../services/articleService";

function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await articleService.getArticleBySlug(slug);
      setArticle(data);
    } catch (error) {
      console.error("Erreur:", error);
      alert("Article non trouvé");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center p-5">
        <div className="spinner-border"></div>
      </div>
    );
  if (!article)
    return <div className="alert alert-danger">Article non trouvé</div>;

  return (
    <div className="container py-4">
      <Link to="/articles" className="btn btn-outline-secondary mb-3">
        <i className="bi bi-arrow-left"></i> Retour aux articles
      </Link>

      <article className="article-detail">
        <div className="mb-3">
          <span className="badge bg-primary">{article.categorie}</span>
        </div>

        <h1 className="display-4 mb-3">{article.titre}</h1>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <i className="bi bi-person-fill text-primary"></i>{" "}
            {article.auteur_nom}
            <span className="text-muted mx-2">|</span>
            <i className="bi bi-calendar"></i>{" "}
            {new Date(article.date_publication).toLocaleDateString("fr-FR")}
            <span className="text-muted mx-2">|</span>
            <i className="bi bi-eye"></i> {article.vues} vues
          </div>
        </div>

        {article.image && (
          <img
            src={article.image}
            alt={article.titre}
            className="img-fluid rounded mb-4"
            style={{ maxHeight: "400px", width: "100%", objectFit: "cover" }}
          />
        )}

        <div className="alert alert-info">
          <strong>Résumé :</strong> {article.resume}
        </div>

        <div
          className="article-content"
          style={{ fontSize: "1.1rem", lineHeight: "1.8" }}
        >
          {article.contenu.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {article.tags && (
          <div className="mt-4">
            <strong>Tags :</strong>{" "}
            {article.tags.split(",").map((tag, index) => (
              <span key={index} className="badge bg-secondary me-1">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

export default ArticleDetail;
