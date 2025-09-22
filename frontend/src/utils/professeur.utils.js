import { createResponsiveAttacheHeader } from "../components/header/header.js";
import { createSidebar, setActiveLink } from "../components/sidebar/sidebar.js";
import { navigateTo } from "../router/router.js";

class ProfesseurInterface {
  constructor(user) {
    this.user = user;
    this.sidebarConfig = {
      logo: {
        icon: "ri-graduation-cap-fill",
        text: "Ecole 221"
      },
      links: [
        {
          text: "Dashboard",
          path: "/frontend/pages/professeur/dashboard.html",
          icon: "ri-home-3-line"
        },
        {
          text: "Mes cours",
          path: "/frontend/pages/professeur/cours.html",
          icon: "ri-archive-line"
        },
        {
          text: "Mes absences",
          path: "/frontend/pages/professeur/absence.html",
          icon: "ri-group-3-line"
        }
      ]
    };
  }

  /**
   * Initialise la sidebar du professeur
   */
  initSidebar() {
    const sidebar = createSidebar({
      ...this.sidebarConfig,
      user: {
        avatar: this.user.avatar,
        role: this.user.nom,
        name: this.user.prenom
      },
      onNavigate: (path) => this.handleNavigation(path)
    });

    const container = document.getElementById("sidebar-container");
    this.clearContainer(container);
    container.appendChild(sidebar);
    setActiveLink(window.location.pathname);
  }

  /**
   * Initialise le header du professeur
   * @param {string} currentPage - Page courante
   */
  initHeader(currentPage = "Dashboard") {
    const header = createResponsiveAttacheHeader({
      currentPage,
      userName: this.user.prenom,
      notificationCount: this.calculateNotificationCount()
    });

    const container = document.getElementById("header");
    this.clearContainer(container);
    container.appendChild(header);
  }

  /**
   * Gère la navigation
   * @param {string} path - Chemin de destination
   */
  handleNavigation(path) {
    navigateTo(path);
    setActiveLink(path);
  }

  /**
   * Met à jour l'interface avec un nouvel utilisateur
   * @param {object} newUser - Nouvel utilisateur
   */
  updateUser(newUser) {
    this.user = newUser;
    this.initSidebar();
    this.initHeader();
  }

  /**
   * Calcule le nombre de notifications
   * @returns {number}
   */
  calculateNotificationCount() {
    // Implémentation par défaut - peut être surchargée
    return 2;
  }

  /**
   * Vide un conteneur DOM
   * @param {HTMLElement} container 
   */
  clearContainer(container) {
    if (!container) {
      console.error("Conteneur introuvable");
      return;
    }
    container.innerHTML = "";
  }
}

// Factory function pour créer une instance
export function createProfesseurInterface(user) {
  return new ProfesseurInterface(user);
}