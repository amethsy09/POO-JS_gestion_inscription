// Initialisation
const etudiantUI = createEtudiantInterface(user);
etudiantUI.initSidebar();
etudiantUI.initHeader("Dashboard");

// Mise à jour dynamique
etudiantUI.updateUser(newUserData);

// Extension possible
class CustomEtudiantInterface extends EtudiantInterface {
  getNotificationCount() {
    return this.user.unreadNotifications || 0;
  }
}