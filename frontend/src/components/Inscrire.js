import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import "./Auth.css";

function Inscrire() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    email: "",
    telephone: "",
    adresse: "",
    role: "patient",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateStep1 = () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      setError("Veuillez remplir tous les champs obligatoires");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Email invalide");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.username || !formData.password || !formData.confirmPassword) {
      setError("Veuillez remplir tous les champs");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError("");
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setError("");
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setError("");
    setLoading(true);

    try {
      const { confirmPassword, ...dataToSend } = formData;

      const res = await authAPI.register(dataToSend);
      console.log("Registration response:", res.data);

      alert(
        "✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter."
      );
      navigate("/connecter");
    } catch (error) {
      console.error("Registration error:", error);

      let errorMessage = "Une erreur est survenue. Veuillez réessayer.";

      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === "object") {
          const firstError = Object.values(errorData)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-large">
        <div className="auth-header">
          <div className="auth-icon">
            <i className="bi bi-person-plus"></i>
          </div>
          <h2 className="auth-title">Inscription</h2>
          <p className="auth-subtitle">Créez votre compte AssitoSanté</p>
        </div>

        {/* Progress Indicator */}
        <div className="progress-indicator">
          <div className={`progress-step ${currentStep >= 1 ? "active" : ""}`}>
            <div className="step-number">1</div>
            <div className="step-label">Informations personnelles</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${currentStep >= 2 ? "active" : ""}`}>
            <div className="step-number">2</div>
            <div className="step-label">Compte & Sécurité</div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger-custom" role="alert">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="form-step">
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label className="form-label-custom">
                      <i className="bi bi-person me-2"></i>
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      className="form-control-custom"
                      placeholder="Votre nom"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group-custom">
                    <label className="form-label-custom">
                      <i className="bi bi-person me-2"></i>
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      className="form-control-custom"
                      placeholder="Votre prénom"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">
                  <i className="bi bi-envelope me-2"></i>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-control-custom"
                  placeholder="votre.email@exemple.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">
                  <i className="bi bi-telephone me-2"></i>
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  className="form-control-custom"
                  placeholder="+221 XX XXX XX XX"
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">
                  <i className="bi bi-geo-alt me-2"></i>
                  Adresse
                </label>
                <input
                  type="text"
                  name="adresse"
                  className="form-control-custom"
                  placeholder="Votre adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">
                  <i className="bi bi-briefcase me-2"></i>
                  Type de compte *
                </label>
                <select
                  name="role"
                  className="form-control-custom"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="patient">Patient</option>
                  <option value="medecin">Médecin</option>
                </select>
              </div>

              <button
                type="button"
                className="btn-submit-custom"
                onClick={handleNext}
              >
                Suivant
                <i className="bi bi-arrow-right ms-2"></i>
              </button>
            </div>
          )}

          {/* Step 2: Account & Security */}
          {currentStep === 2 && (
            <div className="form-step">
              <div className="form-group-custom">
                <label className="form-label-custom">
                  <i className="bi bi-person-badge me-2"></i>
                  Nom d'utilisateur *
                </label>
                <input
                  type="text"
                  name="username"
                  className="form-control-custom"
                  placeholder="Choisissez un nom d'utilisateur unique"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">
                  <i className="bi bi-lock me-2"></i>
                  Mot de passe *
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control-custom"
                    placeholder="Minimum 8 caractères"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`bi bi-eye${showPassword ? "-slash" : ""}`}
                    ></i>
                  </button>
                </div>
                {formData.password && (
                  <div className="password-strength">
                    <div
                      className={`strength-bar ${
                        formData.password.length >= 8 ? "strong" : "weak"
                      }`}
                    ></div>
                    <small>
                      Force:{" "}
                      {formData.password.length >= 8 ? "Forte" : "Faible"}
                    </small>
                  </div>
                )}
              </div>

              <div className="form-group-custom">
                <label className="form-label-custom">
                  <i className="bi bi-lock-fill me-2"></i>
                  Confirmer le mot de passe *
                </label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    className="form-control-custom"
                    placeholder="Confirmez votre mot de passe"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i
                      className={`bi bi-eye${
                        showConfirmPassword ? "-slash" : ""
                      }`}
                    ></i>
                  </button>
                </div>
                {formData.confirmPassword && (
                  <small
                    className={
                      formData.password === formData.confirmPassword
                        ? "text-success"
                        : "text-danger"
                    }
                  >
                    {formData.password === formData.confirmPassword
                      ? "✓ Les mots de passe correspondent"
                      : "✗ Les mots de passe ne correspondent pas"}
                  </small>
                )}
              </div>
              <div className="form-check-custom">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="acceptTerms"
                  required
                />
                <label className="form-check-label" htmlFor="acceptTerms">
                  J'accepte les{" "}
                  <a href="/terms" target="_blank">
                    conditions d'utilisation
                  </a>{" "}
                  et la{" "}
                  <a href="/privacy" target="_blank">
                    politique de confidentialité
                  </a>
                </label>
              </div>

              <div className="button-group">
                <button
                  type="button"
                  className="btn-secondary-custom"
                  onClick={handleBack}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Retour
                </button>
                <button
                  type="submit"
                  className="btn-submit-custom"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Création en cours...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Créer mon compte
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>

        <div className="auth-footer">
          <p>
            Vous avez déjà un compte ?{" "}
            <Link to="/connecter" className="auth-link">
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-background">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>
    </div>
  );
}

export default Inscrire;
