import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from "./components/Layout";
import Accueil from "./pages/Accueil";
import Cliniques from "./pages/Public/Cliniques";
import Dentistes from "./pages/Public/Dentistes";
import Hopitaux from "./pages/Public/Hopitaux";
import Pharmacie from "./pages/Public/Pharmacies";
import QuiSommeNous from "./pages/QuiSommeNous";
import MedecinSpecialiste from "./pages/MedecinSpecialiste";
import MedecinGeneraliste from "./pages/MedecinGeneraliste";
import RendezVous from "./pages/RendezVous";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "leaflet/dist/leaflet.css";
import Connecter from "./components/Connecter";
import Inscrire from "./components/Inscrire";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./components/Unauthorized";

// Test Components (removed for cleanup)

// Patient Dashboard Components
import DashboardPatient from "./pages/Patient/DashboardPatient";
import EnhancedDashboardPatientV2 from "./pages/Patient/EnhancedDashboardPatientV2";
import Notifications from "./pages/Patient/Notifications";

import RendezVousPatient from "./pages/Patient/RendezVous";
import PriseDeRendezVous from "./pages/Patient/PriseDeRendezVous";
import DossierMedical from "./pages/Patient/DossierMedical";
import DocumentPartage from "./pages/Patient/DocumentPartage"; // Added DocumentPartage
import ProfilePatient from "./pages/Patient/Profile";
import BoiteMessagesPatient from "./pages/Patient/BoiteMessages";
import MedicationReminders from "./pages/Patient/MedicationReminders"; // Added medication reminders
import LocaliserCentres from "./pages/Patient/LocaliserCentres"; // Added LocaliserCentres
import ValiderRendezVous from "./pages/Patient/ValiderRendezVous"; // Added ValiderRendezVous
import MessageriePatient from "./pages/Patient/Messagerie"; // Added patient messaging

// Medecin Dashboard Components
import DashboardMedecin from "./pages/Medecin/DashboardMedecin";
import EnhancedDashboardMedecinV2 from "./pages/Medecin/EnhancedDashboardMedecinV2";

import DossiersMedecin from "./pages/Medecin/Dossiers";
import DossiersPatients from "./pages/Medecin/DossiersPatients";
import DocumentPartageMedecin from "./pages/Medecin/DocumentPartage"; // Added DocumentPartage for doctors
import RendezVousMedecin from "./pages/Medecin/RendezVous";
import DisponibilitesMedecin from "./pages/Medecin/Disponibilites";
import NotificationsMedecin from "./pages/Medecin/Notifications";
import ProfileMedecin from "./pages/Medecin/Profile";
import PatientsList from "./pages/Medecin/PatientsList"; // Added PatientsList
import MessagerieMedecin from "./pages/Medecin/Messagerie"; // Added doctor messaging

// Admin Dashboard Components
import DashboardAdmin from "./pages/Admin/DashboardAdmin";
import EnhancedDashboardAdminV2 from "./pages/Admin/EnhancedDashboardAdminV2";
import UtilisateursAdmin from "./pages/Admin/Utilisateurs";
import MedecinsAdmin from "./pages/Admin/Medecins";
import MedecinsSpecialiteAdmin from "./pages/Admin/MedecinsSpecialite";
import SecretairesAdmin from "./pages/Admin/Secretaires";
import PatientsAdmin from "./pages/Admin/Patients";
import SpecialiteAdmin from "./pages/Admin/Specialite";
import MessagesAdmin from "./pages/Admin/Messages";
import MessagerieMonitoring from "./pages/Admin/MessagerieMonitoring"; // Added messaging monitoring
import AppointmentManagement from "./pages/Admin/AppointmentManagement";

// Article Components
import ArticlesPublics from "./pages/Public/Articles"; // Updated extension
import ArticleDetail from "./pages/Public/ArticleDetail"; // Updated extension
import MesArticles from "./pages/Medecin/MesArticles";
import ArticleForm from "./pages/Medecin/ArticleForm";
import ArticlesModeration from "./pages/Admin/ArticlesModeration";

// Urgence Components
import UrgenceSOS from "./pages/Patient/UrgenceSOS";
import UrgencesDashboard from "./pages/Medecin/UrgencesDashboard";

