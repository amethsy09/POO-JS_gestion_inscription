import {
  createModal,
  showEmptyStateModal,
} from "../../components/modals/modal.js";
import { getCurrentAcademicYear } from "../../services/annees_scolaireService.js";
import { getClassesByAttache } from "../../services/attacherService.js";
import { createStudent } from "../../services/etudiantService.js";
import {
  checkExistingReinscription,
  createInscription,
  submitReinscription,
} from "../../services/inscriptionService.js";
import { checkReinscriptionPeriod } from "../../services/periodService.js";
import { createUser } from "../../services/utilisateurService.js";
import { setupRealTimeValidation } from "../../validations/realTimeValidation.js";
import { validateInscriptionData } from "../../validations/validation.js";
import { showLoadingModal } from "./justificationHelpers.js";

// components/ReinscriptionForm.js
export function createReinscriptionForm(student, idAttache) {
  const form = document.createElement("form");
  form.className = "space-y-4 p-4";

  form.innerHTML = `
    <!-- En-tête étudiant -->
    <div class="bg-base-200 p-4 rounded-lg mb-4">
      <h4 class="font-bold">${student.prenom} ${student.nom}</h4>
      <p class="text-sm opacity-75">${student.matricule}</p>
      <p class="text-sm">Classe actuelle: ${student.classe.libelle}</p>
    </div>

    <!-- Nouvelle classe -->
    <div class="form-control">
      <label class="label">
        <span class="label-text">Nouvelle classe *</span>
      </label>
      <select name="new_class_id" class="select select-bordered" required>
        <option value="">Sélectionner...</option>
      </select>
    </div>

    <!-- Statut -->
    <div class="form-control">
      <label class="label">
        <span class="label-text">Situation *</span>
      </label>
      <div class="flex flex-col space-y-2">
        <label class="flex items-center space-x-2">
          <input type="radio" name="redoublement" value="false" checked class="radio radio-primary">
          <span>Passage normal</span>
        </label>
        <label class="flex items-center space-x-2">
          <input type="radio" name="redoublement" value="true" class="radio radio-primary">
          <span>Redoublement</span>
        </label>
      </div>
    </div>

    <div class="modal-action">
      <button type="button" class="btn btn-ghost" onclick="this.closest('dialog').close()">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary">
        Soumettre la demande
      </button>
    </div>
  `;

  // Remplissage des classes
  loadClassOptions(
    form.querySelector('select[name="new_class_id"]'),
    idAttache
  );

  return form;
}

