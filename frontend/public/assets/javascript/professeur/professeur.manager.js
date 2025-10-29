import { professeurService } from './professeur.service.js';
import { showNotification } from '../components/notifications/notification.js';
import { authStore } from '../store/authStore.js';
import { router } from '../router/router.js';

class ProfesseurManager {
    constructor() {
        this.currentCours = [];
        this.currentEtudiants = [];
        this.selectedCours = null;
    }

    async init() {
        try {
            // Vérifier l'authentification
            if (!authStore.isAuthenticated()) {
                router.navigateTo('/frontend/public/index.html');
                return;
            }

            if (!authStore.isProfessor()) {
                showNotification('Accès non autorisé', 'error');
                router.navigateTo(this.getDashboardPath());
                return;
            }

            await this.loadUserData();
            await this.loadCours();
            this.setupEventListeners();
            this.showCoursSection();
            this.setupLogout();
        } catch (error) {
            this.showError('Erreur lors du chargement des données');
        }
    }

    async loadUserData() {
        const professor = await professeurService.getCurrentProfessor();
        this.updateUIElements({
            '#prof-name': `${professor.user?.prenom || 'Professeur'} ${professor.user?.nom || ''}`,
            '#welcome-prof-name': professor.user?.prenom || 'Professeur',
            '#prof-initials': (professor.user?.prenom?.[0] || 'P') + (professor.user?.nom?.[0] || ''),
            '#user-initials': (professor.user?.prenom?.[0] || 'P') + (professor.user?.nom?.[0] || '')
        });
    }

    async loadCours() {
        try {
            this.currentCours = await professeurService.getCoursByProfesseur();
            this.displayCours();
        } catch (error) {
            throw new Error('Impossible de charger les cours');
        }
    }

