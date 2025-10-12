import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { articleService } from "../../services/articleService";

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
    statut: "brouillon",
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

  useEffect(() => {
    if (isEdit) {
      loadArticle();
    }
  }, [id]);

  const loadArticle = async () => {
    try {
      const data = await articleService.getMyArticleDetail(id);
      setFormData({
        titre: data.titre,
        resume: data.resume,
        contenu: data.contenu,
        categorie: data.categorie,
        tags: data.tags,
        statut: data.statut,
      });
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors du chargement de l'article");
      navigate("/medecin/articles");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titre || !formData.resume || !formData.contenu) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {
        await articleService.updateArticle(id, formData);
        alert("Article mis à jour");
      } else {
        await articleService.createArticle(formData);
        alert("Article créé");
      }

      navigate("/medecin/articles");
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.error || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <h2 className="mb-4">
            <i className="bi bi-file-text"></i>{" "}
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
              />
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
              />
              <small className="text-muted">
                {formData.resume.length}/500 caractères
              </small>
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
              <small className="text-muted">
                Utilisez des paragraphes pour une meilleure lisibilité
              </small>
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
              <small className="text-muted">
                Séparez les tags par des virgules
              </small>
            </div>

            {/* Boutons */}
            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/medecin/articles")}
              >
                <i className="bi bi-x-circle"></i> Annuler
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="bi bi-save me-2"></i>
                )}
                {isEdit ? "Mettre à jour" : "Enregistrer comme brouillon"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ArticleForm;
