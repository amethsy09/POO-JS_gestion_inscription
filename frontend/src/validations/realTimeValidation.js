import {
  checkEmailExists,
  checkMatriculeExists,
} from "../services/utilisateurService.js";

class RealTimeValidator {
  constructor(form) {
    this.form = form;
    this.validators = [];
  }

  addValidator(fieldName, validationFn) {
    this.validators.push({
      fieldName,
      validationFn
    });
  }

  setup() {
    this.validators.forEach(({ fieldName, validationFn }) => {
      const input = this.form.querySelector(`[name="${fieldName}"]`);
      const errorElement = this.form.querySelector(`[data-error="${fieldName}"]`);

      if (input && errorElement) {
        input.addEventListener('blur', async () => {
          await validationFn(input.value, errorElement);
        });
      }
    });
  }
}

export class InscriptionRealTimeValidator extends RealTimeValidator {
  constructor(form) {
    super(form);
    
    // Ajout des validateurs spécifiques
    this.addValidator('email', this.validateEmail.bind(this));
    this.addValidator('matricule', this.validateMatricule.bind(this));
    this.setupPasswordValidation();
  }

  async validateEmail(email, errorElement) {
    if (!email) return;

    if (await checkEmailExists(email)) {
      errorElement.textContent = "Email déjà utilisé";
      errorElement.classList.remove("hidden");
    } else {
      errorElement.classList.add("hidden");
    }
  }

  async validateMatricule(matricule, errorElement) {
    if (!matricule) return;

    if (await checkMatriculeExists(matricule)) {
      errorElement.textContent = "Matricule déjà utilisé";
      errorElement.classList.remove("hidden");
    } else {
      errorElement.classList.add("hidden");
    }
  }

  setupPasswordValidation() {
    const passwordInput = this.form.querySelector('[name="password"]');
    const confirmInput = this.form.querySelector('[name="confirm_password"]');
    const errorElement = this.form.querySelector('[data-error="password"]');

    if (passwordInput && confirmInput && errorElement) {
      confirmInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const confirm = confirmInput.value;

        if (password && confirm && password !== confirm) {
          errorElement.textContent = "Les mots de passe ne correspondent pas";
          errorElement.classList.remove("hidden");
        } else {
          errorElement.classList.add("hidden");
        }
      });
    }
  }
}

// Utilisation exemple :
// const form = document.querySelector('#inscription-form');
// const realTimeValidator = new InscriptionRealTimeValidator(form);