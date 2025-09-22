import { initRouter } from "../../../router/router.js";
import { getCurrentUser } from "../../../store/authStore.js";
import { handleNotifications } from "../../../store/notificationStore.js";
import { getIdEtudiantByUserId } from "../../../services/etudiantService.js";
import {
  handleEtudiantSidebar,
  renderEtudiantHeader,
} from "../../../utils/etudiant.utils.js";
import {
  renderCalendar,
  renderCourseCard,
  renderEtudiantStatsCards,
} from "../../../helpers/etudiant/dashboard.helpers.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  handleNotifications();
  const user = getCurrentUser();
  handleEtudiantSidebar(user);
  renderEtudiantHeader(user, "Dashboard");
  const idEtudiant = await getIdEtudiantByUserId(user.id);
  await renderEtudiantStatsCards(idEtudiant);
  renderCalendar();
  await renderCourseCard(idEtudiant);
});
