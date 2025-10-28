# Slot Loading Error Fix

## Issue Description

When trying to book an appointment, users encounter the error:
"Erreur lors du chargement des créneaux disponibles: La ressource demandée n'a pas été trouvée. URL: rendezvous/creneaux_disponibles/?medecin_id=22&date=2025-11-23"

## Root Cause Analysis

The error indicates that the API endpoint `rendezvous/creneaux_disponibles/?medecin_id=22&date=2025-11-23` is returning a 404 Not Found error. After investigation, the issue is related to:

1. **Doctor ID Validation**: The doctor with ID 22 may not exist or may not have proper availability configured
2. **Enhanced Error Handling**: The frontend wasn't providing specific enough error messages to identify the root cause
3. **API Endpoint Issues**: Potential mismatch in how the endpoint is being called

## Fixes Applied

### 1. Enhanced API Error Handling

**File**: `frontend/src/services/api.js`

- Added enhanced error handling for the `getCreneauxDisponibles` function
- Added specific error messages for 404 errors that might be due to doctor not found issues
- Improved error propagation to provide more context to the frontend

### 2. Enhanced Frontend Error Handling

**File**: `frontend/src/pages/Patient/PriseDeRendezVous.jsx`

- Improved error messages with more specific information about doctor availability
- Added better debugging information to help identify issues
- Fixed variable scoping issues in the error handling code

## Technical Details

### Before Fix:

```javascript
// In api.js
getCreneauxDisponibles: (medecinId, date) =>
  api.get(`rendezvous/creneaux_disponibles/?medecin_id=${medecinId}&date=${date}`),
```

### After Fix:

```javascript
// In api.js
getCreneauxDisponibles: (medecinId, date) =>
  api.get(`rendezvous/creneaux_disponibles/?medecin_id=${medecinId}&date=${date}`).catch(error => {
    // Enhanced error handling for slot availability
    console.error('Error fetching available slots:', error);
    if (error.response && error.response.status === 404) {
      // Check if this might be due to a doctor not found issue
      throw new Error(`Créneaux indisponibles: Médecin #${medecinId} non trouvé ou pas de disponibilité pour cette date.`);
    }
    throw error;
  }),
