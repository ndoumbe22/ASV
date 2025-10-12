import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaClock, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function Disponibilites() {
  const [disponibilites, setDisponibilites] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentDisponibilite, setCurrentDisponibilite] = useState(null);
  const [newDisponibilite, setNewDisponibilite] = useState({
    jour: "",
    heureDebut: "",
    heureFin: "",
    recurrence: "aucune"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les disponibilités depuis l'API
  useEffect(() => {
    const fetchDisponibilites = async () => {
      try {
        setLoading(true);
        // Dans une vraie application, ces données viendraient de l'API
        // Pour l'instant, utilisons des données statiques
        const mockDisponibilites = [
          {
            id: 1,
            jour: "Lundi",
            date: "2023-10-16",
            heureDebut: "09:00",
            heureFin: "17:00",
            recurrence: "hebdomadaire"
          },
          {
            id: 2,
            jour: "Mardi",
            date: "2023-10-17",
            heureDebut: "09:00",
            heureFin: "17:00",
            recurrence: "hebdomadaire"
          },
          {
            id: 3,
            jour: "Mercredi",
            date: "2023-10-18",
            heureDebut: "09:00",
            heureFin: "17:00",
            recurrence: "hebdomadaire"
          },
          {
            id: 4,
            jour: "Jeudi",
            date: "2023-10-19",
            heureDebut: "09:00",
            heureFin: "17:00",
            recurrence: "hebdomadaire"
          },
          {
            id: 5,
            jour: "Vendredi",
            date: "2023-10-20",
            heureDebut: "09:00",
            heureFin: "17:00",
            recurrence: "hebdomadaire"
          },
          {
            id: 6,
            jour: "Samedi",
            date: "2023-10-21",
            heureDebut: "09:00",
            heureFin: "12:00",
            recurrence: "hebdomadaire"
          }
        ];
        
        setDisponibilites(mockDisponibilites);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des disponibilités");
        setLoading(false);
        console.error("Erreur lors du chargement des disponibilités :", err);
      }
    };

    fetchDisponibilites();
  }, []);

  const handleAddDisponibilite = async (e) => {
    e.preventDefault();
    try {
      // Dans une vraie application, cela enverrait une requête à l'API
      // const response = await axios.post('/api/medecin/disponibilites/', newDisponibilite, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      // });
      
      // Simulation d'une nouvelle disponibilité
      const newDisp = {
        id: disponibilites.length + 1,
        ...newDisponibilite,
        date: selectedDate.toISOString().split('T')[0]
      };
      
      setDisponibilites(prev => [...prev, newDisp]);
      setNewDisponibilite({
        jour: "",
        heureDebut: "",
        heureFin: "",
        recurrence: "aucune"
      });
      setShowAddModal(false);
    } catch (err) {
      setError("Erreur lors de l'ajout de la disponibilité");
      console.error("Erreur lors de l'ajout de la disponibilité :", err);
    }
  };

  const handleUpdateDisponibilite = async (e) => {
    e.preventDefault();
    try {
      // Dans une vraie application, cela enverrait une requête à l'API
      // await axios.put(`/api/medecin/disponibilites/${currentDisponibilite.id}/`, currentDisponibilite, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      // });
      
      setDisponibilites(prev => 
        prev.map(disp => 
          disp.id === currentDisponibilite.id ? currentDisponibilite : disp
        )
      );
      setShowEditModal(false);
      setCurrentDisponibilite(null);
    } catch (err) {
      setError("Erreur lors de la mise à jour de la disponibilité");
      console.error("Erreur lors de la mise à jour de la disponibilité :", err);
    }
  };

  const handleDeleteDisponibilite = async (id) => {
    try {
      // Dans une vraie application, cela enverrait une requête à l'API
      // await axios.delete(`/api/medecin/disponibilites/${id}/`, {
      //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      // });
      
      setDisponibilites(prev => prev.filter(disp => disp.id !== id));
    } catch (err) {
      setError("Erreur lors de la suppression de la disponibilité");
      console.error("Erreur lors de la suppression de la disponibilité :", err);
    }
  };

  const openEditModal = (disponibilite) => {
    setCurrentDisponibilite(disponibilite);
    setShowEditModal(true);
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>Chargement...</div>;
  }

  if (error) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>Erreur: {error}</div>;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar - Calendrier */}
        <div className="col-md-4">
          <div className="card shadow-sm p-3 mb-4">
            <h5>Calendrier</h5>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="border-0"
            />
          </div>
          
          <div className="card shadow-sm p-3">
            <h5>Actions</h5>
            <button 
              className="btn btn-success w-100 mb-2"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus className="me-2" /> Ajouter une disponibilité
            </button>
            <button className="btn btn-outline-secondary w-100">
              <FaClock className="me-2" /> Voir les congés
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-8">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Gestion des Disponibilités</h2>
            <div>
              <button 
                className="btn btn-success"
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus className="me-2" /> Ajouter
              </button>
            </div>
          </div>

          {disponibilites.length === 0 ? (
            <div className="card shadow-sm p-5 text-center">
              <h4>Aucune disponibilité définie</h4>
              <p>Vous n'avez pas encore défini de disponibilités.</p>
              <button 
                className="btn btn-success"
                onClick={() => setShowAddModal(true)}
              >
                <FaPlus className="me-2" /> Ajouter une disponibilité
              </button>
            </div>
          ) : (
            <div className="row">
              {disponibilites.map((disponibilite) => (
                <div key={disponibilite.id} className="col-md-6 mb-3">
                  <div className="card shadow-sm p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{disponibilite.jour}</h6>
                        <p className="mb-1 text-muted">{disponibilite.date}</p>
                        <p className="mb-1">
                          <FaClock className="me-2" /> 
                          {disponibilite.heureDebut} - {disponibilite.heureFin}
                        </p>
                        <p className="mb-0">
                          <span className="badge bg-info">
                            {disponibilite.recurrence === "hebdomadaire" ? "Hebdomadaire" : "Aucune"}
                          </span>
                        </p>
                      </div>
                      <div>
                        <button 
                          className="btn btn-sm btn-outline-success me-2"
                          onClick={() => openEditModal(disponibilite)}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteDisponibilite(disponibilite.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal d'ajout */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Ajouter une disponibilité</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddDisponibilite}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Jour</label>
                    <select
                      className="form-select"
                      value={newDisponibilite.jour}
                      onChange={(e) => setNewDisponibilite(prev => ({ ...prev, jour: e.target.value }))}
                      required
                    >
                      <option value="">Sélectionner un jour</option>
                      <option value="Lundi">Lundi</option>
                      <option value="Mardi">Mardi</option>
                      <option value="Mercredi">Mercredi</option>
                      <option value="Jeudi">Jeudi</option>
                      <option value="Vendredi">Vendredi</option>
                      <option value="Samedi">Samedi</option>
                      <option value="Dimanche">Dimanche</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Heure de début</label>
                    <input
                      type="time"
                      className="form-control"
                      value={newDisponibilite.heureDebut}
                      onChange={(e) => setNewDisponibilite(prev => ({ ...prev, heureDebut: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Heure de fin</label>
                    <input
                      type="time"
                      className="form-control"
                      value={newDisponibilite.heureFin}
                      onChange={(e) => setNewDisponibilite(prev => ({ ...prev, heureFin: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Récurrence</label>
                    <select
                      className="form-select"
                      value={newDisponibilite.recurrence}
                      onChange={(e) => setNewDisponibilite(prev => ({ ...prev, recurrence: e.target.value }))}
                    >
                      <option value="aucune">Aucune</option>
                      <option value="hebdomadaire">Hebdomadaire</option>
                      <option value="mensuelle">Mensuelle</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowAddModal(false)}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-success">
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal d'édition */}
      {showEditModal && currentDisponibilite && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modifier une disponibilité</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowEditModal(false);
                    setCurrentDisponibilite(null);
                  }}
                ></button>
              </div>
              <form onSubmit={handleUpdateDisponibilite}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Jour</label>
                    <select
                      className="form-select"
                      value={currentDisponibilite.jour}
                      onChange={(e) => setCurrentDisponibilite(prev => ({ ...prev, jour: e.target.value }))}
                      required
                    >
                      <option value="">Sélectionner un jour</option>
                      <option value="Lundi">Lundi</option>
                      <option value="Mardi">Mardi</option>
                      <option value="Mercredi">Mercredi</option>
                      <option value="Jeudi">Jeudi</option>
                      <option value="Vendredi">Vendredi</option>
                      <option value="Samedi">Samedi</option>
                      <option value="Dimanche">Dimanche</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Heure de début</label>
                    <input
                      type="time"
                      className="form-control"
                      value={currentDisponibilite.heureDebut}
                      onChange={(e) => setCurrentDisponibilite(prev => ({ ...prev, heureDebut: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Heure de fin</label>
                    <input
                      type="time"
                      className="form-control"
                      value={currentDisponibilite.heureFin}
                      onChange={(e) => setCurrentDisponibilite(prev => ({ ...prev, heureFin: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Récurrence</label>
                    <select
                      className="form-select"
                      value={currentDisponibilite.recurrence}
                      onChange={(e) => setCurrentDisponibilite(prev => ({ ...prev, recurrence: e.target.value }))}
                    >
                      <option value="aucune">Aucune</option>
                      <option value="hebdomadaire">Hebdomadaire</option>
                      <option value="mensuelle">Mensuelle</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowEditModal(false);
                      setCurrentDisponibilite(null);
                    }}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-success">
                    Mettre à jour
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Disponibilites;