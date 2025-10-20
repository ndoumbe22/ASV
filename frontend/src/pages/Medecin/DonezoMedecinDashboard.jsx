import React, { useState, useEffect } from "react";
import { 
  FaUserInjured, FaCalendar, FaFileAlt, FaClock, 
  FaChartBar, FaBell, FaChevronRight, FaPlus, FaFilter,
  FaUserMd, FaRobot
} from "react-icons/fa";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { appointmentAPI, userAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../components/DashboardLayout.css";
import EnhancedChatbot from "../../components/EnhancedChatbot";

// Colors for charts
const COLORS = ['#0d9488', '#f59e0b', '#ef4444'];
const USER_COLORS = ['#0d9488', '#10b981', '#3b82f6'];

function DonezoMedecinDashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    articles: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('today'); // today, pending, validated, completed
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

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
          const appointmentsResponse = await appointmentAPI.getAppointments();
          const appointmentsData = appointmentsResponse?.data || [];
          setAppointments(appointmentsData);
          
          // Update stats
          setStats(prev => ({
            ...prev,
            todayAppointments: appointmentsData.length,
            pendingRequests: appointmentsData.filter(app => app.status === 'pending').length
          }));
          
          // Fetch patients (this would need a specific endpoint)
          // For now, we'll simulate with appointment data
          const uniquePatients = [...new Set(appointmentsData.map(app => app.patient_name || app.patient || 'Patient inconnu'))];
          setPatients(uniquePatients.map((name, index) => ({
            id: index + 1,
            name: name,
            lastVisit: "2025-06-10", // This would come from API
            condition: "Hypertension" // This would come from API
          })));
          
          setStats(prev => ({
            ...prev,
            totalPatients: uniquePatients.length,
            articles: 12 // This would come from articles API
          }));
        } catch (appointmentsError) {
          console.error("Error fetching appointments:", appointmentsError);
          setAppointments([]);
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

  // Generate patient data for charts
  const generatePatientData = () => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    return months.map((month, index) => ({
      month,
      patients: 40 + Math.floor(Math.random() * 20) // Simulated data
    }));
  };

  // Appointment statistics
  const appointmentStats = [
    { name: 'Confirmés', value: appointments.filter(app => app.status === 'confirmed').length },
    { name: 'En attente', value: appointments.filter(app => app.status === 'pending').length },
    { name: 'Annulés', value: appointments.filter(app => app.status === 'cancelled').length }
  ];

  // Filter appointments based on active tab
  const filteredAppointments = appointments.filter(app => {
    if (activeTab === 'today') return true;
    if (activeTab === 'pending') return app.status === 'pending';
    if (activeTab === 'validated') return app.status === 'confirmed';
    if (activeTab === 'completed') return app.status === 'completed';
    return true;
  });

  // Stat cards data
  const statCards = [
    { title: "Patients", value: stats.totalPatients, icon: <FaUserInjured />, color: "bg-teal-100 text-teal-600" },
    { title: "RDV aujourd'hui", value: stats.todayAppointments, icon: <FaCalendar />, color: "bg-blue-100 text-blue-600" },
    { title: "Articles", value: stats.articles, icon: <FaFileAlt />, color: "bg-green-100 text-green-600" },
    { title: "En attente", value: stats.pendingRequests, icon: <FaClock />, color: "bg-yellow-100 text-yellow-600" }
  ];

  // Quick access buttons for main functionalities
  const quickAccessButtons = [
    { title: "Mes disponibilités", icon: <FaClock />, color: "bg-blue-100 text-blue-600", onClick: () => navigate("/medecin/disponibilites") },
    { title: "Messagerie patients", icon: <FaBell />, color: "bg-green-100 text-green-600", onClick: () => navigate("/medecin/messagerie") },
    { title: "Mes articles", icon: <FaFileAlt />, color: "bg-purple-100 text-purple-600", onClick: () => navigate("/medecin/articles") },
    { title: "Dossiers patients", icon: <FaUserInjured />, color: "bg-red-100 text-red-600", onClick: () => navigate("/medecin/dossiers-patients") }
  ];

  // Handle appointment actions
  const handleValidateAppointment = (appointmentId) => {
    // In a real implementation, this would call an API
    setAppointments(prev => prev.map(app => 
      app.id === appointmentId ? { ...app, status: 'confirmed' } : app
    ));
  };

  const handleRescheduleAppointment = (appointmentId) => {
    // In a real implementation, this would open a modal for rescheduling
    alert("Fonction de reprogrammation à implémenter");
  };

  const handleRejectAppointment = (appointmentId) => {
    // In a real implementation, this would call an API
    setAppointments(prev => prev.map(app => 
      app.id === appointmentId ? { ...app, status: 'rejected' } : app
    ));
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
              <h1 className="text-2xl font-bold">Tableau de bord médecin</h1>
              <p className="opacity-90">
                Bonjour, {user?.first_name ? `Dr. ${user.first_name} ${user.last_name || ''}` : user?.username ? `Dr. ${user.username}` : 'Médecin'}
                {user?.specialty ? ` - ${user.specialty}` : user?.profile?.specialty ? ` - ${user.profile.specialty}` : ' - Médecine générale'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-full hover:bg-teal-700 transition">
                <FaBell className="text-xl" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                  <span className="font-semibold">
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'Dr'}
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
            {/* Agenda and Today's Appointments */}
            <div className="dashboard-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="section-title">
                  <FaCalendar className="text-teal-600" />
                  Agenda du jour
                </h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => navigate("/medecin/rendez-vous")}
                    className="text-teal-600 hover:text-teal-800 flex items-center text-sm"
                  >
                    Voir tout <FaChevronRight className="ml-1 text-xs" />
                  </button>
                  <button 
                    onClick={() => navigate("/medecin/disponibilites")}
                    className="btn btn-primary text-sm flex items-center"
                  >
                    <FaPlus className="mr-1" /> Définir dispos
                  </button>
                </div>
              </div>
              
              {/* Tabs for appointment filtering */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button 
                  onClick={() => setActiveTab('today')}
                  className={`px-3 py-1 rounded-full text-sm ${activeTab === 'today' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Aujourd'hui
                </button>
                <button 
                  onClick={() => setActiveTab('pending')}
                  className={`px-3 py-1 rounded-full text-sm ${activeTab === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  En attente
                </button>
                <button 
                  onClick={() => setActiveTab('validated')}
                  className={`px-3 py-1 rounded-full text-sm ${activeTab === 'validated' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Validés
                </button>
                <button 
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 py-1 rounded-full text-sm ${activeTab === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Terminés
                </button>
              </div>
              
              <div className="space-y-3">
                {filteredAppointments && filteredAppointments.length > 0 ? (
                  filteredAppointments.slice(0, 5).map(app => (
                    <div key={app.id || app.appointment_id || app.date + app.time} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{app.patient_name || app.patient || 'Patient non spécifié'}</p>
                        <p className="text-sm text-gray-500">
                          {app.date ? new Date(app.date).toLocaleDateString('fr-FR') : 'Date non spécifiée'} 
                          {app.time ? ` à ${app.time}` : ''}
                        </p>
                        {app.motif && <p className="text-xs text-gray-500 mt-1">{app.motif}</p>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${
                          app.status === 'confirmed' ? 'badge-success' : 
                          app.status === 'pending' ? 'badge-warning' : 
                          app.status === 'completed' ? 'badge-info' : 
                          app.status === 'cancelled' ? 'badge-danger' : 'badge-secondary'
                        }`}>
                          {app.status === 'confirmed' ? 'Confirmé' : 
                           app.status === 'pending' ? 'En attente' : 
                           app.status === 'completed' ? 'Terminé' : 
                           app.status === 'cancelled' ? 'Annulé' : 'Inconnu'}
                        </span>
                        {app.status === 'pending' && (
                          <div className="flex space-x-1">
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => handleValidateAppointment(app.id)}
                            >
                              Valider
                            </button>
                            <button 
                              className="btn btn-sm btn-warning"
                              onClick={() => handleRescheduleAppointment(app.id)}
                            >
                              Reporter
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => handleRejectAppointment(app.id)}
                            >
                              Refuser
                            </button>
                          </div>
                        )}
                        {app.status === 'confirmed' && (
                          <button className="btn btn-sm btn-primary">
                            Démarrer
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-center py-4">
                    Aucun rendez-vous {activeTab === 'today' ? "aujourd'hui" : 
                                      activeTab === 'pending' ? "en attente" : 
                                      activeTab === 'validated' ? "validé" : 
                                      activeTab === 'completed' ? "terminé" : ""}
                  </p>
                )}
              </div>
            </div>

            {/* Today's Patients */}
            <div className="dashboard-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="section-title">
                  <FaUserInjured className="text-teal-600" />
                  Patients du jour
                </h2>
                <button 
                  onClick={() => navigate("/medecin/patients")}
                  className="text-teal-600 hover:text-teal-800 flex items-center text-sm"
                >
                  Voir tout <FaChevronRight className="ml-1 text-xs" />
                </button>
              </div>
              
              <div className="space-y-3">
                {patients && patients.length > 0 ? (
                  patients.slice(0, 3).map(patient => (
                    <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-500">Dernière visite: {patient.lastVisit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{patient.condition}</p>
                        <button className="mt-1 text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
                          Voir dossier
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-center py-4">Aucun patient trouvé</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Appointment Requests */}
            <div className="dashboard-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="section-title">
                  <FaClock className="text-teal-600" />
                  Demandes de rendez-vous
                </h2>
                <button 
                  onClick={() => navigate("/medecin/rendez-vous")}
                  className="text-teal-600 hover:text-teal-800 flex items-center text-sm"
                >
                  Voir tout <FaChevronRight className="ml-1 text-xs" />
                </button>
              </div>
              
              <div className="space-y-3">
                {appointments && appointments.length > 0 ? (
                  appointments.filter(app => app.status === 'pending').slice(0, 3).map(app => (
                    <div key={app.id || app.appointment_id} className="p-3 border rounded-lg bg-yellow-50">
                      <div className="flex justify-between">
                        <p className="font-medium">{app.patient_name || app.patient || 'Patient non spécifié'}</p>
                        <span className="badge badge-warning">En attente</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {app.date ? new Date(app.date).toLocaleDateString('fr-FR') : 'Date non spécifiée'} 
                        {app.time ? ` à ${app.time}` : ''}
                      </p>
                      {app.motif && <p className="text-xs text-gray-500 mt-1">{app.motif}</p>}
                      <div className="flex space-x-2 mt-2">
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handleValidateAppointment(app.id)}
                        >
                          Accepter
                        </button>
                        <button 
                          className="btn btn-sm btn-warning"
                          onClick={() => handleRescheduleAppointment(app.id)}
                        >
                          Reporter
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleRejectAppointment(app.id)}
                        >
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic text-center py-4">Aucune demande en attente</p>
                )}
                {appointments.filter(app => app.status === 'pending').length === 0 && (
                  <p className="text-gray-500 italic text-center py-4">Aucune demande en attente</p>
                )}
              </div>
            </div>

            {/* Patient Statistics Chart */}
            <div className="dashboard-card p-6">
              <h2 className="section-title mb-4">
                <FaChartBar className="text-teal-600" />
                Évolution des patients
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generatePatientData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="patients" 
                      stroke="#0d9488" 
                      name="Patients" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Appointment Stats */}
            <div className="dashboard-card p-6">
              <h2 className="section-title mb-4">
                <FaCalendar className="text-teal-600" />
                Statistiques des rendez-vous
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={appointmentStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {appointmentStats.map((entry, index) => (
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

export default DonezoMedecinDashboard;