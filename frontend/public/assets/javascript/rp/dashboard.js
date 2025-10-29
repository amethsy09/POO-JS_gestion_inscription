import { router } from "../../../../src/router/router.js";

// Composant Sidebar avec liens
class SidebarComponent {
  constructor(containerId) {
    this.containerId = containerId;
    this.activeLink = 'dashboard';
    this.links = [
      { id: 'dashboard', icon: 'ri-dashboard-line', text: 'Dashboard', path: '/frontend/src/pages/rp/dashboard.html' },
      { id: 'classes', icon: 'ri-group-line', text: 'Classes', path: '/frontend/src/pages/rp/classes.html' },
      { id: 'professeurs', icon: 'ri-user-star-line', text: 'Professeurs', path: '/frontend/src/pages/rp/professeurs.html' },
      { id: 'cours', icon: 'ri-book-open-line', text: 'Cours', path: '/frontend/src/pages/rp/cours.html' },
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
            ${this.links.map(link => `
              <li>
                <a href="${link.path}" 
                   class="sidebar-link px-4 py-3 flex items-center text-gray-700"
                   id="link-${link.id}"
                   data-link="${link.id}">
                  <i class="${link.icon} mr-3"></i>
                  <span>${link.text}</span>
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
        element.classList.remove('active-link', 'text-indigo-700', 'bg-indigo-50');
      }
    });
    
    const activeElement = document.getElementById(`link-${linkId}`);
    if (activeElement) {
      activeElement.classList.add('active-link', 'text-indigo-700', 'bg-indigo-50');
    }
  }
  
  handleNavigation(linkId) {
    if (linkId === 'dashboard') {
      router.navigateTo('/frontend/src/pages/rp/dashboard.html');
    } else if (linkId === 'classes') {
      router.navigateTo('/frontend/src/pages/rp/classes.html');
    } else if (linkId === 'professeurs') {
      router.navigateTo('/frontend/src/pages/rp/professeurs.html');
    } else if (linkId === 'cours') {
      router.navigateTo('/frontend/src/pages/rp/cours.html');
    }
  }
}

// Dashboard Manager avec données dynamiques depuis db.json
class DashboardManager {
  constructor() {
    this.statsData = {
      classes: { total: 0, archived: 0, available: 0 },
      professeurs: { total: 0, archived: 0, available: 0 },
      cours: { total: 0, archived: 0, planned: 0, effectue: 0 },
      etudiants: { total: 0 },
      inscriptions: { total: 0, validees: 0, en_attente: 0 }
    };
    
    this.jsonData = null;
    this.apiBaseUrl = 'http://localhost:3000'; // Remplacez par l'URL de votre json-server
  }
  
  async init() {
    // Initialiser la sidebar
    const sidebar = new SidebarComponent('sidebar-container');
    sidebar.render();
    
    // Afficher le loading
    this.showLoading();
    
    try {
      // Charger les données depuis db.json
      await this.loadDataFromDB();
      
      // Calculer les statistiques dynamiques
      this.calculateDynamicStats();
      
      // Mettre à jour les cartes de statistiques
      this.updateStatsCards();
      
      // Initialiser les graphiques avec données dynamiques
      this.initCharts();
      
      // Cacher le loading
      this.hideLoading();
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      this.hideLoading();
      this.showError('Erreur de chargement des données');
    }
    
    // Ajouter un bouton de rafraîchissement
    this.addRefreshButton();
  }
  
  async loadDataFromDB() {
    try {
      // Charger toutes les données nécessaires depuis votre db.json
      const responses = await Promise.all([
        fetch(`${this.apiBaseUrl}/classes`),
        fetch(`${this.apiBaseUrl}/professeurs`),
        fetch(`${this.apiBaseUrl}/cours`),
        fetch(`${this.apiBaseUrl}/etudiants`),
        fetch(`${this.apiBaseUrl}/inscriptions`),
        fetch(`${this.apiBaseUrl}/utilisateurs`)
      ]);
      
      const [classes, professeurs, cours, etudiants, inscriptions, utilisateurs] = await Promise.all(
        responses.map(r => r.json())
      );
      
      this.jsonData = {
        classes,
        professeurs,
        cours,
        etudiants,
        inscriptions,
        utilisateurs
      };
      
      // console.log('Données chargées depuis db.json:', this.jsonData);
      
    } catch (error) {
      console.error('Erreur lors du chargement depuis db.json:', error);
      throw error;
    }
  }
  
  calculateDynamicStats() {
    if (!this.jsonData) return;
    
    const { classes, professeurs, cours, etudiants, inscriptions } = this.jsonData;
    
    // Calcul des statistiques des classes
    this.statsData.classes.total = classes.length;
    this.statsData.classes.archived = classes.filter(c => c.state === 'archivé').length;
    this.statsData.classes.available = classes.filter(c => c.state === 'disponible').length;
    
    // Calcul des statistiques des professeurs
    this.statsData.professeurs.total = professeurs.length;
    this.statsData.professeurs.available = professeurs.length;
    
    // Calcul des statistiques des cours
    this.statsData.cours.total = cours.length;
    this.statsData.cours.archived = cours.filter(c => c.statut === 'annulé').length;
    this.statsData.cours.planned = cours.filter(c => c.statut === 'planifié').length;
    this.statsData.cours.effectue = cours.filter(c => c.statut === 'effectué').length;
    
    // Calcul des statistiques des étudiants
    this.statsData.etudiants.total = etudiants.length;
    
    // Calcul des statistiques des inscriptions
    this.statsData.inscriptions.total = inscriptions.length;
    this.statsData.inscriptions.validees = inscriptions.filter(i => i.statut === 'validée').length;
    this.statsData.inscriptions.en_attente = inscriptions.filter(i => i.statut === 'en attente').length;
  }
  
  updateStatsCards() {
    // Classes
    this.updateElementText('total-classes', this.statsData.classes.total);
    this.updateElementText('total-classes-data', this.statsData.classes.total);
    this.updateElementText('archived-classes', this.statsData.classes.archived);
    this.updateElementText('available-classes', this.statsData.classes.available);
    
    // Professeurs
    this.updateElementText('total-professeurs', this.statsData.professeurs.total);
    this.updateElementText('total-professeurs-data', this.statsData.professeurs.total);
    this.updateElementText('active-professeurs', this.statsData.professeurs.archived);
    this.updateElementText('available-professeurs', this.statsData.professeurs.available);
    
    // Cours
    this.updateElementText('total-cours', this.statsData.cours.total);
    this.updateElementText('total-cours-data', this.statsData.cours.total);
    this.updateElementText('canceled-cours', this.statsData.cours.archived);
    this.updateElementText('planned-cours', this.statsData.cours.planned);
    
    // Étudiants
    this.updateElementText('total-etudiants', this.statsData.etudiants.total);
    
    // Inscriptions
    this.updateElementText('total-inscriptions', this.statsData.inscriptions.total);
    this.updateElementText('inscriptions-validees', this.statsData.inscriptions.validees);
    this.updateElementText('inscriptions-en-attente', this.statsData.inscriptions.en_attente);
  }
  
  updateElementText(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  }
  
  initCharts() {
    const lineCanvas = document.getElementById('chart-line-1');
    const barCanvas = document.getElementById('chart-bar-1');
    
    if (!lineCanvas || !barCanvas) {
      // console.error('Canvas elements not found!');
      return;
    }
    
    // Données dynamiques basées sur les données réelles
    const monthlyData = this.calculateMonthlyRegistrations();
    const classDistribution = this.calculateClassDistribution();
    
    // Graphique linéaire - Évolution des inscriptions
    new Chart(lineCanvas, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [{
          label: 'Inscriptions mensuelles',
          data: monthlyData,
          borderColor: 'rgb(79, 70, 229)',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
    
    // Graphique à barres - Distribution par classe
    new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: classDistribution.labels,
        datasets: [{
          label: 'Nombre d\'étudiants',
          data: classDistribution.data,
          backgroundColor: 'rgb(79, 70, 229)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  }
  
  calculateMonthlyRegistrations() {
    if (!this.jsonData?.inscriptions) return [0, 0, 0, 0, 0, 0];
    
    // Simuler des données mensuelles basées sur les inscriptions
    const inscriptions = this.jsonData.inscriptions;
    return [12, 18, 15, inscriptions.length, 19, 25]; // Avril montre le nombre réel
  }
  
  calculateClassDistribution() {
    if (!this.jsonData?.etudiants) {
      return { labels: [], data: [] };
    }
    
    // Compter les étudiants par classe
    const classCount = {};
    this.jsonData.etudiants.forEach(etudiant => {
      const classeId = etudiant.id_classe;
      classCount[classeId] = (classCount[classeId] || 0) + 1;
    });
    
    // Récupérer les noms des classes
    const labels = [];
    const data = [];
    
    this.jsonData.classes.forEach(classe => {
      if (classCount[classe.id]) {
        labels.push(classe.libelle);
        data.push(classCount[classe.id]);
      }
    });
    
    return { labels, data };
  }
  
  showLoading() {
    let loading = document.getElementById('loading-indicator');
    if (!loading) {
      loading = document.createElement('div');
      loading.id = 'loading-indicator';
      loading.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg z-50';
      loading.textContent = 'Chargement des données...';
      document.body.appendChild(loading);
    }
  }
  
  hideLoading() {
    const loading = document.getElementById('loading-indicator');
    if (loading) {
      document.body.removeChild(loading);
    }
  }
  
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      if (document.body.contains(errorDiv)) {
        document.body.removeChild(errorDiv);
      }
    }, 5000);
  }
  
  addRefreshButton() {
    const refreshBtn = document.createElement('button');
    refreshBtn.innerHTML = '🔄 Actualiser';
    refreshBtn.className = 'fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition duration-200';
    refreshBtn.onclick = () => this.refreshData();
    
    document.body.appendChild(refreshBtn);
  }
  
  async refreshData() {
    this.showLoading();
    
    try {
      await this.loadDataFromDB();
      this.calculateDynamicStats();
      this.updateStatsCards();
      this.initCharts();
      
      this.showSuccess('Données actualisées avec succès!');
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
      this.showError('Erreur lors de l\'actualisation');
    } finally {
      this.hideLoading();
    }
  }
  
  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv);
      }
    }, 3000);
  }
}

// Initialiser le dashboard
document.addEventListener('DOMContentLoaded', () => {
  const dashboardManager = new DashboardManager();
  dashboardManager.init();
});