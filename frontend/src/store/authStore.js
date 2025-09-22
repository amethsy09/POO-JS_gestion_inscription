class AuthStore {
  constructor(storage = localStorage) {
    this.storage = storage;
    this.CURRENT_USER_KEY = 'currentUser';
  }

  /**
   * Stocke l'utilisateur connecté
   * @param {object} user - L'utilisateur à stocker
   * @throws {Error} Si l'utilisateur est invalide
   */
  setCurrentUser(user) {
    if (!user || !user.id_role) {
      throw new Error('Utilisateur invalide: doit contenir un id_role');
    }

    try {
      this.storage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Erreur de stockage:', error);
      throw new Error('Échec du stockage de l\'utilisateur');
    }
  }

  /**
   * Récupère l'utilisateur connecté
   * @returns {object|null} L'utilisateur ou null
   */
  getCurrentUser() {
    try {
      const userJson = this.storage.getItem(this.CURRENT_USER_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Erreur de lecture:', error);
      return null;
    }
  }

  /**
   * Nettoie la session utilisateur
   */
  clearUser() {
    this.storage.removeItem(this.CURRENT_USER_KEY);
  }

  /**
   * Vérifie si un utilisateur est connecté
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  /**
   * Récupère le rôle de l'utilisateur
   * @returns {number|null} 1: RP, 2: Professeur, 3: Attaché, 4: Étudiant
   */
  getCurrentUserRole() {
    const user = this.getCurrentUser();
    return user ? parseInt(user.id_role) : null;
  }

  /**
   * Vérifie les permissions par rôle
   * @param {number[]} allowedRoles - Rôles autorisés
   * @returns {boolean}
   */
  checkUserRole(allowedRoles = []) {
    const userRole = this.getCurrentUserRole();
    return userRole && allowedRoles.includes(userRole);
  }

  // Helpers spécifiques
  isRP() {
    return this.getCurrentUserRole() === 1;
  }

  isProfessor() {
    return this.getCurrentUserRole() === 2;
  }

  isAttache() {
    return this.getCurrentUserRole() === 3;
  }

  isStudent() {
    return this.getCurrentUserRole() === 4;
  }

  /**
   * Vérifie plusieurs rôles
   * @param {number[]} roles 
   * @returns {boolean}
   */
  hasAnyRole(roles) {
    const userRole = this.getCurrentUserRole();
    return roles.includes(userRole);
  }
}

// Singleton exporté
export const authStore = new AuthStore();

// Alternative pour les tests avec un autre storage
export const createAuthStore = (storage) => new AuthStore(storage);