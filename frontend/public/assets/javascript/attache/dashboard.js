import { initRouter } from "../../../router/router.js";
import { getIdAttacherByUserId } from "../../../services/attacherService.js";
import { getCurrentUser } from "../../../store/authStore.js";
import { handleNotifications } from "../../../store/notificationStore.js";
import {
  handleSidebar,
  renderAbsenteesCard,
  renderAttacheHeader,
  renderAttacheStatsCards,
  renderCalendar,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", async () => {
  initRouter();
  handleNotifications();
  const user = getCurrentUser();
  handleSidebar(user);
  renderAttacheHeader(user);
  const idAttacher = await getIdAttacherByUserId(user.id);
  await renderAttacheStatsCards(idAttacher);
  await renderAbsenteesCard(idAttacher);
  renderCalendar();
});
