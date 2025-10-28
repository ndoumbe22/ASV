# Teleconsultation Setup Guide

This guide explains how to properly configure teleconsultation functionality in the application.

## Current Status

✅ **Teleconsultation is now fully configured!**

- App ID: 4ad7f917dc0c494199965623c7073193
- App Certificate: 8cb2c246f17442808d709dd6eb9ef38f
- Using secure token authentication

## Prerequisites

1. An Agora.io account (https://www.agora.io/)
2. Agora App ID (already configured: 4ad7f917dc0c494199965623c7073193)
3. Agora App Certificate (already configured: 8cb2c246f17442808d709dd6eb9ef38f)

## Setup Steps

### 1. Configure Backend

Your backend is already configured with both App ID and Certificate in the `Sante_Virtuelle/.env` file:

```env
# Agora.io credentials for teleconsultation
# App ID: 4ad7f917dc0c494199965623c7073193
# App Certificate: 8cb2c246f17442808d709dd6eb9ef38f
AGORA_APP_ID=4ad7f917dc0c494199965623c7073193
AGORA_APP_CERTIFICATE=8cb2c246f17442808d709dd6eb9ef38f
```

### 2. Configure Frontend

The frontend is already configured with your App ID: 4ad7f917dc0c494199965623c7073193

### 3. Install Required Packages

Make sure the following packages are installed:

Backend:

```bash
pip install agora-token-builder
```

Frontend:

```bash
npm install agora-rtc-sdk-ng
```

### 4. Restart Services

After configuration, restart both the backend and frontend services.

## Troubleshooting

### Common Issues

1. **"Agora credentials not configured" error**

   - Check that both `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE` are set in the backend `.env` file
   - Ensure there are no extra spaces or quotes around the values

2. **"Agora token builder not available" error**
   - Make sure `agora-token-builder` is installed in the Python environment
   - Run `pip install agora-token-builder`

### Testing

1. Create a consultation as a doctor
2. As a patient, navigate to the consultations list
3. Click on the "Téléconsultation" button for today's scheduled consultation
4. You should be taken to the waiting room
5. Click "Créer la téléconsultation" if it's your first time
6. Click "Rejoindre la téléconsultation" to enter the video call

## Security Notes

- Never commit your actual Agora credentials to version control
- Use environment variables to store sensitive information
- The Agora certificate should be kept secret and only used on the backend
- Both App ID and App Certificate are now properly configured for secure authentication
