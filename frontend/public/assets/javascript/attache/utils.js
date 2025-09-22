import { createModernBanner } from "../../../components/banner/banner.js";
import {
  createAbsenteesCard,
  createStatsCard,
} from "../../../components/card/card.js";
import {
  createAbsencesFilters,
  createClassFilters,
  createInscriptionsFilters,
  createJustificationsFilters,
} from "../../../components/filter/filter.js";
import { createResponsiveAttacheHeader } from "../../../components/header/header.js";
import {
  createModal,
  showEmptyStateModal,
} from "../../../components/modals/modal.js";
import {
  createSidebar,
  setActiveLink,
} from "../../../components/sidebar/sidebar.js";
import {
  createDaisyUITable,
  updateDaisyUITableData,
} from "../../../components/table/table.js";
import { createFloatingButton } from "../../../components/ui/floatingButton.js";
import { createAbsencesModalContent } from "../../../helpers/attacher/absenceHelpers.js";
import {
  createModalContent,
  findClassById,
  showClassNotFound,
  showOrUpdateModal,
} from "../../../helpers/attacher/classeHelpers.js";
import {
  createInscriptionForm,
  handleInscriptionSubmit,
  handleReinscriptionClick,
  submitInscription,
} from "../../../helpers/attacher/inscriptionHelpers.js";
import {
  getActionConfig,
  getAvailableActions,
  getStatutsJustification,
  processJustificationAction,
  showConfirmationModal,
  showLoadingModal,
} from "../../../helpers/attacher/justificationHelpers.js";
import { navigateTo, navigateToAndReplace } from "../../../router/router.js";
import { getAllAnneesScolaires } from "../../../services/annees_scolaireService.js";
import {
  getClassesByAttache,
  getClassesEtEtudiantsParAttache,
  getDashboardStatsAttacher,
  getDemandesJustificationAttache,
  getEtudiantsAvecAbsences,
  getEtudiantsParAttache,
  getTop5Absentees,
} from "../../../services/attacherService.js";
import { getEtudiantById } from "../../../services/etudiantService.js";
import { getAllFilieres } from "../../../services/filiereService.js";
import { updateJustificationStatus } from "../../../services/justificationService.js";
import { getAllNiveaux } from "../../../services/niveauxServices.js";
import { checkReinscriptionPeriod } from "../../../services/periodService.js";
import { createStyledElement } from "../../../utils/function.js";

//Dashboard de l'attacher

export function handleSidebar(user) {
  const { avatar, nom, prenom } = user;
  const sidebar = createSidebar({
    logo: {
      icon: "ri-graduation-cap-fill",
      text: "Ecole 221",
    },
    user: {
      avatar: `${avatar}`,
      role: `${nom}`,
      name: `${prenom}`,
    },
    links: [
      {
        text: "Dashboard",
        path: "/frontend/pages/attache/dashboard.html",
        icon: "ri-home-3-line",
      },
      {
        text: "Mes classes",
        path: "/frontend/pages/attache/classe.html",
        icon: "ri-archive-line",
      },
      {
        text: "Mes etudiants",
        path: "/frontend/pages/attache/etudiant.html",
        icon: "ri-group-3-line",
      },
      {
        text: "Justifications",
        path: "/frontend/pages/attache/justifications.html",
        icon: "ri-megaphone-line",
      },
      {
        text: "Inscription",
        path: "/frontend/pages/attache/inscription.html",
        icon: "ri-file-marked-line",
      },
    ],
    onNavigate: (path) => {
      navigateTo(path);
      setActiveLink(path);
    },
  });
  document.getElementById("sidebar-container").appendChild(sidebar);
  setActiveLink(window.location.pathname);
}

