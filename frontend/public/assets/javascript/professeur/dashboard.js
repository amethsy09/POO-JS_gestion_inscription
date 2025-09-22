import { initRouter } from "../../../router/router.js";
import { getCurrentUser } from "../../../store/authStore.js";
import { handleNotifications } from "../../../store/notificationStore.js";
import {
  handleProfesseurSidebar,
  renderProfesseurHeader,
} from "../../../utils/professeur.utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  handleNotifications();
  const user = getCurrentUser();
  handleProfesseurSidebar(user);
  renderProfesseurHeader(user, "Dashboard");
  
});
