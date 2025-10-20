import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  useEffect(() => {
    if (isEdit) {
      loadArticle();
    }
  }, [id]);

  const loadArticle = async () => {
    try {
      const data = await articleService.getDoctorArticle(id);
      setFormData({
        titre: data.titre,
        resume: data.resume,
        contenu: data.contenu,
        categorie: data.categorie,
        tags: data.tags || "",
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

  const handleSaveDraft = async () => {
    if (!formData.titre && !formData.resume && !formData.contenu) {
      alert("Veuillez remplir au moins un champ avant d'enregistrer");
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
        alert("Brouillon mis à jour");
      } else {
        await articleService.createArticle(draftData);
        alert("Brouillon enregistré");
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
                <i className="bi bi-x-circle"></i> Annuler
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
                  type="submit"
                  className="btn btn-primary mb-2"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-send me-2"></i>
                  )}
                  {isEdit ? "Mettre à jour" : "Soumettre pour validation"}
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