export async function renderAttacheStatsCards(idAttache) {
  const stats = await getDashboardStatsAttacher(idAttache);
  const container = document.createElement("div");
  container.className =
    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5";

  const classesCard = createStatsCard({
    title: "Classes gérées",
    value: stats.nombreClasses,
    description: "Total des classes sous votre responsabilité",
    icon: "ri-building-line",
    color: "purple",
    onClick: () => navigateToAndReplace("/frontend/pages/attache/classe.html"),
  });

  const justificationsCard = createStatsCard({
    title: "Justifications",
    value: stats.justificationsEnAttente,
    description: "En attente de validation",
    icon: "ri-hourglass-fill",
    color: "orange",
    onClick: () => navigateTo("/frontend/pages/attache/justifications.html"),
  });

  const studentsCard = createStatsCard({
    title: "Étudiants",
    value: stats.nombreEtudiants,
    description: "Étudiants dans vos classes",
    icon: "ri-user-line",
    color: "green",
    onClick: () => navigateTo("/frontend/pages/attache/etudiant.html"),
  });

  container.appendChild(classesCard);
  container.appendChild(justificationsCard);
  container.appendChild(studentsCard);
  document.getElementById("stats-section").appendChild(container);
}

export function renderAttacheHeader(user, currentPage = "Dashboard") {
  const header = createResponsiveAttacheHeader({
    currentPage: currentPage,
    userName: user.prenom,
    notificationCount: 2,
  });
  document.getElementById("header").appendChild(header);
}

export async function renderAbsenteesCard(idAttache) {
  try {
    // Récupérer les données
    const absentees = await getTop5Absentees(idAttache);

    // Créer la carte
    const card = createAbsenteesCard({
      absentees,
      onStudentClick: (student) => {
        console.log("Élève sélectionné:", student);
      },
    });

    document.getElementById("absentees-section").appendChild(card);
  } catch (error) {
    console.error("Erreur création carte absences:", error);

    // Retourner une carte d'erreur
    const errorCard = document.createElement("div");
    errorCard.className =
      "bg-white rounded-lg shadow-sm p-6 text-center text-red-500";
    errorCard.textContent = "Erreur de chargement des données";
    document.getElementById("absentees-section").appendChild(errorCard);
  }
}

export function renderCalendar() {
  const calendar = document.createElement("div");
  calendar.innerHTML = `
  <calendar-date class="cally bg-base-100 border border-base-300 shadow-sm rounded-box w-full">
                <svg aria-label="Previous" class="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                </svg>
                <svg aria-label="Next" class="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                </svg>
                <calendar-month></calendar-month>
            </calendar-date>
  `;
  document.getElementById("calendar").appendChild(calendar);
}

//Gestion des classes

export async function renderClassesTable(idAttache, filters = {}) {
  // Chargement initial des données
  let classes = await getClassesEtEtudiantsParAttache(idAttache);

  // Application des filtres
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    classes = classes.filter((classe) =>
      classe.libelle.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.filiere) {
    classes = classes.filter((classe) => classe.idFiliere == filters.filiere);
  }

  if (filters.annee) {
    classes = classes.filter((classe) => classe.idAnnee == filters.annee);
  }

  // Configuration des colonnes
  const columns = [
    {
      header: "Classe",
      key: "libelle",
      render: (classe) =>
        createStyledElement("span", "text-sm", classe.libelle),
    },
    {
      header: "Niveau",
      key: "nomNiveau",
      render: (classe) =>
        createStyledElement("span", "text-sm", classe.nomNiveau),
    },
    {
      header: "Filiere",
      key: "nomFiliere",
      render: (classe) =>
        createStyledElement("span", "text-sm", classe.nomFiliere),
    },
    {
      header: "Capacité",
      key: "capacite_max",
      render: (classe) =>
        createStyledElement("span", "badge badge-soft", classe.capacite_max),
    },
    {
      header: "Statut",
      key: "statut",
      render: (classe) => {
        const badgeClass =
          classe.statut == "disponible" ? "badge-success" : "badge-warning";
        return createStyledElement(
          "span",
          `badge badge-soft ${badgeClass}`,
          classe.statut
        );
      },
    },
  ];

  // Configuration des actions
  const actionsConfig = {
    type: "direct",
    idField: "id_classe",
    items: [
      {
        name: "details",
        label: "Détails",
        icon: "ri-eye-line",
        className: "btn-sm btn-primary",
        showLabel: true,
      },
    ],
  };

  // Gestionnaire d'actions unifié
  const handleAction = (action, id) => {
    if (action === "details") {
      showClassDetails(id, classes);
    }
    // Ajouter d'autres actions si nécessaire
  };

  // Création du tableau
  const table = createDaisyUITable({
    tableId: "classes-table",
    columns,
    itemsPerPage: 2,
    data: classes,
    actions: actionsConfig,
    onAction: handleAction,
  });

  // Rendu dans le conteneur
  const container = document.getElementById("classes-container");
  container.innerHTML = "";
  container.appendChild(table);

  // Mise à jour initiale des données
  updateDaisyUITableData("classes-table", classes, 1, handleAction);
}

