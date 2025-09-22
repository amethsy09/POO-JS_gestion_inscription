class DOMUtils {
  /**
   * Crée un élément HTML stylisé
   * @param {string} tag - Balise HTML
   * @param {string} classes - Classes CSS
   * @param {string} content - Contenu texte
   * @param {string} src - Attribut src
   * @returns {string} HTML de l'élément
   */
  static createStyledElement(tag, classes, content = "", src = "") {
    const el = document.createElement(tag);
    el.className = classes;
    if (src) el.src = src;
    if (content) el.textContent = content;
    return el.outerHTML;
  }
}

class DateUtils {
  /**
   * Formate une date
   * @param {string} dateString - Date à formater
   * @returns {string} Date formatée
   */
  static format(dateString) {
    if (!dateString) return "Date inconnue";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  }
}

class ColorUtils {
  /**
   * Génère une couleur aléatoire
   * @returns {number} Code couleur
   */
  static getRandom() {
    return Math.floor(Math.random() * 16777215);
  }

  /**
   * Retourne la couleur associée à un état
   * @param {string} state - État
   * @returns {string} Classe CSS
   */
  static forState(state) {
    const stateColors = {
      "planifié": "success",
      "annuler": "warning",
      "archiver": "error",
      "effectué": "info",
    };
    return stateColors[state] || "secondary";
  }

  /**
   * Retourne la couleur associée à un état d'absence
   * @param {string} state - État d'absence
   * @returns {string} Classe CSS
   */
  static forAbsenceState(state) {
    const absenceStateColors = {
      "justifier": "success",
      "en attente": "warning",
    };
    return absenceStateColors[state] || "secondary";
  }
}

class TimeUtils {
  /**
   * Calcule la durée entre deux heures
   * @param {string} startTime - Heure de début (HH:MM)
   * @param {string} endTime - Heure de fin (HH:MM)
   * @returns {number} Durée en heures
   */
  static calculateDuration(startTime, endTime) {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    return (end - start) / (1000 * 60 * 60);
  }
}

class FileUtils {
  /**
   * Traite un fichier uploadé
   * @param {File} file - Fichier à traiter
   * @returns {Promise<object>} Données du fichier
   */
  static async process(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        resolve({
          name: file.name,
          type: file.type,
          size: file.size,
          data: event.target.result.split(",")[1],
        });
      };

      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}

// Export des utilitaires groupés
export const Utils = {
  dom: DOMUtils,
  date: DateUtils,
  color: ColorUtils,
  time: TimeUtils,
  file: FileUtils,
};