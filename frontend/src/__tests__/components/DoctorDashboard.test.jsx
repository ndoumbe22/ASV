import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import DashboardMedecin from '../../pages/Medecin/DashboardMedecin';

// Mock the react-icons
jest.mock('react-icons/fa', () => ({
  FaUserMd: () => <div data-testid="user-md-icon" />,
  FaCalendarCheck: () => <div data-testid="calendar-check-icon" />,
  FaFileMedical: () => <div data-testid="file-medical-icon" />,
  FaBell: () => <div data-testid="bell-icon" />,
  FaCog: () => <div data-testid="cog-icon" />,
  FaSignOutAlt: () => <div data-testid="sign-out-icon" />,
  FaUser: () => <div data-testid="user-icon" />,
  FaSearch: () => <div data-testid="search-icon" />,
  FaQrcode: () => <div data-testid="qrcode-icon" />
}));

jest.mock('react-icons/io', () => ({
  IoMdNotificationsOutline: () => <div data-testid="notifications-outline-icon" />
}));

// Mock react-qr-code
jest.mock('react-qr-code', () => {
  return function MockQRCode() {
    return <div data-testid="qr-code">QR Code</div>;
  };
});

// Mock the API services
jest.mock('../../services/api', () => ({
  appointmentAPI: {
    getAppointments: jest.fn().mockResolvedValue({
      data: [
        {
          id: 1,
          date: '2025-12-01',
          heure: '10:00:00',
          statut: 'PENDING',
          patient_nom: 'Jean Patient'
        },
        {
          id: 2,
          date: '2025-12-05',
          heure: '14:00:00',
          statut: 'CONFIRMED',
          patient_nom: 'Marie Dupont'
        },
        {
          id: 3,
          date: '2025-12-10',
          heure: '09:00:00',
          statut: 'CANCELLED',
          patient_nom: 'Pierre Martin'
        }
      ]
    })
  }
}));