export function showClassDetails(classId, allClasses) {
  const classe = findClassById(classId, allClasses);
  if (!classe) {
    showClassNotFound();
    return;
  }

  const modalContent = createModalContent(classe);
  showOrUpdateModal(modalContent, classe.libelle);
}

export async function updateClassesTableWithFilters(idAttache, filters = {}) {
  await renderClassesTable(idAttache, filters);
}

export async function renderClasseTableFilter(idAttacher) {
  const [filieres, anneesScolaires] = await Promise.all([
    getAllFilieres(),
    getAllAnneesScolaires(),
  ]);
  const filters = createClassFilters({
    filieres,
    anneesScolaires,
    idAttache: idAttacher,
    onFilter: (filters) => updateClassesTableWithFilters(idAttacher, filters),
  });
  document.getElementById("filters-container").appendChild(filters);
}

export function renderBannerForClasse() {
  const bannerWithAction = createModernBanner({
    title: "Gestion des classes",
    subtitle: "Consulter et gérez les classe de votre établissement",
    imageUrl: "/frontend/assets/images/main.png",
    altText: "Icône gestion des cours",
    badgeColor: "primary",
  });
  document.getElementById("banner-container").appendChild(bannerWithAction);
}

//Gestion des absences

export async function renderAbsencesTable(idAttache, filters = {}) {
  // Chargement initial des données
  let etudiants = await getEtudiantsAvecAbsences(idAttache);

  // Gestion des filtres
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    etudiants = etudiants.filter(
      (etudiant) =>
        etudiant.nom.toLowerCase().includes(searchTerm) ||
        etudiant.prenom.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.niveau) {
    etudiants = etudiants.filter(
      (etudiant) => etudiant.idNiveau == filters.niveau
    );
  }

  const columns = [
    {
      header: "Profil",
      key: "avatar",
      render: (etudiant) => `
        <div>
          <img src="${etudiant.avatar}" class="w-10 h-10 rounded object-cover" />
        </div>
      `,
    },
    {
      header: "Nom",
      key: "nom",
      render: (etudiant) =>
        createStyledElement("span", "text-sm", ` ${etudiant.nom}`),
    },
    {
      header: "Prenom",
      key: "prenom",
      render: (etudiant) =>
        createStyledElement("span", "text-sm", ` ${etudiant.prenom}`),
    },
    {
      header: "Matricule",
      key: "matricule",
      render: (etudiant) =>
        createStyledElement(
          "span",
          "text-sm badge badge-soft",
          etudiant.matricule
        ),
    },
    {
      header: "Classe",
      key: "classeLibelle",
      render: (etudiant) =>
        createStyledElement("span", "text-sm", etudiant.classeLibelle),
    },
    {
      header: "Filieres",
      key: "filiereLibelle",
      render: (etudiant) =>
        createStyledElement(
          "span",
          "text-sm badge badge-soft badge-info",
          etudiant.filiereLibelle
        ),
    },
  ];

  // Configuration des actions
  const actionsConfig = {
    type: "direct",
    items: [
      {
        name: "details",
        label: "Détails",
        icon: "ri-eye-line",
        className: "btn-sm btn-primary",
        showLabel: true,
      },
    ],
  };

  // Gestionnaire d'actions unifié
  const handleAction = (action, id) => {
    if (action === "details") {
      showAbsencesDetails(id, etudiants);
    }
  };

  // Création du tableau
  const table = createDaisyUITable({
    tableId: "absences-table",
    columns,
    itemsPerPage: 4,
    data: etudiants,
    actions: actionsConfig,
    onAction: handleAction, // Utilisation du gestionnaire unifié
  });

  // Rendu dans le conteneur
  const container = document.getElementById("absences-container");
  container.innerHTML = "";
  container.appendChild(table);

  // Mise à jour initiale des données (avec le même gestionnaire)
  updateDaisyUITableData("absences-table", etudiants, 1, handleAction);
}

