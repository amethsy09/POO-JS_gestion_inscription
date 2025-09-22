import {SidebarComponent} from "../../../../src/components/sidebar/sidebar.js";
// Gestion des professeurs avec API réelle
class ProfessorManager {
    constructor() {
        this.API_BASE = 'http://localhost:3000';
        this.professors = [];
        this.archivedProfessors = [];
        this.utilisateurs = [];
        this.classes = [];
        this.currentView = 'active'; // 'active' ou 'archived'
            this.init();
        
    }
    
    async init() {
        try {
            await Promise.all([
                this.loadProfessors(),
                this.loadArchivedProfessors(),
                this.loadUtilisateurs(),
                this.loadClasses()
            ]);
            
            this.renderViewSwitcher();
            this.renderProfessors();
            this.setupEventListeners();
            
            // Cacher l'overlay de chargement
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
            
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            this.showNotification('Erreur lors du chargement des données', 'error');
        }
    }
    
    // Charger les professeurs actifs depuis l'API
    async loadProfessors() {
        try {
            const response = await fetch(`${this.API_BASE}/professeurs?archived=false`);
            if (!response.ok) throw new Error('Erreur réseau');
            this.professors = await response.json();
        } catch (error) {
            console.error('Erreur de chargement des professeurs:', error);
            throw error;
        }
    }
    
    // Charger les professeurs archivés depuis l'API
    async loadArchivedProfessors() {
        try {
            const response = await fetch(`${this.API_BASE}/professeurs?archived=true`);
            if (!response.ok) throw new Error('Erreur réseau');
            this.archivedProfessors = await response.json();
        } catch (error) {
            console.error('Erreur de chargement des professeurs archivés:', error);
            throw error;
        }
    }
    
    // Charger les utilisateurs depuis l'API
    async loadUtilisateurs() {
        try {
            const response = await fetch(`${this.API_BASE}/utilisateurs`);
            if (!response.ok) throw new Error('Erreur réseau');
            this.utilisateurs = await response.json();
        } catch (error) {
            console.error('Erreur de chargement des utilisateurs:', error);
            throw error;
        }
    }
    
    // Charger les classes depuis l'API
    async loadClasses() {
        try {
            const response = await fetch(`${this.API_BASE}/classes`);
            if (!response.ok) throw new Error('Erreur réseau');
            this.classes = await response.json();
        } catch (error) {
            console.error('Erreur de chargement des classes:', error);
            throw error;
        }
    }
    
    // Obtenir les informations utilisateur d'un professeur
    getProfessorUser(professor) {
        return this.utilisateurs.find(user => user.id == professor.id_utilisateur);
    }
    