// Policy Components
import PolitiqueConfidentialite from "./pages/Public/PolitiqueConfidentialite"; // Updated extension
import LocaliserServices from "./pages/Public/LocaliserServices"; // Added visitor localization
import SearchResults from "./pages/Public/SearchResults"; // Added search results

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <ToastContainer />
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Accueil />} />
              <Route path="cliniques" element={<Cliniques />} />
              <Route path="dentistes" element={<Dentistes />} />
              <Route path="hopitaux" element={<Hopitaux />} />
              <Route path="pharmacie" element={<Pharmacie />} />
              <Route path="qui_sommes_nous" element={<QuiSommeNous />} />
              <Route
                path="medecin_specialiste"
                element={<MedecinSpecialiste />}
              />
              <Route
                path="medecin_generaliste"
                element={<MedecinGeneraliste />}
              />
              <Route path="rendez_vous" element={<RendezVous />} />
              {/* Article Routes */}
              <Route path="articles" element={<ArticlesPublics />} />
              <Route path="articles/:slug" element={<ArticleDetail />} />
              {/* Visitor Routes */}
              <Route
                path="localiser-services"
                element={<LocaliserServices />}
              />
              <Route path="search" element={<SearchResults />} />
            </Route>
            <Route path="connecter" element={<Connecter />} />
            <Route path="inscrire" element={<Inscrire />} />
            {/* Protected Routes */}
            <Route
              path="/interface_patient/*"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <DashboardPatient />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interface_medecin/*"
              element={
                <ProtectedRoute allowedRoles={["medecin"]}>
                  <DashboardMedecin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interface_admin/*"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <DashboardAdmin />
                </ProtectedRoute>
              }
            />
            {/* Patient Dashboard Routes */}
            <Route
              path="patient/*"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <Routes>
                    <Route index element={<DashboardPatient />} />
                    <Route path="dashboard" element={<DashboardPatient />} />
                    <Route
                      path="dashboard-v2"
                      element={<EnhancedDashboardPatientV2 />}
                    />
                    <Route path="rendez-vous" element={<RendezVousPatient />} />
                    <Route
                      path="prise-rendez-vous"
                      element={<PriseDeRendezVous />}
                    />
                    <Route
                      path="dossier-medical"
                      element={<DossierMedical />}
                    />
                    <Route
                      path="document-partage"
                      element={<DocumentPartage />}
                    />
                    <Route path="profile" element={<ProfilePatient />} />
                    <Route
                      path="boite-email"
                      element={<BoiteMessagesPatient />}
                    />
                    <Route
                      path="medication-reminders"
                      element={<MedicationReminders />}
                    />
                    <Route path="urgence" element={<UrgenceSOS />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="messagerie" element={<MessageriePatient />} />
                    <Route
                      path="localiser-centres"
                      element={<LocaliserCentres />}
                    />
                    <Route
                      path="rendez-vous/:id/valider"
                      element={<ValiderRendezVous />}
                    />
                  </Routes>
                </ProtectedRoute>
              }
            />
            {/* Medecin Dashboard Routes */}
            <Route
              path="medecin/*"
              element={
                <ProtectedRoute allowedRoles={["medecin"]}>
                  <Routes>
                    <Route index element={<DashboardMedecin />} />
                    <Route path="dashboard" element={<DashboardMedecin />} />
                    <Route
                      path="dashboard-v2"
                      element={<EnhancedDashboardMedecinV2 />}
                    />
                    <Route path="dossiers" element={<DossiersMedecin />} />
                    <Route
                      path="dossiers-patients"
                      element={<DossiersPatients />}
                    />
                    <Route
                      path="document-partage"
                      element={<DocumentPartageMedecin />}
                    />
                    <Route path="rendez-vous" element={<RendezVousMedecin />} />
                    <Route
                      path="disponibilites"
                      element={<DisponibilitesMedecin />}
                    />
                    <Route
                      path="notifications"
                      element={<NotificationsMedecin />}
                    />
                    <Route path="profile" element={<ProfileMedecin />} />
                    <Route path="urgences" element={<UrgencesDashboard />} />
                    <Route path="patients" element={<PatientsList />} />
                    <Route
                      path="messagerie"
                      element={<MessagerieMedecin />}
                    />
                    {/* Medecin Article Routes */}
                    <Route path="articles" element={<MesArticles />} />
                    <Route path="articles/nouveau" element={<ArticleForm />} />
                    <Route
                      path="articles/:id/modifier"
                      element={<ArticleForm />}
                    />
                  </Routes>
                </ProtectedRoute>
              }
            />
            {/* Admin Dashboard Routes */}
            <Route
              path="admin/*"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Routes>
                    <Route index element={<DashboardAdmin />} />
                    <Route path="dashboard" element={<DashboardAdmin />} />
                    <Route
                      path="dashboard-v2"
                      element={<EnhancedDashboardAdminV2 />}
                    />
                    <Route path="utilisateurs" element={<UtilisateursAdmin />} />
                    <Route path="medecins" element={<MedecinsAdmin />} />
                    <Route
                      path="medecins-specialite"
                      element={<MedecinsSpecialiteAdmin />}
                    />
                    <Route path="secretaires" element={<SecretairesAdmin />} />
                    <Route path="patients" element={<PatientsAdmin />} />
                    <Route path="specialite" element={<SpecialiteAdmin />} />
                    <Route path="messages" element={<MessagesAdmin />} />
                    <Route
                      path="messagerie-monitoring"
                      element={<MessagerieMonitoring />}
                    />
                    <Route path="appointments" element={<AppointmentManagement />} />
                    {/* Admin Article Routes */}
                    <Route path="articles" element={<ArticlesModeration />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
            {/* Test routes removed for cleanup */}
            <Route path="unauthorized" element={<Unauthorized />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;