export class ApiService {
  constructor(baseUrl = "http://localhost:3000") {
    this.API_BASE_URL = baseUrl;
  }

  /**
   * Récupère des données depuis l'API
   * @param {string} endpoint - Le point de terminaison API
   * @param {string|number} [id] - ID optionnel pour une ressource spécifique
   * @returns {Promise<any>} - Les données JSON
   * @throws {Error} - Si la requête échoue
   */
  async fetchData(endpoint, id = "") {
    try {
      const url = id 
        ? `${this.API_BASE_URL}/${endpoint}/${id}`
        : `${this.API_BASE_URL}/${endpoint}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération des ${endpoint}:`, error);
      throw new Error(`Échec de la récupération des données: ${error.message}`);
    }
  }

  /**
   * Génère un nouvel ID unique pour un endpoint
   * @param {string} endpoint - Le point de terminaison API
   * @returns {Promise<number>} - Le nouvel ID
   * @throws {Error} - Si la génération échoue
   */
  async generateId(endpoint) {
    try {
      const data = await this.fetchData(endpoint);
      
      if (!Array.isArray(data)) {
        throw new Error(`Les données reçues ne sont pas un tableau pour ${endpoint}`);
      }

      // Trouve l'ID maximum existant et incrémente
      const maxId = data.reduce((max, item) => {
        const currentId = parseInt(item.id);
        return currentId > max ? currentId : max;
      }, 0);

      return maxId + 1;
    } catch (error) {
      console.error(`Erreur lors de la génération d'ID pour ${endpoint}:`, error);
      throw new Error(`Échec de la génération d'ID: ${error.message}`);
    }
  }

  /**
   * Fonction utilitaire pour les requêtes POST/PUT/PATCH
   * @param {string} endpoint - Point de terminaison
   * @param {object} data - Données à envoyer
   * @param {string} [method="POST"] - Méthode HTTP
   * @returns {Promise<any>} - Réponse JSON
   */
  async sendData(endpoint, data, method = "POST") {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Erreur ${method} sur ${endpoint}:`, error);
      throw new Error(`Échec de l'opération: ${error.message}`);
    }
  }

  // Méthodes spécifiques par verbe HTTP pour une meilleure sémantique
  async post(endpoint, data) {
    return this.sendData(endpoint, data, "POST");
  }

  async put(endpoint, id, data) {
    return this.sendData(`${endpoint}/${id}`, data, "PUT");
  }

  async patch(endpoint, id, data) {
    return this.sendData(`${endpoint}/${id}`, data, "PATCH");
  }

  async delete(endpoint, id) {
    try {
      const response = await fetch(`${this.API_BASE_URL}/${endpoint}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      // Pour DELETE, on ne retourne pas toujours du JSON
      return response.status === 204 ? null : await response.json();
    } catch (error) {
      console.error(`Erreur DELETE sur ${endpoint}:`, error);
      throw new Error(`Échec de la suppression: ${error.message}`);
    }
  }
}

// Exportation d'une instance par défaut
export const apiService = new ApiService();