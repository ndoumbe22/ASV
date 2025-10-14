import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { doctorAPI, appointmentAPI, specialtyAPI } from "../../services/api";
import { FaUserMd, FaCalendarAlt, FaClock, FaStethoscope } from "react-icons/fa";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function PriseDeRendezVous() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Spécialité, 2: Médecin, 3: Date, 4: Confirmation
  const [specialites, setSpecialites] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [selectedSpecialite, setSelectedSpecialite] = useState("");
  const [selectedMedecin, setSelectedMedecin] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [motif, setMotif] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/connecter");
    }
  }, [isAuthenticated, navigate]);

  // Charger les spécialités depuis l'API
  useEffect(() => {
    const fetchSpecialites = async () => {
      try {
        const response = await specialtyAPI.getSpecialties();
        // Extract specialty names from the response
        const specialtyNames = response.data.map(spec => spec.nom);
        setSpecialites(specialtyNames);
      } catch (err) {
        setError("Erreur lors du chargement des spécialités");
        console.error("Erreur lors du chargement des spécialités :", err);
      }
    };

    if (isAuthenticated) {
      fetchSpecialites();
    }
  }, [isAuthenticated]);

  // Charger les médecins quand une spécialité est sélectionnée
  useEffect(() => {
    if (selectedSpecialite) {
      const fetchMedecins = async () => {
        try {
          setLoading(true);
          const response = await doctorAPI.getDoctors();
          // Filter doctors by specialty
          const filteredDoctors = response.data.filter(doctor => 
            doctor.specialite && doctor.specialite === selectedSpecialite
          );
          setMedecins(filteredDoctors);
          setLoading(false);
        } catch (err) {
          setError("Erreur lors du chargement des médecins");
          setLoading(false);
          console.error("Erreur lors du chargement des médecins :", err);
        }
      };

      fetchMedecins();
    }
  }, [selectedSpecialite]);

  // Charger les disponibilités quand un médecin est sélectionné
  useEffect(() => {
    if (selectedMedecin) {
      // Pour l'instant, utilisons des créneaux statiques
      // Dans une vraie application, cela viendrait de l'API
      const mockSlots = [
        "09:00", "09:30", "10:00", "10:30", 
        "11:00", "11:30", "14:00", "14:30", 
        "15:00", "15:30", "16:00", "16:30"
      ];
      setAvailableSlots(mockSlots);
    }
  }, [selectedMedecin]);

  const handleSpecialiteSelect = (specialite) => {
    setSelectedSpecialite(specialite);
    setStep(2);
  };

  const handleMedecinSelect = (medecin) => {
    setSelectedMedecin(medecin);
    setStep(3);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      // Create appointment
      const appointmentData = {
        patient: user.id, // Using actual patient ID from auth context
        medecin: selectedMedecin.id,
        date: selectedDate.toISOString().split('T')[0],
        heure: selectedSlot,
        description: motif
      };
      
      await appointmentAPI.createAppointment(appointmentData);
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError("Erreur lors de la prise de rendez-vous");
      setLoading(false);
      console.error("Erreur lors de la prise de rendez-vous :", err);
    }
  };

  const resetForm = () => {
    setStep(1);
    setSelectedSpecialite("");
    setSelectedMedecin(null);
    setSelectedDate(new Date());
    setSelectedSlot("");
    setMotif("");
    setSuccess(false);
  };

  // Show login message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-sm p-5 text-center">
              <h2>🔐 Authentification requise</h2>
              <p>Vous devez être connecté pour prendre un rendez-vous.</p>
              <button className="btn btn-success" onClick={() => navigate("/connecter")}>
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow-sm p-5 text-center">
              <h2 className="text-success">✅ Rendez-vous confirmé !</h2>
              <p>Votre rendez-vous avec {selectedMedecin?.user.first_name} {selectedMedecin?.user.last_name} le {selectedDate.toLocaleDateString('fr-FR')} à {selectedSlot} a été confirmé.</p>
              <p>Nous vous avons envoyé un email de confirmation.</p>
              <button className="btn btn-success" onClick={resetForm}>Prendre un autre rendez-vous</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Stepper */}
        <div className="col-12 mb-4">
          <div className="d-flex justify-content-between">
            <div className="text-center" style={{ flex: 1 }}>
              <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center ${step >= 1 ? 'bg-success text-white' : 'bg-light'}`} style={{ width: '40px', height: '40px' }}>
                1
              </div>
              <p className="mt-2">Spécialité</p>
            </div>
            <div className="text-center" style={{ flex: 1 }}>
              <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center ${step >= 2 ? 'bg-success text-white' : 'bg-light'}`} style={{ width: '40px', height: '40px' }}>
                2
              </div>
              <p className="mt-2">Médecin</p>
            </div>
            <div className="text-center" style={{ flex: 1 }}>
              <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center ${step >= 3 ? 'bg-success text-white' : 'bg-light'}`} style={{ width: '40px', height: '40px' }}>
                3
              </div>
              <p className="mt-2">Date & Heure</p>
            </div>
            <div className="text-center" style={{ flex: 1 }}>
              <div className={`rounded-circle mx-auto d-flex align-items-center justify-content-center ${step >= 4 ? 'bg-success text-white' : 'bg-light'}`} style={{ width: '40px', height: '40px' }}>
                4
              </div>
              <p className="mt-2">Confirmation</p>
            </div>
          </div>
        </div>

        {/* Contenu selon l'étape */}
        <div className="col-12">
          {step === 1 && (
            <div className="card shadow-sm p-4">
              <h3 className="mb-4">Sélectionnez une spécialité</h3>
              <div className="row">
                {specialites.map((specialite, index) => (
                  <div key={index} className="col-md-3 mb-3">
                    <div 
                      className="card shadow-sm p-3 text-center" 
                      style={{ cursor: "pointer", transition: "all 0.3s" }}
                      onClick={() => handleSpecialiteSelect(specialite)}
                    >
                      <div className="d-flex justify-content-center mb-2">
                        <div style={{ width: "50px", height: "50px", borderRadius: "50%", backgroundColor: "#e9f5e9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FaStethoscope color="#2E7D32" />
                        </div>
                      </div>
                      <h6>{specialite}</h6>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card shadow-sm p-4">
              <div className="d-flex align-items-center mb-4">
                <button className="btn btn-outline-secondary me-3" onClick={() => setStep(1)}>
                  ← Retour
                </button>
                <h3>Médecins en {selectedSpecialite}</h3>
              </div>
              
              {loading ? (
                <div className="d-flex justify-content-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              ) : (
                <div className="row">
                  {medecins.length > 0 ? (
                    medecins.map((medecin) => (
                      <div key={medecin.id} className="col-md-6 col-lg-3 mb-4">
                        <div 
                          className="card shadow-sm p-3 text-center" 
                          style={{ cursor: "pointer", transition: "all 0.3s" }}
                          onClick={() => handleMedecinSelect(medecin)}
                        >
                          <div className="d-flex justify-content-center mb-2">
                            {medecin.photo ? (
                              <img src={medecin.photo} alt={`${medecin.user.first_name} ${medecin.user.last_name}`} style={{ width: "80px", height: "80px", borderRadius: "50%" }} />
                            ) : (
                              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#e9f5e9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <FaUserMd size={40} color="#2E7D32" />
                              </div>
                            )}
                          </div>
                          <h6>{medecin.user.first_name} {medecin.user.last_name}</h6>
                          <p className="text-muted">{medecin.specialite}</p>
                          <div className="d-flex justify-content-center align-items-center">
                            <span className="badge bg-success me-2">{medecin.note || "5.0"}</span>
                            <div className="text-warning">
                              {'★'.repeat(Math.floor(medecin.note || 5))}
                              {'☆'.repeat(5 - Math.floor(medecin.note || 5))}
                            </div>
                          </div>
                          <button className="btn btn-success btn-sm mt-2">Choisir</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <div className="alert alert-info">
                        Aucun médecin disponible pour cette spécialité pour le moment.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="card shadow-sm p-4">
              <div className="d-flex align-items-center mb-4">
                <button className="btn btn-outline-secondary me-3" onClick={() => setStep(2)}>
                  ← Retour
                </button>
                <h3>Disponibilités de {selectedMedecin?.user.first_name} {selectedMedecin?.user.last_name}</h3>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <h5 className="mb-3">Sélectionnez une date</h5>
                  <Calendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    className="border-0"
                  />
                </div>
                
                <div className="col-md-6">
                  <h5 className="mb-3">Sélectionnez un créneau</h5>
                  <div className="row">
                    {availableSlots.map((slot, index) => (
                      <div key={index} className="col-4 mb-2">
                        <button
                          className={`btn w-100 ${selectedSlot === slot ? 'btn-success' : 'btn-outline-secondary'}`}
                          onClick={() => handleSlotSelect(slot)}
                        >
                          {slot}
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <h5>Motif de consultation</h5>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Décrivez brièvement le motif de votre consultation..."
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <button
                    className="btn btn-success w-100 mt-3"
                    onClick={() => setStep(4)}
                    disabled={!selectedSlot || !motif}
                  >
                    Continuer
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="card shadow-sm p-4">
              <div className="d-flex align-items-center mb-4">
                <button className="btn btn-outline-secondary me-3" onClick={() => setStep(3)}>
                  ← Retour
                </button>
                <h3>Confirmer votre rendez-vous</h3>
              </div>
              
              <div className="row">
                <div className="col-md-8">
                  <div className="card p-4">
                    <h4>Récapitulatif</h4>
                    <div className="row mb-3">
                      <div className="col-4"><strong>Médecin:</strong></div>
                      <div className="col-8">{selectedMedecin?.user.first_name} {selectedMedecin?.user.last_name}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4"><strong>Spécialité:</strong></div>
                      <div className="col-8">{selectedSpecialite}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4"><strong>Date:</strong></div>
                      <div className="col-8">{selectedDate.toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4"><strong>Heure:</strong></div>
                      <div className="col-8">{selectedSlot}</div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-4"><strong>Motif:</strong></div>
                      <div className="col-8">{motif}</div>
                    </div>
                  </div>
                </div>
                
                <div className="col-md-4">
                  <div className="card p-3 mb-3">
                    <h5>Informations importantes</h5>
                    <ul>
                      <li>Arrivez 15 minutes avant votre rendez-vous</li>
                      <li>Apportez votre carte d'identité</li>
                      <li>Annulation possible jusqu'à 24h avant</li>
                    </ul>
                  </div>
                  
                  <button
                    className="btn btn-success w-100"
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Confirmation...
                      </>
                    ) : (
                      "Confirmer le rendez-vous"
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PriseDeRendezVous;