    displayCours() {
        const tbody = document.getElementById('courses-list');
        if (!tbody) return;

        if (this.currentCours.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-8">
                        <div class="text-gray-400">Aucun cours trouvé</div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.currentCours.map(cours => this.createCoursRow(cours)).join('');
    }

    createCoursRow(cours) {
        const startTime = cours.heure_debut?.substring(0, 5) || '--:--';
        const endTime = cours.heure_fin?.substring(0, 5) || '--:--';
        const statusClass = cours.statut === 'planifié' ? 'badge-info' : 
                           cours.statut === 'effectué' ? 'badge-success' : 'badge-warning';
        const classNames = cours.classes?.map(c => c.libelle).join(', ') || 'Aucune classe';

        return `
            <tr class="hover:bg-base-200 transition-colors">
                <td>
                    <div class="font-medium">${cours.module?.libelle || 'Module inconnu'}</div>
                    <div class="text-sm text-gray-500">${classNames}</div>
                </td>
                <td>${cours.date_cours || 'Date inconnue'}</td>
                <td>${startTime} - ${endTime}</td>
                <td>
                    <span class="badge ${statusClass}">${cours.statut || 'Inconnu'}</span>
                </td>
                <td>
                    <div class="flex space-x-2">
                        <button class="btn btn-xs btn-outline btn-info cours-details-btn" 
                                data-cours-id="${cours.id}">
                            <i class="ri-eye-line mr-1"></i> Détails
                        </button>
                        ${cours.statut === 'planifié' ? `
                            <button class="btn btn-xs btn-primary marquer-absences-btn" 
                                    data-cours-id="${cours.id}">
                                <i class="ri-user-follow-line mr-1"></i> Absences
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }

    async loadEtudiantsForCours(coursId) {
        try {
            this.currentEtudiants = await professeurService.getEtudiantsByCours(coursId);
            this.displayEtudiants();
        } catch (error) {
            throw new Error('Impossible de charger les étudiants');
        }
    }

    displayEtudiants() {
        const tbody = document.getElementById('students-list');
        if (!tbody) return;

        if (this.currentEtudiants.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center py-4 text-gray-500">
                        Aucun étudiant trouvé pour ce cours
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.currentEtudiants.map(etudiant => this.createEtudiantRow(etudiant)).join('');
        this.setupAbsenceCheckboxes();
    }

    createEtudiantRow(etudiant) {
        const avatarUrl = etudiant.user?.avatar || '/frontend/assets/images/default-avatar.png';
        
        return `
            <tr class="border-b border-gray-100">
                <td class="py-3">
                    <div class="flex items-center gap-3">
                        <div class="avatar">
                            <div class="mask mask-squircle w-10 h-10">
                                <img src="${avatarUrl}" 
                                     alt="${etudiant.user?.prenom} ${etudiant.user?.nom}"
                                     onerror="this.src='/frontend/assets/images/default-avatar.png'">
                            </div>
                        </div>
                        <div>
                            <div class="font-semibold">${etudiant.user?.prenom} ${etudiant.user?.nom}</div>
                            <div class="text-xs text-gray-500">${etudiant.matricule}</div>
                        </div>
                    </div>
                </td>
                <td class="py-3">
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" class="checkbox checkbox-primary checkbox-sm absence-checkbox" 
                               data-etudiant-id="${etudiant.id}" />
                        <span class="text-sm">Absent</span>
                    </label>
                </td>
                <td class="py-3">
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" class="checkbox checkbox-success checkbox-sm justified-checkbox" 
                               data-etudiant-id="${etudiant.id}" disabled />
                        <span class="text-sm">Justifié</span>
                    </label>
                </td>
            </tr>
        `;
    }

    setupAbsenceCheckboxes() {
        document.querySelectorAll('.absence-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const etudiantId = e.target.dataset.etudiantId;
                const justifiedCheckbox = document.querySelector(`.justified-checkbox[data-etudiant-id="${etudiantId}"]`);
                justifiedCheckbox.disabled = !e.target.checked;
                if (!e.target.checked) {
                    justifiedCheckbox.checked = false;
                }
            });
        });
    }

    async saveAbsences() {
        try {
            if (!this.selectedCours) {
                showNotification('Veuillez sélectionner un cours', 'warning');
                return;
            }

            const absences = this.currentEtudiants.map(etudiant => {
                const absenceCheckbox = document.querySelector(`.absence-checkbox[data-etudiant-id="${etudiant.id}"]`);
                const justifiedCheckbox = document.querySelector(`.justified-checkbox[data-etudiant-id="${etudiant.id}"]`);

                return {
                    id_etudiant: etudiant.id,
                    present: !absenceCheckbox?.checked,
                    justified: justifiedCheckbox?.checked || false
                };
            });

            const absentStudents = absences.filter(a => !a.present);
            
            if (absentStudents.length === 0) {
                showNotification('Aucune absence à enregistrer', 'info');
                return;
            }

            await professeurService.marquerAbsences(this.selectedCours, absentStudents);
            showNotification(`${absentStudents.length} absence(s) enregistrée(s) avec succès`, 'success');
            
            // Recharger les cours pour mettre à jour les statuts
            await this.loadCours();
            this.showCoursSection();
            
        } catch (error) {
            showNotification('Erreur lors de l\'enregistrement des absences', 'error');
            console.error('Erreur:', error);
        }
    }

    // Navigation et sections
    showCoursSection() {
        this.hideAllSections();
        this.setActiveTab('courses-tab');
        document.getElementById('courses-section').classList.remove('hidden');
    }

    showAbsencesSection(coursId = null) {
        this.hideAllSections();
        this.setActiveTab('absences-tab');
        document.getElementById('absences-section').classList.remove('hidden');

        if (coursId) {
            this.loadCoursForAbsenceSelection(coursId);
        } else {
            this.loadCoursForAbsenceSelection();
        }
    }

    async loadCoursForAbsenceSelection(selectedCoursId = null) {
        const select = document.getElementById('course-select');
        const plannedCours = this.currentCours.filter(c => c.statut === 'planifié');

        select.innerHTML = '<option value="" disabled selected>Choisissez un cours</option>';
        
        if (plannedCours.length === 0) {
            select.innerHTML = '<option disabled>Aucun cours planifié</option>';
            document.getElementById('absence-form').classList.add('hidden');
            return;
        }

        plannedCours.forEach(cours => {
            const option = document.createElement('option');
            option.value = cours.id;
            option.textContent = `${cours.module?.libelle || 'Cours'} - ${cours.date_cours} (${cours.heure_debut?.substring(0, 5)})`;
            select.appendChild(option);
        });

        if (selectedCoursId) {
            select.value = selectedCoursId;
            await this.handleCourseSelection({ target: { value: selectedCoursId } });
        }
    }

    async handleCourseSelection(event) {
        const coursId = event.target.value;
        this.selectedCours = coursId;

        if (coursId) {
            document.getElementById('absence-form').classList.remove('hidden');
            await this.loadEtudiantsForCours(coursId);
            
            const cours = this.currentCours.find(c => c.id === coursId);
            if (cours) {
                document.getElementById('selected-course-title').textContent = 
                    `${cours.module?.libelle} - ${cours.date_cours}`;
            }
        } else {
            document.getElementById('absence-form').classlList.add('hidden');
        }
    }

    hideAllSections() {
        document.getElementById('courses-section').classList.add('hidden');
        document.getElementById('absences-section').classList.add('hidden');
    }

    setActiveTab(activeTabId) {
        // Désactiver tous les tabs
        ['courses-tab', 'absences-tab'].forEach(tabId => {
            const tab = document.getElementById(tabId);
            if (tab) tab.classList.remove('tab-active', 'active');
        });

        // Activer le tab sélectionné
        const activeTab = document.getElementById(activeTabId);
        if (activeTab) activeTab.classList.add('tab-active', 'active');
    }

    setupEventListeners() {
        // Navigation desktop
        document.getElementById('courses-tab').addEventListener('click', () => this.showCoursSection());
        document.getElementById('absences-tab').addEventListener('click', () => this.showAbsencesSection());
        
        // Navigation mobile
        const mobileCoursesTab = document.getElementById('mobile-courses-tab');
        const mobileAbsencesTab = document.getElementById('mobile-absences-tab');
        
        if (mobileCoursesTab) {
            mobileCoursesTab.addEventListener('click', () => this.showCoursSection());
        }
        if (mobileAbsencesTab) {
            mobileAbsencesTab.addEventListener('click', () => this.showAbsencesSection());
        }
        
        // Sélection de cours pour les absences
        document.getElementById('course-select').addEventListener('change', (e) => this.handleCourseSelection(e));
        
        // Sauvegarde des absences
        document.getElementById('save-absences-btn').addEventListener('click', () => this.saveAbsences());
        
        // Filtre des cours
        document.getElementById('status-filter').addEventListener('change', () => this.filterCoursByStatus());
        
        // Détails des cours (délégué car les boutons sont dynamiques)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cours-details-btn')) {
                const button = e.target.closest('.cours-details-btn');
                this.showCoursDetails(button.dataset.coursId);
            }
            if (e.target.closest('.marquer-absences-btn')) {
                const button = e.target.closest('.marquer-absences-btn');
                this.showAbsencesSection(button.dataset.coursId);
            }
        });
    }

    filterCoursByStatus() {
        const status = document.getElementById('status-filter').value;
        const filteredCours = status === 'all' 
            ? this.currentCours 
            : this.currentCours.filter(c => c.statut === status);
        
        const tbody = document.getElementById('courses-list');
        if (filteredCours.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-8">
                        <div class="text-gray-400">Aucun cours trouvé</div>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = filteredCours.map(cours => this.createCoursRow(cours)).join('');
        }
    }

    showCoursDetails(coursId) {
        const cours = this.currentCours.find(c => c.id === coursId);
        if (!cours) return;

        const modal = document.getElementById('course-details-modal');
        document.getElementById('modal-course-title').textContent = cours.module?.libelle || 'Détails du cours';
        document.getElementById('modal-course-date').textContent = cours.date_cours || 'Non spécifié';
        document.getElementById('modal-course-time').textContent = 
            `${cours.heure_debut?.substring(0, 5) || '--:--'} - ${cours.heure_fin?.substring(0, 5) || '--:--'}`;
        document.getElementById('modal-course-room').textContent = cours.salle || 'Non spécifié';
        
        const statusElement = document.getElementById('modal-course-status');
        statusElement.textContent = cours.statut || 'Inconnu';
        statusElement.className = `font-bold ${
            cours.statut === 'planifié' ? 'text-info' : 
            cours.statut === 'effectué' ? 'text-success' : 'text-warning'
        }`;
        
        document.getElementById('modal-course-classes').textContent = 
            cours.classes?.map(c => c.libelle).join(', ') || 'Aucune classe';
        document.getElementById('modal-course-description').textContent = 
            cours.module?.description || 'Aucune description disponible';

        modal.showModal();
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                authStore.clearUser();
                router.navigateTo('/frontend/public/index.html');
            });
        }
    }

    getDashboardPath() {
        const user = authStore.getCurrentUser();
        const paths = {
            1: "/frontend/src/pages/rp/dashboard.html",
            2: "/frontend/src/pages/professeurs/gestion-absences.html",
            3: "/frontend/src/pages/attache/attache.html",
            4: "/frontend/src/pages/etudiant/etudiant.html",
        };
        return paths[user.id_role] || "/frontend/public/index.html";
    }

    // Méthodes utilitaires d'UI
    updateUIElements(updates) {
        Object.entries(updates).forEach(([selector, value]) => {
            const element = document.querySelector(selector);
            if (element) element.textContent = value;
        });
    }

    showError(message) {
        showNotification(message, 'error');
    }
}

export const professeurManager = new ProfesseurManager();