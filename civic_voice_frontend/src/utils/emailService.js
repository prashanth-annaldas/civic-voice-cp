import emailjs from "@emailjs/browser";

/**
 * Sends a civic request email using EmailJS.
 * This function is designed to be non-blocking for the main UI flow.
 * 
 * @param {Object} params - The template parameters.
 * @param {string} params.userEmail - The email of the user making the request.
 * @param {string} params.description - The description of the request.
 * @param {number} params.lat - Latitude of the location.
 * @param {number} params.lng - Longitude of the location.
 * @returns {Promise<boolean>} - Returns true if the email was sent successfully, false otherwise.
 */
export const sendCivicRequestEmail = async ({ userEmail, description, lat, lng, imageBase64 }) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.error("EmailJS credentials are missing in environment variables.");
    return false;
  }

  const templateParams = {
    name: userEmail.split("@")[0] || "User",
    email: userEmail,
    time: new Date().toLocaleString(),

    message: `Location: Lat ${lat}, Lng ${lng}\n\nDetails: ${description}`,
    image_base64: imageBase64 || "", // pass base64 image to template
  };

  try {
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );
    console.log("EmailJS Success:", response.status, response.text);
    return true;
  } catch (err) {
    console.error("EmailJS Error:", err);
    // Non-blocking: we log the error but allow the application to proceed.
    return false;
  }
};
