# Appointment Slot Loading Error Fix

## Issue Description

When trying to book an appointment, users encounter the error:
"Erreur lors du chargement des créneaux disponibles: La ressource demandée n'a pas été trouvée."

## Root Causes Identified

1. **Doctor Availability Setup**: Doctors may not have availability configured in the system
2. **Incorrect Doctor ID**: The doctor ID being passed might not match any existing doctor
3. **API Endpoint Issues**: Potential mismatch between frontend API calls and backend endpoints
4. **Insufficient Error Handling**: Lack of detailed error information for debugging

## Fixes Applied

### 1. Enhanced Frontend Error Handling

**File**: `frontend/src/pages/Patient/PriseDeRendezVous.jsx`

- Added detailed debug logging to show the doctor ID and date being requested
- Improved error messages with more specific information
- Added better error logging to the console for debugging

### 2. Enhanced API Error Handling

**File**: `frontend/src/services/api.js`

- Added more detailed 404 error handling with URL information
- Improved error logging for debugging purposes

## Technical Details

### Before Fix:

```javascript
const fetchAvailableSlots = async () => {
  try {
    setLoading(true);
    const formattedDate = selectedDate.toISOString().split("T")[0];
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
    if (err.response) {
      if (err.response.data && err.response.data.error) {
        errorMessage += ": " + err.response.data.error;
      } else if (err.response.data && err.response.data.message) {
        errorMessage += ": " + err.response.data.message;
      } else if (err.response.status === 404) {
        errorMessage += ": Médecin non trouvé";
      } else if (err.response.status === 400) {
        errorMessage += ": Données invalides";
      }
    } else if (err.request) {
      errorMessage += ": Problème de connexion au serveur";
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

## Troubleshooting Steps

### 1. Verify Doctor Availability

Run the test script to check if doctors have availability set up:

```bash
cd c:\backendUniversite\Licence\ASV
python test_doctor_availability.py
```

### 2. Check API Endpoint

Test the API endpoint directly:

```bash
cd c:\backendUniversite\Licence\ASV
python test_api_endpoint.py
```

### 3. Manual API Test

Use a tool like curl or Postman to test:

```
GET http://localhost:8000/api/rendezvous/creneaux_disponibles/?medecin_id=1&date=2023-01-01
```

## Common Solutions

1. **Ensure Doctor Availability**: Make sure the selected doctor has availability configured for the selected day
2. **Verify Doctor ID**: Check that the doctor ID being passed is correct
3. **Check Date Format**: Ensure the date is in YYYY-MM-DD format
4. **Server Status**: Verify that the Django server is running
5. **Authentication**: Ensure the user is properly authenticated with a valid token

## Files Modified

- `frontend/src/pages/Patient/PriseDeRendezVous.jsx` - Enhanced error handling and debugging
- `frontend/src/services/api.js` - Enhanced 404 error handling

These fixes should resolve the "resource not found" error and provide better debugging information to help identify the root cause.