export async function createInscriptionForm(idAttache) {
  const form = document.createElement("form");
  form.className = "space-y-2 p-4 max-h-[70vh] overflow-y-auto";

  form.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Section 1: Informations personnelles -->
      <div class="col-span-full font-bold text-lg mb-2">Informations personnelles</div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Nom *</span>
        </label>
        <input type="text" name="nom" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="nom"></div>
      </div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Prénom *</span>
        </label>
        <input type="text" name="prenom" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="prenom"></div>
      </div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Email *</span>
        </label>
        <input type="email" name="email" class="input input-bordered" >
        <div class="text-error text-xs mt-1 hidden" data-error="email"></div>
      </div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Téléphone *</span>
        </label>
        <input type="tel" name="telephone" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="telephone"></div>
      </div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Adresse *</span>
        </label>
        <input type="text" name="adresse" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="adresse"></div>
      </div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Avatar</span>
        </label>
        <input type="text" name="avatar" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="avatar"></div>
      </div>
      
      <!-- Section 2: Scolarité -->
      <div class="col-span-full font-bold text-lg mb-2 mt-4">Scolarité</div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Matricule *</span>
        </label>
        <input type="text" name="matricule" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="matricule"></div>
      </div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Classe *</span>
        </label>
        <select name="classe_id" class="select select-bordered">
          <option value="">Sélectionner...</option>
        </select>
        <div class="text-error text-xs mt-1 hidden" data-error="classe_id"></div>
      </div>
      
      <!-- Section 3: Sécurité -->
      <div class="col-span-full font-bold text-lg mb-2 mt-4">Sécurité</div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Mot de passe *</span>
        </label>
        <input type="password" name="password" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="password"></div>
      </div>
      
      <div class="form-control">
        <label class="label">
          <span class="label-text">Confirmer le mot de passe *</span>
        </label>
        <input type="password" name="confirm_password" class="input input-bordered">
        <div class="text-error text-xs mt-1 hidden" data-error="password"></div>
      </div>
    </div>
    
    <div class="modal-action">
      <button type="button" class="btn btn-ghost" onclick="this.closest('dialog').close()">
        Annuler
      </button>
      <button type="submit" class="btn btn-primary">
        <i class="ri-save-line mr-2"></i> Enregistrer
      </button>
    </div>
  `;

  // Chargement des classes
  await loadClassOptions(
    form.querySelector('select[name="classe_id"]'),
    idAttache
  );

  // Validation en temps réel
  setupRealTimeValidation(form);

  return form;
}

async function loadClassOptions(selectElement, idAttache) {
  const classes = await getClassesByAttache(idAttache);
  classes.forEach((classe) => {
    const option = document.createElement("option");
    option.value = classe.id_classe;
    option.textContent = classe.libelle;
    selectElement.appendChild(option);
  });
}

export async function handleReinscriptionClick(student, idAttache) {
  try {
    // 1. Vérification période
    const isPeriodOpen = await checkReinscriptionPeriod();
    console.log(isPeriodOpen);

    if (!isPeriodOpen) {
      showEmptyStateModal("Les réinscriptions sont actuellement fermées");
      return;
    }

    // 2. Vérification si déjà réinscrit (adapté)
    const currentYear = await getCurrentAcademicYear();
    const alreadyReinscrit = await checkExistingReinscription(
      student.id_etudiant,
      currentYear
    );

    if (alreadyReinscrit) {
      showEmptyStateModal(
        `${student.prenom} est déjà réinscrit pour ${currentYear}`
      );
      return;
    }

    // 3. Affichage du formulaire
    const form = createReinscriptionForm(student, idAttache);
    const modal = createModal({
      title: `Réinscription - ${student.prenom} ${student.nom}`,
      content: form,
    });

    form.onsubmit = async (e) => {
      e.preventDefault();
      const loadingModal = showLoadingModal();

      try {
        const formData = new FormData(form);
        console.log(formData.get("new_class_id"));

        await submitReinscription({
          id_etudiant: student.id_etudiant,
          id_classe: formData.get("new_class_id"),
          redoublement: formData.get("redoublement") === "true",
          annee_scolaire: currentYear,
          date_inscription: new Date().toISOString(),
        });

        loadingModal.close();
        modal.close();
      } catch (error) {
        loadingModal.close();
        showEmptyStateModal(`Erreur: ${error.message}`);
      }
    };

    document.body.appendChild(modal);
    modal.showModal();
  } catch (error) {
    console.error("Erreur:", error);
    showEmptyStateModal("Une erreur est survenue");
  }
}

export async function submitInscription(data) {
  // 1. Validation
  const errors = await validateInscriptionData(data);
  if (errors) throw { name: "ValidationError", errors };

  // 2. Création utilisateur
  const user = await createUser({
    nom: data.nom,
    prenom: data.prenom,
    email: data.email,
    telephone: data.telephone,
    adresse: data.adresse,
    password: data.password,
    state: "disponible",
    id_role: "4",
    avatar: data.avatar || "/assets/default-avatar.png",
  });

  // 3. Création étudiant
  const student = await createStudent({
    id_utilisateur: user.id,
    matricule: data.matricule,
    id_classe: data.classe_id,
    date_inscription: new Date().toISOString(),
  });

  // 4. Création inscription
  const inscription = await createInscription({
    id_etudiant: student.id,
    id_classe: data.classe_id,
    annee_scolaire: await getCurrentAcademicYear(),
  });

  return { user, student, inscription };
}

export async function handleInscriptionSubmit(formElement) {
  const loadingModal = showLoadingModal("Traitement en cours...");
  clearFormErrors(formElement);

  try {
    const formData = new FormData(formElement);

    // Préparation des données
    const data = {
      nom: formData.get("nom"),
      prenom: formData.get("prenom"),
      email: formData.get("email"),
      telephone: formData.get("telephone"),
      adresse: formData.get("adresse"),
      password: formData.get("password"),
      matricule: formData.get("matricule"),
      classe_id: formData.get("classe_id"),
      avatar: formData.get("avatar"),
    };
    const result = await submitInscription(data);
    loadingModal.close();
    return {
      success: true,
      data: {
        matricule: result.student.matricule,
        password: data.password,
      },
    };
  } catch (error) {
    loadingModal.close();

    if (error.name === "ValidationError") {
      showFormErrors(formElement, error.errors);
      return { success: false, errors: error.errors };
    }

    console.error("Erreur inscription:", error);
    showEmptyStateModal("Une erreur est survenue lors de l'inscription");
    return { success: false };
  }
}

function showFormErrors(form, errors = {}) {
  Object.entries(errors).forEach(([field, message]) => {
    const errorElement = form.querySelector(`[data-error="${field}"]`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.remove("hidden");
    }
  });
}

function clearFormErrors(form) {
  const errorElements = form.querySelectorAll("[data-error]");
  errorElements.forEach((element) => {
    element.textContent = "";
    element.classList.add("hidden");
  });
}
