import { createIllustratedBanner } from "../../components/banner/banner.js";
import {
  createAbsenceCards,
  updateAbsenceCardsData,
} from "../../components/card/cardAbsence.js";
import { createJustificationFiltersForEtudiant } from "../../components/filter/filter.js";
import { createJustificationForm } from "../../components/form/form.js";
import {
  createModal,
  showEmptyStateModal,
} from "../../components/modals/modal.js";
import { handleJustificationSubmit } from "../../handler/etudiant/justificationEtudiant.handler.js";
import { getAllAnneesScolaires } from "../../services/annees_scolaireService.js";
import { getStudentAbsences } from "../../services/etudiantService.js";
import { getAllSemestres } from "../../services/semestreService.js";
import { showLoadingModal } from "../attacher/justificationHelpers.js";

export async function renderAbsenceCardEtudiant(idEtudiant, filters = {}) {
  try {
    const loadingModal = showLoadingModal("Chargement des absences...");
    let absencesData = await getStudentAbsences(idEtudiant);
    console.log(absencesData);

    // 2. Filtrage des données
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      absencesData = absencesData.filter(
        (c) =>
          c.cours.module.libelle.toLowerCase().includes(searchTerm) ||
          `${c.professeur.utilisateur.prenom} ${c.professeur.utilisateur.nom}`
            .toLowerCase()
            .includes(searchTerm)
      );
    }

    // 2. Configurer les actions possibles
    const actionsConfig = {
      type: "dropdown",
      items: (item) => {
        if (item.justified === "justifier") {
          return [
            {
              name: "archive",
              label: "Archiver",
              icon: "ri-arrow-go-back-line",
              className: "text-error",
              type: "direct",
              showLabel: true,
            },
          ];
        }
        return [
          {
            name: "justifier",
            label: " Justifier",
            icon: "ri-check-line",
            className: "text-error",
          },
        ];
      },
    };

    const handleAction = async (action, id) => {
      switch (action) {
        case "justifier":
          await showAddJustificationsModalEtudiant(id, idEtudiant);
          break;
        case "archive":
          alert(`archive clicked ${id}`);
          break;
      }
    };

    // 3. Créer le composant d'affichage
    const absenceCards = createAbsenceCards({
      containerId: "absence-cards",
      data: absencesData,
      itemsPerPage: 4,
      actions: actionsConfig,
      onAction: handleAction,
      emptyMessage: "Aucune absence enregistrée pour cet étudiant",
    });

    // 6. Rendu dans le DOM
    const container = document.getElementById("absence-container");
    container.innerHTML = "";
    container.appendChild(absenceCards);

    loadingModal.close();
    updateAbsenceCardsData("absence-cards", absencesData, 1, handleAction);
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal(
      "Erreur lors du chargement des absences",
      error.message
    );
  }
}

export async function showAddJustificationsModalEtudiant(
  absenceId,
  idEtudiant
) {
  const absences = await getStudentAbsences(idEtudiant);
  const absence = absences.find((a) => a.id_absence === absenceId);

  if (!absence) {
    throw new Error("Absence introuvable");
  }

  const form = await createJustificationForm(absence);
  const modal = createModal({
    title: "Demande de justification d'absence",
    content: form,
    size: "lg",
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const result = await handleJustificationSubmit(form, absenceId, idEtudiant);

    if (result.success) {
      modal.close();
      await renderAbsenceCardEtudiant(absence.id_etudiant);
    }
  };

  document.getElementById("modal-absence-container").appendChild(modal);
  modal.showModal();
}

export function rendeJustificationBannerForEtudiant() {
  const hero = createIllustratedBanner({
    title: "Suivez vos absence en temps réel",
    subtitle: "Une plateforme intuitive pour une gestion moderne",
    illustrationUrl: "/frontend/assets/images/teacher.svg",
    bgColor: "bg-blue-50",
    textColor: "text-blue-600",
  });
  document.getElementById("banner-container").appendChild(hero);
}

export async function renderJustificationCardFilterForEtudiant(idEtudiant) {
  const [semestres, anneesScolaires] = await Promise.all([
    getAllSemestres(),
    getAllAnneesScolaires(),
  ]);
  const filters = createJustificationFiltersForEtudiant({
    semestres,
    anneesScolaires,
    onFilter: (filters) =>
      updateJustificationCardWithFiltersForEtudiant(idEtudiant, filters),
  });
  document.getElementById("filters-container").appendChild(filters);
}

export async function updateJustificationCardWithFiltersForEtudiant(
  idEtudiant,
  filters = {}
) {
  await renderAbsenceCardEtudiant(idEtudiant, filters);
}
