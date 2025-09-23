// src/components/Connecter.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Connecter() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    first_name: "",
    last_name: "",
    email: "",
    telephone: "",
    adresse: "",
    role: "patient", // ✅ rôle par défaut
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        // Connexion
        const res = await axios.post("http://127.0.0.1:8000/login/", {
          username: formData.username,
          password: formData.password,
        });

        const { access, role } = res.data;
        localStorage.setItem("token", access);
        localStorage.setItem("role", role);

        // 🔹 Redirection selon le rôle
        if (role === "patient") navigate("/interface_patient");
        else if (role === "medecin") navigate("/interface_medecin");
        else if (role === "admin") navigate("/interface_admin");
        else navigate("/"); // fallback
      } else {
        // Inscription
        await axios.post("http://127.0.0.1:8000/register/", formData);
        alert("✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
        setIsLogin(true);
      }
    } catch (error) {
      console.error(error);
      alert(
        "❌ Erreur : " +
          (error.response?.data?.detail ||
            error.response?.data?.error ||
            JSON.stringify(error.response?.data) ||
            "Vérifiez vos informations.")
      );
    }
  };

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">{isLogin ? "Connexion" : "Inscription"}</h2>

      <form onSubmit={handleSubmit} className="w-50 mx-auto">
        {!isLogin && (
          <>
            <input
              type="text"
              name="first_name"
              placeholder="Nom"
              className="form-control mb-3"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="last_name"
              placeholder="Prénom"
              className="form-control mb-3"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control mb-3"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="telephone"
              placeholder="Téléphone"
              className="form-control mb-3"
              value={formData.telephone}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="adresse"
              placeholder="Adresse"
              className="form-control mb-3"
              value={formData.adresse}
              onChange={handleChange}
              required
            />

            {/* 🔹 Champ rôle visible uniquement en inscription */}
            <select
              name="role"
              className="form-control mb-3"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="patient">Patient</option>
              <option value="medecin">Médecin</option>
            </select>
          </>
        )}

        <input
          type="text"
          name="username"
          placeholder="Nom d'utilisateur"
          className="form-control mb-3"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          className="form-control mb-3"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn btn-primary w-100">
          {isLogin ? "Se connecter" : "S'inscrire"}
        </button>
      </form>

      <p className="text-center mt-3">
        {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
        <button className="btn btn-link" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "S'inscrire" : "Se connecter"}
        </button>
      </p>
    </div>
  );
}

export default Connecter;
