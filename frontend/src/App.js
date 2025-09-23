import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Accueil from "./pages/Accueil";
import Cliniques from "./pages/Cliniques";
import Dentistes from "./pages/Dentistes";
import Hopitaux from "./pages/Hopitaux";
import Pharmacie from "./pages/Pharmacie";  // ✅ un seul import
import QuiSommeNous from "./pages/QuiSommeNous";
import MedecinSpecialiste from "./pages/MedecinSpecialiste";
import MedecinGeneraliste from "./pages/MedecinGeneraliste";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "leaflet/dist/leaflet.css"; // ✅ CSS leaflet
import Connecter from "./components/Connecter";
import InterfacePatient from "./components/InterfacePatient";
import InterfaceMedecin from "./components/InterfaceMedecin";
import InterfaceAdmin from "./components/InterfaceAdmin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Accueil />} />
          <Route path="cliniques" element={<Cliniques />} />
          <Route path="dentistes" element={<Dentistes />} />
          <Route path="hopitaux" element={<Hopitaux />} />
          <Route path="pharmacie" element={<Pharmacie />} /> {/* ✅ route pharmacie */}
          <Route path="qui_sommes_nous" element={<QuiSommeNous />} />
          <Route path="medecin_specialiste" element={<MedecinSpecialiste />} />
          <Route path="medecin_generaliste" element={<MedecinGeneraliste />} />
        </Route>

        <Route path="connecter" element={<Connecter />} />
        <Route path="interface_patient" element={<InterfacePatient />} />
        <Route path="interface_medecin" element={<InterfaceMedecin />} />
        <Route path="interface_admin" element={<InterfaceAdmin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
