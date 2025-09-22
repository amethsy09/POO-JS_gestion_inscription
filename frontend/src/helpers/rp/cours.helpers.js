import {
  createCoursCards,
  updateCoursCardsData,
} from "../../components/card/cardPaginated.js";
import { createCoursFiltersForRp } from "../../components/filter/filter.js";
import { createCoursForm } from "../../components/form/form.js";
import {
  createModal,
  showEmptyStateModal,
} from "../../components/modals/modal.js";
import { createFloatingButton } from "../../components/ui/floatingButton.js";
import { handleCoursRpSubmit } from "../../handler/rp/coursRp.handler.js";
import { getAllAnneesScolaires } from "../../services/annees_scolaireService.js";
import {
  getAllCours,
  getCoursById,
  handleArchiveCours,
  handleCancelCours,
  handleRestoreCours,
} from "../../services/coursService.js";
import { getAllSemestres } from "../../services/semestreService.js";
import {
  showConfirmationModal,
  showLoadingModal,
} from "../attacher/justificationHelpers.js";

class CoursRpManager {
  constructor() {
    this.currentFilters = {};
    this.coursData = [];
  }

  async init() {
    await this.renderCoursCardFilter();
    await this.renderCoursCards();
    this.renderFloatingButton();
  }

  async renderCoursCards(filters = {}) {
    try {
      this.currentFilters = filters;
      const loadingModal = showLoadingModal("Chargement des cours...");

      // 1. Récupération des données
      this.coursData = await getAllCours();
      console.log(this.coursData);

      // 2. Filtrage des données
      this.applyFilters();

      // 3. Création du composant Cards
      const cardsContainer = createCoursCards({
        containerId: "cours-cards",
        data: this.coursData,
        actions: this.getActionsConfig(),
        onAction: (action, id) => this.handleAction(action, id),
        itemsPerPage: 3,
        emptyMessage: "Aucun cours trouvé",
      });

      // 4. Rendu dans le DOM
      const container = document.getElementById("cours-container");
      container.innerHTML = "";
      container.appendChild(cardsContainer);

      loadingModal.close();

      // 5. Mise à jour initiale
      updateCoursCardsData("cours-cards", this.coursData, 1, (action, id) =>
        this.handleAction(action, id)
      );
    } catch (error) {
      console.error("Erreur:", error);
      showEmptyStateModal("Erreur lors du chargement des cours");
    }
  }

  applyFilters() {
    if (this.currentFilters.search) {
      const searchTerm = this.currentFilters.search.toLowerCase();
      this.coursData = this.coursData.filter(
        (c) =>
          c.module.libelle.toLowerCase().includes(searchTerm) ||
          `${c.professeur.utilisateur.prenom} ${c.professeur.utilisateur.nom}`
            .toLowerCase()
            .includes(searchTerm)
      );
    }

    if (this.currentFilters.semestre) {
      this.coursData = this.coursData.filter(
        (c) => c.semestre.id == this.currentFilters.semestre
      );
    }

    if (this.currentFilters.annee) {
      this.coursData = this.coursData.filter(
        (c) => c.semestre.annee_scolaire == this.currentFilters.annee
      );
    }
  }

  getActionsConfig() {
    return {
      type: "dropdown",
      items: (item) => {
        if (item.statut === "annuler") {
          return [
            {
              name: "archive",
              label: "Archiver",
              icon: "ri-archive-line",
              className: "text-error",
              type: "direct",
              showLabel: true,
            },
            {
              name: "restore",
              label: "Restorer",
              icon: "ri-arrow-go-back-line",
              className: "text-success",
              type: "direct",
              showLabel: true,
            },
          ];
        }
        return [
          {
            name: "edit",
            label: "Modifier",
            icon: "ri-edit-line",
            className: "text-info",
          },
          {
            name: "annuler",
            label: "Annuler",
            icon: "ri-close-line",
            icon: "ri-archive-line",
            className: "text-error",
          },
        ];
      },
    };
  }

  async handleAction(action, id) {
    const coursItem = this.coursData.find((c) => c.id_cours == id);

    switch (action) {
      case "edit":
        console.log(id);
        await this.showEditCoursModal(id);
        break;
      case "archive":
        console.log(id);
        this.showArchiveCoursConfirmation(id);
        break;
      case "restore":
        console.log(id);
        this.showRestoreCoursConfirmation(id);
        break;
      case "annuler":
        console.log(id);
        this.showCancelCoursConfirmation(id);
        break;
    }
  }