export function showAbsencesDetails(etudiantId, allEtudiants) {
  const etudiant = allEtudiants.find((e) => e.id == etudiantId);
  if (!etudiant) {
    showEmptyStateModal("Étudiant introuvable");
    return;
  }

  const modalContent = createAbsencesModalContent(etudiant);
  showOrUpdateModal(modalContent, `${etudiant.prenom} ${etudiant.nom}`);
}

export async function renderAbsencesTableFilter(idAttacher) {
  const [niveaux] = await Promise.all([getAllNiveaux()]);

  const filters = createAbsencesFilters({
    niveaux,
    idAttache: idAttacher,
    onFilter: (filters) => updateAbsencesTableWithFilters(idAttacher, filters),
  });

  document.getElementById("filters-container").appendChild(filters);
}

export async function updateAbsencesTableWithFilters(idAttache, filters = {}) {
  await renderAbsencesTable(idAttache, filters);
}

export function renderBannerForAbsence() {
  const bannerWithAction = createModernBanner({
    title: "Gestion des absences",
    subtitle: "Consulter et gérez les absences de chaque etudiant",
    imageUrl: "/frontend/assets/images/absence.png",
    altText: "Icône gestion des cours",
    badgeColor: "primary",
  });
  document.getElementById("banner-container").appendChild(bannerWithAction);
}

//Gestions des demandes de justifications

export async function renderJustificationsTable(idAttache, filters = {}) {
  let demandes = await getDemandesJustificationAttache(idAttache);

  // Application des filtres
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    demandes = demandes.filter(
      (demande) =>
        demande.etudiant.nom.toLowerCase().includes(searchTerm) ||
        demande.etudiant.prenom.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.statut) {
    demandes = demandes.filter((demande) => demande.statut === filters.statut);
  }

  if (filters.classe) {
    demandes = demandes.filter(
      (demande) => demande.etudiant.classe.id == filters.classe
    );
  }

  // Fonction pour rafraîchir les données
  const refreshData = async () => {
    const updatedDemandes = await getDemandesJustificationAttache(idAttache);
    updateDaisyUITableData(
      "justifications-table",
      updatedDemandes,
      currentPage,
      handleAction
    );
  };

  const columns = [
    {
      header: "Étudiant",
      key: "etudiant",
      render: (demande) =>
        createStyledElement(
          "span",
          "text-sm",
          `${demande.etudiant.prenom} ${demande.etudiant.nom}`
        ),
    },
    {
      header: "Matricule",
      key: "matricule",
      render: (demande) =>
        createStyledElement("span", "text-sm", demande.etudiant.matricule),
    },
    {
      header: "Classe",
      key: "classe",
      render: (demande) =>
        createStyledElement("span", "text-sm", demande.etudiant.classe.libelle),
    },
    {
      header: "Date absence",
      key: "date_absence",
      render: (demande) =>
        createStyledElement("span", "text-sm", demande.absence.date_absence),
    },
    {
      header: "Cours",
      key: "cours",
      render: (demande) =>
        createStyledElement("span", "text-sm", demande.absence.cours.module),
    },
    {
      header: "Statut",
      key: "statut",
      render: (demande) => {
        const statusClass =
          {
            "en attente": "badge-warning",
            validée: "badge-success",
            rejetée: "badge-error",
          }[demande.statut] || "badge-info";

        return createStyledElement(
          "span",
          `badge ${statusClass}`,
          demande.statut
        );
      },
    },
  ];

  const actionsConfig = {
    type: "dropdown",
    items: (item) => {
      return getAvailableActions(item.statut).map((action) => {
        const config = getActionConfig(action);
        return {
          name: action,
          label: config.label,
          icon: config.icon,
          className: config.className,
        };
      });
    },
  };

  const handleAction = (action, id) => {
    const config = getActionConfig(action);
    if (config) {
      showConfirmationModal({
        title: config.title,
        content: config.content,
        confirmText: config.confirmText,
        confirmClass: config.confirmClass,
        onConfirm: () =>
          processJustificationAction(action, id, idAttache, refreshData),
      });
    }
  };

  const table = createDaisyUITable({
    tableId: "justifications-table",
    columns,
    itemsPerPage: 10,
    data: demandes,
    actions: actionsConfig,
  });

  const container = document.getElementById("justifications-container");
  container.innerHTML = "";
  container.appendChild(table);
  updateDaisyUITableData("justifications-table", demandes, 1, handleAction);
}

