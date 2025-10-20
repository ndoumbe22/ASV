import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import articleService from "../../services/articleService";

function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
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
      console.error("Erreur:", err);
      setError("Article non trouvé");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container py-5 text-center">
        <div className="display-1 text-muted mb-3">
          <i className="bi bi-journal-x"></i>
        </div>
        <h2>Article non trouvé</h2>
        <p className="text-muted">L'article que vous recherchez n'existe pas ou n'est plus disponible.</p>
        <Link to="/articles" className="btn btn-primary">
          <i className="bi bi-arrow-left me-2"></i>Retour aux articles
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          {/* Back button */}
          <div className="mb-4">
            <Link to="/articles" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>Retour aux articles
            </Link>
          </div>

          {/* Article header */}
          <article className="card shadow-sm border-0 rounded-3 overflow-hidden mb-4">
            {article.image && (
              <img
                src={article.image}
                className="card-img-top"
                alt={article.titre}
                style={{ height: "400px", objectFit: "cover" }}
              />
            )}
            
            <div className="card-body">
              <div className="mb-3">
                <span className="badge bg-primary me-2">{article.categorie}</span>
                {article.is_featured && (
                  <span className="badge bg-warning text-dark">
                    <i className="bi bi-star-fill"></i> À la Une
                  </span>
                )}
              </div>
              
              <h1 className="card-title display-5 fw-bold mb-3">
                {article.titre}
              </h1>
              
              <div className="d-flex flex-wrap align-items-center text-muted mb-4">
                <div className="me-4">
                  <i className="bi bi-person me-1"></i>
                  <span>Par {article.auteur_nom}</span>
                </div>
                <div className="me-4">
                  <i className="bi bi-calendar me-1"></i>
                  <span>{formatDate(article.date_publication)}</span>
                </div>
                <div>
                  <i className="bi bi-eye me-1"></i>
                  <span>{article.vues} vues</span>
                </div>
              </div>
              
              <p className="lead text-muted mb-4">
                {article.resume}
              </p>
              
              <hr />
              
              {/* Article content */}
              <div className="article-content">
                {article.contenu.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            
            <div className="card-footer bg-white border-0">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  {article.tags && (
                    <div className="mt-3">
                      <strong className="me-2">Tags:</strong>
                      {article.tags.split(',').map((tag, index) => (
                        <span key={index} className="badge bg-light text-dark me-1">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="d-flex">
                  <button className="btn btn-outline-primary me-2">
                    <i className="bi bi-share me-1"></i> Partager
                  </button>
                  <button className="btn btn-outline-secondary">
                    <i className="bi bi-bookmark me-1"></i> Sauvegarder
                  </button>
                </div>
              </div>
            </div>
          </article>

          {/* Author info */}
          <div className="card shadow-sm border-0 rounded-3 mb-4">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3" 
                     style={{ width: '60px', height: '60px' }}>
                  <i className="bi bi-person-fill text-primary" style={{ fontSize: '2rem' }}></i>
                </div>
                <div>
                  <h5 className="mb-1">À propos de l'auteur</h5>
                  <p className="mb-0 text-muted">Dr. {article.auteur_nom}</p>
                  <p className="mb-0 text-muted small">
                    Médecin expert en {article.categorie}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related articles */}
          <div className="mt-5">
            <h4 className="mb-4 pb-2 border-bottom">
              <i className="bi bi-journal-text me-2"></i>Articles similaires
            </h4>
            <div className="text-center py-5">
              <p className="text-muted">Fonctionnalité à venir: Articles similaires basés sur la catégorie et les tags.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles */}
      <style jsx>{`
        .article-content p:first-child::first-letter {
          font-size: 3rem;
          font-weight: bold;
          float: left;
          line-height: 1;
          margin-right: 0.5rem;
        }
        
        .card-img-top {
          transition: transform 0.3s ease;
        }
        
        .card:hover .card-img-top {
          transform: scale(1.02);
        }
        
        @media (max-width: 768px) {
          .display-5 {
            font-size: 2rem;
          }
          
          .card-img-top {
            height: 250px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default ArticleDetail;