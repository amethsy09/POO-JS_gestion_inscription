/**
 * Crée un modal réutilisable avec DaisyUI
 * @param {Object} config - Configuration du modal
 * @param {string} config.id - ID du modal
 * @param {string} config.title - Titre du modal
 * @param {string|HTMLElement} config.content - Contenu du modal
 * @param {boolean} config.showCloseButton - Afficher le bouton fermer
 * @returns {HTMLElement} L'élément modal
 */
export function createModal(config) {
  const {
    id = `modal-${Math.random().toString(36).substring(2)}`,
    title = "Modal",
    content = "",
    showCloseButton = true,
    size = "md",
    scrollable = false,
  } = config;

  // Modal de base
  const modal = document.createElement("dialog");
  modal.id = id;
  modal.className = "modal";

  // Boîte principale
  const modalBox = document.createElement("div");
  modalBox.className = `modal-box w-full max-w-${size}`;

  // Si scrollable, ajout de hauteur fixe et scroll interne
  if (scrollable) {
    modalBox.classList.add("max-h-[85vh]", "overflow-y-auto");
  }

  // En-tête
  const modalHeader = document.createElement("div");
  modalHeader.className = "flex items-center justify-between mb-4";

  const modalTitle = document.createElement("h3");
  modalTitle.className = "font-bold text-lg";
  modalTitle.textContent = title;

  modalHeader.appendChild(modalTitle);

  // Bouton de fermeture (optionnel)
  if (showCloseButton) {
    const closeButton = document.createElement("button");
    closeButton.className = "btn btn-sm btn-circle btn-ghost";
    closeButton.innerHTML = "✕";
    closeButton.onclick = () => modal.close();
    modalHeader.appendChild(closeButton);
  }

  // Contenu
  const modalContent = document.createElement("div");
  modalContent.className = "py-4";

  if (typeof content === "string") {
    modalContent.innerHTML = content;
  } else {
    modalContent.appendChild(content);
  }

  // Footer
  const modalFooter = document.createElement("div");
  modalFooter.className = "modal-action";

  const closeFooterButton = document.createElement("button");
  closeFooterButton.className = "btn";
  closeFooterButton.textContent = "Fermer";
  closeFooterButton.onclick = () => modal.close();
  modalFooter.appendChild(closeFooterButton);

  // Assemblage
  modalBox.appendChild(modalHeader);
  modalBox.appendChild(modalContent);
  modalBox.appendChild(modalFooter);
  modal.appendChild(modalBox);

  // Fermer en cliquant en dehors
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.close();
    }
  };

  return modal;
}

/**
 * Affiche un modal avec un état vide
 * @param {string} message - Message à afficher
 * @param {string} modalId - ID du modal existant ou nouveau
 */
export function showEmptyStateModal(message, modalId = null) {
  const emptyContent = `
    <div class="text-center py-8">
      <img src="/frontend/assets/images/recherche.png" alt="Tableau vide" class="w-32 h-32 mx-auto mb-4 opacity-50">
      <p class="text-gray-500">${message}</p>
    </div>
  `;

  if (modalId && document.getElementById(modalId)) {
    const modal = document.getElementById(modalId);
    modal.querySelector(".modal-box div:nth-child(2)").innerHTML = emptyContent;
    modal.showModal();
  } else {
    const modal = createModal({
      id: modalId || `empty-modal-${Math.random().toString(36).substr(2, 4)}`,
      title: "Information",
      content: emptyContent,
    });
    document.body.appendChild(modal);
    modal.showModal();
  }
}