export async function updateJustificationsTableWithFilters(
  idAttache,
  filters = {}
) {
  await renderJustificationsTable(idAttache, filters);
}

export async function renderJustificationsTableFilter(idAttacher) {
  const [classes, statuts] = await Promise.all([
    getClassesByAttache(idAttacher),
    getStatutsJustification(),
  ]);

  const filters = createJustificationsFilters({
    classes,
    statuts,
    idAttache: idAttacher,
    onFilter: (filters) =>
      updateJustificationsTableWithFilters(idAttacher, filters),
  });

  document.getElementById("filters-container").appendChild(filters);
}

export function renderBannerForJustification() {
  const bannerWithAction = createModernBanner({
    title: "Gestion des demandes",
    subtitle: "Consulter et gérez les demandes de justifications",
    imageUrl: "/frontend/assets/images/justification.png",
    altText: "Icône gestion des cours",
    badgeColor: "primary",
    badgeText: "annee en cours",
    showBadge: true,
  });
  document.getElementById("banner-container").appendChild(bannerWithAction);
}

//Gestion des inscriptions

export async function renderInscriptionTable(idAttache, filters = {}) {
  let etudiants = await getEtudiantsParAttache(idAttache);
  console.log(etudiants);

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    etudiants = etudiants.filter(
      (etudiant) =>
        etudiant.nom.toLowerCase().includes(searchTerm) ||
        etudiant.prenom.toLowerCase().includes(searchTerm)
    );
  }
  if (filters.classe) {
    etudiants = etudiants.filter(
      (etudiant) => etudiant.id_classe == filters.classe
    );
  }
  if (filters.annee) {
    etudiants = etudiants.filter(
      (etudiant) => etudiant.idAnnee == filters.annee
    );
  }

  const columns = [
    {
      header: "Profil",
      key: "avatar",
      render: (etudiant) => `
        <div>
          <img src="${etudiant.avatar}" class="w-10 h-10 rounded object-cover" />
        </div>
      `,
    },
    {
      header: "Matricule",
      key: "matricule",
      render: (etudiant) =>
        createStyledElement(
          "span",
          "text-sm font-mono badge",
          etudiant.matricule
        ),
    },
    {
      header: "Étudiant",
      key: "nom_complet",
      render: (etudiant) =>
        createStyledElement(
          "span",
          "text-sm font-medium",
          `${etudiant.prenom} ${etudiant.nom}`
        ),
    },
    {
      header: "Classe",
      key: "classe_libelle",
      render: (etudiant) =>
        createStyledElement("span", "text-sm", etudiant.classe_libelle),
    },
    {
      header: "Email",
      key: "email",
      render: (etudiant) =>
        createStyledElement("span", "text-sm", etudiant.email),
    },
    {
      header: "Date inscription",
      key: "date_inscription",
      render: (etudiant) =>
        createStyledElement("span", "text-sm", etudiant.date_inscription),
    },
    {
      header: "Type",
      key: "est_reinscription",
      render: (etudiant) => {
        const type =
          etudiant.est_reinscription == 1 ? "Réinscription" : "Nouveau";
        const badgeClass =
          etudiant.est_reinscription == 1 ? "badge-info" : "badge-success";
        return createStyledElement(
          "span",
          `badge badge-soft ${badgeClass}`,
          type
        );
      },
    },
  ];

  // Configuration des actions
  const actionsConfig = {
    type: "direct",
    items: [
      {
        name: "reinscription",
        label: "Reinscription",
        icon: "ri-eye-line",
        className: "btn-sm btn-neutral",
        showLabel: true,
      },
    ],
  };

  // Gestionnaire d'actions unifié
  const handleAction = async (action, id) => {
    if (action === "reinscription") {
      const student = await getEtudiantById(id);
      await handleReinscriptionClick(student, idAttache);
    }
  };

  const table = createDaisyUITable({
    tableId: "inscriptions-table",
    columns,
    itemsPerPage: 4,
    data: etudiants,
    actions: actionsConfig,
    emptyMessage: "Aucun étudiant trouvé",
    onAction: handleAction,
  });

  // Rendu dans le conteneur
  const container = document.getElementById("inscriptions-container");
  container.innerHTML = "";
  container.appendChild(table);

  // Mise à jour initiale des données (avec le même gestionnaire)
  updateDaisyUITableData("inscriptions-table", etudiants, 1, handleAction);
}

