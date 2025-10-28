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
import { patientAPI, userAPI, articleAPI } from "../../services/api";
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
            upcomingAppointments: appointmentsData.length
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
            pastAppointments: historyData.length
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
        
        // Update stats
        setStats(prev => ({
          ...prev,
          doctors: 5, // This would need a specific API endpoint
          messages: 8  // This would need a specific API endpoint
        }));
        
      } catch (err) {
        console.error("General error fetching data:", err);
        setError("Une erreur inattendue s'est produite lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate appointment data for charts
  const generateAppointmentData = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    return days.map((day, index) => ({
      day,
      count: appointments.filter(app => {
        // This is a simplified example - in reality, you'd parse the actual appointment dates
        const dayIndex = new Date().getDay();
        return (dayIndex + index) % 7 === index;
      }).length
    }));
  };

  // Medication adherence data
  const medicationAdherence = [
    { name: 'Pris', value: medications.filter(med => med.taken).length || 0 },
    { name: 'Manqués', value: medications.filter(med => !med.taken).length || 0 }
  ];

  // Filter appointments based on selected filter
  const filteredAppointments = appointments.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return app.status === 'confirmed';
    if (filter === 'pending') return app.status === 'pending';
    if (filter === 'cancelled') return app.status === 'cancelled';
    return true;
  });

  // Stat cards data
  const statCards = [
    { title: "RDV à venir", value: stats.upcomingAppointments, icon: <FaCalendar />, color: "bg-teal-100 text-teal-600" },
    { title: "RDV passés", value: stats.pastAppointments, icon: <FaHistory />, color: "bg-blue-100 text-blue-600" },
    { title: "Médecins", value: stats.doctors, icon: <FaUserMd />, color: "bg-green-100 text-green-600" },
    { title: "Messages", value: stats.messages, icon: <FaEnvelope />, color: "bg-purple-100 text-purple-600" }
  ];

  // Quick access buttons for main functionalities
  const quickAccessButtons = [
    { title: "Documents médicaux", icon: <FaFileAlt />, color: "bg-blue-100 text-blue-600", onClick: () => navigate("/patient/document-partage") },
    { title: "Rappels médicaments", icon: <FaPills />, color: "bg-green-100 text-green-600", onClick: () => navigate("/patient/medication-reminders") },
    { title: "Téléconsultation", icon: <FaVideo />, color: "bg-purple-100 text-purple-600", onClick: () => navigate("/patient/consultations") },
    { title: "Centres de santé", icon: <FaMapMarkerAlt />, color: "bg-red-100 text-red-600", onClick: () => navigate("/patient/localiser-centres") }
  ];

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
              
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Tous
                </button>
                <button 
                  onClick={() => setFilter('upcoming')}
                  className={`px-3 py-1 rounded-full text-sm ${filter === 'upcoming' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  À venir
                </button>
                <button 
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1 rounded-full text-sm ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  En attente
                </button>
                <button 
                  onClick={() => setFilter('cancelled')}
                  className={`px-3 py-1 rounded-full text-sm ${filter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Annulés
                </button>
              </div>
              
              <div className="mb-6">
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Juin 2025</h3>
                    <div className="flex space-x-2">
                      <button className="p-1 hover:bg-gray-200 rounded">&lt;</button>
                      <button className="p-1 hover:bg-gray-200 rounded">&gt;</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mt-2 text-center text-sm">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, i) => (
                      <div key={i} className="font-medium py-1">{day}</div>
                    ))}
                    {Array.from({ length: 30 }, (_, i) => (
                      <div 
                        key={i} 
                        className={`p-1 text-center rounded ${
                          i === 14 ? 'bg-teal-500 text-white' : 
                          [12, 17, 19].includes(i) ? 'bg-teal-100 text-teal-800' : ''
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Rendez-vous {filter === 'all' ? '' : filter === 'upcoming' ? 'à venir' : filter === 'pending' ? 'en attente' : 'annulés'}</h3>
                {filteredAppointments && filteredAppointments.length > 0 ? (
                  filteredAppointments.slice(0, 3).map(app => (
                    <div key={app.id || app.appointment_id || app.date + app.time} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{app.doctor_name || app.doctor || 'Médecin non spécifié'}</p>
                        <p className="text-sm text-gray-500">
                          {app.date ? new Date(app.date).toLocaleDateString('fr-FR') : 'Date non spécifiée'} 
                          {app.time ? ` à ${app.time}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${
                          app.status === 'confirmed' ? 'badge-success' : 
                          app.status === 'pending' ? 'badge-warning' : 
                          app.status === 'cancelled' ? 'badge-danger' : 'badge-secondary'
                        }`}>
                          {app.status === 'confirmed' ? 'Confirmé' : 
                           app.status === 'pending' ? 'En attente' : 
                           app.status === 'cancelled' ? 'Annulé' : 'Inconnu'}
                        </span>
                        {(app.status === 'confirmed' || app.status === 'pending') && (
                          <div className="flex space-x-1">
                            <button className="btn btn-sm btn-warning">Reporter</button>
                            <button className="btn btn-sm btn-danger">Annuler</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Aucun rendez-vous {filter === 'all' ? '' : filter === 'upcoming' ? 'à venir' : filter === 'pending' ? 'en attente' : 'annulé'}</p>
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
            <div className="dashboard-card p-6">
              <h2 className="section-title mb-4">
                <FaFileAlt className="text-teal-600" />
                Activité des rendez-vous
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={generateAppointmentData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0d9488" name="Rendez-vous" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Health Articles */}
            <div className="dashboard-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="section-title">
                  <FaFileAlt className="text-teal-600" />
                  Articles de santé
                </h2>
                <button 
                  onClick={() => navigate("/articles")}
                  className="text-teal-600 hover:text-teal-800 flex items-center text-sm"
                >
                  Voir tout <FaChevronRight className="ml-1 text-xs" />
                </button>
              </div>
              
              <div className="space-y-4">
                {articles && articles.length > 0 ? (
                  articles.map(article => (
                    <div key={article.id || article.article_id || article.title} className="border-b pb-4 last:border-0 last:pb-0">
                      <h3 
                        className="font-medium hover:text-teal-600 cursor-pointer"
                        onClick={() => article.slug ? navigate(`/articles/${article.slug}`) : null}
                      >
                        {article.title || 'Titre non spécifié'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {article.created_at ? new Date(article.created_at).toLocaleDateString('fr-FR') : 'Date non spécifiée'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Aucun article disponible</p>
                )}
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