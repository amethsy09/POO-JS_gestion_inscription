import { createResponsiveRPHeader } from "../components/header/headerRp.js";
import { createSidebar, setActiveLink } from "../components/sidebar/sidebar.js";
import { navigateTo } from "../router/router.js";

class RPInterface {
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
          path: "/frontend/src/pages/rp/dashboard.html",
          icon: "ri-home-3-line"
        },
        {
          text: "Gestions classes",
          path: "/frontend/src/pages/rp/classe.html",
          icon: "ri-archive-line"
        },
        {
          text: "Professeurs",
          path: "/frontend/src/pages/rp/professeurs.html",
          icon: "ri-group-3-line"
        },
        {
          text: "Gestion cours",
          path: "/frontend/src/pages/rp/cours.html",
          icon: "ri-megaphone-line"
        }
      ]
    };
  }

  /**
   * Initialise la sidebar RP
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

    const container = this.getContainer("sidebar-container");
    container.innerHTML = "";
    container.appendChild(sidebar);
    this.updateActiveLink();
  }

  /**
   * Initialise le header RP
   * @param {string} currentPage - Page courante
   */
  initHeader(currentPage = "Dashboard") {
    const header = createResponsiveRPHeader({
      currentPage,
      userName: this.user.prenom
    });

    const container = this.getContainer("header");
    container.innerHTML = "";
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
   * Met à jour l'utilisateur courant
   * @param {object} newUser - Nouvel utilisateur
   */
  updateUser(newUser) {
    this.user = newUser;
    this.refreshUI();
  }

  /**
   * Rafraîchit l'interface
   */
  refreshUI() {
    this.initSidebar();
    this.initHeader();
  }

  /**
   * Met à jour le lien actif
   */
  updateActiveLink() {
    setActiveLink(window.location.pathname);
  }

  /**
   * Récupère un conteneur DOM
   * @param {string} id - ID du conteneur
   * @returns {HTMLElement}
   * @throws {Error} Si le conteneur n'existe pas
   */
  getContainer(id) {
    const container = document.getElementById(id);
    if (!container) {
      throw new Error(`Conteneur #${id} introuvable`);
    }
    return container;
  }
}

// Factory pour créer une instance
export function createRPInterface(user) {
  return new RPInterface(user);
}