  async renderCoursCardFilter() {
    const [semestres, anneesScolaires] = await Promise.all([
      getAllSemestres(),
      getAllAnneesScolaires(),
    ]);
    const filters = createCoursFiltersForRp({
      semestres,
      anneesScolaires,
      onFilter: (filters) => this.updateCoursCardWithFilters(filters),
    });
    document.getElementById("filters-container").appendChild(filters);
  }

  async updateCoursCardWithFilters(filters = {}) {
    await this.renderCoursCards(filters);
  }

  renderFloatingButton() {
    const button = createFloatingButton({
      id: "quick-add-btn",
      icon: "ri-add-line",
      title: "Création rapide",
      color: "warning",
      position: "bottom-right",
      onClick: async () => await this.showAddCoursModal(),
    });

    document.getElementById("floatingButton").appendChild(button);
  }

  async showAddCoursModal() {
    const form = await createCoursForm();
    const modal = createModal({
      title: "Ajouter une nouvelle cours",
      content: form,
      size: "xl",
    });

    form.onsubmit = async (e) => {
      e.preventDefault();
      const result = await handleCoursRpSubmit(form);
      if (result.success) {
        modal.close();
        await this.renderCoursCards(this.currentFilters);
      }
    };

    document.getElementById("modal-cours-container").appendChild(modal);
    modal.showModal();
  }

  async showEditCoursModal(id) {
    const existingCours = await getCoursById(id);
    console.log(existingCours);

    const form = await createCoursForm(existingCours);
    const modal = createModal({
      title: "Modifier le cours",
      content: form,
      size: "xl",
    });

    form.onsubmit = async (e) => {
      e.preventDefault();
      const result = await handleCoursRpSubmit(form, existingCours);
      if (result.success) {
        modal.close();
        await this.renderCoursCards(this.currentFilters);
      }
    };

    document.getElementById("modal-cours-container").appendChild(modal);
    modal.showModal();
  }

  showCancelCoursConfirmation(courId) {
    showConfirmationModal({
      title: `Annuler le cours`,
      content: "Cette cours ne sera plus disponible.",
      confirmText: "Annuler le cours",
      confirmClass: "btn-warning",
      onConfirm: async () => {
        const loading = showLoadingModal("Annulation en cours...");
        try {
          await handleCancelCours(courId);
          await this.renderCoursCards(this.currentFilters);
        } catch (error) {
          showEmptyStateModal("Erreur lors de l'annulation du cours");
        } finally {
          loading.close();
        }
      },
    });
  }

  showRestoreCoursConfirmation(courId) {
    showConfirmationModal({
      title: `Restorer le cours`,
      content: "Cette cours sera de nouveau disponible.",
      confirmText: "Restorer le cours",
      confirmClass: "btn-success",
      onConfirm: async () => {
        const loading = showLoadingModal("Restauration en cours...");
        try {
          await handleRestoreCours(courId);
          await this.renderCoursCards(this.currentFilters);
        } catch (error) {
          showEmptyStateModal("Erreur lors de la restauration du cours");
        } finally {
          loading.close();
        }
      },
    });
  }

  showArchiveCoursConfirmation(courId) {
    showConfirmationModal({
      title: `Archiver le cours`,
      content: "Cette cours sera plus disponible",
      confirmText: "Archiver le cours",
      confirmClass: "btn-error",
      onConfirm: async () => {
        const loading = showLoadingModal("Annulation en cours...");
        try {
          await handleArchiveCours(courId);
          await this.renderCoursCards(this.currentFilters);
        } catch (error) {
          showEmptyStateModal("Erreur lors de l'archivage du cours");
        } finally {
          loading.close();
        }
      },
    });
  }
}

// Utilisation
const coursRpManager = new CoursRpManager();
coursRpManager.init();

// Export pour compatibilité (si nécessaire)
export {
  coursRpManager as renderCoursCardsRp,
  coursRpManager as renderCoursCardFilterForRp,
  coursRpManager as updateCoursCardWithFiltersForRp,
  coursRpManager as renderFloatingButtonAddCours,
  coursRpManager as showAddCoursModalRp,
  coursRpManager as showEditCoursModalRp,
};