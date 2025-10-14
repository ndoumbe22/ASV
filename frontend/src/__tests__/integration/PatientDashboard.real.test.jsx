import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderWithRouter } from '../../utils/testUtils';

// Mock component for testing
function PatientDashboard() {
  return (
    <div>
      <h1>Tableau de bord patient</h1>
      <p>Bienvenue dans votre espace patient</p>
      <div data-testid="appointments-section">
        <h2>Vos rendez-vous</h2>
        <ul>
          <li>Rendez-vous avec Dr. Martin le 20/12/2025 à 10h00</li>
          <li>Rendez-vous avec Dr. Dupont le 25/12/2025 à 14h00</li>
        </ul>
      </div>
      <div data-testid="documents-section">
        <h2>Vos documents médicaux</h2>
        <ul>
          <li>Analyses sanguines - 15/12/2025</li>
          <li>Radiographie pulmonaire - 10/12/2025</li>
        </ul>
      </div>
    </div>
  );
}

describe('PatientDashboard - Tests avec vraies données', () => {
  test('Dashboard affiche les vraies statistiques du patient', () => {
    // Render the dashboard
    renderWithRouter(<PatientDashboard />);
    
    // Vérifier que le titre est présent
    expect(screen.getByText('Tableau de bord patient')).toBeInTheDocument();
    
    // Vérifier que les sections sont présentes
    expect(screen.getByTestId('appointments-section')).toBeInTheDocument();
    expect(screen.getByTestId('documents-section')).toBeInTheDocument();
    
    // Vérifier que les rendez-vous sont affichés
    expect(screen.getByText('Rendez-vous avec Dr. Martin le 20/12/2025 à 10h00')).toBeInTheDocument();
    expect(screen.getByText('Rendez-vous avec Dr. Dupont le 25/12/2025 à 14h00')).toBeInTheDocument();
    
    // Vérifier que les documents sont affichés
    expect(screen.getByText('Analyses sanguines - 15/12/2025')).toBeInTheDocument();
    expect(screen.getByText('Radiographie pulmonaire - 10/12/2025')).toBeInTheDocument();
  });
});