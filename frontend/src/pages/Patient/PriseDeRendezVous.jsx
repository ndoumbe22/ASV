import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { doctorAPI, appointmentAPI, specialtyAPI, userAPI } from "../../services/api";
import { FaUserMd, FaCalendarAlt, FaClock, FaStethoscope, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
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

  // Charger les spécialités depuis l'API (using doctors data since pathologies endpoint is empty)
  useEffect(() => {
    const fetchSpecialites = async () => {
      try {
        const response = await doctorAPI.getDoctors();
        // Extract unique specialties from doctors
        const specialtiesSet = new Set();
        response.data.forEach(doctor => {
          const specialty = doctor.specialite || doctor.specialty || doctor.pathologie || "Spécialité non spécifiée";
          specialtiesSet.add(specialty);
        });
        const specialtiesData = Array.from(specialtiesSet);
        setSpecialites(specialtiesData);
      } catch (err) {
        setError("Erreur lors du chargement des spécialités: " + (err.response?.data?.detail || err.response?.data?.error || err.message));
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
          
          // Filter doctors by selected specialty (case insensitive)
          const filteredDoctors = response.data.filter(doctor => {
            // Check multiple possible field names for specialty
            const doctorSpecialty = doctor.specialite || doctor.specialty || doctor.pathologie || "";
            return doctorSpecialty && 
                   doctorSpecialty.toLowerCase().includes(selectedSpecialite.toLowerCase());
          });
          
          setMedecins(filteredDoctors);
          setLoading(false);
        } catch (err) {
          setError("Erreur lors du chargement des médecins: " + (err.response?.data?.detail || err.response?.data?.error || err.message));
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
      // Dans une vraie application, cela viendrait de l'API
      // Pour le moment, utilisons des créneaux dynamiques basés sur l'heure actuelle
      const now = new Date();
      const slots = [];
      
      // Créneaux matin
      for (let hour = 9; hour <= 11; hour++) {
        slots.push(`${hour}:00`, `${hour}:30`);
      }
      
      // Créneaux après-midi
      for (let hour = 14; hour <= 16; hour++) {
        slots.push(`${hour}:00`, `${hour}:30`);
      }
      
      // Filtrer les créneaux passés si la date sélectionnée est aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateObj = new Date(selectedDate);
      selectedDateObj.setHours(0, 0, 0, 0);
      
      if (selectedDateObj.getTime() === today.getTime()) {
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        
        const filteredSlots = slots.filter(slot => {
          const [hour, minute] = slot.split(':').map(Number);
          if (hour < currentHour) return false;
          if (hour === currentHour && minute <= currentMinute) return false;
          return true;
        });
        
        setAvailableSlots(filteredSlots);
      } else {
        setAvailableSlots(slots);
      }
    }
  }, [selectedMedecin, selectedDate]);

  const handleSpecialiteSelect = (specialite) => {
    setSelectedSpecialite(specialite);
    setStep(2);
  };

  const handleMedecinSelect = (medecin) => {
    setSelectedMedecin(medecin);
    setStep(3);
  };

  const handleDateChange = (date) => {
    // Vérifier que la date n'est pas dans le passé
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(date);
    selectedDateObj.setHours(0, 0, 0, 0);
    
    // Additional validation to ensure date is not in the past
    if (selectedDateObj < today) {
      setError('Veuillez sélectionner une date future');
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setSelectedDate(date);
    setError(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      // Create appointment
      // Validation finale
      if (!selectedSlot) {
        setError("Veuillez sélectionner un créneau horaire");
        setLoading(false);
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      // Additional validation to ensure date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateObj = new Date(selectedDate);
      selectedDateObj.setHours(0, 0, 0, 0);
      
      if (selectedDateObj < today) {
        setError("Veuillez sélectionner une date future valide");
        setLoading(false);
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      // Validate required fields
      console.log("User data:", user);
      console.log("Selected medecin data:", selectedMedecin);
      
      // Get patient ID from context
      let patientId = user?.id;
      
      // Validate that we have a patient ID
      if (!patientId) {
        throw new Error("Patient ID is missing. Please log in again.");
      }
      
      if (!selectedMedecin || !selectedMedecin.user || !selectedMedecin.user.id) {
        throw new Error("Doctor ID is missing");
      }
      
      // Ensure IDs are integers
      const medecinId = parseInt(selectedMedecin.user.id, 10);
      patientId = parseInt(patientId, 10);
      
      if (isNaN(patientId) || isNaN(medecinId)) {
        throw new Error("Invalid patient or doctor ID");
      }
      
      // Format date properly (YYYY-MM-DD)
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      // Validate time format (should be HH:MM)
      if (!/^\d{1,2}:\d{2}$/.test(selectedSlot)) {
        throw new Error("Format d'heure invalide");
      }
      
      const appointmentData = {
        patient: patientId, // Using patient ID from context
        medecin: medecinId, // Using doctor ID as integer
        date: formattedDate,
        heure: selectedSlot,
        description: motif
      };
      
      console.log("Sending appointment data:", appointmentData);
      
      const response = await appointmentAPI.createAppointment(appointmentData);
      
      console.log("Appointment creation response:", response);
      
      // Show success message
      setSuccess(true);
      setLoading(false);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        resetForm();
      }, 3000);
    } catch (err) {
      // More detailed error handling
      let errorMessage = "Erreur lors de la prise de rendez-vous";
      
      console.error("Full error object:", err);
      
      if (err.response) {
        console.log("Error response:", err.response);
        if (err.response.data) {
          // Handle different error formats
          if (err.response.data.detail) {
            errorMessage += ": " + err.response.data.detail;
          } else if (err.response.data.error) {
            errorMessage += ": " + err.response.data.error;
          } else if (err.response.data.message) {
            errorMessage += ": " + err.response.data.message;
          } else if (err.response.data.non_field_errors) {
            // Handle non-field errors specifically
            errorMessage += ": " + err.response.data.non_field_errors.join(', ');
          } else if (Array.isArray(err.response.data)) {
            // Handle array of errors
            errorMessage += ": " + err.response.data.join(', ');
          } else if (typeof err.response.data === 'object') {
            // Try to get the first error message from the object
            const errorMessages = [];
            for (const [key, value] of Object.entries(err.response.data)) {
              if (Array.isArray(value)) {
                errorMessages.push(`${key}: ${value.join(', ')}`);
              } else if (typeof value === 'object' && value !== null) {
                // Handle nested objects
                errorMessages.push(`${key}: ${JSON.stringify(value)}`);
              } else {
                errorMessages.push(`${key}: ${value}`);
              }
            }
            if (errorMessages.length > 0) {
              errorMessage += ": " + errorMessages.join('; ');
            } else {
              errorMessage += ": " + JSON.stringify(err.response.data);
            }
          } else if (typeof err.response.data === 'string') {
            errorMessage += ": " + err.response.data;
          } else {
            errorMessage += ": " + JSON.stringify(err.response.data);
          }
        } else {
          errorMessage += ": " + err.response.status;
        }
      } else if (err.request) {
        errorMessage += ": Aucune réponse du serveur. Veuillez vérifier votre connexion internet.";
      } else {
        errorMessage += ": " + err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
      console.error("Erreur lors de la prise de rendez-vous :", err);
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
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
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg rounded-3">
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px" }}>
                    <FaUserMd size={40} className="text-primary" />
                  </div>
                </div>
                <h2 className="mb-3">🔐 Authentification requise</h2>
                <p className="mb-4 text-muted">Vous devez être connecté pour prendre un rendez-vous.</p>
                <Link to="/connecter" className="btn btn-primary btn-lg px-4 py-2">
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg rounded-3">
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px" }}>
                    <FaCheckCircle size={40} className="text-white" />
                  </div>
                </div>
                <h2 className="text-success mb-3">Rendez-vous confirmé !</h2>
                <p className="mb-2 lead">
                  Votre rendez-vous avec <strong>Dr. {selectedMedecin?.user.first_name} {selectedMedecin?.user.last_name}</strong> 
                  le <strong>{selectedDate.toLocaleDateString('fr-FR')}</strong> à <strong>{selectedSlot}</strong> a été confirmé.
                </p>
                <p className="mb-4 text-muted">Nous vous avons envoyé un email de confirmation.</p>
                <button className="btn btn-primary btn-lg px-4 py-2" onClick={resetForm}>
                  Prendre un autre rendez-vous
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex align-items-center mb-4">
            <Link to="/patient/rendez-vous" className="btn btn-outline-secondary me-3">
              <FaArrowLeft className="me-2" /> Retour
            </Link>
            <div>
              <h1 className="mb-0">Prendre un rendez-vous</h1>
              <p className="text-muted mb-0">Suivez les étapes pour programmer votre consultation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between position-relative">
                {/* Progress line */}
                <div className="position-absolute top-50 start-0 end-0 translate-middle-y" style={{ height: "4px", backgroundColor: "#e9ecef", zIndex: 1 }}></div>
                <div 
                  className="position-absolute top-50 start-0 translate-middle-y" 
                  style={{ 
                    height: "4px", 
                    backgroundColor: "#28a745", 
                    zIndex: 2, 
                    width: `${(step - 1) * 33.33}%`,
                    transition: "width 0.3s ease"
                  }}
                ></div>
                
                {/* Steps */}
                {[1, 2, 3, 4].map((stepNum) => (
                  <div key={stepNum} className="position-relative" style={{ zIndex: 3 }}>
                    <div className={`rounded-circle d-flex align-items-center justify-content-center ${step >= stepNum ? 'bg-success text-white' : 'bg-light text-muted'}`} 
                         style={{ width: "40px", height: "40px", border: step >= stepNum ? "2px solid #28a745" : "2px solid #dee2e6" }}>
                      {stepNum}
                    </div>
                    <div className="text-center mt-2">
                      <small className={step === stepNum ? "fw-bold text-success" : "text-muted"}>
                        {stepNum === 1 && "Spécialité"}
                        {stepNum === 2 && "Médecin"}
                        {stepNum === 3 && "Date & Heure"}
                        {stepNum === 4 && "Confirmation"}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger alert-dismissible fade show rounded-3 shadow-sm" role="alert">
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                <div>{error}</div>
                <button type="button" className="btn-close" onClick={() => setError(null)}></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content based on step */}
      <div className="row">
        <div className="col-12">
          {step === 1 && (
            <div className="card border-0 shadow-lg rounded-3">
              <div className="card-body p-5">
                <div className="text-center mb-5">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "70px", height: "70px" }}>
                    <FaStethoscope size={35} className="text-primary" />
                  </div>
                  <h2 className="mb-2">Sélectionnez une spécialité</h2>
                  <p className="text-muted">Choisissez la spécialité médicale qui correspond à vos besoins</p>
                </div>
                
                {specialites.length > 0 ? (
                  <div className="row g-4">
                    {specialites.map((specialite, index) => (
                      <div key={index} className="col-md-6 col-lg-3">
                        <div 
                          className="card border-0 shadow-sm h-100 rounded-3 cursor-pointer hover-lift"
                          style={{ transition: "all 0.3s ease" }}
                          onClick={() => handleSpecialiteSelect(specialite)}
                        >
                          <div className="card-body text-center p-4">
                            <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3 mx-auto" style={{ width: "60px", height: "60px" }}>
                              <FaStethoscope size={25} className="text-primary" />
                            </div>
                            <h5 className="card-title mb-0">{specialite}</h5>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="alert alert-info rounded-3">
                    <div className="text-center">
                      <i className="bi bi-info-circle-fill me-2"></i>
                      <span>Aucune spécialité disponible pour le moment.</span>
                      <p className="mb-0 mt-2">Veuillez contacter l'administrateur pour ajouter des spécialités.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card border-0 shadow-lg rounded-3">
              <div className="card-body p-5">
                <div className="d-flex align-items-center mb-4">
                  <button className="btn btn-outline-secondary me-3 rounded-circle" onClick={() => setStep(1)}>
                    <FaArrowLeft />
                  </button>
                  <div>
                    <h2 className="mb-0">Médecins en {selectedSpecialite}</h2>
                    <p className="text-muted mb-0">Sélectionnez le médecin avec lequel vous souhaitez prendre rendez-vous</p>
                  </div>
                </div>
                
                {loading ? (
                  <div className="d-flex justify-content-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row g-4">
                    {medecins.length > 0 ? (
                      medecins.map((medecin) => (
                        <div key={medecin.id} className="col-md-6 col-lg-4">
                          <div 
                            className="card border-0 shadow-sm h-100 rounded-3 cursor-pointer hover-lift"
                            style={{ transition: "all 0.3s ease" }}
                            onClick={() => handleMedecinSelect(medecin)}
                          >
                            <div className="card-body text-center p-4">
                              <div className="mb-3">
                                {medecin.photo ? (
                                  <img src={medecin.photo} alt={`${medecin.user.first_name} ${medecin.user.last_name}`} 
                                       className="rounded-circle" style={{ width: "90px", height: "90px", objectFit: "cover" }} />
                                ) : (
                                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mx-auto" 
                                       style={{ width: "90px", height: "90px" }}>
                                    <FaUserMd size={45} className="text-primary" />
                                  </div>
                                )}
                              </div>
                              <h5 className="card-title mb-1">Dr. {medecin.user.first_name} {medecin.user.last_name}</h5>
                              <p className="text-muted mb-2">({medecin.specialite || medecin.specialty || medecin.pathologie || "Spécialité non spécifiée"})</p>
                              <div className="d-flex justify-content-center align-items-center mb-3">
                                <span className="badge bg-success me-2">{medecin.note || "5.0"}</span>
                                <div className="text-warning">
                                  {'★'.repeat(Math.floor(medecin.note || 5))}
                                  {'☆'.repeat(5 - Math.floor(medecin.note || 5))}
                                </div>
                              </div>
                              <button className="btn btn-primary w-100 rounded-pill">
                                Choisir ce médecin
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12">
                        <div className="alert alert-info rounded-3">
                          <div className="text-center">
                            <i className="bi bi-info-circle-fill me-2"></i>
                            <span>Aucun médecin disponible pour cette spécialité pour le moment.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="card border-0 shadow-lg rounded-3">
              <div className="card-body p-5">
                <div className="d-flex align-items-center mb-4">
                  <button className="btn btn-outline-secondary me-3 rounded-circle" onClick={() => setStep(2)}>
                    <FaArrowLeft />
                  </button>
                  <div>
                    <h2 className="mb-0">Disponibilités de Dr. {selectedMedecin?.user.first_name} {selectedMedecin?.user.last_name}</h2>
                    <p className="text-muted mb-0">Sélectionnez une date et un créneau horaire pour votre rendez-vous</p>
                  </div>
                </div>
                
                <div className="row g-4">
                  <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                      <div className="card-body p-4">
                        <h4 className="mb-4">
                          <FaCalendarAlt className="me-2 text-primary" />
                          Sélectionnez une date
                        </h4>
                        <div className="calendar-container">
                          <Calendar
                            onChange={handleDateChange}
                            value={selectedDate}
                            className="border-0 w-100"
                            minDate={new Date()} // This blocks past dates
                            tileClassName={({ date, view }) => {
                              // Highlight today
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const selectedDateObj = new Date(date);
                              selectedDateObj.setHours(0, 0, 0, 0);
                              
                              if (selectedDateObj.getTime() === today.getTime()) {
                                return 'react-calendar__tile--today';
                              }
                              return null;
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                      <div className="card-body p-4">
                        <h4 className="mb-4">
                          <FaClock className="me-2 text-primary" />
                          Sélectionnez un créneau
                        </h4>
                        
                        <div className="mb-4">
                          <h6 className="mb-3">Créneaux disponibles pour le {selectedDate.toLocaleDateString('fr-FR')}</h6>
                          <div className="row g-2">
                            {availableSlots.map((slot, index) => (
                              <div key={index} className="col-4">
                                <button
                                  className={`btn w-100 rounded-pill ${selectedSlot === slot ? 'btn-primary' : 'btn-outline-secondary'}`}
                                  onClick={() => handleSlotSelect(slot)}
                                >
                                  {slot}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <h5 className="mb-3">Motif de consultation</h5>
                          <textarea
                            className="form-control rounded-3"
                            rows="4"
                            placeholder="Décrivez brièvement le motif de votre consultation..."
                            value={motif}
                            onChange={(e) => setMotif(e.target.value)}
                            required
                          ></textarea>
                        </div>
                        
                        <button
                          className="btn btn-primary w-100 mt-4 rounded-pill py-2"
                          onClick={() => setStep(4)}
                          disabled={!selectedSlot || !motif}
                        >
                          Continuer vers la confirmation
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="card border-0 shadow-lg rounded-3">
              <div className="card-body p-5">
                <div className="d-flex align-items-center mb-4">
                  <button className="btn btn-outline-secondary me-3 rounded-circle" onClick={() => setStep(3)}>
                    <FaArrowLeft />
                  </button>
                  <div>
                    <h2 className="mb-0">Confirmer votre rendez-vous</h2>
                    <p className="text-muted mb-0">Vérifiez les détails de votre rendez-vous avant de confirmer</p>
                  </div>
                </div>
                
                <div className="row g-4">
                  <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                      <div className="card-body p-4">
                        <h4 className="mb-4 pb-2 border-bottom">Détails du rendez-vous</h4>
                        
                        <div className="d-flex mb-4">
                          <div className="me-3">
                            {selectedMedecin?.photo ? (
                              <img src={selectedMedecin.photo} alt={`${selectedMedecin.user.first_name} ${selectedMedecin.user.last_name}`} 
                                   className="rounded-circle" style={{ width: "60px", height: "60px", objectFit: "cover" }} />
                            ) : (
                              <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center" 
                                   style={{ width: "60px", height: "60px" }}>
                                <FaUserMd size={30} className="text-primary" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h5 className="mb-0">Dr. {selectedMedecin?.user.first_name} {selectedMedecin?.user.last_name}</h5>
                            <p className="text-muted mb-0">{selectedMedecin?.specialite || selectedMedecin?.specialty || selectedMedecin?.pathologie || "Spécialité non spécifiée"}</p>
                          </div>
                        </div>
                        
                        <div className="row g-3">
                          <div className="col-12">
                            <div className="d-flex">
                              <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center me-3" 
                                   style={{ width: "40px", height: "40px", minWidth: "40px" }}>
                                <FaCalendarAlt className="text-primary" />
                              </div>
                              <div>
                                <small className="text-muted">Date</small>
                                <p className="mb-0 fw-medium">{selectedDate.toLocaleDateString('fr-FR')}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-12">
                            <div className="d-flex">
                              <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center me-3" 
                                   style={{ width: "40px", height: "40px", minWidth: "40px" }}>
                                <FaClock className="text-primary" />
                              </div>
                              <div>
                                <small className="text-muted">Heure</small>
                                <p className="mb-0 fw-medium">{selectedSlot}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-12">
                            <div className="d-flex">
                              <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center me-3" 
                                   style={{ width: "40px", height: "40px", minWidth: "40px" }}>
                                <i className="bi bi-chat-text text-primary"></i>
                              </div>
                              <div>
                                <small className="text-muted">Motif</small>
                                <p className="mb-0 fw-medium">{motif || "Non spécifié"}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-lg-6">
                    <div className="card border-0 shadow-sm rounded-3 h-100">
                      <div className="card-body p-4">
                        <h4 className="mb-4 pb-2 border-bottom">Informations importantes</h4>
                        
                        <ul className="list-group list-group-flush">
                          <li className="list-group-item px-0 py-3 border-0">
                            <div className="d-flex">
                              <div className="text-success me-3">
                                <i className="bi bi-check-circle-fill"></i>
                              </div>
                              <div>
                                <h6 className="mb-1">Arrivée</h6>
                                <p className="mb-0 text-muted">Veuillez arriver 15 minutes avant votre rendez-vous</p>
                              </div>
                            </div>
                          </li>
                          
                          <li className="list-group-item px-0 py-3 border-0">
                            <div className="d-flex">
                              <div className="text-primary me-3">
                                <i className="bi bi-card-text"></i>
                              </div>
                              <div>
                                <h6 className="mb-1">Documents à apporter</h6>
                                <p className="mb-0 text-muted">Apportez votre carte d'identité et votre carte vitale</p>
                              </div>
                            </div>
                          </li>
                          
                          <li className="list-group-item px-0 py-3 border-0">
                            <div className="d-flex">
                              <div className="text-warning me-3">
                                <i className="bi bi-exclamation-triangle-fill"></i>
                              </div>
                              <div>
                                <h6 className="mb-1">Annulation</h6>
                                <p className="mb-0 text-muted">En cas d'empêchement, veuillez annuler au moins 24h à l'avance</p>
                              </div>
                            </div>
                          </li>
                        </ul>
                        
                        <div className="mt-4">
                          <button
                            className="btn btn-primary w-100 rounded-pill py-2 mb-2"
                            onClick={handleConfirm}
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Confirmation en cours...
                              </>
                            ) : (
                              <>
                                <FaCheckCircle className="me-2" />
                                Confirmer le rendez-vous
                              </>
                            )}
                          </button>
                          
                          <button
                            className="btn btn-outline-secondary w-100 rounded-pill py-2"
                            onClick={() => setStep(3)}
                          >
                            Modifier les informations
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Styles */}
      <style jsx>{`
        .hover-lift {
          cursor: pointer;
        }
        
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        
        .cursor-pointer {
          cursor: pointer;
        }
        
        .react-calendar {
          border: none !important;
          width: 100% !important;
        }
        
        .react-calendar__tile--today {
          background: #e9f5e9 !important;
          font-weight: bold !important;
        }
        
        .react-calendar__tile--active {
          background: #28a745 !important;
          color: white !important;
        }
        
        .react-calendar__tile--active:hover {
          background: #218838 !important;
        }
        
        .calendar-container {
          border-radius: 10px;
          overflow: hidden;
        }
        
        @media (max-width: 768px) {
          .card-body {
            padding: 1.5rem !important;
          }
          
          h1, h2 {
            font-size: 1.5rem !important;
          }
          
          .react-calendar {
            font-size: 0.8rem !important;
          }
        }
      `}</style>
    </div>
  );
}

export default PriseDeRendezVous;