import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import articleService from "../../services/articleService";

function ArticleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: "",
    resume: "",
    contenu: "",
    categorie: "autre",
    tags: "",
  });

  const categories = [
    { value: "prevention", label: "Prévention" },
    { value: "nutrition", label: "Nutrition" },
    { value: "maladies", label: "Maladies" },
    { value: "bien_etre", label: "Bien-être" },
    { value: "grossesse", label: "Grossesse" },
    { value: "pediatrie", label: "Pédiatrie" },
    { value: "geriatrie", label: "Gériatrie" },
    { value: "autre", label: "Autre" },
  ];

  const loadArticle = useCallback(async () => {
    try {
      setLoading(true);
      const data = await articleService.getMyArticleDetail(id);
      setFormData({
        titre: data.titre || "",
        resume: data.resume || "",
        contenu: data.contenu || "",
        categorie: data.categorie || "autre",
        tags: data.tags || "",
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement de l'article");
      navigate("/medecin/articles");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isEdit) {
      loadArticle();
    }
  }, [isEdit, loadArticle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    if (!formData.titre.trim()) {
      toast.error("Veuillez remplir le titre");
      return false;
    }
    if (!formData.resume.trim()) {
      toast.error("Veuillez remplir le résumé");
      return false;
    }
    if (!formData.contenu.trim()) {
      toast.error("Veuillez remplir le contenu");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {
        await articleService.updateArticle(id, formData);
        toast.success("Article mis à jour avec succès");
      } else {
        await articleService.createArticle(formData);
        toast.success("Article créé avec succès");
      }

      navigate("/medecin/articles");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error.response?.data?.error || error.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.titre.trim() && !formData.resume.trim() && !formData.contenu.trim()) {
      toast.error("Veuillez remplir au moins un champ avant d'enregistrer");
      return;
    }

    try {
      setLoading(true);

      const draftData = {
        ...formData,
        statut: "brouillon"
      };

      if (isEdit) {
        await articleService.updateArticle(id, draftData);
        toast.success("Brouillon mis à jour avec succès");
      } else {
        await articleService.createArticle(draftData);
        toast.success("Brouillon enregistré avec succès");
      }

      navigate("/medecin/articles");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error.response?.data?.error || error.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {
        // First update the article
        await articleService.updateArticle(id, formData);
        // Then submit for review
        await articleService.soumettreValidation(id);
        toast.success("Article soumis pour validation avec succès");
      } else {
        // First create the article
        const article = await articleService.createArticle(formData);
        // Then submit for review
        await articleService.soumettreValidation(article.id);
        toast.success("Article soumis pour validation avec succès");
      }

      navigate("/medecin/articles");
    } catch (error) {
      console.error("Erreur:", error);
      toast.error(error.response?.data?.error || error.response?.data?.message || "Erreur lors de la soumission");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEdit) {
    return (
      <div className="container py-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h2 className="mb-4">
            {isEdit ? "Modifier l'article" : "Nouvel Article"}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Titre */}
            <div className="mb-3">
              <label className="form-label">Titre *</label>
              <input
                type="text"
                className="form-control"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                required
                maxLength="200"
                placeholder="Entrez le titre de votre article"
              />
              <div className="form-text">
                {formData.titre.length}/200 caractères
              </div>
            </div>

            {/* Résumé */}
            <div className="mb-3">
              <label className="form-label">Résumé *</label>
              <textarea
                className="form-control"
                name="resume"
                value={formData.resume}
                onChange={handleChange}
                rows="3"
                required
                maxLength="500"
                placeholder="Résumé concis de votre article"
              />
              <div className="form-text">
                {formData.resume.length}/500 caractères
              </div>
            </div>

            {/* Contenu */}
            <div className="mb-3">
              <label className="form-label">Contenu de l'article *</label>
              <textarea
                className="form-control"
                name="contenu"
                value={formData.contenu}
                onChange={handleChange}
                rows="15"
                required
                placeholder="Rédigez votre article ici..."
              />
              <div className="form-text">
                Utilisez des paragraphes pour une meilleure lisibilité
              </div>
            </div>

            {/* Catégorie */}
            <div className="mb-3">
              <label className="form-label">Catégorie</label>
              <select
                className="form-select"
                name="categorie"
                value={formData.categorie}
                onChange={handleChange}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="mb-3">
              <label className="form-label">Tags</label>
              <input
                type="text"
                className="form-control"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Ex: diabète, nutrition, prévention"
              />
              <div className="form-text">
                Séparez les tags par des virgules
              </div>
            </div>

            {/* Boutons */}
            <div className="d-flex justify-content-between flex-wrap">
              <button
                type="button"
                className="btn btn-secondary mb-2"
                onClick={() => navigate("/medecin/articles")}
              >
                Annuler
              </button>

              <div className="d-flex flex-wrap">
                <button
                  type="button"
                  className="btn btn-outline-primary mb-2 me-2"
                  onClick={handleSaveDraft}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-save me-2"></i>
                  )}
                  Enregistrer comme brouillon
                </button>

                <button
                  type="button"
                  className="btn btn-warning mb-2 me-2"
                  onClick={handleSubmitForReview}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-send me-2"></i>
                  )}
                  Soumettre pour validation
                </button>

                <button
                  type="submit"
                  className="btn btn-primary mb-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-floppy me-2"></i>
                  )}
                  {isEdit ? "Mettre à jour" : "Enregistrer"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ArticleForm;