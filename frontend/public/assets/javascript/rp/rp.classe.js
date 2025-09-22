import { router } from "../../../../src/router/router.js";
import { SidebarComponent } from "../../../../src/components/sidebar/sidebar.js";
// Classe Sidebar


// Classe principale pour la gestion des classes avec Fetch API
class ClassManager {
    constructor() {
        this.API_BASE = 'http://localhost:3000';
        this.classes = [];
        this.filteredClasses = [];
        this.filieres = [];
        this.niveaux = [];
        this.annees = [];
        this.showArchived = false; // Nouvelle variable pour gérer l'affichage des archives
        this.init();    
    }
    
    async init() {
        try {
            // Charger toutes les données nécessaires
            await Promise.all([
                this.loadClasses(),
                this.loadFilieres(),
                this.loadNiveaux(),
                this.loadAnnees()
            ]);
            
            // Peupler les sélecteurs
            this.populateSelectors();
            
            this.renderClasses();
            this.setupEventListeners();
            this.setupArchiveToggle(); // Configurer le toggle d'archives
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            this.showNotification('Erreur lors du chargement des données', 'error');
        } finally {
            // Cacher l'overlay de chargement
            document.getElementById('loading-overlay').style.display = 'none';
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
    
    // Charger les filières depuis l'API
    async loadFilieres() {
        try {
            const response = await fetch(`${this.API_BASE}/filieres`);
            if (!response.ok) throw new Error('Erreur réseau');
            this.filieres = await response.json();
        } catch (error) {
            console.error('Erreur de chargement des filières:', error);
            throw error;
        }
    }
    
    // Charger les niveaux depuis l'API
    async loadNiveaux() {
        try {
            const response = await fetch(`${this.API_BASE}/niveaux`);
            if (!response.ok) throw new Error('Erreur réseau');
            this.niveaux = await response.json();
        } catch (error) {
            console.error('Erreur de chargement des niveaux:', error);
            throw error;
        }
    }
    
    // Charger les années scolaires depuis l'API
    async loadAnnees() {
        try {
            const response = await fetch(`${this.API_BASE}/annee_scolaire`);
            if (!response.ok) throw new Error('Erreur réseau');
            this.annees = await response.json();
        } catch (error) {
            console.error('Erreur de chargement des années scolaires:', error);
            throw error;
        }
    }
    
    // Remplir les sélecteurs dans le modal
    populateSelectors() {
        // Remplir le sélecteur de filières
        const filiereSelect = document.getElementById('class-filiere');
        filiereSelect.innerHTML = '<option value="" disabled selected>Sélectionner une filière</option>';
        this.filieres.forEach(filiere => {
            filiereSelect.innerHTML += `<option value="${filiere.id}">${filiere.libelle}</option>`;
        });
        
        // Remplir le sélecteur de niveaux
        const niveauSelect = document.getElementById('class-niveau');
        niveauSelect.innerHTML = '<option value="" disabled selected>Sélectionner un niveau</option>';
        this.niveaux.forEach(niveau => {
            niveauSelect.innerHTML += `<option value="${niveau.id}">${niveau.libelle}</option>`;
        });
        
        // Remplir le sélecteur d'années
        const anneeSelect = document.getElementById('class-annee');
        anneeSelect.innerHTML = '<option value="" disabled selected>Sélectionner une année</option>';
        this.annees.forEach(annee => {
            anneeSelect.innerHTML += `<option value="${annee.id}">${annee.libelle}</option>`;
        });
    }
    
    renderClasses() {
        const tableBody = document.getElementById('classes-table-body');
        if (!tableBody) return;
        
        // Obtenir le terme de recherche
        const searchTerm = document.getElementById('search-input').value.toLowerCase();
        
        // Filtrer les classes selon l'état d'affichage (archivées ou non)
        let classesToRender = this.classes.filter(cls => {
            if (this.showArchived) {
                return cls.state === 'archivé';
            } else {
                return cls.state !== 'archivé';
            }
        });
        
        // Appliquer le filtre de recherche
        if (searchTerm) {
            classesToRender = classesToRender.filter(cls => {
                return (
                    (cls.libelle && cls.libelle.toLowerCase().includes(searchTerm)) ||
                    (this.getFiliereName(cls.id_filiere) && this.getFiliereName(cls.id_filiere).toLowerCase().includes(searchTerm)) ||
                    (this.getNiveauName(cls.id_niveau) && this.getNiveauName(cls.id_niveau).toLowerCase().includes(searchTerm)) ||
                    (this.getAnneeName(cls.id_annee) && this.getAnneeName(cls.id_annee).toLowerCase().includes(searchTerm)) ||
                    (cls.capacite_max && cls.capacite_max.toString().includes(searchTerm)) ||
                    (cls.state && cls.state.toLowerCase().includes(searchTerm))
                );
            });
        }
        
        if (classesToRender.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8 text-gray-500">
                        ${searchTerm ? 'Aucune classe trouvée pour votre recherche' : 
                         this.showArchived ? 'Aucune classe archivée' : 'Aucune classe disponible'}
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = '';
        
        classesToRender.forEach(cls => {
            const row = document.createElement('tr');
            row.classList.add('fade-in');
            
            let stateClass = '';
            let stateText = cls.state || 'disponible';
            
            if (stateText === 'disponible') {
                stateClass = 'badge-success';
            } else if (stateText === 'archivé') {
                stateClass = 'badge-secondary';
            } else {
                stateClass = 'badge-warning';
            }
            
            row.innerHTML = `
                <td>${cls.libelle || 'Non spécifié'}</td>
                <td>${this.getFiliereName(cls.id_filiere) || 'Non spécifié'}</td>
                <td>${this.getNiveauName(cls.id_niveau) || 'Non spécifié'}</td>
                <td>${this.getAnneeName(cls.id_annee) || 'Non spécifié'}</td>
                <td>${cls.capacite_max || 'Non spécifié'} étudiants</td>
                <td><span class="badge ${stateClass}">${stateText}</span></td>
                <td>
                    <div class="dropdown dropdown-end">
                        <button class="btn btn-ghost btn-sm dropdown-toggle">
                            <i class="ri-more-2-line"></i>
                        </button>
                        <ul class="dropdown-menu shadow bg-base-100 rounded-box w-52">
                            ${!this.showArchived ? `
                                <li><a href="#" class="modify-class" data-id="${cls.id}"><i class="ri-edit-line"></i> Modifier</a></li>
                                <li><a href="#" class="view-details" data-id="${cls.id}"><i class="ri-eye-line"></i> Voir détails</a></li>
                                <li>
                                    <a href="#" class="archive-class" data-id="${cls.id}">
                                        <i class="ri-archive-line"></i> 
                                        Archiver
                                    </a>
                                </li>
                            ` : `
                                <li><a href="#" class="view-details" data-id="${cls.id}"><i class="ri-eye-line"></i> Voir détails</a></li>
                                <li>
                                    <a href="#" class="restore-class" data-id="${cls.id}">
                                        <i class="ri-inbox-unarchive-line"></i> 
                                        Restaurer
                                    </a>
                                </li>
                            `}
                        </ul>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Lier les événements après le rendu
        setTimeout(() => {
            this.bindActionEvents();
        }, 100);
    }
    
    // Configurer le toggle d'affichage des archives
    setupArchiveToggle() {
        const archiveToggle = document.getElementById('archive-toggle');
        if (archiveToggle) {
            archiveToggle.addEventListener('change', (e) => {
                this.showArchived = e.target.checked;
                this.renderClasses();
                this.updateArchiveButtonText();
            });
        }
        
        this.updateArchiveButtonText();
    }
    
    // Mettre à jour le texte du bouton d'archivage
    updateArchiveButtonText() {
        const archiveBtn = document.getElementById('toggle-archive-btn');
        if (archiveBtn) {
            archiveBtn.textContent = this.showArchived ? 
                'Voir les classes actives' : 
                'Voir les archives';
        }
    }
    
    // Lier les événements aux boutons d'action
    bindActionEvents() {
        // Modifier une classe
        document.querySelectorAll('.modify-class').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const classId = btn.getAttribute('data-id');
                this.editClass(classId);
            });
        });
        
        // Voir les détails d'une classe
        document.querySelectorAll('.view-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const classId = btn.getAttribute('data-id');
                this.showClassDetails(classId);
            });
        });
        
        // Archiver une classe
        document.querySelectorAll('.archive-class').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const classId = btn.getAttribute('data-id');
                this.showConfirmDialog(
                    'Archiver la classe',
                    'Êtes-vous sûr de vouloir archiver cette classe ?',
                    () => this.archiveClass(classId)
                );
            });
        });
        
        // Restaurer une classe (nouveau)
        document.querySelectorAll('.restore-class').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const classId = btn.getAttribute('data-id');
                this.showConfirmDialog(
                    'Restaurer la classe',
                    'Êtes-vous sûr de vouloir restaurer cette classe ?',
                    () => this.restoreClass(classId)
                );
            });
        });
    }
    
    // Validation du formulaire
    validateForm() {
        let isValid = true;
        
        // Réinitialiser les erreurs
        this.clearErrors();
        
        // Validation du libellé
        const name = document.getElementById('class-name').value.trim();
        if (!name) {
            this.showError('class-name', 'Le libellé est requis');
            isValid = false;
        }
        
        // Validation de la filière
        const filiere = document.getElementById('class-filiere').value;
        if (!filiere) {
            this.showError('class-filiere', 'Veuillez sélectionner une filière');
            isValid = false;
        }
        
        // Validation du niveau
        const niveau = document.getElementById('class-niveau').value;
        if (!niveau) {
            this.showError('class-niveau', 'Veuillez sélectionner un niveau');
            isValid = false;
        }
        
        // Validation de l'année
        const annee = document.getElementById('class-annee').value;
        if (!annee) {
            this.showError('class-annee', 'Veuillez sélectionner une année scolaire');
            isValid = false;
        }
        
        // Validation de la capacité
        const capacity = document.getElementById('class-capacity').value;
        if (!capacity || isNaN(capacity) || parseInt(capacity) <= 0) {
            this.showError('class-capacity', 'La capacité doit être un nombre supérieur à 0');
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
            
            // Supprimer l'animation après son exécution
            setTimeout(() => {
                field.classList.remove('shake');
            }, 500);
        }
    }
    
    clearErrors() {
        // Réinitialiser tous les messages d'erreur
        document.querySelectorAll('.error-message').forEach(el => {
            el.style.display = 'none';
        });
        
        // Réinitialiser les bordures d'erreur
        document.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });
    }
    
    // Fonctions utilitaires
    getFiliereName(id) {
        const filiere = this.filieres.find(f => f.id == id);
        return filiere ? filiere.libelle : null;
    }
    
    getNiveauName(id) {
        const niveau = this.niveaux.find(n => n.id == id);
        return niveau ? niveau.libelle : null;
    }
    
    getAnneeName(id) {
        const annee = this.annees.find(a => a.id == id);
        return annee ? annee.libelle : null;
    }
    
    showSubmitLoading(show) {
        const submitText = document.getElementById('submit-text');
        const submitSpinner = document.getElementById('submit-spinner');
        
        if (submitText && submitSpinner) {
            submitText.style.display = show ? 'none' : 'inline';
            submitSpinner.style.display = show ? 'inline-block' : 'none';
            document.getElementById('submit-btn').disabled = show;
        }
    }
    
    // Gestion des événements
    setupEventListeners() {
        // Ajouter une classe
        document.getElementById('add-class-btn').addEventListener('click', () => {
            document.getElementById('modal-title').textContent = 'Ajouter une nouvelle classe';
            document.getElementById('class-form').reset();
            document.getElementById('class-id').value = '';
            this.clearErrors();
            document.getElementById('class-modal').showModal();
        });
        
        // Actualiser les données
        document.getElementById('refresh-btn').addEventListener('click', async () => {
            document.getElementById('loading-overlay').style.display = 'flex';
            try {
                await this.loadClasses();
                this.renderClasses();
                this.showNotification('Données actualisées avec succès');
            } catch (error) {
                console.error('Erreur lors de l\'actualisation:', error);
                this.showNotification('Erreur lors de l\'actualisation', 'error');
            } finally {
                document.getElementById('loading-overlay').style.display = 'none';
            }
        });
        
        // Recherche de classes
        document.getElementById('search-input').addEventListener('input', () => {
            this.renderClasses();
        });
        
        // Annuler le modal
        document.getElementById('cancel-class-modal').addEventListener('click', () => {
            document.getElementById('class-modal').close();
        });
        
        // Soumettre le formulaire de classe
        document.getElementById('class-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Valider le formulaire
            if (!this.validateForm()) {
                return;
            }
            
            // Récupérer les données du formulaire
            const classData = {
                libelle: document.getElementById('class-name').value,
                id_filiere: document.getElementById('class-filiere').value,
                id_niveau: document.getElementById('class-niveau').value,
                id_annee: document.getElementById('class-annee').value,
                capacite_max: parseInt(document.getElementById('class-capacity').value),
                state: document.getElementById('class-state').value
            };
            
            const classId = document.getElementById('class-id').value;
            
            this.showSubmitLoading(true);
            
            try {
                if (classId) {
                    await this.updateClass(classId, classData);
                } else {
                    await this.addClass(classData);
                }
            } catch (error) {
                console.error('Erreur lors de l\'opération:', error);
                this.showNotification('Erreur lors de l\'opération', 'error');
            } finally {
                this.showSubmitLoading(false);
            }
        });
        
        // Bouton pour basculer entre archives et classes actives
        document.getElementById('toggle-archive-btn')?.addEventListener('click', () => {
            this.showArchived = !this.showArchived;
            this.renderClasses();
            this.updateArchiveButtonText();
        });
    }
    
    // Méthodes CRUD avec Fetch API
    async addClass(classData) {
        try {
            const response = await fetch(`${this.API_BASE}/classes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(classData)
            });
            
            if (!response.ok) throw new Error('Erreur lors de l\'ajout');
            
            const newClass = await response.json();
            this.classes.push(newClass);
            this.renderClasses();
            this.showNotification(`Classe "${classData.libelle}" ajoutée avec succès!`);
            document.getElementById('class-modal').close();
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur lors de l\'ajout de la classe. Vérifiez que le serveur JSON est démarré.', 'error');
            throw error;
        }
    }
    
    async updateClass(id, updatedData) {
        try {
            const response = await fetch(`${this.API_BASE}/classes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });
            
            if (!response.ok) throw new Error('Erreur lors de la mise à jour');
            
            const updatedClass = await response.json();
            
            // Mettre à jour localement
            const index = this.classes.findIndex(c => c.id == id);
            if (index !== -1) {
                this.classes[index] = updatedClass;
            }
            
            this.renderClasses();
            this.showNotification(`Classe mise à jour avec succès!`);
            document.getElementById('class-modal').close();
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur lors de la mise à jour de la classe. Vérifiez que le serveur JSON est démarré.', 'error');
            throw error;
        }
    }
    
    async archiveClass(id) {
        try {
            // Trouver la classe
            const cls = this.classes.find(c => c.id == id);
            if (!cls) return;
            
            // Mettre à jour l'état
            const updatedClass = { ...cls, state: 'archivé' };
            
            const response = await fetch(`${this.API_BASE}/classes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedClass)
            });
            
            if (!response.ok) throw new Error('Erreur lors de l\'archivage');
            
            // Mettre à jour localement
            const index = this.classes.findIndex(c => c.id == id);
            if (index !== -1) {
                this.classes[index] = updatedClass;
            }
            
            this.renderClasses();
            this.showNotification(`Classe archivée avec succès!`);
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur lors de l\'archivage de la classe. Vérifiez que le serveur JSON est démarré.', 'error');
        }
    }
    
    // Nouvelle méthode pour restaurer une classe
    async restoreClass(id) {
        try {
            // Trouver la classe
            const cls = this.classes.find(c => c.id == id);
            if (!cls) return;
            
            // Mettre à jour l'état
            const updatedClass = { ...cls, state: 'disponible' };
            
            const response = await fetch(`${this.API_BASE}/classes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedClass)
            });
            
            if (!response.ok) throw new Error('Erreur lors de la restauration');
            
            // Mettre à jour localement
            const index = this.classes.findIndex(c => c.id == id);
            if (index !== -1) {
                this.classes[index] = updatedClass;
            }
            
            this.renderClasses();
            this.showNotification(`Classe restaurée avec succès!`);
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur lors de la restauration de la classe. Vérifiez que le serveur JSON est démarré.', 'error');
        }
    }
    
    async showClassDetails(id) {
        try {
            const cls = this.classes.find(c => c.id == id);
            if (!cls) return;
            
            this.showDetailsModal(
                `Détails de la classe: ${cls.libelle}`,
                `
                <div class="space-y-3">
                    <div class="flex justify-between">
                        <span class="font-semibold">Filière:</span>
                        <span>${this.getFiliereName(cls.id_filiere) || 'Non spécifié'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-semibold">Niveau:</span>
                        <span>${this.getNiveauName(cls.id_niveau) || 'Non spécifié'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-semibold">Année:</span>
                        <span>${this.getAnneeName(cls.id_annee) || 'Non spécifié'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-semibold">Capacité:</span>
                        <span>${cls.capacite_max || 'Non spécifié'} étudiants</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="font-semibold">État:</span>
                        <span class="badge ${cls.state === 'archivé' ? 'badge-secondary' : 'badge-success'}">${cls.state || 'disponible'}</span>
                    </div>
                </div>
                `
            );
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur lors du chargement des détails', 'error');
        }
    }
    
    async editClass(id) {
        try {
            const cls = this.classes.find(c => c.id == id);
            if (!cls) return;
            
            // S'assurer que les sélecteurs sont à jour
            this.populateSelectors();
            
            // Donner un peu de temps pour que les sélecteurs soient mis à jour
            setTimeout(() => {
                document.getElementById('modal-title').textContent = 'Modifier la classe';
                document.getElementById('class-id').value = cls.id;
                document.getElementById('class-name').value = cls.libelle || '';
                
                // Définir les valeurs des sélecteurs
                document.getElementById('class-filiere').value = cls.id_filiere || '';
                document.getElementById('class-niveau').value = cls.id_niveau || '';
                document.getElementById('class-annee').value = cls.id_annee || '';
                
                document.getElementById('class-capacity').value = cls.capacite_max || '';
                document.getElementById('class-state').value = cls.state || 'disponible';
                
                this.clearErrors();
                document.getElementById('class-modal').showModal();
            }, 50);
        } catch (error) {
            console.error('Erreur:', error);
            this.showNotification('Erreur lors du chargement de la classe', 'error');
        }
    }
    
    // Méthodes pour les popups et toast
    showNotification(message, type = 'success') {
        // Créer l'élément de notification toast
        const toast = document.createElement('div');
        toast.className = `toast toast-top toast-end z-50`;
        toast.innerHTML = `
            <div class="alert alert-${type} shadow-lg">
                <div class="flex items-center">
                    <i class="ri-${type === 'success' ? 'check' : type === 'error' ? 'close' : 'information'}-circle-fill mr-2"></i>
                    <span>${message}</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Supprimer le toast après 3 secondes
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    showConfirmDialog(title, message, onConfirm, onCancel = null) {
        // Créer le modal de confirmation avec l'élément dialog
        const modalId = 'confirm-modal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('dialog');
            modal.id = modalId;
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-box">
                    <h3 class="font-bold text-lg" id="confirm-title">${title}</h3>
                    <p class="py-4" id="confirm-message">${message}</p>
                    <div class="modal-action">
                        <button class="btn btn-ghost" id="confirm-cancel">Annuler</button>
                        <button class="btn btn-primary" id="confirm-ok">Confirmer</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        } else {
            document.getElementById('confirm-title').textContent = title;
            document.getElementById('confirm-message').textContent = message;
        }
        
        // Gérer les événements
        const cancelBtn = document.getElementById('confirm-cancel');
        const confirmBtn = document.getElementById('confirm-ok');
        
        const cleanup = () => {
            cancelBtn.removeEventListener('click', cancelHandler);
            confirmBtn.removeEventListener('click', confirmHandler);
            modal.close();
        };
        
        const cancelHandler = () => {
            cleanup();
            if (onCancel) onCancel();
        };
        
        const confirmHandler = () => {
            cleanup();
            onConfirm();
        };
        
        cancelBtn.addEventListener('click', cancelHandler);
        confirmBtn.addEventListener('click', confirmHandler);
        
        // Afficher le modal
        modal.showModal();
    }
    
    showDetailsModal(title, content) {
        // Créer le modal de détails avec l'élément dialog
        const modalId = 'details-modal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('dialog');
            modal.id = modalId;
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-box max-w-2xl">
                    <h3 class="font-bold text-lg" id="details-title">${title}</h3>
                    <div class="py-4" id="details-content">
                        ${content}
                    </div>
                    <div class="modal-action">
                        <button class="btn btn-primary" id="details-close">Fermer</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        } else {
            document.getElementById('details-title').textContent = title;
            document.getElementById('details-content').innerHTML = content;
        }
        
        // Gérer l'événement de fermeture
        const closeBtn = document.getElementById('details-close');
        
        const closeHandler = () => {
            closeBtn.removeEventListener('click', closeHandler);
            modal.close();
        };
        
        closeBtn.addEventListener('click', closeHandler);
        
        // Afficher le modal
        modal.showModal();
    }
}

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    const currentPage =  window.location.pathname.includes('classes') ? 'classes' :
                          window.location.pathname.includes('professeurs') ? 'professeurs' :
                          window.location.pathname.includes('cours') ? 'cours' : 'dashboard';
    const sidebar = new SidebarComponent('sidebar-container', currentPage);
    sidebar.render();
    
    const classManager = new ClassManager();
});