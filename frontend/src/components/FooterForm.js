// src/components/FooterForm.js
import React, { useState } from "react";

function FooterForm() {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    sujet: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/api/contact_footer/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("✅ Message envoyé !");
        setFormData({ nom: "", email: "", sujet: "", message: "" });
      } else {
        setStatus("❌ Erreur : " + data.message);
      }
    } catch (err) {
      setStatus("⚠️ Problème de connexion au serveur");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-2">
        <input
          type="text"
          name="nom"
          className="form-control"
          placeholder="Nom & Prénom"
          value={formData.nom}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-2">
        <input
          type="email"
          name="email"
          className="form-control"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-2">
        <input
          type="text"
          name="sujet"
          className="form-control"
          placeholder="Sujet"
          value={formData.sujet}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-2">
        <textarea
          name="message"
          className="form-control"
          rows="3"
          placeholder="Message"
          value={formData.message}
          onChange={handleChange}
          required
        ></textarea>
      </div>
      <button type="submit" className="btn btn-light w-100">
        Envoyer
      </button>
      {status && <p className="mt-2">{status}</p>}
    </form>
  );
}

export default FooterForm;
