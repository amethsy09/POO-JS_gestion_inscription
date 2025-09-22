// sidebar.js - Composant réutilisable
class SidebarComponent {
  constructor(containerId, currentPage = 'dashboard') {
    this.containerId = containerId;
    this.activeLink = currentPage;
    this.links = [
      { 
        id: 'dashboard', 
        icon: 'ri-dashboard-line', 
        text: 'Dashboard', 
        path: 'dashboard.html' 
      },
      { 
        id: 'classes', 
        icon: 'ri-group-line', 
        text: 'Classes', 
        path: 'classes.html' 
      },
      { 
        id: 'professeurs', 
        icon: 'ri-user-star-line', 
        text: 'Professeurs', 
        path: 'professeurs.html' 
      },
      { 
        id: 'cours', 
        icon: 'ri-book-open-line', 
        text: 'Cours', 
        path: 'cours.html' 
      },
    ];
  }
  
  render() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    container.innerHTML = `
      <aside class="fixed top-0 left-0 h-full w-56 bg-white shadow-md z-50 flex flex-col">
        <div class="sidebar-logo p-4 border-b bg-indigo-600">
          <h1 class="text-xl font-bold text-white">Ecole 221</h1>
        </div>
        
        <nav class="mt-4 flex-1">
          <ul>
            ${this.links.map(link => `
              <li>
                <a href="${link.path}" 
                   class="sidebar-link px-4 py-3 flex items-center text-gray-700 hover:bg-indigo-50 transition-colors duration-200"
                   id="link-${link.id}"
                   data-link="${link.id}">
                  <i class="${link.icon} mr-3"></i>
                  <span>${link.text}</span>
                </a>
              </li>
            `).join('')}
          </ul>
        </nav>
        
        <!-- Bouton de déconnexion -->
        <div class="p-4 border-t">
          <button id="logout-btn" class="w-full flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200">
            <i class="ri-logout-box-r-line mr-2"></i>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    `;
    
    this.addEventListeners();
    this.setActiveLink(this.activeLink);
  }
  
  addEventListeners() {
    // Écouteurs pour les liens de navigation
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
    
    // Écouteur pour le bouton de déconnexion
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.handleLogout();
      });
    }
  }
  
  setActiveLink(linkId) {
    this.activeLink = linkId;
    
    this.links.forEach(link => {
      const element = document.getElementById(`link-${link.id}`);
      if (element) {
        element.classList.remove('active-link', 'text-indigo-700', 'bg-indigo-50');
      }
    });
    
    const activeElement = document.getElementById(`link-${linkId}`);
    if (activeElement) {
      activeElement.classList.add('active-link', 'text-indigo-700', 'bg-indigo-50');
    }
  }
  
  handleNavigation(linkId) {
    const currentPage = window.location.pathname.split('/').pop();
    const targetPage = this.links.find(link => link.id === linkId)?.path;
    
    // Ne pas recharger si on est déjà sur la bonne page
    if (currentPage === targetPage) return;
    
    // Navigation simple
    window.location.href = targetPage;
  }
  
  handleLogout() {
    // Afficher un modal de confirmation
    this.showLogoutConfirmation();
  }
  
  showLogoutConfirmation() {
    // Créer le modal de confirmation
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 w-80">
        <div class="text-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i class="ri-logout-box-r-line text-red-500 text-xl"></i>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Déconnexion</h3>
          <p class="text-gray-600 mt-1">Êtes-vous sûr de vouloir vous déconnecter ?</p>
        </div>
        <div class="flex space-x-3">
          <button id="cancel-logout" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button id="confirm-logout" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
            Se déconnecter
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Écouteurs pour les boutons du modal
    document.getElementById('cancel-logout').addEventListener('click', () => {
      modal.remove();
    });
    
    document.getElementById('confirm-logout').addEventListener('click', () => {
      this.performLogout();
      modal.remove();
    });
    
    // Fermer le modal en cliquant à l'extérieur
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
  
  performLogout() {
    // 1. Nettoyer le localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('isLoggedIn');
    
    // 2. Afficher une notification de déconnexion
    this.showLogoutNotification();
    
    // 3. Rediriger vers la page de login après un court délai
    setTimeout(() => {
      window.location.href = '../../../public/index.html';
    }, 1500);
  }
  
  showLogoutNotification() {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center">
        <i class="ri-check-line mr-2"></i>
        <span>Déconnexion réussie</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer la notification après 3 secondes
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

export { SidebarComponent };