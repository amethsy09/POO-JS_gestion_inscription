import {
  createCourseCard,
  createEmptyCourseState,
  createStatsCard,
} from "../../components/card/card.js";
import { createChartCard } from "../../components/card/chartCard.js";
import {
  getMonthlyAbsenceData,
  getStudentAbsenceStats,
  getTodaysCourses,
} from "../../services/etudiantService.js";

export async function renderEtudiantStatsCards(studentId) {
  const container = document.createElement("div");
  container.className =
    "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5";
  const stats = await getStudentAbsenceStats(studentId);

  const hoursCard = createStatsCard({
    title: "Heures d'absence",
    value: stats.totalHours + "h",
    description: "Total cette année",
    icon: "ri-time-line",
    color: "red",
    hoverEffect: true,
  });

  const justifiedCard = createStatsCard({
    title: "Absences justifiées",
    value: stats.justified,
    description: "Justifications validées",
    icon: "ri-checkbox-circle-line",
    color: "green",
    hoverEffect: true,
  });

  const pendingCard = createStatsCard({
    title: "En attente",
    value: stats.pending,
    description: "Justifications à traiter",
    icon: "ri-timer-line",
    color: "orange",
    hoverEffect: true,
  });

  container.appendChild(hoursCard);
  container.appendChild(justifiedCard);
  container.appendChild(pendingCard);
  document.getElementById("stats-section").appendChild(container);
}

export function renderCalendar() {
  const calendar = document.createElement("div");
  calendar.innerHTML = `
  <calendar-date class="cally bg-base-100 border border-base-300 shadow-sm rounded-box w-full">
                <svg aria-label="Previous" class="fill-current size-4" slot="previous" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                </svg>
                <svg aria-label="Next" class="fill-current size-4" slot="next" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path fill="currentColor" d="m8.25 4.5 7.5 7.5-7.5 7.5"></path>
                </svg>
                <calendar-month></calendar-month>
            </calendar-date>
  `;
  document.getElementById("calendar").appendChild(calendar);
}

export async function createAbsenceEvolutionChart(studentId) {
  const monthlyData = await getMonthlyAbsenceData(studentId);

  // Préparer les labels (noms des mois)
  const labels = monthlyData.map((item) => {
    const [year, month] = item.month.split("-");
    return new Date(year, month - 1).toLocaleDateString("fr-FR", {
      month: "short",
      year: "numeric",
    });
  });

  // Créer la configuration du graphique
  const chartConfig = {
    title: "Évolution des absences par mois",
    chartType: "bar",
    chartData: {
      labels: labels,
      datasets: [
        {
          label: "Absences totales",
          data: monthlyData.map((item) => item.total),
          backgroundColor: "rgba(239, 68, 68, 0.7)",
          borderColor: "rgba(239, 68, 68, 1)",
          borderWidth: 1,
        },
        {
          label: "Justifiées",
          data: monthlyData.map((item) => item.justified),
          backgroundColor: "rgba(16, 185, 129, 0.7)",
          borderColor: "rgba(16, 185, 129, 1)",
          borderWidth: 1,
        },
        {
          label: "En attente",
          data: monthlyData.map((item) => item.pending),
          backgroundColor: "rgba(245, 158, 11, 0.7)",
          borderColor: "rgba(245, 158, 11, 1)",
          borderWidth: 1,
        },
      ],
    },
    chartOptions: {
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Nombre d'absences",
          },
        },
        x: {
          title: {
            display: true,
            text: "Mois",
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            afterBody: (context) => {
              const dataIndex = context[0].dataIndex;
              return `Heures: ${monthlyData[dataIndex].hours}h`;
            },
          },
        },
      },
    },
  };
  // Créer et retourner la carte avec le graphique
  return createChartCard(chartConfig);
}

export async function renderCourseCard(studentId) {
  try {
    // Récupérer les données
    const courses = await getTodaysCourses(studentId);
    console.log("Cours récupérés:", courses);

    // Sélectionner le conteneur
    const container = document.getElementById("courses-section");
    container.innerHTML = ""; // Vider le conteneur

    // Cas où il n'y a pas de cours
    if (courses.length === 0) {
      const emptyState = createEmptyCourseState();
      container.appendChild(emptyState);
      return;
    }

    // Créer et ajouter les cartes
    courses.forEach((course, index) => {
      const card = createCourseCard(course, index);
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Erreur création carte cours:", error);

    // Retourner une carte d'erreur
    const errorCard = document.createElement("div");
    errorCard.className =
      "bg-white rounded-lg shadow-sm p-6 text-center text-red-500";
    errorCard.textContent = "Erreur de chargement des données";

    const container = document.getElementById("courses-section");
    container.innerHTML = ""; // Vider avant d'ajouter l'erreur
    container.appendChild(errorCard);
  }
}
