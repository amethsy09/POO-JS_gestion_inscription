import { apiService } from "./api.js";

class UserService {
  constructor(apiService) {
    this.api = apiService;
  }

  /**
   * Crée un nouvel utilisateur
   * @param {object} userData - Données de l'utilisateur
   * @returns {Promise<object>} - L'utilisateur créé
   */
  async create(userData) {
    try {
      this.validateUserData(userData);
      
      if (await this.checkEmailExists(userData.email)) {
        throw new Error("Cet email est déjà utilisé");
      }

      const newUser = {
        id: String(await this.api.generateId("utilisateurs")),
        state: "disponible",
        avatar: userData.avatar || "https://via.placeholder.com/150",
        ...userData
      };

      return await this.api.post("utilisateurs", newUser);
    } catch (error) {
      console.error("Erreur création utilisateur:", error);
      throw new Error(`Échec de la création: ${error.message}`);
    }
  }

  /**
   * Met à jour un utilisateur existant
   * @param {string} id - ID de l'utilisateur
   * @param {object} userData - Données à mettre à jour
   * @returns {Promise<object>} - L'utilisateur mis à jour
   */
  async update(id, userData) {
    try {
      if (userData.email) {
        throw new Error("La modification d'email n'est pas autorisée");
      }

      return await this.api.patch(`utilisateurs/${id}`, userData);
    } catch (error) {
      console.error("Erreur modification utilisateur:", error);
      throw new Error(`Échec de la modification: ${error.message}`);
    }
  }

  /**
   * Vérifie si un email existe déjà
   * @param {string} email - Email à vérifier
   * @returns {Promise<boolean>} - True si existe
   */
  async checkEmailExists(email) {
    const users = await this.api.fetchData("utilisateurs");
    return users.some(user => 
      user.email.toLowerCase() === email.toLowerCase()
    );
  }

  /**
   * Vérifie si un matricule existe déjà
   * @param {string} matricule - Matricule à vérifier
   * @returns {Promise<boolean>} - True si existe
   */
  async checkMatriculeExists(matricule) {
    const etudiants = await this.api.fetchData("etudiants");
    return etudiants.some(etudiant =>
      etudiant.matricule.toLowerCase() === matricule.toLowerCase()
    );
  }

  /**
   * Récupère un utilisateur par son email
   * @param {string} email - Email de l'utilisateur
   * @returns {Promise<object|null>} - L'utilisateur ou null
   */
  async getByEmail(email) {
    const users = await this.api.fetchData("utilisateurs");
    return users.find(user => 
      user.email.toLowerCase() === email.toLowerCase()
    ) || null;
  }

  /**
   * Récupère un utilisateur par son ID
   * @param {string} id - ID de l'utilisateur
   * @returns {Promise<object|null>} - L'utilisateur ou null
   */
  async getById(id) {
    try {
      return await this.api.fetchData(`utilisateurs/${id}`);
    } catch (error) {
      if (error.message.includes("404")) return null;
      throw error;
    }
  }

  /**
   * Change le statut d'un utilisateur
   * @param {string} id - ID de l'utilisateur
   * @param {string} state - Nouveau statut
   * @returns {Promise<object>} - Utilisateur modifié
   */
  async changeState(id, state) {
    return this.update(id, { state });
  }

  // Méthodes privées
  validateUserData(userData) {
    if (!userData.email || !userData.password || !userData.id_role) {
      throw new Error("Email, password et role sont obligatoires");
    }
  }
}

// Instance singleton exportée
export const userService = new UserService(apiService);