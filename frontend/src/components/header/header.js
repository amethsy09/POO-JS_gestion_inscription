/**
 * Crée un header responsive pour l'interface Attaché
 * @param {Object} config - Configuration du header
 * @param {string} config.currentPage - Page actuelle
 * @param {string} config.userName - Nom de l'utilisateur
 * @param {number} [config.notificationCount=0] - Nombre de notifications
 * @param {Function} [config.onNotificationClick] - Callback notifications
 * @param {Function} [config.onMenuClick] - Callback pour ouvrir le sidebar
 * @returns {HTMLElement} L'élément header
 */
export function createResponsiveAttacheHeader(config) {
  const {
    currentPage = "Dashboard",
    userName = "Attaché",
    notificationCount = 0,
    onNotificationClick = () => {},
    onMenuClick = () => openSidebar(),
  } = config;

  // Création du header
  const header = document.createElement("header");
  header.className =
    "bg-white shadow-sm py-4 px-4 sm:px-6 flex items-center justify-between border-b border-gray-100";

  // Partie gauche (Menu burger + Fil d'Ariane)
  const leftSection = document.createElement("div");
  leftSection.className = "flex items-center space-x-4";

  // Bouton menu (visible uniquement sur mobile/tablette)
  const menuButton = document.createElement("button");
  menuButton.className =
    "lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-50 focus:outline-none";
  menuButton.innerHTML = '<i class="ri-dashboard-line text-xl"></i>';
  menuButton.addEventListener("click", onMenuClick);

  // Conteneur pour le fil d'Ariane et message
  const breadcrumbContainer = document.createElement("div");
  breadcrumbContainer.className = "flex flex-col";

  // Fil d'Ariane
  const breadcrumb = document.createElement("div");
  breadcrumb.className = "flex items-center text-sm text-gray-600";
  breadcrumb.innerHTML = `
    <a href="/frontend/attache/dashboard" class="text-blue-600 hover:text-blue-800 hidden sm:inline">Dashboard</a>
    <span class="mx-2 hidden sm:inline">/</span>
    <span class="text-gray-800 font-medium">${currentPage}</span>
  `;

  // Message de bienvenue (caché sur mobile)
  const welcomeMsg = document.createElement("h1");
  welcomeMsg.className = "text-lg font-medium text-gray-700 hidden lg:block";
  welcomeMsg.textContent = `Bonjour, ${userName}👋`;

  breadcrumbContainer.appendChild(breadcrumb);
  breadcrumbContainer.appendChild(welcomeMsg);

  leftSection.appendChild(menuButton);
  leftSection.appendChild(breadcrumbContainer);

  // Partie droite (Notifications + Avatar)
  const rightSection = document.createElement("div");
  rightSection.className = "flex items-center space-x-4";

  // Bouton Notifications
  const notificationBtn = document.createElement("button");
  notificationBtn.className =
    "relative p-2 rounded-full hover:bg-gray-100 focus:outline-none";
  notificationBtn.addEventListener("click", onNotificationClick);

  const notificationIcon = document.createElement("i");
  notificationIcon.className = "ri-notification-3-line text-gray-600 text-xl";

  if (notificationCount > 0) {
    const notificationBadge = document.createElement("span");
    notificationBadge.className =
      "absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center";
    notificationBadge.textContent =
      notificationCount > 9 ? "9+" : notificationCount;
    notificationBtn.appendChild(notificationBadge);
  }

  notificationBtn.appendChild(notificationIcon);
  rightSection.appendChild(notificationBtn);

  // Assemblage final
  header.appendChild(leftSection);
  header.appendChild(rightSection);

  return header;
}

function openSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.remove("-translate-x-full");
}
