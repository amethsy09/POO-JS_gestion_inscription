import {SidebarComponent} from "../../../../src/components/sidebar/sidebar.js";

// Classe SidebarComponent

// Gestion des cours
class CourseManager {
  constructor() {
    this.courses = [];
    this.archivedCourses = []; // Nouveau tableau pour les cours archivés
    this.initCalendar();
    this.init();
  }

  init() {
    // Charger des données de démonstration
    this.loadDemoData();

    // Afficher le calendrier
    this.renderCalendar();

    // Cacher l'overlay de chargement
    setTimeout(() => {
      document.getElementById("loading-overlay").style.display = "none";
    }, 800);

    // Initialiser les écouteurs d'événements
    this.setupEventListeners();
  }

  loadDemoData() {
    // Générer des données de démonstration
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Lundi de cette semaine

    this.courses = [
      {
        id: 1,
        title: "Algorithmique - L1 Info",
        start: new Date(startOfWeek.setHours(9, 0, 0)),
        end: new Date(startOfWeek.setHours(11, 0, 0)),
        extendedProps: {
          module: "Algorithmique",
          professor: "Prof. Alioune Diop",
          class: "L1 Informatique",
          room: "Salle A101",
          type: "cours",
          color: 1,
          archived: false,
          archivedAt: null
        },
      },
      {
        id: 2,
        title: "Base de données - L2 Info",
        start: new Date(startOfWeek.setDate(startOfWeek.getDate() + 1)),
        end: new Date(startOfWeek.setHours(10, 0, 0)),
        extendedProps: {
          module: "Base de données",
          professor: "Dr. Sophie Martin",
          class: "L2 Informatique",
          room: "Labo Informatique 1",
          type: "tp",
          color: 2,
          archived: false,
          archivedAt: null
        },
      },
      {
        id: 3,
        title: "Math avancées - L2 Maths",
        start: new Date(startOfWeek.setDate(startOfWeek.getDate() + 1)),
        end: new Date(startOfWeek.setHours(13, 0, 0)),
        extendedProps: {
          module: "Mathématiques avancées",
          professor: "Dr. Fatou Ndiaye",
          class: "L2 Mathématiques",
          room: "Salle B203",
          type: "cours",
          color: 3,
          archived: false,
          archivedAt: null
        },
      },
      {
        id: 4,
        title: "Physique quantique - L3 Phys",
        start: new Date(startOfWeek.setDate(startOfWeek.getDate() + 2)),
        end: new Date(startOfWeek.setHours(14, 0, 0)),
        extendedProps: {
          module: "Physique quantique",
          professor: "Prof. Jean Dupont",
          class: "L3 Physique",
          room: "Amphi Principal",
          type: "cours",
          color: 4,
          archived: false,
          archivedAt: null
        },
      },
      {
        id: 5,
        title: "Algorithmique TD - L1 Info",
        start: new Date(startOfWeek.setDate(startOfWeek.getDate() + 3)),
        end: new Date(startOfWeek.setHours(11, 0, 0)),
        extendedProps: {
          module: "Algorithmique",
          professor: "Prof. Alioune Diop",
          class: "L1 Informatique",
          room: "Salle A102",
          type: "td",
          color: 1,
          archived: false,
          archivedAt: null
        },
      },
    ];

    // Données de démonstration pour les cours archivés
    this.archivedCourses = [
      {
        id: 6,
        title: "Anglais technique - L1 Info",
        start: new Date(startOfWeek.setDate(startOfWeek.getDate() - 7)),
        end: new Date(startOfWeek.setHours(15, 0, 0)),
        extendedProps: {
          module: "Anglais technique",
          professor: "Dr. Sarah Johnson",
          class: "L1 Informatique",
          room: "Salle C101",
          type: "cours",
          color: 5,
          archived: true,
          archivedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
      }
    ];
  }

  initCalendar() {
    this.calendarEl = document.getElementById("calendar");

    this.calendar = new FullCalendar.Calendar(this.calendarEl, {
      initialView: "timeGridWeek",
      locale: "fr",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "timeGridWeek,timeGridDay,listWeek",
      },
      buttonText: {
        today: "Aujourd'hui",
        week: "Semaine",
        day: "Jour",
        list: "Liste",
      },
      allDaySlot: false,
      slotMinTime: "08:00:00",
      slotMaxTime: "20:00:00",
      events: this.courses,
      eventClick: (info) => {
        this.editCourse(info.event);
      },
      eventContent: (arg) => {
        // Personnaliser l'affichage des événements
        const event = arg.event;
        const props = event.extendedProps;

        return {
          html: `
            <div class="p-2">
              <div class="font-bold truncate">${props.module}</div>
              <div class="text-xs">${props.class}</div>
              <div class="text-xs">${props.professor}</div>
              <div class="text-xs">${props.room}</div>
            </div>
          `,
        };
      },
      eventClassNames: (arg) => {
        // Appliquer des classes CSS en fonction du type de cours
        const type = arg.event.extendedProps.type;
        return [`course-type-${type}`];
      },
      eventBackgroundColor: (arg) => {
        // Définir la couleur en fonction de la propriété color
        const colorIndex = arg.event.extendedProps.color;
        const colors = {
          1: "#3b82f6",
          2: "#10b981",
          3: "#f59e0b",
          4: "#8b5cf6",
          5: "#ec4899",
        };
        return colors[colorIndex] || "#3b82f6";
      },
    });
  }