    // Afficher le sélecteur de vue (actif/archivé)
    renderViewSwitcher() {
        const container = document.getElementById('view-switcher-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="flex space-x-2 mb-6">
                <button class="btn ${this.currentView === 'active' ? 'btn-primary-modern' : 'btn-outline'} btn-modern rounded-xl view-switcher" data-view="active">
                    <i class="ri-user-line mr-2"></i> Professeurs actifs
                    <span class="badge badge-sm ml-2">${this.professors.length}</span>
                </button>
                <button class="btn ${this.currentView === 'archived' ? 'btn-primary-modern' : 'btn-outline'} btn-modern rounded-xl view-switcher" data-view="archived">
                    <i class="ri-archive-line mr-2"></i> Professeurs archivés
                    <span class="badge badge-sm ml-2">${this.archivedProfessors.length}</span>
                </button>
            </div>
        `;
    }
    
    renderProfessors() {
        const grid = document.getElementById('professors-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const currentList = this.currentView === 'active' ? this.professors : this.archivedProfessors;
        
        if (currentList.length === 0) {
            const message = this.currentView === 'active' 
                ? 'Aucun professeur actif trouvé'
                : 'Aucun professeur archivé trouvé';
                
            const buttonText = this.currentView === 'active' 
                ? 'Ajouter un professeur'
                : 'Voir les professeurs actifs';
                
            const buttonId = this.currentView === 'active' 
                ? 'add-first-professor'
                : 'switch-to-active';
                
            const buttonIcon = this.currentView === 'active' 
                ? 'ri-user-add-line'
                : 'ri-user-line';
                
            grid.innerHTML = `
                <div class="col-span-4 text-center py-16">
                    <div class="glass-card rounded-2xl p-8 max-w-md mx-auto">
                        <i class="ri-${this.currentView === 'active' ? 'user-search' : 'archive'}-line text-5xl text-gray-400 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">${message}</h3>
                        <p class="text-gray-500">${this.currentView === 'active' ? 'Commencez par ajouter votre premier professeur' : 'Les professeurs archivés n\'apparaissent pas dans la liste principale'}</p>
                        <button class="btn btn-primary-modern btn-modern mt-4 rounded-xl" id="${buttonId}">
                            <i class="${buttonIcon} mr-2"></i> ${buttonText}
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        currentList.forEach(prof => {
            const user = this.getProfessorUser(prof);
            if (!user) return;
            
            const card = document.createElement('div');
            card.className = 'professor-card fade-in';
            
            // Couleur basée sur la spécialité
            let specialtyColor = 'from-blue-500 to-blue-600';
            let specialtyIcon = 'ri-computer-line';
            
            switch(prof.specialite) {
                case 'Mathématiques':
                    specialtyColor = 'from-purple-500 to-purple-600';
                    specialtyIcon = 'ri-calculator-line';
                    break;
                case 'Physique':
                    specialtyColor = 'from-orange-500 to-orange-600';
                    specialtyIcon = 'ri-atom-line';
                    break;
                case 'Chimie':
                    specialtyColor = 'from-green-500 to-green-600';
                    specialtyIcon = 'ri-flask-line';
                    break;
                case 'Biologie':
                    specialtyColor = 'from-emerald-500 to-emerald-600';
                    specialtyIcon = 'ri-dna-line';
                    break;
            }
            
            // Ajouter une bordure rouge pour les archivés
            const archiveBorder = this.currentView === 'archived' ? 'border-l-4 border-l-red-500' : '';
            
            card.innerHTML = `
                <div class="relative ${archiveBorder}">
                    <div class="h-24 bg-gradient-to-r ${specialtyColor} ${this.currentView === 'archived' ? 'opacity-70' : ''}"></div>
                    ${this.currentView === 'archived' ? 
                        '<div class="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">Archivé</div>' : 
                        ''
                    }
                    <div class="absolute -bottom-12 left-6">
                        <img src="${user.avatar}" alt="${user.prenom} ${user.nom}" 
                             class="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg ${this.currentView === 'archived' ? 'grayscale' : ''}">
                    </div>
                </div>
                
                <div class="pt-14 pb-6 px-6">
                    <div class="mb-4">
                        <h3 class="text-xl font-bold text-gray-900 truncate">${user.prenom} ${user.nom}</h3>
                        <div class="flex items-center mt-1">
                            <i class="${specialtyIcon} text-${specialtyColor.split('-')[1]}-500 mr-2"></i>
                            <span class="text-gray-600">${prof.specialite}</span>
                        </div>
                        <div class="tag inline-block mt-2">
                            ${prof.grade}
                        </div>
                    </div>
                    
                    <div class="space-y-3 text-sm">
                        <div class="flex items-center text-gray-600">
                            <i class="ri-mail-line mr-3"></i>
                            <span class="truncate">${user.email}</span>
                        </div>
                        <div class="flex items-center text-gray-600">
                            <i class="ri-phone-line mr-3"></i>
                            <span>${user.telephone}</span>
                        </div>
                        <div class="flex items-center text-gray-600">
                            <i class="ri-calendar-event-line mr-3"></i>
                            <span>${this.formatDate(prof.date_embauche)}</span>
                        </div>
                    </div>
                    
                    <div class="flex space-x-3 mt-6 pt-4 border-t">
                        <button class="btn btn-outline btn-sm btn-modern flex-1 view-details" data-id="${prof.id}">
                            <i class="ri-eye-line mr-1"></i> Détails
                        </button>
                        ${this.currentView === 'active' ? 
                            `<button class="btn btn-primary-modern btn-sm btn-modern flex-1 contact-btn" data-id="${prof.id}">
                                <i class="ri-chat-4-line mr-1"></i> Contacter
                            </button>
                            <button class="btn btn-warning btn-sm btn-modern edit-btn" data-id="${prof.id}" title="Modifier">
                                <i class="ri-edit-line"></i>
                            </button>
                            <button class="btn btn-error btn-sm btn-modern archive-btn" data-id="${prof.id}" title="Archiver">
                                <i class="ri-archive-line"></i>
                            </button>` :
                            `<button class="btn btn-success btn-sm btn-modern restore-btn" data-id="${prof.id}" title="Restaurer">
                                <i class="ri-refresh-line"></i>
                            </button>
                            <button class="btn btn-error btn-sm btn-modern delete-btn" data-id="${prof.id}" title="Supprimer définitivement">
                                <i class="ri-delete-bin-line"></i>
                            </button>`
                        }
                    </div>
                </div>
            `;
            
            grid.appendChild(card);
        });
        
        // Mettre à jour les statistiques (uniquement pour les actifs)
        this.updateStatistics();
    }
    
    updateStatistics() {
        const totalProfs = document.getElementById('total-professors');
        const totalCourses = document.getElementById('total-courses');
        const totalHours = document.getElementById('total-hours');
        
        if (totalProfs) totalProfs.textContent = this.professors.length;
        if (totalCourses) totalCourses.textContent = this.professors.length * 3;
        if (totalHours) totalHours.textContent = this.professors.length * 18;
    }
    
    formatDate(dateString) {
        if (!dateString) return 'Non spécifié';
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('fr-FR', options);
    }

    // Afficher un modal de confirmation
    showConfirmationModal(title, message, confirmText, confirmClass, confirmCallback) {
        const modalId = 'confirmation-modal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('dialog');
            modal.id = modalId;
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="modal-box max-w-md modal-glass rounded-2xl">
                <div class="text-center">
                    <div class="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100 mb-4">
                        <i class="ri-alert-line text-2xl text-red-600"></i>
                    </div>
                    <h3 class="font-bold text-lg mb-2">${title}</h3>
                    <p class="text-gray-600 mb-6">${message}</p>
                </div>
                <div class="flex space-x-3 justify-center">
                    <button class="btn btn-outline btn-modern rounded-xl" id="cancel-confirmation">
                        <i class="ri-close-line mr-1"></i> Annuler
                    </button>
                    <button class="btn ${confirmClass} btn-modern rounded-xl" id="confirm-action">
                        <i class="ri-check-line mr-1"></i> ${confirmText}
                    </button>
                </div>
            </div>
        `;
        
        modal.showModal();
        
        const cancelBtn = document.getElementById('cancel-confirmation');
        const confirmBtn = document.getElementById('confirm-action');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.close();
            });
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                modal.close();
                confirmCallback();
            });
        }
        
        // Fermer le modal en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.close();
            }
        });
    }
    
    // Archiver un professeur
    async archiveProfessor(professorId) {
        const professor = this.professors.find(p => p.id == professorId);
        const user = professor ? this.getProfessorUser(professor) : null;
        const professorName = user ? `${user.prenom} ${user.nom}` : 'ce professeur';
        
        this.showConfirmationModal(
            'Archiver le professeur',
            `Êtes-vous sûr de vouloir archiver ${professorName} ?`,
            'Archiver',
            'btn-warning',
            async () => {
                try {
                    const response = await fetch(`${this.API_BASE}/professeurs/${professorId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            archived: true,
                            date_archivage: new Date().toISOString()
                        })
                    });
                    
                    if (!response.ok) throw new Error('Erreur lors de l\'archivage');
                    
                    await Promise.all([
                        this.loadProfessors(),
                        this.loadArchivedProfessors()
                    ]);
                    
                    this.renderViewSwitcher();
                    this.renderProfessors();
                    this.showNotification('Professeur archivé avec succès');
                    
                } catch (error) {
                    console.error('Erreur:', error);
                    this.showNotification('Erreur lors de l\'archivage du professeur', 'error');
                }
            }
        );
    }
    
    // Restaurer un professeur
    async restoreProfessor(professorId) {
        const professor = this.archivedProfessors.find(p => p.id == professorId);
        const user = professor ? this.getProfessorUser(professor) : null;
        const professorName = user ? `${user.prenom} ${user.nom}` : 'ce professeur';
        
        this.showConfirmationModal(
            'Restaurer le professeur',
            `Êtes-vous sûr de vouloir restaurer ${professorName} ?`,
            'Restaurer',
            'btn-success',
            async () => {
                try {
                    const response = await fetch(`${this.API_BASE}/professeurs/${professorId}`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            archived: false,
                            date_archivage: null
                        })
                    });
                    
                    if (!response.ok) throw new Error('Erreur lors de la restauration');
                    
                    await Promise.all([
                        this.loadProfessors(),
                        this.loadArchivedProfessors()
                    ]);
                    
                    this.renderViewSwitcher();
                    this.renderProfessors();
                    this.showNotification('Professeur restauré avec succès');
                    
                } catch (error) {
                    console.error('Erreur:', error);
                    this.showNotification('Erreur lors de la restauration du professeur', 'error');
                }
            }
        );
    }
    
    // Supprimer définitivement un professeur
    async deleteProfessor(professorId) {
        const professor = this.archivedProfessors.find(p => p.id == professorId);
        const user = professor ? this.getProfessorUser(professor) : null;
        const professorName = user ? `${user.prenom} ${user.nom}` : 'ce professeur';
        
        this.showConfirmationModal(
            'Supprimer définitivement',
            `Êtes-vous sûr de vouloir supprimer définitivement ${professorName} ? Cette action est irréversible.`,
            'Supprimer',
            'btn-error',
            async () => {
                try {
                    const response = await fetch(`${this.API_BASE}/professeurs/${professorId}`, {
                        method: 'DELETE'
                    });
                    
                    if (!response.ok) throw new Error('Erreur lors de la suppression');
                    
                    await this.loadArchivedProfessors();
                    this.renderViewSwitcher();
                    this.renderProfessors();
                    this.showNotification('Professeur supprimé définitivement');
                    
                } catch (error) {
                    console.error('Erreur:', error);
                    this.showNotification('Erreur lors de la suppression du professeur', 'error');
                }
            }
        );
    }

    // Afficher le modal de modification
    showEditModal(professorId) {
        const professor = [...this.professors, ...this.archivedProfessors].find(p => p.id == professorId);
        const user = professor ? this.getProfessorUser(professor) : null;
        
        if (!professor || !user) return;
        
        const modalId = 'edit-modal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('dialog');
            modal.id = modalId;
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="modal-box max-w-2xl modal-glass rounded-2xl">
                <h3 class="font-bold text-lg mb-4">Modifier le professeur</h3>
                
                <form id="edit-professor-form" class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="label">
                                <span class="label-text">Nom</span>
                            </label>
                            <input type="text" id="edit-lastname" value="${user.nom}" class="input input-bordered w-full rounded-xl">
                        </div>
                        <div>
                            <label class="label">
                                <span class="label-text">Prénom</span>
                            </label>
                            <input type="text" id="edit-firstname" value="${user.prenom}" class="input input-bordered w-full rounded-xl">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="label">
                                <span class="label-text">Email</span>
                            </label>
                            <input type="email" id="edit-email" value="${user.email}" class="input input-bordered w-full rounded-xl">
                        </div>
                        <div>
                            <label class="label">
                                <span class="label-text">Téléphone</span>
                            </label>
                            <input type="tel" id="edit-phone" value="${user.telephone}" class="input input-bordered w-full rounded-xl">
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="label">
                                <span class="label-text">Spécialité</span>
                            </label>
                            <select id="edit-speciality" class="select select-bordered w-full rounded-xl">
                                <option value="Informatique" ${professor.specialite === 'Informatique' ? 'selected' : ''}>Informatique</option>
                                <option value="Mathématiques" ${professor.specialite === 'Mathématiques' ? 'selected' : ''}>Mathématiques</option>
                                <option value="Physique" ${professor.specialite === 'Physique' ? 'selected' : ''}>Physique</option>
                                <option value="Chimie" ${professor.specialite === 'Chimie' ? 'selected' : ''}>Chimie</option>
                                <option value="Biologie" ${professor.specialite === 'Biologie' ? 'selected' : ''}>Biologie</option>
                            </select>
                        </div>
                        <div>
                            <label class="label">
                                <span class="label-text">Grade</span>
                            </label>
                            <select id="edit-grade" class="select select-bordered w-full rounded-xl">
                                <option value="Professeur" ${professor.grade === 'Professeur' ? 'selected' : ''}>Professeur</option>
                                <option value="Maître de conférences" ${professor.grade === 'Maître de conférences' ? 'selected' : ''}>Maître de conférences</option>
                                <option value="Chargé de cours" ${professor.grade === 'Chargé de cours' ? 'selected' : ''}>Chargé de cours</option>
                                <option value="Assistant" ${professor.grade === 'Assistant' ? 'selected' : ''}>Assistant</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label class="label">
                            <span class="label-text">Date d'embauche</span>
                        </label>
                        <input type="date" id="edit-hiredate" value="${professor.date_embauche}" class="input input-bordered w-full rounded-xl">
                    </div>
                    
                    <div>
                        <label class="label">
                            <span class="label-text">Adresse</span>
                        </label>
                        <textarea id="edit-address" class="textarea textarea-bordered w-full rounded-xl">${user.adresse || ''}</textarea>
                    </div>
                </form>
                
                <div class="modal-action mt-6">
                    <button class="btn btn-outline btn-modern rounded-xl" id="cancel-edit">
                        <i class="ri-close-line mr-1"></i> Annuler
                    </button>
                    <button class="btn btn-primary-modern btn-modern rounded-xl" id="save-edit" data-id="${professor.id}">
                        <i class="ri-save-line mr-1"></i> Sauvegarder
                    </button>
                </div>
            </div>
        `;
        
        modal.showModal();
        
        const cancelBtn = document.getElementById('cancel-edit');
        const saveBtn = document.getElementById('save-edit');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                modal.close();
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.updateProfessor(professor.id);
            });
        }
        
        // Fermer le modal en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.close();
            }
        });
    }

    // Mettre à jour un professeur
    async updateProfessor(professorId) {
        const lastName = document.getElementById('edit-lastname');
        const firstName = document.getElementById('edit-firstname');
        const email = document.getElementById('edit-email');
        const phone = document.getElementById('edit-phone');
        const speciality = document.getElementById('edit-speciality');
        const grade = document.getElementById('edit-grade');
        const hireDate = document.getElementById('edit-hiredate');
        const address = document.getElementById('edit-address');
        
        if (!lastName || !firstName || !email || !phone || !speciality || !grade || !hireDate || !address) {
            return;
        }
        
        try {
            // Mettre à jour l'utilisateur
            const professor = [...this.professors, ...this.archivedProfessors].find(p => p.id == professorId);
            const user = professor ? this.getProfessorUser(professor) : null;
            
            if (!user) {
                throw new Error('Utilisateur non trouvé');
            }
            
            const userResponse = await fetch(`${this.API_BASE}/utilisateurs/${user.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nom: lastName.value.trim(),
                    prenom: firstName.value.trim(),
                    email: email.value.trim(),
                    telephone: phone.value.trim(),
                    adresse: address.value.trim()
                })
            });
            
            if (!userResponse.ok) throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
            
            // Mettre à jour le professeur
            const profResponse = await fetch(`${this.API_BASE}/professeurs/${professorId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    specialite: speciality.value,
                    grade: grade.value,
                    date_embauche: hireDate.value
                })
            });
            
            if (!profResponse.ok) throw new Error('Erreur lors de la mise à jour du professeur');
            
            // Recharger les données
            await Promise.all([
                this.loadProfessors(),
                this.loadArchivedProfessors(),
                this.loadUtilisateurs()
            ]);
            
            this.renderViewSwitcher();
            this.renderProfessors();
            
            // Fermer le modal
            const modal = document.getElementById('edit-modal');
            if (modal) modal.close();
            
            this.showNotification('Professeur modifié avec succès');
            
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur lors de la modification du professeur', 'error');
        }
    }
    
    validateForm() {
        let isValid = true;
        this.clearErrors();
        
        const lastName = document.getElementById('prof-lastname');
        const firstName = document.getElementById('prof-firstname');
        const email = document.getElementById('prof-email');
        const phone = document.getElementById('prof-phone');
        const speciality = document.getElementById('prof-speciality');
        const grade = document.getElementById('prof-grade');
        const hireDate = document.getElementById('prof-hiredate');
        
        if (!lastName || !firstName || !email || !phone || !speciality || !grade || !hireDate) {
            return false;
        }
        
        if (!lastName.value.trim() || lastName.value.trim().length < 2) {
            this.showError('prof-lastname', 'Le nom doit contenir au moins 2 caractères');
            isValid = false;
        }
        
        if (!firstName.value.trim() || firstName.value.trim().length < 2) {
            this.showError('prof-firstname', 'Le prénom doit contenir au moins 2 caractères');
            isValid = false;
        }
        
        const emailValue = email.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailValue) {
            this.showError('prof-email', 'L\'email est requis');
            isValid = false;
        } else if (!emailRegex.test(emailValue)) {
            this.showError('prof-email', 'Veuillez entrer un email valide');
            isValid = false;
        }
        
        const phoneValue = phone.value.trim();
        if (!phoneValue || phoneValue.replace(/[^\d]/g, '').length < 9) {
            this.showError('prof-phone', 'Le numéro doit contenir au moins 9 chiffres');
            isValid = false;
        }
        
        if (!speciality.value) {
            this.showError('prof-speciality', 'Veuillez sélectionner une spécialité');
            isValid = false;
        }
        
        if (!grade.value) {
            this.showError('prof-grade', 'Veuillez sélectionner un grade');
            isValid = false;
        }
        
        if (!hireDate.value) {
            this.showError('prof-hiredate', 'Veuillez sélectionner une date');
            isValid = false;
        }
        
        return isValid;
    }
    
    showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`error-${fieldId}`);
        
        if (field && errorElement) {
            field.classList.add('input-error', 'shake');
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            setTimeout(() => {
                field.classList.remove('shake');
            }, 500);
        }
    }
    
    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });
        
        document.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });
    }
    
    showSubmitLoading(show) {
        const submitText = document.getElementById('submit-text');
        const submitSpinner = document.getElementById('submit-spinner');
        const submitBtn = document.getElementById('submit-btn');
        
        if (submitText && submitSpinner && submitBtn) {
            submitText.style.display = show ? 'none' : 'inline';
            submitSpinner.style.display = show ? 'inline-block' : 'none';
            submitBtn.disabled = show;
        }
    }
    
    showNotification(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast slide-in`;
        toast.innerHTML = `
            <div class="alert alert-${type} shadow-lg glass-card">
                <div class="flex items-center">
                    <i class="ri-${type === 'success' ? 'check' : type === 'error' ? 'close' : 'information'}-circle-fill mr-3 text-lg"></i>
                    <span class="font-medium">${message}</span>
                </div>
            </div>
        `;
        
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    }
    
    // Méthode pour gérer l'upload d'image
    handleImageUpload(event, previewId) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            this.showNotification('Veuillez sélectionner une image valide', 'error');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            this.showNotification('L\'image ne doit pas dépasser 2MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById(previewId);
            if (preview) {
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Preview" 
                         class="w-24 h-24 object-cover rounded-2xl shadow-md">
                `;
            }
        };
        reader.readAsDataURL(file);
        
        return file;
    }
    
    // Méthode pour afficher les détails dans un modal
    showProfessorDetails(prof) {
        const user = this.getProfessorUser(prof);
        if (!user) return;
        
        const modalId = 'details-modal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('dialog');
            modal.id = modalId;
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        const archiveInfo = prof.archived ? 
            `<div class="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                <div class="flex items-center text-red-700">
                    <i class="ri-archive-line mr-2"></i>
                    <span class="font-semibold">Ce professeur est archivé</span>
                </div>
                ${prof.date_archivage ? 
                    `<p class="text-red-600 text-sm mt-1">Archivé le: ${this.formatDate(prof.date_archivage)}</p>` : 
                    ''
                }
            </div>` : '';
        
        modal.innerHTML = `
            <div class="modal-box max-w-2xl modal-glass rounded-2xl">
                <h3 class="font-bold text-lg mb-4">Détails du professeur</h3>
                <div class="flex items-center mb-6">
                    <img src="${user.avatar}" alt="${user.prenom} ${user.nom}" 
                         class="w-20 h-20 rounded-2xl object-cover shadow-md mr-6 ${prof.archived ? 'grayscale' : ''}">
                    <div>
                        <h4 class="font-semibold text-xl">${user.prenom} ${user.nom}</h4>
                        <p class="text-gray-600">${prof.specialite}</p>
                        ${prof.archived ? '<span class="badge badge-error mt-1">Archivé</span>' : ''}
                    </div>
                </div>
                ${archiveInfo}
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <span class="font-semibold text-gray-700">Email:</span>
                            <p class="text-gray-900">${user.email}</p>
                        </div>
                        <div>
                            <span class="font-semibold text-gray-700">Téléphone:</span>
                            <p class="text-gray-900">${user.telephone}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <span class="font-semibold text-gray-700">Spécialité:</span>
                            <p class="text-gray-900">${prof.specialite}</p>
                        </div>
                        <div>
                            <span class="font-semibold text-gray-700">Grade:</span>
                            <p class="text-gray-900">${prof.grade}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <span class="font-semibold text-gray-700">Date d'embauche:</span>
                            <p class="text-gray-900">${this.formatDate(prof.date_embauche)}</p>
                        </div>
                        <div>
                            <span class="font-semibold text-gray-700">Adresse:</span>
                            <p class="text-gray-900">${user.adresse || 'Non spécifié'}</p>
                        </div>
                    </div>
                    <div>
                        <span class="font-semibold text-gray-700">Statut:</span>
                        <span class="badge ${user.state === 'disponible' ? 'badge-success' : 'badge-warning'}">${user.state}</span>
                    </div>
                </div>
                <div class="modal-action mt-6">
                    ${prof.archived ? 
                        `<button class="btn btn-success btn-modern rounded-xl restore-from-details" data-id="${prof.id}">
                            <i class="ri-refresh-line mr-1"></i> Restaurer
                        </button>` : 
                        `<button class="btn btn-warning btn-modern rounded-xl edit-from-details" data-id="${prof.id}">
                            <i class="ri-edit-line mr-1"></i> Modifier
                        </button>
                        <button class="btn btn-error btn-modern rounded-xl archive-from-details" data-id="${prof.id}">
                            <i class="ri-archive-line mr-1"></i> Archiver
                        </button>`
                    }
                    <button class="btn btn-primary-modern btn-modern rounded-xl" id="close-details">Fermer</button>
                </div>
            </div>
        `;
        
        modal.showModal();
        
        const closeBtn = document.getElementById('close-details');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.close();
            });
        }
        
        // Ajouter les écouteurs pour les boutons dans le modal
        const archiveBtn = modal.querySelector('.archive-from-details');
        if (archiveBtn) {
            archiveBtn.addEventListener('click', () => {
                this.archiveProfessor(prof.id);
                modal.close();
            });
        }
        
        const restoreBtn = modal.querySelector('.restore-from-details');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => {
                this.restoreProfessor(prof.id);
                modal.close();
            });
        }
        
        const editBtn = modal.querySelector('.edit-from-details');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                modal.close();
                this.showEditModal(prof.id);
            });
        }
    }
    
    // Méthode pour afficher le modal de contact
    showContactModal(prof) {
        const user = this.getProfessorUser(prof);
        if (!user) return;
        
        const modalId = 'contact-modal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('dialog');
            modal.id = modalId;
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        modal.innerHTML = `
            <div class="modal-box modal-glass rounded-2xl">
                <h3 class="font-bold text-lg mb-4">Contacter ${user.prenom} ${user.nom}</h3>
                <div class="space-y-4">
                    <div class="flex items-center p-3 bg-gray-50 rounded-xl">
                        <i class="ri-mail-line text-blue-500 text-xl mr-3"></i>
                        <div>
                            <p class="font-semibold">Email</p>
                            <p class="text-gray-700">${user.email}</p>
                        </div>
                    </div>
                    <div class="flex items-center p-3 bg-gray-50 rounded-xl">
                        <i class="ri-phone-line text-green-500 text-xl mr-3"></i>
                        <div>
                            <p class="font-semibold">Téléphone</p>
                            <p class="text-gray-700">${user.telephone}</p>
                        </div>
                    </div>
                    <div class="flex items-center p-3 bg-gray-50 rounded-xl">
                        <i class="ri-map-pin-line text-red-500 text-xl mr-3"></i>
                        <div>
                            <p class="font-semibold">Adresse</p>
                            <p class="text-gray-700">${user.adresse || 'Non spécifiée'}</p>
                        </div>
                    </div>
                </div>
                <div class="modal-action mt-6">
                    <button class="btn btn-primary-modern btn-modern rounded-xl" id="close-contact">Fermer</button>
                </div>
            </div>
        `;
        
        modal.showModal();
        
        const closeBtn = document.getElementById('close-contact');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.close();
            });
        }
    }
    
    async addProfessor(professorData) {
        try {
            // D'abord créer l'utilisateur
            const userResponse = await fetch(`${this.API_BASE}/utilisateurs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nom: professorData.lastName,
                    prenom: professorData.firstName,
                    email: professorData.email,
                    telephone: professorData.phone,
                    id_role: "2", // ID rôle professeur
                    avatar: professorData.avatar || 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=600',
                    adresse: professorData.address || 'Non spécifié',
                    state: 'disponible',
                    password: 'password123' // Mot de passe par défaut
                })
            });
            
            if (!userResponse.ok) throw new Error('Erreur lors de la création de l\'utilisateur');
            
            const newUser = await userResponse.json();
            
            // Ensuite créer le professeur
            const profResponse = await fetch(`${this.API_BASE}/professeurs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id_utilisateur: newUser.id,
                    specialite: professorData.speciality,
                    grade: professorData.grade,
                    date_embauche: professorData.hireDate,
                    archived: false,
                    date_archivage: null
                })
            });
            
            if (!profResponse.ok) throw new Error('Erreur lors de la création du professeur');
            
            const newProfessor = await profResponse.json();
            
            // Recharger les données
            await Promise.all([
                this.loadProfessors(),
                this.loadArchivedProfessors(),
                this.loadUtilisateurs()
            ]);
            
            this.renderViewSwitcher();
            this.renderProfessors();
            this.showNotification(`Professeur ${professorData.firstName} ${professorData.lastName} ajouté avec succès`);
            
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur lors de l\'ajout du professeur', 'error');
        }
    }
    
    setupEventListeners() {
        // Vérifier l'existence des éléments avant d'ajouter les écouteurs
        const addButton = document.getElementById('add-prof-btn');
        const cancelButton = document.getElementById('cancel-prof-modal');
        const refreshButton = document.getElementById('refresh-btn');
        const searchInput = document.getElementById('search-input');
        const avatarInput = document.getElementById('prof-avatar');
        const professorForm = document.getElementById('professor-form');
        
        if (addButton) {
            addButton.addEventListener('click', () => {
                const modal = document.getElementById('professor-modal');
                if (modal) modal.showModal();
                
                const form = document.getElementById('professor-form');
                if (form) form.reset();
                
                const avatarPreview = document.getElementById('avatar-preview');
                if (avatarPreview) {
                    avatarPreview.innerHTML = `
                        <div class="w-24 h-24 bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center rounded-2xl">
                            <i class="ri-user-3-line text-3xl text-gray-400"></i>
                        </div>
                    `;
                }
                
                this.clearErrors();
            });
        }
        
        if (cancelButton) {
            cancelButton.addEventListener('click', () => {
                const modal = document.getElementById('professor-modal');
                if (modal) modal.close();
            });
        }
        
        if (refreshButton) {
            refreshButton.addEventListener('click', async () => {
                const loadingOverlay = document.getElementById('loading-overlay');
                if (loadingOverlay) loadingOverlay.style.display = 'flex';
                
                try {
                    await Promise.all([
                        this.loadProfessors(),
                        this.loadArchivedProfessors(),
                        this.loadUtilisateurs()
                    ]);
                    
                    this.renderViewSwitcher();
                    this.renderProfessors();
                    this.showNotification('Liste des professeurs actualisée');
                } catch (error) {
                    this.showNotification('Erreur lors de l\'actualisation', 'error');
                } finally {
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                }
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const cards = document.querySelectorAll('.professor-card');
                
                cards.forEach(card => {
                    const nameElement = card.querySelector('h3');
                    if (nameElement) {
                        const name = nameElement.textContent.toLowerCase();
                        if (name.includes(searchTerm)) {
                            card.style.display = 'block';
                        } else {
                            card.style.display = 'none';
                        }
                    }
                });
            });
        }
        
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                this.handleImageUpload(e, 'avatar-preview');
            });
        }
        
        if (professorForm) {
            professorForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                if (!this.validateForm()) {
                    return;
                }
                
                this.showSubmitLoading(true);
                
                const avatarFile = document.getElementById('prof-avatar');
                let avatarUrl = null;
                
                if (avatarFile && avatarFile.files[0]) {
                    const reader = new FileReader();
                    reader.onload = async (e) => {
                        avatarUrl = e.target.result;
                        await this.submitProfessorForm(avatarUrl);
                    };
                    reader.readAsDataURL(avatarFile.files[0]);
                } else {
                    await this.submitProfessorForm(null);
                }
            });
        }
        
        // Délégation d'événements pour les éléments dynamiques
        document.addEventListener('click', (e) => {
            // Switch de vue
            if (e.target.classList.contains('view-switcher') || e.target.closest('.view-switcher')) {
                const btn = e.target.classList.contains('view-switcher') 
                    ? e.target 
                    : e.target.closest('.view-switcher');
                const view = btn.dataset.view;
                
                this.currentView = view;
                this.renderViewSwitcher();
                this.renderProfessors();
            }
            
            // Bouton "Voir les actifs" dans la vue archivée
            if (e.target.id === 'switch-to-active' || e.target.closest('#switch-to-active')) {
                this.currentView = 'active';
                this.renderViewSwitcher();
                this.renderProfessors();
            }
            
            // Bouton "Ajouter premier professeur"
            if (e.target.id === 'add-first-professor' || e.target.closest('#add-first-professor')) {
                const modal = document.getElementById('professor-modal');
                if (modal) modal.showModal();
            }
            
            // Détails du professeur
            if (e.target.classList.contains('view-details') || e.target.closest('.view-details')) {
                const btn = e.target.classList.contains('view-details') 
                    ? e.target 
                    : e.target.closest('.view-details');
                const id = btn.dataset.id;
                
                const prof = [...this.professors, ...this.archivedProfessors].find(p => p.id == id);
                if (prof) {
                    this.showProfessorDetails(prof);
                }
            }
            
            // Contact
            if (e.target.classList.contains('contact-btn') || e.target.closest('.contact-btn')) {
                const btn = e.target.classList.contains('contact-btn') 
                    ? e.target 
                    : e.target.closest('.contact-btn');
                const id = btn.dataset.id;
                
                const prof = this.professors.find(p => p.id == id);
                if (prof) {
                    this.showContactModal(prof);
                }
            }
            
            // Modification
            if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
                const btn = e.target.classList.contains('edit-btn') 
                    ? e.target 
                    : e.target.closest('.edit-btn');
                const id = btn.dataset.id;
                
                this.showEditModal(id);
            }
            
            // Archivage
            if (e.target.classList.contains('archive-btn') || e.target.closest('.archive-btn')) {
                const btn = e.target.classList.contains('archive-btn') 
                    ? e.target 
                    : e.target.closest('.archive-btn');
                const id = btn.dataset.id;
                
                this.archiveProfessor(id);
            }
            
            // Restauration
            if (e.target.classList.contains('restore-btn') || e.target.closest('.restore-btn')) {
                const btn = e.target.classList.contains('restore-btn') 
                    ? e.target 
                    : e.target.closest('.restore-btn');
                const id = btn.dataset.id;
                
                this.restoreProfessor(id);
            }
            
            // Suppression définitive
            if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
                const btn = e.target.classList.contains('delete-btn') 
                    ? e.target 
                    : e.target.closest('.delete-btn');
                const id = btn.dataset.id;
                
                this.deleteProfessor(id);
            }
        });
    }
    
    async submitProfessorForm(avatarUrl) {
        const lastName = document.getElementById('prof-lastname');
        const firstName = document.getElementById('prof-firstname');
        const email = document.getElementById('prof-email');
        const phone = document.getElementById('prof-phone');
        const speciality = document.getElementById('prof-speciality');
        const grade = document.getElementById('prof-grade');
        const hireDate = document.getElementById('prof-hiredate');
        const address = document.getElementById('prof-address');
        
        if (!lastName || !firstName || !email || !phone || !speciality || !grade || !hireDate || !address) {
            this.showSubmitLoading(false);
            return;
        }
        
        const professorData = {
            lastName: lastName.value.trim(),
            firstName: firstName.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            speciality: speciality.value,
            grade: grade.value,
            hireDate: hireDate.value,
            address: address.value,
            avatar: avatarUrl
        };
        
        await this.addProfessor(professorData);
        this.showSubmitLoading(false);
        
        const modal = document.getElementById('professor-modal');
        if (modal) modal.close();
    }
}

// Initialisation de la page
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.includes('professeurs') ? 'professeurs' : 
                         window.location.pathname.includes('classes') ? 'classes' : 
                          window.location.pathname.includes('cours') ? 'cours' : 'dashboard';
    const sidebar = new SidebarComponent('sidebar-container', 'currentPage');
    sidebar.render();
    
    const professorManager = new ProfessorManager();
});