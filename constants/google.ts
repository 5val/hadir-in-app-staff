// Put your Google Maps / Places API key here.
// To enable search & place details you'll need to create an API key and
// enable the Places API and Maps SDK for Android/iOS in Google Cloud Console.
// Example: export const GOOGLE_MAPS_API_KEY = 'AIza...';
export const GOOGLE_MAPS_API_KEY = "AIzaSyCrafjahZxZsTsdw_BVgBrNQW8IuWFRDdw";

// NOTE: For security, do not commit production API keys. Prefer using
// environment variables or secure storage in production builds.

// Google Drive uploads (OAuth2). To enable Drive uploads:
// 1. Create an OAuth 2.0 Client ID in Google Cloud Console (Desktop or Other).
// 2. Obtain a refresh token (e.g. via OAuth playground) and place it below.
// 3. Optionally set a target folder ID in DRIVE_FOLDER_ID.
// WARNING: Embedding client secrets/refresh tokens in a mobile app is insecure
// for production. Prefer using a backend to perform uploads.
export const DRIVE_CLIENT_ID = "YOUR_DRIVE_CLIENT_ID";
export const DRIVE_CLIENT_SECRET = "YOUR_DRIVE_CLIENT_SECRET";
export const DRIVE_REFRESH_TOKEN = "YOUR_DRIVE_REFRESH_TOKEN";
export const DRIVE_FOLDER_ID = ""; // optional: Google Drive folder ID to put files in
