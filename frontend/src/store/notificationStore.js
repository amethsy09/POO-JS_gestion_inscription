import { showNotification } from "../components/notifications/notification.js";

class NotificationService {
  constructor(storage = localStorage) {
    this.storage = storage;
    this.STORAGE_KEY = "notifications";
  }

  /**
   * Stocke une notification à afficher
   * @param {string} message - Le message à afficher
   * @param {string} [type="success"] - Le type de notification (success, error, warning, info)
   */
  set(message, type = "success") {
    try {
      this.storage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({ message, type })
      );
    } catch (error) {
      console.error("Erreur lors du stockage de la notification:", error);
    }
  }

  /**
   * Affiche et nettoie les notifications stockées
   */
  handle() {
    try {
      const data = this.storage.getItem(this.STORAGE_KEY);
      if (!data) return;

      const { message, type } = JSON.parse(data);
      showNotification(message, type);
      this.clear();
    } catch (error) {
      console.error("Erreur lors du traitement des notifications:", error);
      this.clear();
    }
  }

  /**
   * Supprime les notifications stockées
   */
  clear() {
    this.storage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Méthode rapide pour afficher une notification success
   * @param {string} message 
   */
  success(message) {
    this.set(message, "success");
  }

  /**
   * Méthode rapide pour afficher une notification error
   * @param {string} message 
   */
  error(message) {
    this.set(message, "error");
  }

  /**
   * Méthode rapide pour afficher une notification warning
   * @param {string} message 
   */
  warning(message) {
    this.set(message, "warning");
  }

  /**
   * Méthode rapide pour afficher une notification info
   * @param {string} message 
   */
  info(message) {
    this.set(message, "info");
  }
}

// Singleton exporté
export const notificationService = new NotificationService();

// Factory pour les tests
export const createNotificationService = (storage) => new NotificationService(storage);