import {
  checkExistingClass,
  getClasseById,
} from "../services/classeServices.js";
import { getProfessorDetails } from "../services/professeurService.js";
import {
  checkEmailExists,
  checkMatriculeExists,
} from "../services/utilisateurService.js";

class Validator {
  static validateRequiredFields(data, requiredFields) {
    const errors = {};
    for (const field of requiredFields) {
      if (!data[field]) {
        errors[field] = `Le champ ${field} est requis`;
      }
    }
    return errors;
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email requis";
    } else if (!emailRegex.test(email)) {
      return "Email invalide";
    }
    return null;
  }

  static async checkEmailUniqueness(email, currentId = null) {
    if (await checkEmailExists(email, currentId)) {
      return "Email déjà utilisé";
    }
    return null;
  }
}

export class InscriptionValidator extends Validator {
  static async validate(data) {
    const errors = {};

    // Validation des champs requis
    const requiredFields = [
      "nom",
      "prenom",
      "password",
      "adresse",
      "avatar",
      "telephone",
      "classe_id",
    ];
    Object.assign(errors, this.validateRequiredFields(data, requiredFields));

    // Validation email
    const emailError = this.validateEmail(data.email);
    if (emailError) {
      errors.email = emailError;
    } else if (await this.checkEmailUniqueness(data.email)) {
      errors.email = "Email déjà utilisé";
    }

    // Validation matricule
    if (!data.matricule) {
      errors.matricule = "Matricule requis";
    } else if (await checkMatriculeExists(data.matricule)) {
      errors.matricule = "Matricule déjà utilisé";
    }

    return Object.keys(errors).length ? errors : null;
  }
}

export class ClassValidator extends Validator {
  static async validate(data, isUpdate = false, classId = null) {
    const errors = {};

    if (!data.libelle?.trim()) {
      errors.libelle = "Le libellé est requis";
    } else if (data.libelle.length > 50) {
      errors.libelle = "Maximum 50 caractères";
    }

    if (!data.id_filiere) {
      errors.id_filiere = "Sélectionnez une filière";
    }

    if (!data.id_niveau) {
      errors.id_niveau = "Sélectionnez un niveau";
    }

    if (!data.capacite_max || data.capacite_max < 1) {
      errors.capacite_max = "Capacité invalide";
    }

    if (isUpdate) {
      const originalClass = await getClasseById(classId);
      if (data.libelle !== originalClass.libelle) {
        const exists = await checkExistingClass(data.libelle, classId);
        if (exists) {
          errors.libelle = "Cette classe existe déjà pour cette filière";
        }
      }
    } else {
      const exists = await checkExistingClass(data.libelle);
      if (exists) {
        errors.libelle = "Cette classe existe déjà pour cette filière";
      }
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
}

export class ProfesseurValidator extends Validator {
  static async validate(data, isUpdate = false, profId = null) {
    const errors = {};

    const stringFields = [
      { name: "nom", maxLength: 50 },
      { name: "prenom", maxLength: 50 },
      { name: "grade" },
      { name: "specialite" },
      { name: "telephone" },
      { name: "password" },
      { name: "avatar" },
      { name: "adresse" },
    ];

    for (const field of stringFields) {
      if (!data[field.name]?.trim()) {
        errors[field.name] = `Le champ ${field.name} est requis`;
      } else if (field.maxLength && data[field.name].length > field.maxLength) {
        errors[field.name] = `Maximum ${field.maxLength} caractères`;
      }
    }

    // Validation email
    const emailError = this.validateEmail(data.email);
    if (emailError) {
      errors.email = emailError;
    } else {
      if (isUpdate) {
        const originalProf = await getProfessorDetails(profId);
        if (data.email !== originalProf.informations.email) {
          const uniquenessError = await this.checkEmailUniqueness(data.email);
          if (uniquenessError) errors.email = uniquenessError;
        }
      } else {
        const uniquenessError = await this.checkEmailUniqueness(data.email);
        if (uniquenessError) errors.email = uniquenessError;
      }
    }

    if (!data.classes || data.classes.length === 0) {
      errors.classes = "Affectez au moins une classe";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
}

export class CoursValidator {
  static validate(coursData) {
    const errors = {};

    const requiredFields = [
      "id_module",
      "id_professeur",
      "id_semestre",
      "date_cours",
      "salle",
      "heure_debut",
      "heure_fin",
    ];

    for (const field of requiredFields) {
      if (!coursData[field]) {
        errors[field] = `Le champ ${field} est requis`;
      }
    }

    if (coursData.heure_debut && coursData.heure_fin) {
      if (coursData.heure_debut >= coursData.heure_fin) {
        errors.heure_fin = "L'heure de fin doit être après l'heure de début";
      }
    }

    if (!coursData.classes || coursData.classes.length === 0) {
      errors.classes = "Au moins une classe doit être sélectionnée";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
}

export class JustificationValidator {
  static validate(justificationData) {
    const errors = {};

    if (!justificationData.motif) {
      errors.motif = "Le motif est obligatoire";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }
}