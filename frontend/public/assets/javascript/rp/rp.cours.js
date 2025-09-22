
// Classe SidebarComponent
class SidebarComponent {
  constructor(containerId, activeLink = "cours") {
    this.containerId = containerId;
    this.activeLink = activeLink;
    this.links = [
      { id: "dashboard", icon: "ri-dashboard-line", text: "Dashboard" },
      { id: "classes", icon: "ri-group-line", text: "Classes" },
      { id: "professeurs", icon: "ri-user-star-line", text: "Professeurs" },
      { id: "cours", icon: "ri-book-open-line", text: "Cours" },
    ];
  }

  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    container.innerHTML = `
                  <aside class="fixed top-0 left-0 h-full w-56 bg-white shadow-md z-50">
                    <div class="sidebar-logo p-4 border-b">
                      <h1 class="text-xl font-bold text-white">Ecole 221</h1>
                    </div>
                    <nav class="mt-4">
                      <ul>
                        ${this.links
                          .map(
                            (link) => `
                          <li>
                            <a href="#" 
                               class="sidebar-link px-4 py-3 flex items-center text-gray-700"
                               id="link-${link.id}"
                               data-link="${link.id}">
                              <i class="${link.icon} mr-3"></i>
                              <span>${link.text}</span>
                            </a>
                          </li>
                        `
                          )
                          .join("")}
                      </ul>
                    </nav>
                  </aside>
                `;

    this.addEventListeners();
    this.setActiveLink(this.activeLink);
  }

  addEventListeners() {
    this.links.forEach((link) => {
      const element = document.getElementById(`link-${link.id}`);
      if (element) {
        element.addEventListener("click", (e) => {
          e.preventDefault();
          this.setActiveLink(link.id);
          this.handleNavigation(link.id);
        });
      }
    });
  }

  setActiveLink(linkId) {
    this.activeLink = linkId;

    this.links.forEach((link) => {
      const element = document.getElementById(`link-${link.id}`);
      if (element) {
        element.classList.remove(
          "active-link",
          "text-indigo-700",
          "bg-indigo-50"
        );
      }
    });

    const activeElement = document.getElementById(`link-${linkId}`);
    if (activeElement) {
      activeElement.classList.add(
        "active-link",
        "text-indigo-700",
        "bg-indigo-50"
      );
    }
  }

  handleNavigation(linkId) {
      if (linkId === 'cours') return;
                if (linkId === 'classes') {
                    window.location.href = 'classes.html';
                }else if (linkId === 'dashboard') {
                        window.location.href = 'dashboard.html';
                } else if (linkId === 'professeurs') {
                    window.location.href = 'professeurs.html';
                } else {
                    alert(`Navigation vers ${linkId}.html`);
                }
              }
}

// Gestion des cours
class CourseManager {
  constructor() {
    this.courses = [];
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
        },
      },
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

    if (submitText && submitSpinner) {
      submitText.style.display = show ? "none" : "inline";
      submitSpinner.style.display = show ? "inline-block" : "none";
      document.getElementById("submit-btn").disabled = show;
    }
  }

  showNotification(message, type = "success") {
    // Créer l'élément de notification
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} notification mb-4`;
    notification.innerHTML = `
                    <div class="flex items-center">
                        <i class="ri-${
                          type === "success" ? "check" : "close"
                        }-circle-fill mr-2"></i>
                        <span>${message}</span>
                    </div>
                `;

    const container = document.getElementById("notification-container");
    container.appendChild(notification);

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
    document.getElementById("course-start").value = this.formatDateTime(
      event.start
    );
    document.getElementById("course-end").value = this.formatDateTime(
      event.end
    );
    document.getElementById("course-type").value = props.type;

    // Sélectionner la couleur
    const colorRadios = document.getElementsByName("course-color");
    colorRadios.forEach((radio) => {
      if (radio.value == props.color) {
        radio.checked = true;
      }
    });

    this.clearErrors();
    document.getElementById("course-modal").showModal();
  }

  setupEventListeners() {
    // Bouton pour ajouter un cours
    document.getElementById("add-course-btn").addEventListener("click", () => {
      document.getElementById("modal-title").textContent =
        "Planifier un nouveau cours";
      document.getElementById("course-form").reset();
      document.getElementById("course-id").value = "";

      // Sélectionner la couleur par défaut
      const colorRadios = document.getElementsByName("course-color");
      colorRadios[0].checked = true;

      this.clearErrors();
      document.getElementById("course-modal").showModal();
    });

    // Bouton pour annuler le modal
    document
      .getElementById("cancel-course-modal")
      .addEventListener("click", () => {
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
    document
      .getElementById("current-week-btn")
      .addEventListener("click", () => {
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
        id:
          document.getElementById("course-id").value || this.courses.length + 1,
        title: `${document.getElementById("course-module").value} - ${
          document.getElementById("course-class").value
        }`,
        start: new Date(document.getElementById("course-start").value),
        end: new Date(document.getElementById("course-end").value),
        extendedProps: {
          module: document.getElementById("course-module").value,
          professor: document.getElementById("course-professor").value,
          class: document.getElementById("course-class").value,
          room: document.getElementById("course-room").value,
          type: document.getElementById("course-type").value,
          color: document.querySelector('input[name="course-color"]:checked')
            .value,
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
          `Cours ${
            document.getElementById("course-id").value ? "modifié" : "planifié"
          } avec succès`
        );

        // Réinitialiser le chargement
        this.showSubmitLoading(false);
      }, 1500);
    });

    // Gestion des filtres
    document.getElementById("class-filter").addEventListener("change", () => {
      this.applyFilters();
    });

    document
      .getElementById("professor-filter")
      .addEventListener("change", () => {
        this.applyFilters();
      });

    document.getElementById("room-filter").addEventListener("change", () => {
      this.applyFilters();
    });

    document.getElementById("module-filter").addEventListener("change", () => {
      this.applyFilters();
    });
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
    overlay.className =
      "fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center z-50";
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
  }

  performLogout() {
    const confirmBtn = document.getElementById("confirm-logout");
    if (confirmBtn) {
      // Afficher un indicateur de chargement
      confirmBtn.innerHTML =
        '<div class="loading-spinner mr-2"></div> Déconnexion...';
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
  const sidebar = new SidebarComponent("sidebar-container", "cours");
  sidebar.render();

  const courseManager = new CourseManager();
  const logoutManager = new LogoutManager();
});
