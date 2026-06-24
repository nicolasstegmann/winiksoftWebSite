(function () {
  "use strict";

  // ── EmailJS credentials ──────────────────────────────────────────────────
  const EMAILJS_PUBLIC_KEY  = "JLY_ts8i9XgQgfyHO";       // Account > API Keys
  const EMAILJS_SERVICE_ID  = "winiksoft";                // Email Services
  const EMAILJS_TEMPLATE_ID = "recruiting_web_winiksoft"; // Email Templates — crear en EmailJS
  // ─────────────────────────────────────────────────────────────────────────

  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  const form     = document.getElementById("formularioRecruiting");
  const loading  = form.querySelector(".loading");
  const errorMsg = form.querySelector(".error-message");
  const sentMsg  = form.querySelector(".sent-message");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    loading.classList.add("d-block");
    errorMsg.classList.remove("d-block");
    sentMsg.classList.remove("d-block");

    const templateParams = {
      nombre:   form.nombre.value,
      email:    form.email.value,
      linkedin: form.linkedin.value,
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(function () {
        loading.classList.remove("d-block");
        sentMsg.classList.add("d-block");
        form.reset();
        form.classList.remove("was-validated");
      })
      .catch(function (error) {
        loading.classList.remove("d-block");
        errorMsg.innerHTML = "Error al enviar el mensaje. Por favor intentá nuevamente.";
        errorMsg.classList.add("d-block");
        console.error("EmailJS error:", error);
      });
  });
})();
