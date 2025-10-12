import React, { useState } from "react";
import { authAPI } from "../services/api";

function TestLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");

  const handleTestLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await authAPI.login({ username, password });
      setResult(`Success: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setResult(`Error: ${error.message}`);
      console.error("Login error:", error);
    }
  };

  return (
    <div className="container my-5">
      <h2>Test de Connexion</h2>
      <form onSubmit={handleTestLogin}>
        <div className="mb-3">
          <label className="form-label">Nom d'utilisateur</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Mot de passe</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Tester la connexion
        </button>
      </form>
      {result && (
        <div className="mt-3 p-3 bg-light border">
          <strong>Résultat:</strong> {result}
        </div>
      )}
    </div>
  );
}

export default TestLogin;
