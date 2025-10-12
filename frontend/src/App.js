import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import Accueil from "./pages/Accueil";
import Cliniques from "./pages/Cliniques";
import Dentistes from "./pages/Dentistes";
import Hopitaux from "./pages/Hopitaux";
import Pharmacie from "./pages/Pharmacie";
import QuiSommeNous from "./pages/QuiSommeNous";
import MedecinSpecialiste from "./pages/MedecinSpecialiste";
import MedecinGeneraliste from "./pages/MedecinGeneraliste";
import RendezVous from "./pages/RendezVous";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "leaflet/dist/leaflet.css";
import Connecter from "./components/Connecter";
import Inscrire from "./components/Inscrire";
import InterfacePatient from "./components/InterfacePatient";
import InterfaceMedecin from "./components/InterfaceMedecin";
import InterfaceAdmin from "./components/InterfaceAdmin";
import ProtectedRoute from "./components/ProtectedRoute";

// Test Components
import TestComponent from "./components/TestComponent";
import TestLogin from "./components/TestLogin";

// Patient Dashboard Components
import DashboardPatient from "./pages/Patient/DashboardPatient";
import RendezVousPatient from "./pages/Patient/RendezVous";
import PriseDeRendezVous from "./pages/Patient/PriseDeRendezVous";
import DossierMedical from "./pages/Patient/DossierMedical";
import ProfilePatient from "./pages/Patient/Profile";
import BoiteMessagesPatient from "./pages/Patient/BoiteMessages";
import MedicationReminders from "./pages/Patient/MedicationReminders"; // Added medication reminders

// Medecin Dashboard Components
import DashboardMedecin from "./pages/Medecin/DashboardMedecin";
import DossiersMedecin from "./pages/Medecin/Dossiers";
import DossiersPatients from "./pages/Medecin/DossiersPatients";
import RendezVousMedecin from "./pages/Medecin/RendezVous";
import DisponibilitesMedecin from "./pages/Medecin/Disponibilites";
import NotificationsMedecin from "./pages/Medecin/Notifications";
import ProfileMedecin from "./pages/Medecin/Profile";

// Admin Dashboard Components
import DashboardAdmin from "./pages/Admin/DashboardAdmin";
import UtilisateursAdmin from "./pages/Admin/Utilisateurs";
import MedecinsAdmin from "./pages/Admin/Medecins";
import MedecinsSpecialiteAdmin from "./pages/Admin/MedecinsSpecialite";
import SecretairesAdmin from "./pages/Admin/Secretaires";
import PatientsAdmin from "./pages/Admin/Patients";
import SpecialiteAdmin from "./pages/Admin/Specialite";
import MessagesAdmin from "./pages/Admin/Messages";

// Article Components
import ArticlesPublics from "./pages/Public/Articles";
import ArticleDetail from "./pages/Public/ArticleDetail";
import MesArticles from "./pages/Medecin/MesArticles";
import ArticleForm from "./pages/Medecin/ArticleForm";
import ArticlesModeration from "./pages/Admin/ArticlesModeration";

// Urgence Components
import UrgenceSOS from "./pages/Patient/UrgenceSOS";
import UrgencesDashboard from "./pages/Medecin/UrgencesDashboard";

// Policy Components
import PolitiqueConfidentialite from "./pages/Public/PolitiqueConfidentialite";

function App() {
  return (
    <AuthProvider>
      <Router>
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
          </Route>
          <Route path="connecter" element={<Connecter />} />
          <Route path="inscrire" element={<Inscrire />} />
          <Route path="interface_patient" element={<InterfacePatient />} />
          <Route path="interface_medecin" element={<InterfaceMedecin />} />
          <Route path="interface_admin" element={<InterfaceAdmin />} />
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
          <Route path="patient/dashboard" element={<DashboardPatient />} />
          <Route path="patient/rendez-vous" element={<RendezVousPatient />} />
          <Route
            path="patient/prise-rendez-vous"
            element={<PriseDeRendezVous />}
          />
          <Route path="patient/dossier-medical" element={<DossierMedical />} />
          <Route path="patient/profile" element={<ProfilePatient />} />
          <Route
            path="patient/boite-email"
            element={<BoiteMessagesPatient />}
          />
          <Route
            path="patient/medication-reminders"
            element={<MedicationReminders />}
          />
          <Route path="patient/urgence" element={<UrgenceSOS />} />

          {/* Medecin Dashboard Routes */}
          <Route path="medecin/dashboard" element={<DashboardMedecin />} />
          <Route path="medecin/dossiers" element={<DossiersMedecin />} />
          <Route
            path="medecin/dossiers-patients"
            element={<DossiersPatients />}
          />
          <Route path="medecin/rendez-vous" element={<RendezVousMedecin />} />
          <Route
            path="medecin/disponibilites"
            element={<DisponibilitesMedecin />}
          />
          <Route
            path="medecin/notifications"
            element={<NotificationsMedecin />}
          />
          <Route path="medecin/profile" element={<ProfileMedecin />} />
          <Route path="medecin/urgences" element={<UrgencesDashboard />} />

          {/* Medecin Article Routes */}
          <Route path="medecin/articles" element={<MesArticles />} />
          <Route path="medecin/articles/nouveau" element={<ArticleForm />} />
          <Route
            path="medecin/articles/:id/modifier"
            element={<ArticleForm />}
          />
          {/* Admin Dashboard Routes */}
          <Route path="admin/dashboard" element={<DashboardAdmin />} />
          <Route path="admin/utilisateurs" element={<UtilisateursAdmin />} />
          <Route path="admin/medecins" element={<MedecinsAdmin />} />
          <Route
            path="admin/medecins-specialite"
            element={<MedecinsSpecialiteAdmin />}
          />
          <Route path="admin/secretaires" element={<SecretairesAdmin />} />
          <Route path="admin/patients" element={<PatientsAdmin />} />
          <Route path="admin/specialite" element={<SpecialiteAdmin />} />
          <Route path="admin/messages" element={<MessagesAdmin />} />
          {/* Admin Article Routes */}
          <Route path="admin/articles" element={<ArticlesModeration />} />
          <Route path="test" element={<TestComponent />} />
          <Route path="test-login" element={<TestLogin />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
