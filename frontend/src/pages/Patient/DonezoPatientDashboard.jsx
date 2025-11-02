import React, { useState, useEffect } from "react";
import { 
  FaCalendar, FaHistory, FaUserMd, FaEnvelope, 
  FaPills, FaFileAlt, FaBell, FaChevronRight, FaPlus, FaFilter,
  FaMapMarkerAlt, FaRobot, FaVideo
} from "react-icons/fa";
import { 
  BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { patientAPI, userAPI, articleAPI, consultationAPI, rendezVousAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import "../../components/DashboardLayout.css";
import EnhancedChatbot from "../../components/EnhancedChatbot";

// Colors for charts
const COLORS = ['#0d9488', '#ef4444'];

function DonezoPatientDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medications, setMedications] = useState([]);
  const [articles, setArticles] = useState([]);
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    pastAppointments: 0,
    doctors: 0,
    messages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, past, cancelled
  const navigate = useNavigate();
  
  // New states for the enhanced dashboard
  const [rdvConfirmes, setRdvConfirmes] = useState(new Set());
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [statsRdvSemaine, setStatsRdvSemaine] = useState({
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    data: [0, 0, 0, 0, 0, 0, 0]
  });
  const [filtreRdv, setFiltreRdv] = useState('tous'); // 'tous', 'a_venir', 'en_attente', 'annules'
  const [rdvFiltres, setRdvFiltres] = useState([]);

  // Charger les RDV pour le mois
  const chargerRdvMois = async () => {
    try {
      const response = await rendezVousAPI.mesRendezVous();
      const tousRdv = Array.isArray(response) ? response : (response.data || []);
      
      // Filtrer les RDV confirmés pour ce mois
      const moisActuel = selectedMonth.getMonth();
      const anneeActuelle = selectedMonth.getFullYear();
      
      const rdvMois = tousRdv.filter(rdv => {
        const dateRdv = new Date(rdv.date);
        return rdv.statut === 'CONFIRMED' && 
               dateRdv.getMonth() === moisActuel &&
               dateRdv.getFullYear() === anneeActuelle;
      });
      
      // Créer un Set des dates avec RDV (format YYYY-MM-DD)
      const datesAvecRdv = new Set(rdvMois.map(rdv => rdv.date));
      
      setRdvConfirmes(datesAvecRdv);
      
    } catch (error) {
      console.error('Erreur chargement RDV mois:', error);
    }
  };

  // Charger les stats des RDV de la semaine
  const chargerStatsRdvSemaine = async () => {
    try {
      const response = await rendezVousAPI.mesRendezVous();
      const tousRdv = Array.isArray(response) ? response : (response.data || []);
      
      // Définir la semaine actuelle (lundi → dimanche)
      const aujourdhui = new Date();
      const jourSemaine = aujourdhui.getDay(); // 0=dimanche, 1=lundi, ...
      const premierJour = new Date(aujourdhui);
      premierJour.setDate(aujourdhui.getDate() - (jourSemaine === 0 ? 6 : jourSemaine - 1));
      
      // Initialiser compteur par jour
      const rdvParJour = [0, 0, 0, 0, 0, 0, 0];
      
      // Compter les RDV par jour de la semaine (TOUS les statuts sauf CANCELLED)
      tousRdv
        .filter(rdv => rdv.statut !== 'CANCELLED')
        .forEach(rdv => {
          const dateRdv = new Date(rdv.date);
          const diffJours = Math.floor((dateRdv - premierJour) / (1000 * 60 * 60 * 24));
          
          // Si le RDV est dans la semaine actuelle
          if (diffJours >= 0 && diffJours < 7) {
            rdvParJour[diffJours]++;
          }
        });
      
      setStatsRdvSemaine({
        labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        data: rdvParJour
      });
      
    } catch (error) {
      console.error('Erreur stats semaine:', error);
    }
  };

  // Filtrer les RDV selon l'onglet actif
  const filtrerRdv = async () => {
    try {
      const response = await rendezVousAPI.mesRendezVous();
      const tousRdv = Array.isArray(response) ? response : (response.data || []);
      
      let rdv = [];
      const maintenant = new Date();
      
      switch(filtreRdv) {
        case 'tous':
          rdv = tousRdv.filter(r => r.statut !== 'CANCELLED');
          break;
        case 'a_venir':
          rdv = tousRdv.filter(r => 
            (r.statut === 'PENDING' || r.statut === 'CONFIRMED') && 
            new Date(r.date) >= maintenant
          );
          break;
        case 'en_attente':
          rdv = tousRdv.filter(r => r.statut === 'PENDING');
          break;
        case 'annules':
          rdv = tousRdv.filter(r => r.statut === 'CANCELLED');
          break;
      }
      
      // Trier par date (plus proche en premier)
      rdv.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setRdvFiltres(rdv);
      
    } catch (error) {
      console.error('Erreur filtrage RDV:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user profile
        try {
          const userResponse = await userAPI.getProfile();
          if (userResponse && userResponse.data) {
            setUser(userResponse.data);
          } else {
            console.warn("User profile response is empty or invalid");
            setUser(null);
          }
        } catch (userError) {
          console.error("Error fetching user profile:", userError);
          // Don't set error here as we want to continue loading other data
        }
        
        // Fetch appointments
        try {
          const appointmentsResponse = await patientAPI.getAppointments();
          const appointmentsData = appointmentsResponse?.data || [];
          setAppointments(appointmentsData);
          setStats(prev => ({
            ...prev,
            upcomingAppointments: Array.isArray(appointmentsData) 
              ? appointmentsData.filter(app => app.statut === 'CONFIRMED').length 
              : 0
          }));
        } catch (appointmentsError) {
          console.error("Error fetching appointments:", appointmentsError);
          setAppointments([]);
        }
        
        // Fetch appointment history
        try {
          const historyResponse = await patientAPI.getAppointmentHistory();
          const historyData = historyResponse?.data || [];
          setStats(prev => ({
            ...prev,
            pastAppointments: Array.isArray(historyData) ? historyData.length : 0
          }));
        } catch (historyError) {
          console.error("Error fetching appointment history:", historyError);
        }
        
        // Fetch medications
        try {
          // Get the patient ID from the authenticated user
          const patientId = user?.id; // Assuming the user object has an id property
          if (patientId) {
            const medicationsResponse = await patientAPI.getMedications(patientId);
            const medicationsData = medicationsResponse?.data || [];
            setMedications(medicationsData);
          } else {
            setMedications([]);
          }
        } catch (medicationsError) {
          console.error("Error fetching medications:", medicationsError);
          setMedications([]);
        }
        
        // Fetch articles
        try {
          const articlesResponse = await articleAPI.getArticles();
          const articlesData = articlesResponse?.data || [];
          // Ensure articlesData is an array before calling slice
          const articles = Array.isArray(articlesData) ? articlesData : [];
          setArticles(articles.slice(0, 3)); // Get first 3 articles
        } catch (articlesError) {
          console.error("Error fetching articles:", articlesError);
          setArticles([]);
        }
        
        // Fetch consultations count
        try {
          const consultationsResponse = await consultationAPI.getConsultations();
          const consultationsData = consultationsResponse?.data || [];
          const onlineConsultations = Array.isArray(consultationsData) 
            ? consultationsData.filter(consultation => consultation.type === 'teleconsultation').length 
            : 0;
          setStats(prev => ({
            ...prev,
            doctors: 5, // This would need a specific API endpoint
            messages: onlineConsultations  // Replacing messages with online consultations count
          }));
        } catch (consultationsError) {
          console.error("Error fetching consultations:", consultationsError);
          setStats(prev => ({
            ...prev,
            doctors: 5, // This would need a specific API endpoint
            messages: 0
          }));
        }
        
      } catch (err) {
        console.error("General error fetching data:", err);
        setError("Une erreur inattendue s'est produite lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Charger les données pour le calendrier et les stats
  useEffect(() => {
    chargerRdvMois();
    chargerStatsRdvSemaine();
    filtrerRdv();
  }, [selectedMonth, filtreRdv]);

  // Generate appointment data for charts based on real appointments
  const generateAppointmentData = () => {
    // Create data for the last 7 days
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const today = new Date();
    
    return days.map((day, index) => {
      // Calculate the date for each day of the week
      const date = new Date(today);
      const dayDiff = index - today.getDay() + (index < today.getDay() ? 7 : 0);
      date.setDate(today.getDate() - today.getDay() + index + (index < today.getDay() ? 7 : 0));
      
      // Count appointments for this date
      const count = Array.isArray(appointments) 
        ? appointments.filter(app => {
            if (!app.date) return false;
            const appDate = new Date(app.date);
            return appDate.toDateString() === date.toDateString() && app.statut === 'CONFIRMED';
          }).length 
        : 0;
      
      return {
        day,
        count
      };
    });
  };

  // Medication adherence data based on real medications
  const medicationAdherence = [
    { name: 'Pris', value: Array.isArray(medications) ? medications.filter(med => med.taken).length : 0 },
    { name: 'Manqués', value: Array.isArray(medications) ? medications.filter(med => !med.taken).length : 0 }
  ];

  // Get appointment dates for calendar highlighting
  const getAppointmentDates = () => {
    if (!Array.isArray(appointments)) return [];
    
    return appointments
      .filter(app => app.statut === 'CONFIRMED' && app.date)
      .map(app => {
        const date = new Date(app.date);
        return {
          date: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear(),
          fullDate: date.toDateString()
        };
      });
  };

  const appointmentDates = getAppointmentDates();

  // Filter appointments based on selected filter
  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return app.statut === 'CONFIRMED';
    if (filter === 'pending') return app.statut === 'PENDING';
    if (filter === 'cancelled') return app.statut === 'CANCELLED';
    return true;
  });

  // Stat cards data
  const statCards = [
    { title: "RDV à venir", value: stats.upcomingAppointments, icon: <FaCalendar />, color: "bg-teal-100 text-teal-600" },
    { title: "RDV passés", value: stats.pastAppointments, icon: <FaHistory />, color: "bg-blue-100 text-blue-600" },
    { title: "Médecins", value: stats.doctors, icon: <FaUserMd />, color: "bg-green-100 text-green-600" },
    { title: "Consultations en ligne", value: stats.messages, icon: <FaVideo />, color: "bg-purple-100 text-purple-600" }
  ];

  // Quick access buttons for main functionalities
  const quickAccessButtons = [
    { title: "Documents médicaux", icon: <FaFileAlt />, color: "bg-blue-100 text-blue-600", onClick: () => navigate("/patient/document-partage") },
    { title: "Rappels médicaments", icon: <FaPills />, color: "bg-green-100 text-green-600", onClick: () => navigate("/patient/medication-reminders") },
    { title: "Téléconsultation", icon: <FaVideo />, color: "bg-purple-100 text-purple-600", onClick: () => navigate("/patient/consultations") },
    { title: "Centres de santé", icon: <FaMapMarkerAlt />, color: "bg-red-100 text-red-600", onClick: () => navigate("/patient/localiser-centres") }
  ];

  // Handle day click in calendar
  const handleDayClick = (day) => {
    console.log("Day clicked:", day);
    // Implement day click functionality if needed
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="container mx-auto py-6 px-4">
          <div className="alert alert-danger bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Erreur! </strong>
            <span className="block sm:inline">{error}</span>
            <button 
              className="mt-2 btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Tableau de bord</h1>
              <p className="opacity-90">
                Bonjour, {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username || 'Patient'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-teal-700 transition">
                <FaBell className="text-xl" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                  <span className="font-semibold">
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'P'}
                    {user?.last_name?.charAt(0) || user?.first_name?.slice(1, 2) || ''}
                  </span>
                </div>
                <button 
                  onClick={() => { 
                    localStorage.removeItem("access_token"); 
                    localStorage.removeItem("refresh_token");
                    localStorage.removeItem("username");
                    localStorage.removeItem("first_name");
                    localStorage.removeItem("last_name");
                    localStorage.removeItem("role");
                    localStorage.removeItem("email");
                    navigate("/connecter"); 
                  }}
                  className="btn btn-outline-light"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className="stat-card p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-sm">{card.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{card.value}</h3>
                </div>
                <div className={`p-3 rounded-full ${card.color}`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Access Section */}
        <div className="dashboard-card p-6 mb-8">
          <h2 className="section-title mb-4">
            <FaRobot className="text-teal-600" />
            Accès rapide aux fonctionnalités
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickAccessButtons.map((button, index) => (
              <button
                key={index}
                onClick={button.onClick}
                className="flex flex-col items-center justify-center p-4 rounded-lg border hover:shadow-md transition-shadow"
              >
                <div className={`p-3 rounded-full ${button.color} mb-2`}>
                  {button.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{button.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Calendar and Appointments */}
            <div className="dashboard-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="section-title">
                  <FaCalendar className="text-teal-600" />
                  Rendez-vous
                </h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => navigate("/patient/rendez-vous")}
                    className="text-teal-600 hover:text-teal-800 flex items-center text-sm"
                  >
                    Voir tout <FaChevronRight className="ml-1 text-xs" />
                  </button>
                  <button 
                    onClick={() => navigate("/patient/prise-rendez-vous")}
                    className="btn btn-primary text-sm flex items-center"
                  >
                    <FaPlus className="mr-1" /> Prendre RDV
                  </button>
                </div>
              </div>
              
              {/* Calendar */}
              <div className="mb-6">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">
                      {selectedMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 hover:bg-gray-200 rounded"
                        onClick={() => {
                          const newMonth = new Date(selectedMonth);
                          newMonth.setMonth(newMonth.getMonth() - 1);
                          setSelectedMonth(newMonth);
                        }}
                      >
                        &lt;
                      </button>
                      <button 
                        className="p-1 hover:bg-gray-200 rounded"
                        onClick={() => {
                          const newMonth = new Date(selectedMonth);
                          newMonth.setMonth(newMonth.getMonth() + 1);
                          setSelectedMonth(newMonth);
                        }}
                      >
                        &gt;
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mt-2 text-center text-sm">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                      <div key={i} className="font-medium py-1">{day}</div>
                    ))}
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = i + 1;
                      const dateStr = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const hasAppointment = rdvConfirmes.has(dateStr);
                      
                      // Skip days that don't exist in this month
                      const testDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
                      if (testDate.getMonth() !== selectedMonth.getMonth()) {
                        return <div key={i}></div>;
                      }
                      
                      return (
                        <div 
                          key={i} 
                          className={`calendar-day p-1 text-center rounded cursor-pointer transition-all ${
                            hasAppointment ? 'has-appointment bg-blue-500 text-white font-bold hover:bg-blue-600 transform hover:scale-105' : ''
                          }`}
                          title={hasAppointment ? '📅 Rendez-vous confirmé' : ''}
                          onClick={() => handleDayClick(day)}
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* RDV Filters */}
              <div className="d-flex gap-2 mb-3">
                <button 
                  className={`btn btn-sm ${filtreRdv === 'tous' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFiltreRdv('tous')}
                >
                  Tous
                </button>
                <button 
                  className={`btn btn-sm ${filtreRdv === 'a_venir' ? 'btn-success' : 'btn-outline-success'}`}
                  onClick={() => setFiltreRdv('a_venir')}
                >
                  À venir
                </button>
                <button 
                  className={`btn btn-sm ${filtreRdv === 'en_attente' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => setFiltreRdv('en_attente')}
                >
                  En attente
                </button>
                <button 
                  className={`btn btn-sm ${filtreRdv === 'annules' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                  onClick={() => setFiltreRdv('annules')}
                >
                  Annulés
                </button>
              </div>
              
              {/* RDV List */}
              <div className="space-y-3">
                {rdvFiltres && rdvFiltres.length > 0 ? (
                  rdvFiltres.slice(0, 5).map(rdv => (
                    <div key={rdv.id || rdv.numero || rdv.date + rdv.heure} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{rdv.medecin_nom || 'Médecin non spécifié'}</p>
                        <p className="text-sm text-gray-500">
                          {rdv.date ? new Date(rdv.date).toLocaleDateString('fr-FR') : 'Date non spécifiée'} 
                          {rdv.heure ? ` à ${rdv.heure}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${
                          rdv.statut === 'CONFIRMED' ? 'badge-success' : 
                          rdv.statut === 'PENDING' ? 'badge-warning' : 
                          rdv.statut === 'CANCELLED' ? 'badge-danger' : 'badge-secondary'
                        }`}>
                          {rdv.statut === 'CONFIRMED' ? 'Confirmé' : 
                           rdv.statut === 'PENDING' ? 'En attente' : 
                           rdv.statut === 'CANCELLED' ? 'Annulé' : 'Inconnu'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-center py-4">
                    Aucun rendez-vous {filtreRdv === 'tous' ? '' : 
                                      filtreRdv === 'a_venir' ? 'à venir' : 
                                      filtreRdv === 'en_attente' ? 'en attente' : 
                                      filtreRdv === 'annules' ? 'annulé' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Medications */}
            <div className="dashboard-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="section-title">
                  <FaPills className="text-teal-600" />
                  Médicaments du jour
                </h2>
                <button 
                  onClick={() => navigate("/patient/medication-reminders")}
                  className="text-teal-600 hover:text-teal-800 flex items-center text-sm"
                >
                  Voir tout <FaChevronRight className="ml-1 text-xs" />
                </button>
              </div>
              
              <div className="space-y-3">
                {medications && medications.length > 0 ? (
                  medications.slice(0, 3).map(med => (
                    <div key={med.id || med.medication_id || med.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{med.name || 'Médicament non spécifié'}</p>
                        <p className="text-sm text-gray-500">{med.dosage || 'Dosage non spécifié'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{med.time || 'Heure non spécifiée'}</p>
                        <button className="mt-1 text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
                          {med.taken ? 'Pris' : 'Marquer comme pris'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Aucun médicament programmé</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Charts */}
            <div className="card">
              <div className="card-header">
                <h5>📊 Activité des rendez-vous</h5>
                <small className="text-muted">Rendez-vous de cette semaine</small>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statsRdvSemaine.labels.map((label, index) => ({ 
                    name: label, 
                    count: statsRdvSemaine.data[index] || 0 
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="count" 
                      fill="#3b82f6" 
                      name="Nombre de RDV"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
                
                {/* Résumé textuel */}
                <div className="mt-3 text-center">
                  <p className="mb-0 text-muted">
                    <strong>{statsRdvSemaine.data.reduce((a, b) => a + b, 0)}</strong> rendez-vous cette semaine
                  </p>
                </div>
              </div>
            </div>

            {/* Health Articles */}
            <div className="card">
              <div className="card-body text-center py-5">
                <div className="mb-3">
                  <i className="bi bi-file-text" style={{ fontSize: '4rem', color: '#10b981' }}></i>
                </div>
                <h4 className="mb-3">📚 Articles de santé</h4>
                <p className="text-muted mb-4">
                  Découvrez nos articles et conseils santé rédigés par des professionnels
                </p>
                <a 
                  href="/articles" 
                  className="btn btn-success btn-lg px-5"
                  style={{
                    fontSize: '1.2rem',
                    borderRadius: '50px',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  📖 Voir tous les articles
                  <i className="bi bi-arrow-right ms-2"></i>
                </a>
              </div>
            </div>

            {/* Medication Adherence */}
            <div className="dashboard-card p-6">
              <h2 className="section-title mb-4">
                <FaPills className="text-teal-600" />
                Adhérence aux médicaments
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={medicationAdherence}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {medicationAdherence.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chatbot Widget */}
      <EnhancedChatbot />
    </div>
  );
}

export default DonezoPatientDashboard;