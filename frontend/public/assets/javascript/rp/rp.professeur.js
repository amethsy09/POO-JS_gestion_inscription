import { router } from "../../../../src/router/router.js";

// Classe Sidebar
class SidebarComponent {
    constructor(containerId, activeLink = 'professeurs') {
        this.containerId = containerId;
        this.activeLink = activeLink;
        this.links = [
            { id: 'dashboard', icon: 'ri-dashboard-line', text: 'Dashboard' },
            { id: 'classes', icon: 'ri-group-line', text: 'Classes' },
            { id: 'professeurs', icon: 'ri-user-star-line', text: 'Professeurs' },
            { id: 'cours', icon: 'ri-book-open-line', text: 'Cours' },
        ];
    }
    
    render() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        container.innerHTML = `
            <aside class="fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 sidebar">
                <div class="sidebar-logo p-6 border-b border-white border-opacity-20">
                    <h1 class="text-2xl font-bold text-white">Ecole 221</h1>
                    <p class="text-white text-opacity-70 text-sm mt-1">Plateforme de gestion</p>
                </div>
                <nav class="mt-6 p-4">
                    <ul class="space-y-2">
                        ${this.links.map(link => `
                            <li>
                                <a href="#" 
                                    class="sidebar-link px-4 py-4 flex items-center text-white text-opacity-80 rounded-xl transition-all duration-200 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10"
                                    id="link-${link.id}"
                                    data-link="${link.id}">
                                    <i class="${link.icon} text-xl mr-4"></i>
                                    <span class="font-medium">${link.text}</span>
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </nav>
            </aside>
        `;
        
        this.addEventListeners();
        this.setActiveLink(this.activeLink);
    }
    
    addEventListeners() {
        this.links.forEach(link => {
            const element = document.getElementById(`link-${link.id}`);
            if (element) {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.setActiveLink(link.id);
                    this.handleNavigation(link.id);
                });
            }
        });
    }
    
    setActiveLink(linkId) {
        this.activeLink = linkId;
        
        this.links.forEach(link => {
            const element = document.getElementById(`link-${link.id}`);
            if (element) {
                element.classList.remove('active-link');
            }
        });
        
        const activeElement = document.getElementById(`link-${linkId}`);
        if (activeElement) {
            activeElement.classList.add('active-link');
        }
    }
    
    handleNavigation(linkId) {
        if (linkId === 'professeurs') return;
        if (linkId === 'classes') {
            window.location.href = 'classes.html';
        } else if (linkId === 'dashboard') {
            window.location.href = 'dashboard.html';
        } else if (linkId === 'cours') {
            window.location.href = 'cours.html';
        } else {
            this.showToast(`Navigation vers ${linkId}.html`, 'info');
        }
    }

    showToast(message, type = 'info') {
        this.showNotification(message, type);
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
}

// Gestion des professeurs avec API réelle
class ProfessorManager {
    constructor() {
        this.API_BASE = 'http://localhost:3000';
        this.professors = [];
        this.utilisateurs = [];
        this.classes = [];
        this.init();
    }
    
    async init() {
        try {
            await Promise.all([
                this.loadProfessors(),
                this.loadUtilisateurs(),
                this.loadClasses()
            ]);
            
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
    
    // Charger les professeurs depuis l'API
    async loadProfessors() {
        try {
            const response = await fetch(`${this.API_BASE}/professeurs`);
            if (!response.ok) throw new Error('Erreur réseau');
            this.professors = await response.json();
        } catch (error) {
            console.error('Erreur de chargement des professeurs:', error);
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
    
    renderProfessors() {
        const grid = document.getElementById('professors-grid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        if (this.professors.length === 0) {
            grid.innerHTML = `
                <div class="col-span-4 text-center py-16">
                    <div class="glass-card rounded-2xl p-8 max-w-md mx-auto">
                        <i class="ri-user-search-line text-5xl text-gray-400 mb-4"></i>
                        <h3 class="text-xl font-semibold text-gray-700 mb-2">Aucun professeur trouvé</h3>
                        <p class="text-gray-500">Commencez par ajouter votre premier professeur</p>
                        <button class="btn btn-primary-modern btn-modern mt-4 rounded-xl" id="add-first-professor">
                            <i class="ri-user-add-line mr-2"></i> Ajouter un professeur
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        this.professors.forEach(prof => {
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
            
            card.innerHTML = `
                <div class="relative">
                    <div class="h-24 bg-gradient-to-r ${specialtyColor}"></div>
                    <div class="absolute -bottom-12 left-6">
                        <img src="${user.avatar}" alt="${user.prenom} ${user.nom}" 
                             class="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg">
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
                        <button class="btn btn-primary-modern btn-sm btn-modern flex-1 contact-btn" data-id="${prof.id}">
                            <i class="ri-chat-4-line mr-1"></i> Contacter
                        </button>
                    </div>
                </div>
            `;
            
            grid.appendChild(card);
        });
        
        // Mettre à jour les statistiques
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
        
        modal.innerHTML = `
            <div class="modal-box max-w-2xl modal-glass rounded-2xl">
                <h3 class="font-bold text-lg mb-4">Détails du professeur</h3>
                <div class="flex items-center mb-6">
                    <img src="${user.avatar}" alt="${user.prenom} ${user.nom}" 
                         class="w-20 h-20 rounded-2xl object-cover shadow-md mr-6">
                    <div>
                        <h4 class="font-semibold text-xl">${user.prenom} ${user.nom}</h4>
                        <p class="text-gray-600">${prof.specialite}</p>
                    </div>
                </div>
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
                    date_embauche: professorData.hireDate
                })
            });
            
            if (!profResponse.ok) throw new Error('Erreur lors de la création du professeur');
            
            const newProfessor = await profResponse.json();
            
            // Recharger les données
            await this.loadProfessors();
            await this.loadUtilisateurs();
            
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
        const addFirstProfessor = document.getElementById('add-first-professor');
        
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
        
        if (addFirstProfessor) {
            addFirstProfessor.addEventListener('click', () => {
                const modal = document.getElementById('professor-modal');
                if (modal) modal.showModal();
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
                    await this.loadProfessors();
                    await this.loadUtilisateurs();
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
            if (e.target.classList.contains('view-details') || e.target.closest('.view-details')) {
                const btn = e.target.classList.contains('view-details') 
                    ? e.target 
                    : e.target.closest('.view-details');
                const id = btn.dataset.id;
                
                const prof = this.professors.find(p => p.id == id);
                if (prof) {
                    this.showProfessorDetails(prof);
                }
            }
            
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
    const sidebar = new SidebarComponent('sidebar-container', 'professeurs');
    sidebar.render();
    
    const professorManager = new ProfessorManager();
});