# Google Meet Integration Setup

## Prerequisites

1. **Google Cloud Console Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Google Calendar API

2. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs (e.g., `http://localhost:5000/live-support/oauth2callback`)

## Environment Variables

Add these variables to your `back-end/.env` file:

```env
# Google Calendar API Configuration (Backend)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/live-support/oauth2callback

# Optional: Pre-configured tokens (get these from OAuth flow)
GOOGLE_ACCESS_TOKEN=your_access_token_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

## Initial Setup Steps

1. **Get OAuth Tokens**
   - Start your backend server
   - Make a GET request to `/live-support/auth-url`
   - Visit the returned URL and authorize the application
   - Get the authorization code from the callback
   - Make a POST request to `/live-support/auth-callback` with the code
   - Save the returned tokens to your environment variables

2. **Test the Integration**
   - Use the Live Support page to create a meeting
   - Verify the Google Meet link is generated
   - Check that the event appears in Google Calendar

## Features

- ✅ Create Google Meet events with custom titles and descriptions
- ✅ Set start and end times
- ✅ Add attendees via email
- ✅ Automatic Google Meet link generation
- ✅ View upcoming meetings
- ✅ Delete meetings
- ✅ Email reminders (24 hours and 10 minutes before)
- ✅ Calendar integration

