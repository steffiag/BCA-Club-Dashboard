import { getFormResponses } from "./google-forms.js";

const formId = "1K2a3Akdr75XpojqzEyMLBP9IHx4fS6lMZYtRps-ngZo";

(async () => {
  const responses = await getFormResponses(formId);
  console.log(responses);
})();
