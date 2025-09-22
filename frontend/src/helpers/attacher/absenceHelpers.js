export function createAbsencesModalContent(etudiant) {
  const modalContent = document.createElement("div");

  // Informations de l'étudiant
  const studentInfo = document.createElement("div");
  studentInfo.className = "mb-6 p-4 bg-base-200 rounded-lg";
  studentInfo.innerHTML = `
    <div class="flex items-center space-x-4 mb-3">
      <div class="avatar">
        <div class="w-16 rounded">
            <img src="${etudiant.avatar}" />
        </div>
      </div>
      <div>
        <h4 class="font-bold text-lg">${etudiant.prenom} ${etudiant.nom}</h4>
        <div class="text-sm">${etudiant.matricule} | ${
    etudiant.classeLibelle
  }</div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-2 text-sm">
      <div><span class="font-medium">Total absences:</span> ${
        etudiant.absences.length
      }</div>
      <div><span class="font-medium">Justifiées:</span> ${
        etudiant.absences.filter((a) => a.justified).length
      }</div>
    </div>
  `;
  modalContent.appendChild(studentInfo);

  // Liste des absences
  if (etudiant.absences.length > 0) {
    const title = document.createElement("h5");
    title.className = "font-bold mb-3";
    title.textContent = "Historique des absences";
    modalContent.appendChild(title);

    const absencesList = document.createElement("div");
    absencesList.className = "space-y-2 max-h-96 overflow-y-auto";

    etudiant.absences.forEach((absence) => {
      absencesList.appendChild(createAbsenceItem(absence));
    });

    modalContent.appendChild(absencesList);
  } else {
    const emptyState = document.createElement("div");
    emptyState.className = "text-center p-4 text-base-content/50";
    emptyState.textContent = "Aucune absence enregistrée";
    modalContent.appendChild(emptyState);
  }

  return modalContent;
}

function createAbsenceItem(absence) {
  const item = document.createElement("div");
  item.className =
    "flex justify-between items-center p-3 bg-base-100 rounded-lg";

  const justifiedClass = absence.justified ? "text-success" : "text-error";
  const justifiedText = absence.justified ? "Justifiée" : "Non justifiée";

  item.innerHTML = `
    <div>
      <div class="font-medium">${absence.date_absence}</div>
      <div class="text-sm">${absence.cours.module || "Inconnue"}</div>
    </div>
    <div class="${justifiedClass}">${justifiedText}</div>
  `;

  return item;
}
