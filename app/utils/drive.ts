import {
    DRIVE_CLIENT_ID,
    DRIVE_CLIENT_SECRET,
    DRIVE_FOLDER_ID,
    DRIVE_REFRESH_TOKEN,
} from "../../constants/google";

// Exchange a refresh token for an access token
async function getAccessTokenFromRefreshToken(): Promise<string> {
  if (!DRIVE_CLIENT_ID || !DRIVE_CLIENT_SECRET || !DRIVE_REFRESH_TOKEN) {
    throw new Error(
      "Drive config missing. Set DRIVE_CLIENT_ID, DRIVE_CLIENT_SECRET and DRIVE_REFRESH_TOKEN in constants/google.ts",
    );
  }

  const body = `client_id=${encodeURIComponent(DRIVE_CLIENT_ID)}&client_secret=${encodeURIComponent(
    DRIVE_CLIENT_SECRET,
  )}&refresh_token=${encodeURIComponent(DRIVE_REFRESH_TOKEN)}&grant_type=refresh_token`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const json = await res.json();
  if (!json.access_token) {
    throw new Error(json.error_description || json.error || "Failed to get access token");
  }
  return json.access_token as string;
}

// Upload a local file URI to Google Drive using multipart upload
export async function uploadFileToDrive(
  fileUri: string,
  filename: string,
  mimeType = "image/jpeg",
) {
  const token = await getAccessTokenFromRefreshToken();

  // Build metadata
  const metadata: any = { name: filename };
  if (DRIVE_FOLDER_ID) metadata.parents = [DRIVE_FOLDER_ID];

  const form = new FormData();
  form.append("metadata", JSON.stringify(metadata));
  // For React Native / Expo, append file as { uri, name, type }
  // `fileUri` should be a local file path (file://...) returned by the camera
  form.append("file", { uri: fileUri, name: filename, type: mimeType } as any);

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // NOTE: do NOT set Content-Type header here; fetch/React Native will set the correct boundary
    },
    body: form as any,
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message || JSON.stringify(json));
  }
  return json;
}

export default uploadFileToDrive;