  renderCalendar() {
    this.calendar.render();
  }

  // Méthode pour archiver un cours
  archiveCourse(courseId) {
    const courseIndex = this.courses.findIndex(course => course.id == courseId);
    
    if (courseIndex !== -1) {
      const course = this.courses[courseIndex];
      
      // Marquer le cours comme archivé
      course.extendedProps.archived = true;
      course.extendedProps.archivedAt = new Date();
      
      // Déplacer vers les archives
      this.archivedCourses.push(course);
      this.courses.splice(courseIndex, 1);
      
      // Mettre à jour le calendrier
      this.updateCalendar();
      
      this.showNotification('Cours archivé avec succès', 'success');
      return true;
    }
    return false;
  }

  // Méthode pour restaurer un cours
  restoreCourse(courseId) {
    const courseIndex = this.archivedCourses.findIndex(course => course.id == courseId);
    
    if (courseIndex !== -1) {
      const course = this.archivedCourses[courseIndex];
      
      // Retirer l'archivage
      course.extendedProps.archived = false;
      course.extendedProps.archivedAt = null;
      
      // Remettre dans les cours actifs
      this.courses.push(course);
      this.archivedCourses.splice(courseIndex, 1);
      
      // Mettre à jour le calendrier
      this.updateCalendar();
      
      this.showNotification('Cours restauré avec succès', 'success');
      return true;
    }
    return false;
  }

  // Méthode pour mettre à jour le calendrier
  updateCalendar() {
    this.calendar.removeAllEvents();
    this.calendar.addEventSource(this.courses);
  }

