
class Router {
  constructor() {
    // Initialisation si nécessaire
  }

  init() {
    const user = getCurrentUser();

    if (!user) {
      this.navigateToAndReplace("/frontend/public/index.html");
    }
  }

  setupLogout() {
    clearUser();
    this.navigateToAndReplace("/frontend/public/index.html");
  }

  navigateTo(path) {
    window.location.href = path;
  }

  navigateToAndReplace(path) {
    window.location.replace(path);
  }
}

// Exportation d'une instance unique (singleton)
export const router = new Router();