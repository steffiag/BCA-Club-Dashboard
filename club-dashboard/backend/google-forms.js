import { google } from "googleapis";
import path from "path";

const keyFile = process.env.GOOGLE_CREDS_PATH;

const auth = new google.auth.GoogleAuth({
  keyFile,
  scopes: ["https://www.googleapis.com/auth/forms.responses.readonly"],
});

const forms = google.forms({ version: "v1", auth });

export async function getFormResponses(formId) {
  try {
    const res = await forms.forms.responses.list({ formId });
    return res.data.responses || [];
  } catch (err) {
    console.error("Error fetching form responses:", err);
    return [];
  }
}