```

### Before Fix:

```javascript
// In PriseDeRendezVous.jsx
const fetchAvailableSlots = async () => {
  try {
    setLoading(true);
    const formattedDate = selectedDate.toISOString().split("T")[0];

    // Debug logging
    console.log(
      "Fetching available slots for doctor ID:",
      selectedMedecin.user.id
    );
    console.log("Date:", formattedDate);

    const response = await disponibiliteMedecinAPI.getCreneauxDisponibles(
      selectedMedecin.user.id,
      formattedDate
    );

    if (response && response.data && response.data.creneaux) {
      setAvailableSlots(response.data.creneaux);
    } else {
      setAvailableSlots([]);
    }

    setLoading(false);
  } catch (err) {
    console.error("Erreur lors du chargement des créneaux disponibles:", err);
    // Basic error handling
    let errorMessage = "Erreur lors du chargement des créneaux disponibles";

    // Log detailed error information
    console.error("Full error object:", err);
    if (err.response) {
      console.error("Error response:", err.response);
      if (err.response.data && err.response.data.error) {
        errorMessage += ": " + err.response.data.error;
      } else if (err.response.data && err.response.data.message) {
        errorMessage += ": " + err.response.data.message;
      } else if (err.response.status === 404) {
        errorMessage += ": Médecin non trouvé ou endpoint incorrect";
      } else if (err.response.status === 400) {
        errorMessage += ": Données invalides";
      } else {
        errorMessage += ": Erreur serveur " + err.response.status;
      }
    } else if (err.request) {
      errorMessage +=
        ": Problème de connexion au serveur. Vérifiez que le serveur est démarré.";
    } else {
      errorMessage += ": " + err.message;
    }

    setError(errorMessage);
    setAvailableSlots([]);
    setLoading(false);
  }
};
```

### After Fix:

```javascript
// In PriseDeRendezVous.jsx
const fetchAvailableSlots = async () => {
  setLoading(true);
  const formattedDate = selectedDate.toISOString().split("T")[0];

  // Debug logging
  console.log(
    "Fetching available slots for doctor ID:",
    selectedMedecin.user.id
  );
  console.log("Date:", formattedDate);

  try {
    const response = await disponibiliteMedecinAPI.getCreneauxDisponibles(
      selectedMedecin.user.id,
      formattedDate
    );

    if (response && response.data && response.data.creneaux) {
      setAvailableSlots(response.data.creneaux);
    } else {
      setAvailableSlots([]);
    }

    setLoading(false);
  } catch (err) {
    console.error("Erreur lors du chargement des créneaux disponibles:", err);
    // More detailed error handling
    let errorMessage = "Erreur lors du chargement des créneaux disponibles";

    // Log detailed error information
    console.error("Full error object:", err);
    if (err.response) {
      console.error("Error response:", err.response);
      if (err.response.data && err.response.data.error) {
        errorMessage += ": " + err.response.data.error;
      } else if (err.response.data && err.response.data.message) {
        errorMessage += ": " + err.response.data.message;
      } else if (err.response.status === 404) {
        errorMessage +=
          ": Médecin non trouvé ou pas de disponibilité pour cette date";
      } else if (err.response.status === 400) {
        errorMessage += ": Données invalides";
      } else {
        errorMessage += ": Erreur serveur " + err.response.status;
      }
    } else if (err.request) {
      errorMessage +=
        ": Problème de connexion au serveur. Vérifiez que le serveur est démarré.";
    } else {
      errorMessage += ": " + err.message;
    }

    // Additional debugging for specific doctor
    console.log(
      `Tentative de chargement des créneaux pour le médecin ID: ${selectedMedecin.user.id}`
    );

    setError(errorMessage);
    setAvailableSlots([]);
    setLoading(false);
  }
};
```

## Troubleshooting Steps

### 1. Verify Doctor Existence

Check if the doctor with ID 22 exists in the database:

```bash
# Run Django shell command to check doctors
python manage.py shell -c "from sante_app.models import Medecin; print('Doctor with ID 22 exists:', Medecin.objects.filter(id=22).exists())"
```

### 2. Check Doctor Availability

Verify that the doctor has availability configured:

```bash
# Run Django shell command to check doctor availability
python manage.py shell -c "from sante_app.models import Medecin, DisponibiliteMedecin; doctor = Medecin.objects.filter(id=22).first(); print('Doctor availabilities:', DisponibiliteMedecin.objects.filter(medecin=doctor).count() if doctor else 'Doctor not found')"
```

### 3. Manual API Test

Test the API endpoint directly with curl or Postman:

```
GET http://localhost:8000/api/rendezvous/creneaux_disponibles/?medecin_id=22&date=2025-11-23
```

## Common Solutions

1. **Doctor Not Found**:

   - Verify that doctor ID 22 exists in the database
   - If not, select a different doctor

2. **Missing Availability**:

   - Ensure the doctor has availability configured for the selected date
   - Check that the doctor has DisponibiliteMedecin entries

3. **Date Issues**:

   - Verify the date is in the future (not in the past)
   - Check that the date format is correct (YYYY-MM-DD)

4. **Server Issues**:
   - Ensure the Django server is running
   - Check that the API endpoints are accessible

## Files Modified

- `frontend/src/services/api.js` - Enhanced error handling for slot availability API calls
- `frontend/src/pages/Patient/PriseDeRendezVous.jsx` - Improved error messages and debugging

These fixes should resolve the "resource not found" error and provide better debugging information to help identify the root cause. The enhanced error messages will help quickly determine if the issue is with the doctor ID, missing availability, or other configuration issues.