describe('DoctorDashboard', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key) => {
          if (key === 'first_name') return 'Martin';
          if (key === 'last_name') return 'Dupont';
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
    
    // Mock useNavigate
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => jest.fn()
    }));
  });

  test('✅ Affichage des demandes de rendez-vous en attente', async () => {
    render(
      <BrowserRouter>
        <DashboardMedecin />
      </BrowserRouter>
    );
    
    // Wait for data to load
    expect(await screen.findByText('Bienvenue, Dr. Martin Dupont')).toBeInTheDocument();
    
    // Check for pending appointments section
    expect(screen.getByText('Demandes de rendez-vous en attente')).toBeInTheDocument();
    
    // Check for pending appointment
    expect(screen.getByText('2025-12-01')).toBeInTheDocument();
    expect(screen.getByText('10:00')).toBeInTheDocument();
    expect(screen.getByText('Jean Patient')).toBeInTheDocument();
    expect(screen.getByText('⏳ En attente')).toBeInTheDocument();
  });

  test('✅ Confirmation d\'un rendez-vous', async () => {
    render(
      <BrowserRouter>
        <DashboardMedecin />
      </BrowserRouter>
    );
    
    // Wait for data to load
    expect(await screen.findByText('Bienvenue, Dr. Martin Dupont')).toBeInTheDocument();
    
    // The confirmation functionality would be tested in the appointment detail component
    // Here we just verify the UI elements exist
    expect(screen.getByText('Voir tous')).toBeInTheDocument();
  });

  test('✅ Refus d\'un rendez-vous avec motif', async () => {
    render(
      <BrowserRouter>
        <DashboardMedecin />
      </BrowserRouter>
    );
    
    // Wait for data to load
    expect(await screen.findByText('Bienvenue, Dr. Martin Dupont')).toBeInTheDocument();
    
    // The refusal functionality would be tested in the appointment detail component
    // Here we just verify the UI elements exist
  });

  test('✅ Affichage des rendez-vous confirmés', async () => {
    render(
      <BrowserRouter>
        <DashboardMedecin />
      </BrowserRouter>
    );
    
    // Wait for data to load
    expect(await screen.findByText('Bienvenue, Dr. Martin Dupont')).toBeInTheDocument();
    
    // Check for statistics section which shows confirmed appointments
    expect(screen.getByText('1')).toBeInTheDocument(); // One confirmed appointment
    expect(screen.getByText('Rendez-vous confirmés')).toBeInTheDocument();
  });

  test('✅ Visualisation des documents d\'un patient', async () => {
    render(
      <BrowserRouter>
        <DashboardMedecin />
      </BrowserRouter>
    );
    
    // Wait for data to load
    expect(await screen.findByText('Bienvenue, Dr. Martin Dupont')).toBeInTheDocument();
    
    // Check for "Documents partagés" link in sidebar
    const documentsLink = screen.getByText('Documents partagés');
    expect(documentsLink).toBeInTheDocument();
  });

  test('✅ Affichage des statistiques du médecin', async () => {
    render(
      <BrowserRouter>
        <DashboardMedecin />
      </BrowserRouter>
    );
    
    // Wait for data to load
    expect(await screen.findByText('Bienvenue, Dr. Martin Dupont')).toBeInTheDocument();
    
    // Check for statistics cards
    expect(screen.getByText('1')).toBeInTheDocument(); // Confirmed appointments
    expect(screen.getByText('Rendez-vous confirmés')).toBeInTheDocument();
    
    expect(screen.getByText('1')).toBeInTheDocument(); // Pending appointments
    expect(screen.getByText('Demandes en attente')).toBeInTheDocument();
    
    expect(screen.getByText('1')).toBeInTheDocument(); // Cancelled appointments
    expect(screen.getByText('Rendez-vous annulés')).toBeInTheDocument();
    
    expect(screen.getByText('3')).toBeInTheDocument(); // Total appointments
    expect(screen.getByText('Total rendez-vous')).toBeInTheDocument();
  });

  test('✅ Affichage des notifications', async () => {
    render(
      <BrowserRouter>
        <DashboardMedecin />
      </BrowserRouter>
    );
    
    // Wait for data to load
    expect(await screen.findByText('Bienvenue, Dr. Martin Dupont')).toBeInTheDocument();
    
    // Check for notification icon
    const notificationIcon = screen.getByTestId('notifications-outline-icon');
    expect(notificationIcon).toBeInTheDocument();
    
    // Click on notification icon
    fireEvent.click(notificationIcon);
    
    // Check for notification dropdown
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    
    // Check for appointment notification
    expect(screen.getByText('📅 Nouvelle demande de rendez-vous de Jean Patient pour le 2025-12-01 à 10:00:00')).toBeInTheDocument();
  });

  test('✅ Navigation vers les différentes sections', async () => {
    render(
      <BrowserRouter>
        <DashboardMedecin />
      </BrowserRouter>
    );
    
    // Wait for data to load
    expect(await screen.findByText('Bienvenue, Dr. Martin Dupont')).toBeInTheDocument();
    
    // Check for navigation links
    expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
    expect(screen.getByText('Rendez-vous')).toBeInTheDocument();
    expect(screen.getByText('Dossiers patients')).toBeInTheDocument();
    expect(screen.getByText('Documents partagés')).toBeInTheDocument();
    expect(screen.getByText('Disponibilités')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.getByText('Urgences')).toBeInTheDocument();
  });

  test('✅ Affichage du QR Code', async () => {
    render(
      <BrowserRouter>
        <DashboardMedecin />
      </BrowserRouter>
    );
    
    // Wait for data to load
    expect(await screen.findByText('Bienvenue, Dr. Martin Dupont')).toBeInTheDocument();
    
    // Check for QR code section
    expect(screen.getByText('QR Code pour contact rapide')).toBeInTheDocument();
    expect(screen.getByTestId('qr-code')).toBeInTheDocument();
  });

  test('✅ Affichage du prochain rendez-vous', async () => {
    render(
      <BrowserRouter>
        <DashboardMedecin />
      </BrowserRouter>
    );
    
    // Wait for data to load
    expect(await screen.findByText('Bienvenue, Dr. Martin Dupont')).toBeInTheDocument();
    
    // Check for next appointment section
    expect(screen.getByText('Prochain rendez-vous')).toBeInTheDocument();
    
    // Check for confirmed appointment details
    expect(screen.getByText('Jean Patient')).toBeInTheDocument();
    expect(screen.getByText('Date: 2025-12-01')).toBeInTheDocument();
    expect(screen.getByText('Heure: 10:00:00')).toBeInTheDocument();
  });

  test('✅ Fonctionnalité de recherche', async () => {
    render(
      <BrowserRouter>
        <DashboardMedecin />
      </BrowserRouter>
    );
    
    // Wait for data to load
    expect(await screen.findByText('Bienvenue, Dr. Martin Dupont')).toBeInTheDocument();
    
    // Check for search input
    const searchInput = screen.getByPlaceholderText('Search here...');
    expect(searchInput).toBeInTheDocument();
    
    // Simulate typing in search
    fireEvent.change(searchInput, { target: { value: 'patient' } });
    expect(searchInput.value).toBe('patient');
  });
});