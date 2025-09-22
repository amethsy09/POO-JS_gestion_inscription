import { apiService } from "./api.js";

class AuthService {
  constructor(apiService) {
    this.api = apiService;
  }

  /**
   * Authentifie un utilisateur
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe de l'utilisateur
   * @returns {Promise<object>} - L'utilisateur authentifié
   * @throws {Error} - Si l'authentification échoue
   */
  async login(email, password) {
    try {
      const users = await this.api.fetchData("utilisateurs");
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        throw new Error("Identifiants incorrects");
      }

      return user;
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      throw new Error("Échec de la connexion: " + error.message);
    }
  }

  /**
   * Déconnecte l'utilisateur (méthode vide pour l'extension future)
   */
  logout() {
    // Peut être étendu pour gérer la déconnexion
    console.log("Utilisateur déconnecté");
  }

  /**
   * Vérifie si un utilisateur existe avec cet email
   * @param {string} email - Email à vérifier
   * @returns {Promise<boolean>}
   */
  async checkEmailExists(email) {
    const users = await this.api.fetchData("utilisateurs");
    return users.some(u => u.email === email);
  }
}

// Instance singleton exportée
export const authService = new AuthService(apiService);