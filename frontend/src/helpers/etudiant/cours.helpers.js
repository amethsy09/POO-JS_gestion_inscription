import { createIllustratedBanner } from "../../components/banner/banner.js";
import {
  createCoursCards,
  updateCoursCardsData,
} from "../../components/card/cardPaginated.js";
import { createCoursFiltersForEtudiant } from "../../components/filter/filter.js";
import { showEmptyStateModal } from "../../components/modals/modal.js";
import { getAllAnneesScolaires } from "../../services/annees_scolaireService.js";
import { getStudentCourses } from "../../services/etudiantService.js";
import { getAllSemestres } from "../../services/semestreService.js";
import { showLoadingModal } from "../attacher/justificationHelpers.js";

export async function renderCoursCardsEtudiant(idEtudiant, filters = {}) {
  try {
    const loadingModal = showLoadingModal("Chargement des cours...");

    // 1. Récupération des données
    let cours = await getStudentCourses(idEtudiant);
    console.log(cours);

    // 2. Filtrage des données
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      cours = cours.filter(
        (c) =>
          c.module.libelle.toLowerCase().includes(searchTerm) ||
          `${c.professeur.utilisateur.prenom} ${c.professeur.utilisateur.nom}`
            .toLowerCase()
            .includes(searchTerm)
      );
    }

    if (filters.semestre) {
      cours = cours.filter((c) => c.semestre.id == filters.semestre);
    }

    if (filters.annee) {
      cours = cours.filter((c) => c.semestre.annee_scolaire == filters.annee);
    }

    // 5. Création du composant Cards
    const cardsContainer = createCoursCards({
      containerId: "cours-cards",
      data: cours,
      itemsPerPage: 3,
      emptyMessage: "Aucun cours trouvé",
    });

    // 6. Rendu dans le DOM
    const container = document.getElementById("cours-container");
    container.innerHTML = "";
    container.appendChild(cardsContainer);

    loadingModal.close();

    // 7. Mise à jour initiale
    updateCoursCardsData("cours-cards", cours, 1);
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal("Erreur lors du chargement des cours");
  }
}

export async function renderCoursCardFilterForEtudiant(idEtudiant) {
  const [semestres, anneesScolaires] = await Promise.all([
    getAllSemestres(),
    getAllAnneesScolaires(),
  ]);
  const filters = createCoursFiltersForEtudiant({
    semestres,
    anneesScolaires,
    onFilter: (filters) =>
      updateCoursCardWithFiltersForEtudiant(idEtudiant, filters),
  });
  document.getElementById("filters-container").appendChild(filters);
}

export async function updateCoursCardWithFiltersForEtudiant(
  idEtudiant,
  filters = {}
) {
  await renderCoursCardsEtudiant(idEtudiant, filters);
}

export function rendeCoursBannerForEtudiant() {
  const hero = createIllustratedBanner({
    title: "Suivez vos cours en temps réel",
    subtitle: "Une plateforme intuitive pour une gestion moderne",
    illustrationUrl: "/frontend/assets/images/teacher.svg",
    bgColor: "bg-purple-500",
    textColor: "text-white",
  });
  document.getElementById("banner-container").appendChild(hero);
}
