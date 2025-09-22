import { createModal } from "../../components/modals/modal.js";
import { justificationActionConfigs } from "../../config/config.js";
import { updateJustificationStatus } from "../../services/justificationService.js";

export function getNewStatus(action) {
  const statusMap = {
    accepter: "validée",
    refuser: "rejetée",
    annuler: "en attente",
  };

  if (!statusMap[action]) {
    throw new Error(`Action non reconnue: ${action}`);
  }

  return statusMap[action];
}

export async function getStatutsJustification() {
  return ["en attente", "validée", "rejetée"];
}

/**
 * Crée et affiche un modal de confirmation
 * @param {Object} config - Configuration du modal
 * @param {string} config.title - Titre du modal
 * @param {string} config.content - Contenu principal
 * @param {string} config.confirmText - Texte du bouton de confirmation
 * @param {string} config.confirmClass - Classes CSS pour le bouton de confirmation
 * @param {Function} config.onConfirm - Callback lors de la confirmation
 * @param {string} [config.cancelText="Annuler"] - Texte du bouton d'annulation
 * @returns {HTMLElement} Le modal créé
 */
export function showConfirmationModal(config) {
  const {
    title,
    content,
    confirmText,
    confirmClass = "",
    onConfirm,
    cancelText = "Annuler",
  } = config;

  const modalContent = document.createElement("div");
  modalContent.className = "text-center";
  modalContent.innerHTML = `
    <p class="mb-6">${content}</p>
    <div class="flex justify-center gap-4">
      <button id="confirm-action" class="btn ${confirmClass}">
        ${confirmText}
      </button>
      <button id="cancel-action" class="btn btn-ghost">
        ${cancelText}
      </button>
    </div>
  `;

  const modal = createModal({
    id: `confirm-modal-${Math.random().toString(36).substr(2, 9)}`,
    title,
    content: modalContent,
    showCloseButton: true,
  });

  document.body.appendChild(modal);
  modal.showModal();

  // Gestion des événements
  const confirmBtn = modal.querySelector("#confirm-action");
  const cancelBtn = modal.querySelector("#cancel-action");

  const cleanup = () => {
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
    modal.close();
    setTimeout(() => modal.remove(), 300); // Laisser l'animation se terminer
  };

  confirmBtn.onclick = () => {
    cleanup();
    if (onConfirm) onConfirm();
  };

  cancelBtn.onclick = cleanup;
  modal.querySelector(".btn-ghost").onclick = cleanup;

  return modal;
}

/**
 * Affiche un modal de chargement
 * @param {string} [title="Traitement en cours"] - Titre du modal
 * @returns {HTMLElement} Le modal créé
 */
export function showLoadingModal(title = "Traitement en cours") {
  const modal = createModal({
    id: "loading-modal",
    title,
    content:
      '<div class="text-center"><span class="loading loading-spinner loading-lg"></span></div>',
    showCloseButton: false,
  });

  document.body.appendChild(modal);
  modal.showModal();

  return modal;
}

export const processJustificationAction = async (
  action,
  id,
  idAttache,
  refreshData
) => {
  const newStatus = getNewStatus(action);
  if (!newStatus) return;

  const loadingModal = showLoadingModal();

  try {
    await updateJustificationStatus(id, newStatus, idAttache);
    await refreshData();
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    loadingModal.close();
  }
};

/**
 * Récupère la configuration des actions disponibles selon le statut
 * @param {string} statut - Statut actuel de la justification
 * @returns {Array} Liste des actions disponibles
 */
export const getAvailableActions = (statut) => {
  if (statut === "en attente") {
    return ["accepter", "refuser"];
  }
  return ["annuler"];
};

export const getActionConfig = (action) => {
  return justificationActionConfigs[action] || null;
};