  // Méthode pour afficher les cours archivés
  showArchivedCourses() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-96 overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold">Cours archivés</h3>
          <button id="close-archived-modal" class="text-gray-500 hover:text-gray-700">
            <i class="ri-close-line text-2xl"></i>
          </button>
        </div>
        <div id="archived-courses-list" class="space-y-2">
          ${this.archivedCourses.length === 0 ? 
            '<p class="text-gray-500 text-center py-4">Aucun cours archivé</p>' : 
            this.archivedCourses.map(course => `
              <div class="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <div class="font-semibold">${course.extendedProps.module}</div>
                  <div class="text-sm text-gray-600">
                    ${course.extendedProps.class} - ${course.extendedProps.professor}
                  </div>
                  <div class="text-xs text-gray-500">
                    ${new Date(course.start).toLocaleDateString('fr-FR')} • ${course.extendedProps.room}
                  </div>
                  <div class="text-xs text-gray-400">
                    Archivé le: ${new Date(course.extendedProps.archivedAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <button class="restore-course-btn btn btn-outline btn-sm" data-id="${course.id}">
                  <i class="ri-refresh-line mr-1"></i> Restaurer
                </button>
              </div>
            `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Gestion de la fermeture
    document.getElementById('close-archived-modal').addEventListener('click', () => {
      modal.remove();
    });

    // Gestion de la restauration
    modal.querySelectorAll('.restore-course-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const courseId = e.target.closest('button').dataset.id;
        this.restoreCourse(courseId);
        modal.remove();
      });
    });

    // Fermer en cliquant à l'extérieur
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  validateForm() {
    let isValid = true;

    // Réinitialiser les erreurs
    this.clearErrors();

    // Validation du module
    const module = document.getElementById("course-module").value;
    if (!module) {
      this.showError("course-module", "Veuillez sélectionner un module");
      isValid = false;
    }

    // Validation de la classe
    const classe = document.getElementById("course-class").value;
    if (!classe) {
      this.showError("course-class", "Veuillez sélectionner une classe");
      isValid = false;
    }

    // Validation du professeur
    const professor = document.getElementById("course-professor").value;
    if (!professor) {
      this.showError("course-professor", "Veuillez sélectionner un professeur");
      isValid = false;
    }

    // Validation de la salle
    const room = document.getElementById("course-room").value;
    if (!room) {
      this.showError("course-room", "Veuillez sélectionner une salle");
      isValid = false;
    }

    // Validation de la date de début
    const start = document.getElementById("course-start").value;
    if (!start) {
      this.showError(
        "course-start",
        "Veuillez sélectionner une date et heure de début"
      );
      isValid = false;
    }

    // Validation de la date de fin
    const end = document.getElementById("course-end").value;
    if (!end) {
      this.showError(
        "course-end",
        "Veuillez sélectionner une date et heure de fin"
      );
      isValid = false;
    }

    // Vérifier que la date de fin est après la date de début
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (endDate <= startDate) {
        this.showError(
          "course-end",
          "La date de fin doit être après la date de début"
        );
        isValid = false;
      }
    }

    return isValid;
  }

  showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`error-${fieldId}`);

    if (field && errorElement) {
      field.classList.add("input-error", "shake");
      errorElement.textContent = message;
      errorElement.style.display = "block";

      // Supprimer l'animation après son exécution
      setTimeout(() => {
        field.classList.remove("shake");
      }, 500);
    }
  }

  clearErrors() {
    // Réinitialiser tous les messages d'erreur
    document.querySelectorAll(".error-message").forEach((el) => {
      el.style.display = "none";
    });

    // Réinitialiser les bordures d'erreur
    document.querySelectorAll(".input-error").forEach((el) => {
      el.classList.remove("input-error");
    });
  }

  showSubmitLoading(show) {
    const submitText = document.getElementById("submit-text");
    const submitSpinner = document.getElementById("submit-spinner");
    const submitBtn = document.getElementById("submit-btn");

    // Vérifier que les éléments existent avant de les manipuler
    if (submitText && submitSpinner && submitBtn) {
      submitText.style.display = show ? "none" : "inline";
      submitSpinner.style.display = show ? "inline-block" : "none";
      submitBtn.disabled = show;
    }
  }

  showNotification(message, type = "success") {
    // Créer l'élément de notification
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} notification mb-4`;
    notification.innerHTML = `
      <div class="flex items-center">
        <i class="ri-${type === "success" ? "check" : "close"}-circle-fill mr-2"></i>
        <span>${message}</span>
      </div>
    `;

    const container = document.getElementById("notification-container");
    if (container) {
      container.appendChild(notification);
    } else {
      // Créer le conteneur s'il n'existe pas
      const newContainer = document.createElement("div");
      newContainer.id = "notification-container";
      newContainer.className = "fixed top-4 right-4 z-50";
      document.body.appendChild(newContainer);
      newContainer.appendChild(notification);
    }

    // Supprimer la notification après 3 secondes
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  formatDateTime(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  editCourse(event) {
    const props = event.extendedProps;

    document.getElementById("modal-title").textContent = "Modifier le cours";
    document.getElementById("course-id").value = event.id;
    document.getElementById("course-module").value = props.module;
    document.getElementById("course-class").value = props.class;
    document.getElementById("course-professor").value = props.professor;
    document.getElementById("course-room").value = props.room;
    document.getElementById("course-start").value = this.formatDateTime(event.start);
    document.getElementById("course-end").value = this.formatDateTime(event.end);
    document.getElementById("course-type").value = props.type;

    // Sélectionner la couleur
    const colorRadios = document.getElementsByName("course-color");
    colorRadios.forEach((radio) => {
      if (radio.value == props.color) {
        radio.checked = true;
      }
    });

    // Ajouter le bouton d'archivage
    this.addArchiveButtonToModal(event.id);

    this.clearErrors();
    document.getElementById("course-modal").showModal();
  }

  // Méthode pour ajouter le bouton d'archivage dans le modal
  addArchiveButtonToModal(courseId) {
    // Supprimer l'ancien bouton s'il existe
    const existingBtn = document.getElementById('archive-course-btn');
    if (existingBtn) {
      existingBtn.remove();
    }

    // Créer le bouton d'archivage
    const archiveBtn = document.createElement('button');
    archiveBtn.id = 'archive-course-btn';
    archiveBtn.type = 'button'; // Important : type="button" pour éviter la soumission
    archiveBtn.className = 'btn btn-outline btn-error mt-4 w-full';
    archiveBtn.innerHTML = '<i class="ri-archive-line mr-2"></i>Archiver ce cours';
    archiveBtn.dataset.courseId = courseId;

    archiveBtn.addEventListener('click', (e) => {
      e.preventDefault(); // Empêcher la soumission du formulaire
      e.stopPropagation(); // Arrêter la propagation
      this.showArchiveConfirmation(courseId);
    });

    // Ajouter le bouton avant les boutons d'action
    const modalActions = document.querySelector('#course-modal .modal-action');
    const form = document.getElementById('course-form');
    if (modalActions && form) {
      form.insertBefore(archiveBtn, modalActions);
    } else if (form) {
      form.appendChild(archiveBtn);
    }
  }

  // Méthode pour afficher la confirmation d'archivage
  showArchiveConfirmation(courseId) {
    const course = this.courses.find(c => c.id == courseId);
    if (!course) {
      this.showNotification('Cours non trouvé', 'error');
      return;
    }

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md mx-4">
        <div class="text-yellow-500 text-4xl mb-4 text-center">
          <i class="ri-alert-line"></i>
        </div>
        <h3 class="text-lg font-bold mb-2 text-center">Confirmer l'archivage</h3>
        <p class="text-gray-600 mb-4 text-center">
          Êtes-vous sûr de vouloir archiver le cours "<strong>${course.extendedProps.module}</strong>" ?
        </p>
        <p class="text-sm text-gray-500 mb-4 text-center">
          Le cours sera déplacé vers les archives et n'apparaîtra plus dans le planning.
        </p>
        <div class="flex gap-3 justify-center">
          <button id="confirm-archive" class="btn btn-error px-4">
            <i class="ri-archive-line mr-2"></i>Archiver
          </button>
          <button id="cancel-archive" class="btn btn-outline px-4">Annuler</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Gestion de la confirmation
    const confirmHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (this.archiveCourse(courseId)) {
        document.getElementById('course-modal').close();
      }
      modal.remove();
    };

    // Gestion de l'annulation
    const cancelHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      modal.remove();
    };

    document.getElementById('confirm-archive').addEventListener('click', confirmHandler);
    document.getElementById('cancel-archive').addEventListener('click', cancelHandler);

    // Fermer en cliquant à l'extérieur
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  setupEventListeners() {
    // Bouton pour ajouter un cours
    document.getElementById("add-course-btn").addEventListener("click", (e) => {
      e.preventDefault();
      
      document.getElementById("modal-title").textContent = "Planifier un nouveau cours";
      document.getElementById("course-form").reset();
      document.getElementById("course-id").value = "";

      // Supprimer le bouton d'archivage s'il existe
      const archiveBtn = document.getElementById('archive-course-btn');
      if (archiveBtn) {
        archiveBtn.remove();
      }

      // Sélectionner la couleur par défaut
      const colorRadios = document.getElementsByName("course-color");
      if (colorRadios.length > 0) {
        colorRadios[0].checked = true;
      }

      this.clearErrors();
      document.getElementById("course-modal").showModal();
    });

    // Bouton pour annuler le modal
    document.getElementById("cancel-course-modal").addEventListener("click", () => {
      document.getElementById("course-modal").close();
    });

    // Bouton d'actualisation
    document.getElementById("refresh-btn").addEventListener("click", () => {
      document.getElementById("loading-overlay").style.display = "flex";
      setTimeout(() => {
        document.getElementById("loading-overlay").style.display = "none";
        this.showNotification("Planning actualisé");
      }, 800);
    });

    // Bouton semaine actuelle
    document.getElementById("current-week-btn").addEventListener("click", () => {
      this.calendar.today();
    });

    // Soumission du formulaire
    document.getElementById("course-form").addEventListener("submit", (e) => {
      e.preventDefault();

      // Valider le formulaire
      if (!this.validateForm()) {
        return;
      }

      // Simuler l'envoi des données
      this.showSubmitLoading(true);

      // Récupérer les données du formulaire
      const courseData = {
        id: document.getElementById("course-id").value || Date.now(),
        title: `${document.getElementById("course-module").value} - ${document.getElementById("course-class").value}`,
        start: new Date(document.getElementById("course-start").value),
        end: new Date(document.getElementById("course-end").value),
        extendedProps: {
          module: document.getElementById("course-module").value,
          professor: document.getElementById("course-professor").value,
          class: document.getElementById("course-class").value,
          room: document.getElementById("course-room").value,
          type: document.getElementById("course-type").value,
          color: document.querySelector('input[name="course-color"]:checked').value,
          archived: false,
          archivedAt: null
        },
      };

      // Simuler un délai de traitement
      setTimeout(() => {
        if (document.getElementById("course-id").value) {
          // Mise à jour d'un cours existant
          const index = this.courses.findIndex((c) => c.id == courseData.id);
          if (index !== -1) {
            this.courses[index] = courseData;
          }
        } else {
          // Ajouter un nouveau cours
          this.courses.push(courseData);
        }

        // Mettre à jour le calendrier
        this.calendar.removeAllEvents();
        this.calendar.addEventSource(this.courses);

        // Fermer le modal
        document.getElementById("course-modal").close();

        // Afficher une notification de succès
        this.showNotification(
          `Cours ${document.getElementById("course-id").value ? "modifié" : "planifié"} avec succès`
        );

        // Réinitialiser le chargement
        this.showSubmitLoading(false);
      }, 1500);
    });

    // Gestion des filtres
    document.getElementById("class-filter").addEventListener("change", () => {
      this.applyFilters();
    });

    document.getElementById("professor-filter").addEventListener("change", () => {
      this.applyFilters();
    });

    document.getElementById("room-filter").addEventListener("change", () => {
      this.applyFilters();
    });

    document.getElementById("module-filter").addEventListener("change", () => {
      this.applyFilters();
    });

    // Ajouter le bouton des cours archivés
    this.addArchivedCoursesButton();
  }

  // Méthode pour ajouter le bouton des cours archivés
  addArchivedCoursesButton() {
    // Créer le bouton s'il n'existe pas
    if (!document.getElementById('archived-courses-btn')) {
      const archivedBtn = document.createElement('button');
      archivedBtn.id = 'archived-courses-btn';
      archivedBtn.className = 'btn btn-outline mr-2';
      archivedBtn.innerHTML = '<i class="ri-archive-line mr-2"></i>Cours archivés';
      
      // Trouver le conteneur des boutons
      const buttonContainer = document.querySelector('.flex.justify-between.items-center.mb-6');
      if (buttonContainer) {
        const addCourseBtn = document.getElementById('add-course-btn');
        if (addCourseBtn) {
          buttonContainer.insertBefore(archivedBtn, addCourseBtn);
        } else {
          buttonContainer.appendChild(archivedBtn);
        }
      }

      archivedBtn.addEventListener('click', () => {
        this.showArchivedCourses();
      });
    }
  }

  applyFilters() {
    const classFilter = document.getElementById("class-filter").value;
    const professorFilter = document.getElementById("professor-filter").value;
    const roomFilter = document.getElementById("room-filter").value;
    const moduleFilter = document.getElementById("module-filter").value;

    const filteredEvents = this.courses.filter((course) => {
      const props = course.extendedProps;

      return (
        (classFilter === "all" || props.class === classFilter) &&
        (professorFilter === "all" || props.professor === professorFilter) &&
        (roomFilter === "all" || props.room === roomFilter) &&
        (moduleFilter === "all" || props.module === moduleFilter)
      );
    });

    this.calendar.removeAllEvents();
    this.calendar.addEventSource(filteredEvents);
  }
}

// Gestion de la déconnexion
class LogoutManager {
  constructor() {
    this.init();
  }

  init() {
    // Vérifier que l'élément existe avant d'ajouter l'écouteur
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.showLogoutConfirmation();
      });
    }
  }

  showLogoutConfirmation() {
    // Créer dynamiquement la fenêtre de confirmation
    const overlay = document.createElement("div");
    overlay.id = "logout-overlay";
    overlay.className = "fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center z-50";
    overlay.innerHTML = `
      <div class="bg-white rounded-xl p-8 max-w-md text-center">
        <div class="text-6xl text-red-500 mb-4">
          <i class="ri-logout-circle-r-line"></i>
        </div>
        <h2 class="text-2xl font-bold mb-4">Confirmer la déconnexion</h2>
        <p class="mb-6 text-gray-600">Êtes-vous sûr de vouloir vous déconnecter ?</p>
        <div class="flex justify-center gap-4">
          <button id="confirm-logout" class="btn btn-primary px-6">Oui, déconnecter</button>
          <button id="cancel-logout" class="btn btn-outline px-6">Annuler</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Ajouter les écouteurs après la création des éléments
    document.getElementById("confirm-logout").addEventListener("click", () => {
      this.performLogout();
    });

    document.getElementById("cancel-logout").addEventListener("click", () => {
      overlay.remove();
    });

    // Fermer en cliquant à l'extérieur
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }

  performLogout() {
    const confirmBtn = document.getElementById("confirm-logout");
    if (confirmBtn) {
      // Afficher un indicateur de chargement
      confirmBtn.innerHTML = '<div class="loading-spinner mr-2"></div> Déconnexion...';
      confirmBtn.disabled = true;

      // Simuler le processus de déconnexion
      setTimeout(() => {
        // Nettoyer les données de session
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");

        // Redirection vers la page de connexion
        window.location.href = "login.html";
      }, 1500);
    }
  }
}

// Initialisation de la page
document.addEventListener("DOMContentLoaded", () => {
    // Détection automatique de la page active
    const currentPage = window.location.pathname.includes('cours') ? 'cours' : 
                       window.location.pathname.includes('classes') ? 'classes' : 
                       window.location.pathname.includes('professeurs') ? 'professeurs' : 'dashboard';
    
    const sidebar = new SidebarComponent("sidebar-container", currentPage);
    sidebar.render();

    const courseManager = new CourseManager();
    const logoutManager = new LogoutManager();
});