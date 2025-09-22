import { showNotification } from "../components/notifications/notification.js";
import { router } from "../router/router.js";
import { authService } from "../services/authServices.js";
import { authStore } from "../store/authStore.js";

class LoginController {
  constructor() {
    this.init();
    this.authService = authService;
    this.router = router;
    this.authStore = authStore;
  }

  init() {
    document.addEventListener("DOMContentLoaded", () => {
      this.form = document.querySelector("#loginForm");
      this.form.addEventListener("submit", (event) => this.handleSubmit(event));
    });
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    if (!this.validateForm()) {
      return;
    }

    try {
      const email = document.querySelector("#email").value;
      const password = document.querySelector("#password").value;
      
      const user = await this.authService.login(email, password);
      this.handleLoginSuccess(user);
    } catch (error) {
      this.handleLoginError(error);
    }
  }

  validateForm() {
    let isValid = true;
    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const errorEmail = document.getElementById("errorEmail");
    const errorPassword = document.getElementById("errorPassword");

    errorEmail.textContent = "";
    errorPassword.textContent = "";

    if (!email) {
      errorEmail.textContent = "L'email est requis";
      errorEmail.classList.add("text-red-500");
      isValid = false;
    }
    
    if (!password) {
      errorPassword.textContent = "Le mot de passe est requis";
      errorPassword.classList.add("text-red-500");
      isValid = false;
    }

    return isValid;
  }

  handleLoginSuccess(user) {
    authStore.setCurrentUser(user);
    showNotification("Connexion réussie avec succès");
    router.navigateTo(this.getDashboardPath(user.id_role));
  }

  handleLoginError(error) {
    console.log(error.message);
    showNotification(error.message, "error");
  }

  getDashboardPath(roleId) {
    const paths = {
      1: "/frontend/src/pages/rp/dashboard.html",
      2: "/frontend/src/pages/professeurs/gestion-absences.html",
      3: "/frontend/src/pages/attache/attache.html",
      4: "/frontend/src/pages/etudiant/etudiant.html",
    };
    return paths[roleId] || "/index.html";
  }
}

// Instanciation du contrôleur
new LoginController();