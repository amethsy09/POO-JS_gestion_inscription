import {
  createModal,
  showEmptyStateModal,
} from "../../components/modals/modal.js";

/**
 * Trouve une classe par son ID
 */
export function findClassById(classId, allClasses) {
  return allClasses.find((c) => c.id == classId);
}

/**
 * Affiche un message si classe non trouvée
 */
export function showClassNotFound() {
  showEmptyStateModal("Classe introuvable");
}

/**
 * Crée le contenu du modal
 */
export function createModalContent(classe) {
  const modalContent = document.createElement("div");

  // Ajouter les infos de la classe
  modalContent.appendChild(createClassInfoSection(classe));

  // Ajouter la liste des étudiants ou état vide
  if (hasStudents(classe)) {
    modalContent.appendChild(createStudentsListSection(classe));
  } else {
    showEmptyStateModal(
      "Aucun étudiant inscrit dans cette classe",
      "class-details-modal"
    );
    return null;
  }

  return modalContent;
}

/**
 * Crée la section d'informations de la classe
 */
function createClassInfoSection(classe) {
  const classInfo = document.createElement("div");
  classInfo.className = "mb-6 p-4 bg-base-200 rounded-lg";
  classInfo.innerHTML = `
    <h4 class="font-bold text-lg mb-2">${classe.libelle}</h4>
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div><span class="font-medium">Filière:</span> ${classe.nomFiliere}</div>
      <div><span class="font-medium">Niveau:</span> ${classe.nomNiveau}</div>
      <div><span class="font-medium">Capacité:</span> ${classe.capacite_max}</div>
      <div><span class="font-medium">Inscrits:</span> ${classe.nombreEtudiants}</div>
    </div>
  `;
  return classInfo;
}

/**
 * Vérifie si la classe a des étudiants
 */
function hasStudents(classe) {
  return classe.etudiants && classe.etudiants.length > 0;
}

/**
 * Crée la section liste des étudiants
 */
function createStudentsListSection(classe) {
  const section = document.createElement("div");

  const title = document.createElement("h5");
  title.className = "font-bold mb-3";
  title.textContent = "Liste des étudiants";
  section.appendChild(title);

  const studentsList = document.createElement("div");
  studentsList.className = "space-y-2 max-h-96 overflow-y-auto";

  classe.etudiants.forEach((etudiant) => {
    studentsList.appendChild(createStudentItem(etudiant));
  });

  section.appendChild(studentsList);
  return section;
}

/**
 * Crée un élément étudiant pour la liste
 */
function createStudentItem(etudiant) {
  const studentItem = document.createElement("div");
  studentItem.className =
    "flex items-center justify-between p-3 bg-base-100 rounded-lg";
  studentItem.innerHTML = `
    <div class="flex items-center space-x-3">
      <div class="avatar placeholder">
        <div class="bg-neutral-focus text-neutral-content rounded-full w-10 h-10">
          <span>${etudiant.prenom.charAt(0)}${etudiant.nom.charAt(0)}</span>
        </div>
      </div>
      <div>
        <div class="font-bold">${etudiant.prenom} ${etudiant.nom}</div>
        <div class="text-sm opacity-50">${etudiant.matricule}</div>
      </div>
    </div>
    <button class="btn btn-xs btn-ghost">
      <i class="ri-external-link-line"></i>
    </button>
  `;

  return studentItem;
}

/**
 * Affiche ou met à jour le modal
 */
export function showOrUpdateModal(content, title) {
  if (!content) return;

  const modalId = "class-details-modal";
  let modal = document.getElementById(modalId);

  if (modal) {
    updateExistingModal(modal, content);
  } else {
    createNewModal(modalId, content, title);
  }
}

function updateExistingModal(modal, content) {
  const contentContainer = modal.querySelector(".modal-box div:nth-child(2)");
  contentContainer.replaceWith(content);
  modal.showModal();
}

function createNewModal(modalId, content, title) {
  const modal = createModal({
    id: modalId,
    title: `Détails - ${title}`,
    content,
  });
  document.body.appendChild(modal);
  modal.showModal();
}
