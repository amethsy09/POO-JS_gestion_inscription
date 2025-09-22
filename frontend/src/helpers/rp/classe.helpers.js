class ClassManager {
  constructor() {
    this.currentFilters = {};
    this.baseUrl = 'http://localhost:3000/';
    this.initElements();
    this.bindEvents();
  }

  initElements() {
    this.elements = {
      notifications: document.getElementById('notifications'),
      loadingModal: document.getElementById('loading-modal'),
      loadingMessage: document.getElementById('loading-message'),
      classesContainer: document.getElementById('classes-container'),
      filterBtn: document.getElementById('filter-btn'),
      searchInput: document.getElementById('search-input'),
      filiereSelect: document.getElementById('filiere-select'),
      niveauSelect: document.getElementById('niveau-select'),
      anneeSelect: document.getElementById('annee-select')
    };
  }

  bindEvents() {
    if (this.elements.filterBtn) {
      this.elements.filterBtn.addEventListener('click', () => this.applyFilters());
    }
    
    document.addEventListener('DOMContentLoaded', () => this.addFloatingButton());
  }

  // Fonction pour créer un élément avec classes et attributs
  createElement(tag, classes = '', attributes = {}) {
    const element = document.createElement(tag);
    if (classes) element.className = classes;
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
    return element;
  }

  // Fonction pour afficher une notification
  showNotification(message, type = 'info') {
    const notification = this.createElement('div', `alert alert-${type} shadow-lg mb-4`);
    notification.innerHTML = `
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>${message}</span>
      </div>
    `;
    
    if (this.elements.notifications) {
      this.elements.notifications.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 5000);
    }
  }

  // Fonction pour afficher un modal de chargement
  showLoadingModal(message = 'Chargement en cours...') {
    if (this.elements.loadingModal && this.elements.loadingMessage) {
      this.elements.loadingMessage.textContent = message;
      this.elements.loadingModal.style.display = 'block';
    }
    
    return {
      close: () => {
        if (this.elements.loadingModal) {
          this.elements.loadingModal.style.display = 'none';
        }
      }
    };
  }

  // Fonction pour récupérer les données depuis l'API
  async fetchData(endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      if (!response.ok) throw new Error('Erreur réseau');
      return await response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération des ${endpoint}:`, error);
      throw error;
    }
  }

  // Fonction pour appliquer les filtres
  applyFilters() {
    this.currentFilters = {
      search: this.elements.searchInput?.value || '',
      filiere: this.elements.filiereSelect?.value || '',
      niveau: this.elements.niveauSelect?.value || '',
      annee: this.elements.anneeSelect?.value || ''
    };
    this.renderClassesTable();
  }

  // Fonction pour afficher les classes dans le tableau
  async renderClassesTable() {
    let loading;
    
    try {
      loading = this.showLoadingModal();
      
      // Récupérer les données nécessaires
      const [classes, filieres, niveaux, annees, etudiants] = await Promise.all([
        this.fetchData('classes?_expand=filiere&_expand=niveau&_expand=annee_scolaire'),
        this.fetchData('filieres'),
        this.fetchData('niveaux'),
        this.fetchData('annee_scolaire'),
        this.fetchData('etudiants')
      ]);
      
      // Appliquer les filtres
      let filteredClasses = [...classes];
      if (this.currentFilters.search) {
        const searchTerm = this.currentFilters.search.toLowerCase();
        filteredClasses = filteredClasses.filter(classe => 
          classe.libelle.toLowerCase().includes(searchTerm)
        );
      }
      if (this.currentFilters.filiere) {
        filteredClasses = filteredClasses.filter(classe => 
          classe.id_filiere == this.currentFilters.filiere
        );
      }
      if (this.currentFilters.niveau) {
        filteredClasses = filteredClasses.filter(classe => 
          classe.id_niveau == this.currentFilters.niveau
        );
      }
      if (this.currentFilters.annee) {
        filteredClasses = filteredClasses.filter(classe => 
          classe.id_annee == this.currentFilters.annee
        );
      }
      
      // Calculer le nombre d'étudiants par classe
      const classesWithStats = filteredClasses.map(classe => {
        const etudiantsInClass = etudiants.filter(e => e.id_classe == classe.id);
        const tauxRemplissage = Math.round((etudiantsInClass.length / classe.capacite_max) * 100);
        
        return {
          ...classe,
          etudiantsCount: etudiantsInClass.length,
          tauxRemplissage
        };
      });
      
      // Créer le tableau HTML
      const table = this.createElement('div', 'bg-white rounded-lg shadow overflow-hidden');
      table.innerHTML = `
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Libellé</th>
                <th>Filière</th>
                <th>Niveau</th>
                <th>Année scolaire</th>
                <th>Capacité</th>
                <th>Inscrits</th>
                <th>Taux remplissage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${classesWithStats.map(classe => `
                <tr>
                  <td>${classe.libelle}</td>
                  <td>${classe.filiere?.libelle || 'Non défini'}</td>
                  <td>${classe.niveau?.libelle || 'Non défini'}</td>
                  <td>${classe.annee_scolaire?.libelle || 'Non défini'}</td>
                  <td>${classe.capacite_max}</td>
                  <td>${classe.etudiantsCount}</td>
                  <td>
                    <div class="flex items-center gap-2">
                      <progress class="progress progress-primary w-32" 
                                value="${classe.tauxRemplissage}" max="100"></progress>
                      <span>${classe.tauxRemplissage}%</span>
                    </div>
                  </td>
                  <td>
                    <div class="flex gap-2">
                      <button class="btn btn-sm btn-info" data-action="view" data-id="${classe.id}">
                        <i class="ri-eye-line"></i>
                      </button>
                      <button class="btn btn-sm btn-warning" data-action="edit" data-id="${classe.id}">
                        <i class="ri-pencil-line"></i>
                      </button>
                      <button class="btn btn-sm btn-error" data-action="delete" data-id="${classe.id}">
                        <i class="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
      
      // Gérer les actions du tableau
      table.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
          const action = btn.dataset.action;
          const id = btn.dataset.id;
          
          switch(action) {
            case 'view':
              this.showClassDetails(id);
              break;
            case 'edit':
              this.showEditClassForm(id);
              break;
            case 'delete':
              this.showDeleteConfirmation(id);
              break;
          }
        });
      });
      
      // Afficher le tableau
      if (this.elements.classesContainer) {
        this.elements.classesContainer.innerHTML = '';
        this.elements.classesContainer.appendChild(table);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement des classes:', error);
      this.showNotification('Erreur lors du chargement des classes', 'error');
    } finally {
      if (loading) loading.close();
    }
  }

  // Fonction pour initialiser les filtres
  async initFilters() {
    try {
      const [filieres, niveaux, annees] = await Promise.all([
        this.fetchData('filieres'),
        this.fetchData('niveaux'),
        this.fetchData('annee_scolaire')
      ]);
      
      // Remplir les select de filtre
      this.fillSelect('filiere-select', filieres);
      this.fillSelect('niveau-select', niveaux);
      this.fillSelect('annee-select', annees);
      
    } catch (error) {
      console.error('Erreur lors du chargement des filtres:', error);
      this.showNotification('Erreur lors du chargement des filtres', 'error');
    }
  }

  fillSelect(selectId, data, valueProp = 'id', labelProp = 'libelle') {
    const select = document.getElementById(selectId);
    if (select) {
      // Garder la première option (Toutes/Tous)
      const firstOption = select.options[0];
      select.innerHTML = '';
      select.appendChild(firstOption);
      
      data.forEach(item => {
        const option = this.createElement('option');
        option.value = item[valueProp];
        option.textContent = item[labelProp];
        select.appendChild(option);
      });
    }
  }

  // Fonction pour afficher les détails d'une classe
  async showClassDetails(classId) {
    const loading = this.showLoadingModal('Chargement des détails...');
    
    try {
      const [classe, etudiants, professeurs] = await Promise.all([
        this.fetchData(`classes/${classId}?_expand=filiere&_expand=niveau&_expand=annee_scolaire`),
        this.fetchData(`etudiants?id_classe=${classId}&_expand=utilisateur`),
        this.fetchData(`classes_professeur?id_classe=${classId}&_expand=professeur`)
      ]);
      
      const modal = this.createElement('div', 'modal modal-xl');
      modal.style.display = 'block';
      modal.innerHTML = `
        <div class="modal-box">
          <button onclick="this.closest('.modal').style.display='none'" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          <h3 class="font-bold text-lg">Détails de la classe ${classe.libelle}</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <div class="space-y-4">
              <h4 class="font-bold">Informations</h4>
              <div>
                <label class="text-sm text-gray-500">Filière</label>
                <p>${classe.filiere?.libelle || 'Non défini'}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">Niveau</label>
                <p>${classe.niveau?.libelle || 'Non défini'}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">Année scolaire</label>
                <p>${classe.annee_scolaire?.libelle || 'Non défini'}</p>
              </div>
              <div>
                <label class="text-sm text-gray-500">Capacité</label>
                <p>${classe.capacite_max} étudiants</p>
              </div>
            </div>
            
            <div class="space-y-4">
              <h4 class="font-bold">Statistiques</h4>
              <div class="stats shadow">
                <div class="stat">
                  <div class="stat-title">Étudiants inscrits</div>
                  <div class="stat-value">${etudiants.length}</div>
                  <div class="stat-desc">${Math.round((etudiants.length / classe.capacite_max) * 100)}% de remplissage</div>
                </div>
                <div class="stat">
                  <div class="stat-title">Professeurs</div>
                  <div class="stat-value">${professeurs.length}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="mb-6">
            <h4 class="font-bold mb-4">Étudiants (${etudiants.length})</h4>
            ${etudiants.length > 0 ? `
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${etudiants.map(etudiant => `
                  <div class="card bg-base-100 shadow-sm">
                    <div class="card-body p-4">
                      <div class="flex items-center gap-4">
                        <div class="avatar">
                          <div class="w-12 rounded-full">
                            <img src="${etudiant.utilisateur?.avatar || 'https://via.placeholder.com/150'}" />
                          </div>
                        </div>
                        <div>
                          <h5 class="font-bold">${etudiant.utilisateur?.prenom || ''} ${etudiant.utilisateur?.nom || ''}</h5>
                          <p class="text-sm text-gray-500">${etudiant.matricule}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : '<p class="text-gray-500">Aucun étudiant dans cette classe</p>'}
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
    } catch (error) {
      this.showNotification('Erreur lors du chargement des détails', 'error');
      console.error(error);
    } finally {
      loading.close();
    }
  }

  // Fonction pour afficher le formulaire d'édition
  async showEditClassForm(classId) {
    const loading = this.showLoadingModal('Chargement des données...');
    
    try {
      const classe = await this.fetchData(`classes/${classId}`);
      const [filieres, niveaux, annees] = await Promise.all([
        this.fetchData('filieres'),
        this.fetchData('niveaux'),
        this.fetchData('annee_scolaire')
      ]);
      
      const modal = this.createElement('div', 'modal modal-lg');
      modal.style.display = 'block';
      modal.innerHTML = `
        <div class="modal-box">
          <button onclick="this.closest('.modal').style.display='none'" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          <h3 class="font-bold text-lg">Modifier la classe ${classe.libelle}</h3>
          
          <form id="edit-class-form" class="mt-6 space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Libellé</span>
              </label>
              <input type="text" name="libelle" value="${classe.libelle}" 
                     class="input input-bordered w-full" required>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Filière</span>
                </label>
                <select name="id_filiere" class="select select-bordered w-full" required>
                  ${filieres.map(f => `
                    <option value="${f.id}" ${f.id == classe.id_filiere ? 'selected' : ''}>${f.libelle}</option>
                  `).join('')}
                </select>
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Niveau</span>
                </label>
                <select name="id_niveau" class="select select-bordered w-full" required>
                  ${niveaux.map(n => `
                    <option value="${n.id}" ${n.id == classe.id_niveau ? 'selected' : ''}>${n.libelle}</option>
                  `).join('')}
                </select>
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Année scolaire</span>
                </label>
                <select name="id_annee" class="select select-bordered w-full" required>
                  ${annees.map(a => `
                    <option value="${a.id}" ${a.id == classe.id_annee ? 'selected' : ''}>${a.libelle}</option>
                  `).join('')}
                </select>
              </div>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">Capacité maximale</span>
              </label>
              <input type="number" name="capacite_max" value="${classe.capacite_max}" 
                     class="input input-bordered w-full" required>
            </div>
            
            <div class="modal-action">
              <button type="button" class="btn" onclick="this.closest('.modal').style.display='none'">Annuler</button>
              <button type="submit" class="btn btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      `;
      
      const form = modal.querySelector('form');
      
      form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(form));
        
        try {
          const response = await fetch(`${this.baseUrl}classes/${classId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          });
          
          if (!response.ok) throw new Error('Erreur lors de la mise à jour');
          
          this.showNotification('Classe mise à jour avec succès', 'success');
          modal.style.display = 'none';
          this.renderClassesTable();
        } catch (error) {
          this.showNotification('Erreur lors de la mise à jour de la classe', 'error');
          console.error(error);
        }
      };
      
      document.body.appendChild(modal);
    } catch (error) {
      this.showNotification('Erreur lors du chargement des données', 'error');
      console.error(error);
    } finally {
      loading.close();
    }
  }

  // Fonction pour afficher la confirmation de suppression
  showDeleteConfirmation(classId) {
    const modal = this.createElement('div', 'modal');
    modal.style.display = 'block';
    modal.innerHTML = `
      <div class="modal-box">
        <h3 class="font-bold text-lg">Confirmer la suppression</h3>
        <p class="py-4">Êtes-vous sûr de vouloir supprimer cette classe? Cette action est irréversible.</p>
        <div class="modal-action">
          <button class="btn" onclick="this.closest('.modal').style.display='none'">Annuler</button>
          <button class="btn btn-error" id="confirm-delete">Supprimer</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('confirm-delete').onclick = async () => {
      const loading = this.showLoadingModal('Suppression en cours...');
      try {
        const response = await fetch(`${this.baseUrl}classes/${classId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Erreur lors de la suppression');
        
        this.showNotification('Classe supprimée avec succès', 'success');
        modal.style.display = 'none';
        this.renderClassesTable();
      } catch (error) {
        this.showNotification('Erreur lors de la suppression de la classe', 'error');
        console.error(error);
      } finally {
        loading.close();
      }
    };
  }

  // Fonction pour afficher le formulaire d'ajout
  async showAddClassForm() {
    const loading = this.showLoadingModal('Chargement des données...');
    
    try {
      const [filieres, niveaux, annees] = await Promise.all([
        this.fetchData('filieres'),
        this.fetchData('niveaux'),
        this.fetchData('annee_scolaire')
      ]);
      
      const modal = this.createElement('div', 'modal modal-lg');
      modal.style.display = 'block';
      modal.innerHTML = `
        <div class="modal-box">
          <button onclick="this.closest('.modal').style.display='none'" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
          <h3 class="font-bold text-lg">Ajouter une nouvelle classe</h3>
          
          <form id="add-class-form" class="mt-6 space-y-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Libellé</span>
              </label>
              <input type="text" name="libelle" class="input input-bordered w-full" required>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Filière</span>
                </label>
                <select name="id_filiere" class="select select-bordered w-full" required>
                  <option value="">Sélectionner une filière</option>
                  ${filieres.map(f => `
                    <option value="${f.id}">${f.libelle}</option>
                  `).join('')}
                </select>
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Niveau</span>
                </label>
                <select name="id_niveau" class="select select-bordered w-full" required>
                  <option value="">Sélectionner un niveau</option>
                  ${niveaux.map(n => `
                    <option value="${n.id}">${n.libelle}</option>
                  `).join('')}
                </select>
              </div>
              
              <div class="form-control">
                <label class="label">
                  <span class="label-text">Année scolaire</span>
                </label>
                <select name="id_annee" class="select select-bordered w-full" required>
                  <option value="">Sélectionner une année</option>
                  ${annees.map(a => `
                    <option value="${a.id}">${a.libelle}</option>
                  `).join('')}
                </select>
              </div>
            </div>
            
            <div class="form-control">
              <label class="label">
                <span class="label-text">Capacité maximale</span>
              </label>
              <input type="number" name="capacite_max" class="input input-bordered w-full" required>
            </div>
            
            <div class="modal-action">
              <button type="button" class="btn" onclick="this.closest('.modal').style.display='none'">Annuler</button>
              <button type="submit" class="btn btn-primary">Ajouter</button>
            </div>
          </form>
        </div>
      `;
      
      const form = modal.querySelector('form');
      
      form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = Object.fromEntries(new FormData(form));
        
        try {
          const response = await fetch(`${this.baseUrl}classes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...formData,
              state: 'disponible'
            })
          });
          
          if (!response.ok) throw new Error('Erreur lors de l\'ajout');
          
          this.showNotification('Classe ajoutée avec succès', 'success');
          modal.style.display = 'none';
          this.renderClassesTable();
        } catch (error) {
          this.showNotification('Erreur lors de l\'ajout de la classe', 'error');
          console.error(error);
        }
      };
      
      document.body.appendChild(modal);
    } catch (error) {
      this.showNotification('Erreur lors du chargement des données', 'error');
      console.error(error);
    } finally {
      loading.close();
    }
  }

  // Ajouter le bouton flottant pour ajouter une classe
  addFloatingButton() {
    const button = this.createElement('button', 'btn btn-primary btn-circle fixed bottom-6 right-6 shadow-lg');
    button.innerHTML = '<i class="ri-add-line text-xl"></i>';
    button.title = 'Ajouter une classe';
    
    button.onclick = () => this.showAddClassForm();
    document.body.appendChild(button);
  }

  // Initialisation complète
  async init() {
    await this.initFilters();
    await this.renderClassesTable();
  }
}

// Utilisation
const classManager = new ClassManager();
classManager.init();