export async function updateInscriptionsTableWithFilters(
  idAttache,
  filters = {}
) {
  await renderInscriptionTable(idAttache, filters);
}

export async function renderInscriptionsFilters(idAttacher) {
  const [classes, annees] = await Promise.all([
    getClassesByAttache(idAttacher),
    getAllAnneesScolaires(),
  ]);

  const filters = createInscriptionsFilters({
    classes,
    annees,
    idAttache: idAttacher,
    onFilter: (filters) =>
      updateInscriptionsTableWithFilters(idAttacher, filters),
  });

  document.getElementById("filters-container").appendChild(filters);
}

export function renderBannerForInscription() {
  const bannerWithAction = createModernBanner({
    title: "Gestion des inscriptions",
    subtitle: "Consulter et gérez les demandes d'inscription",
    imageUrl: "/frontend/assets/images/inscription.png",
    altText: "Icône gestion des cours",
    badgeColor: "primary",
    badgeText: "annee en cours",
    showBadge: true,
  });
  document.getElementById("banner-container").appendChild(bannerWithAction);
}

export function renderFloatingButtonAdd(idAttache) {
  const button = createFloatingButton({
    id: "quick-add-btn",
    icon: "ri-add-line",
    title: "Création rapide",
    color: "accent",
    position: "bottom-right",
    onClick: () => showInscriptionFormModal(idAttache),
  });

  document.getElementById("floatingButton").appendChild(button);
}

export async function showInscriptionFormModal(idAttache) {
  const isPeriodOpen = await checkReinscriptionPeriod("inscription");

  if (!isPeriodOpen) {
    showEmptyStateModal("Les inscriptions sont actuellement fermées");
    return;
  }
  const form = await createInscriptionForm(idAttache);
  const modal = createModal({
    title: "Nouvelle inscription",
    content: form,
    size: "xl",
  });

  form.onsubmit = async (e) => {
    e.preventDefault();
    const result = await handleInscriptionSubmit(form);

    if (result.success) {
      modal.close();
      updateInscriptionsTableWithFilters(idAttache, {});
    }
  };

  document.getElementById("inscrit-container").appendChild(modal);
  modal.showModal();
}
