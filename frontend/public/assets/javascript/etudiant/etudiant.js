import { API_BASE_URL, fetchData, sendData } from '../../../../src/services/api.js';
import { handleEtudiantSidebar, renderEtudiantHeader } from '../../../../src/utils/etudiant.utils.js';
import { getCurrentUser } from '../../../../src/store/authStore.js';
import { initRouter } from '../../../../src/router/router.js';

// ==================== ÉTAT GLOBAL ====================
let currentStudent = null;
let currentStudentCourses = [];
let currentStudentAbsences = [];

// ==================== RÉFÉRENCES DOM ====================
const getSafeElement = (id) => {
    const el = document.getElementById(id);
    if (!el) console.warn(`Element #${id} not found`);
    return el;
};

const elements = {
    sections: {
        courses: getSafeElement('courses-section'),
        absences: getSafeElement('absences-section'),
        justifications: getSafeElement('justifications-section')
    },
    tabs: {
        courses: getSafeElement('courses-tab'),
        absences: getSafeElement('absences-tab'),
        justifications: getSafeElement('justifications-tab')
    },
    lists: {
        courses: getSafeElement('courses-list'),
        absences: getSafeElement('absences-list'),
        justifications: getSafeElement('justifications-list')
    },
    filters: {
        semester: getSafeElement('semester-filter'),
        absenceStartDate: getSafeElement('absence-start-date'),
        absenceEndDate: getSafeElement('absence-end-date'),
        justificationStatus: getSafeElement('justification-status-filter'),
        justificationStartDate: getSafeElement('justification-start-date'),
        justificationEndDate: getSafeElement('justification-end-date')
    },
    buttons: {
        filterAbsences: getSafeElement('filter-absences-btn'),
        filterJustifications: getSafeElement('filter-justifications-btn'),
        submitJustification: getSafeElement('submit-justify-btn'),
        cancelJustification: getSafeElement('cancel-justify-btn'),
        logout: getSafeElement('logout-btn')
    },
    modals: {
        justifyAbsence: getSafeElement('justify-modal')
    },
    infoDisplays: {
        studentName: getSafeElement('student-name'),
        studentMatricule: getSafeElement('student-matricule'),
        studentClass: getSafeElement('student-class'),
        studentInitials: getSafeElement('student-initials'),
        studentFirstname: getSafeElement('student-firstname')
    }
};

// ==================== FONCTIONS UTILITAIRES ====================
function showToast(type, message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `alert alert-${type} shadow-lg`;
    toast.innerHTML = `<div><span>${message}</span></div>`;
    
    toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
        return 'Date invalide';
    }
}

function formatTime(timeString) {
    return timeString?.substring(0, 5) || 'N/A';
}

function getInitials(name) {
    return name?.split(' ').map(p => p[0]?.toUpperCase() ?? '').join('').substring(0, 2) || 'ET';
}

// ==================== GESTION UTILISATEUR ====================
async function loadCurrentUser() {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error("Aucun utilisateur connecté");
        
        const etudiants = await fetchData('etudiants');
        const student = etudiants.find(e => e.id_utilisateur === user.id);
        if (!student) throw new Error("Utilisateur n'est pas un étudiant");

        // Mise à jour de l'interface
        if (elements.infoDisplays.studentName) {
            elements.infoDisplays.studentName.textContent = `${user.prenom} ${user.nom}`;
        }
        if (elements.infoDisplays.studentInitials) {
            elements.infoDisplays.studentInitials.textContent = getInitials(user.prenom + ' ' + user.nom);
        }
        if (elements.infoDisplays.studentFirstname) {
            elements.infoDisplays.studentFirstname.textContent = user.prenom || 'Étudiant';
        }
        if (elements.infoDisplays.studentMatricule) {
            elements.infoDisplays.studentMatricule.textContent = student.matricule;
        }
        if (elements.infoDisplays.studentClass) {
            const classe = await fetchData('classes', student.id_classe).catch(() => null);
            elements.infoDisplays.studentClass.textContent = classe?.libelle || 'Classe inconnue';
        }

        return { ...user, ...student };
    } catch (error) {
        console.error("Erreur de chargement de l'utilisateur:", error);
        showToast('error', 'Erreur de connexion');
        throw error;
    }
}

// ==================== GESTION DES DONNÉES ====================
async function loadStudentData() {
    try {
        await Promise.all([
            loadStudentCourses(),
            loadStudentAbsences(),
            loadStudentJustifications()
        ]);
    } catch (error) {
        console.error("Erreur de chargement des données:", error);
        showToast('error', 'Erreur de chargement des données');
    }
}

// ==================== GESTION DES COURS ====================
async function loadStudentCourses(semesterFilter = 'all') {
    try {
        const student = await fetchData(`etudiants/${currentStudent.id}`);
        const coursClasses = await fetchData('cours_classes');
        const classCourses = coursClasses.filter(cc => cc.id_classe === student.id_classe).map(cc => cc.id_cours);
        
        let filteredCourses = (await fetchData('cours')).filter(c => classCourses.includes(c.id));
        if (semesterFilter !== 'all') filteredCourses = filteredCourses.filter(c => c.id_semestre === semesterFilter);

        const coursesWithDetails = await Promise.all(
            filteredCourses.map(async course => ({
                ...course,
                module: await fetchData(`modules/${course.id_module}`).catch(() => null),
                professor: await fetchData(`professeurs/${course.id_professeur}`)
                    .then(p => fetchData(`utilisateurs/${p.id_utilisateur}`))
                    .catch(() => null)
            }))
        );

        displayCourses(coursesWithDetails.sort((a, b) => new Date(b.date_cours) - new Date(a.date_cours)));
    } catch (error) {
        console.error("Erreur de chargement des cours:", error);
        showToast('error', 'Impossible de charger les cours');
    }
}

function displayCourses(courses) {
    if (!elements.lists.courses) return;
    
    elements.lists.courses.innerHTML = courses.length > 0 
        ? courses.map(course => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${course.module?.libelle || 'Inconnu'} (${course.module?.code_module || '?'})</td>
                <td class="px-6 py-4 whitespace-nowrap">${formatDate(course.date_cours)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${formatTime(course.heure_debut)} - ${formatTime(course.heure_fin)}</td>
                <td class="px-6 py-4 whitespace-nowrap">${course.salle || 'Non spécifié'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${course.professor ? `${course.professor.prenom} ${course.professor.nom}` : 'Inconnu'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="badge ${course.statut === 'planifié' ? 'badge-info' : 'badge-success'}">
                        ${course.statut || 'Inconnu'}
                    </span>
                </td>
            </tr>
        `).join('')
        : '<tr><td colspan="6" class="px-6 py-4 text-center">Aucun cours trouvé</td></tr>';
}

// ==================== GESTION DES ABSENCES ====================
async function loadStudentAbsences(startDate = null, endDate = null) {
    try {
        const absences = (await fetchData('absences')).filter(a => a.id_etudiant === currentStudent.id);
        const filteredAbsences = filterAbsencesByDate(absences, startDate, endDate);
        
        const absencesWithDetails = await Promise.all(
            filteredAbsences.map(async absence => ({
                ...absence,
                course: await fetchData(`cours/${absence.id_cours}`).catch(() => null),
                justification: await fetchData('justifications')
                    .then(justifs => justifs.find(j => j.id_absence === absence.id))
                    .catch(() => null)
            }))
        );

        displayAbsences(absencesWithDetails);
    } catch (error) {
        console.error("Erreur de chargement des absences:", error);
        showToast('error', 'Impossible de charger les absences');
    }
}

function filterAbsencesByDate(absences, startDate, endDate) {
    if (!startDate && !endDate) return absences;
    return absences.filter(absence => {
        const absenceDate = new Date(absence.date_absence);
        return (!startDate || absenceDate >= new Date(startDate)) && 
               (!endDate || absenceDate <= new Date(endDate));
    });
}

function displayAbsences(absences) {
    if (!elements.lists.absences) return;
    
    elements.lists.absences.innerHTML = absences.length > 0
        ? absences.map(absence => {
            const status = absence.justification?.statut || 'Non justifiée';
            const statusClass = status === 'acceptée' ? 'badge-success' 
                              : status === 'en attente' ? 'badge-warning' 
                              : 'badge-error';
            
            return `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">${formatDate(absence.date_absence)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${absence.course?.module?.libelle || 'Inconnu'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${absence.course?.module?.code_module || '?'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="badge ${statusClass}">${status}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        ${!absence.justification ? 
                            `<button class="btn btn-xs btn-primary justify-btn" data-absence-id="${absence.id}">
                                Justifier
                            </button>` 
                            : ''}
                    </td>
                </tr>
            `;
        }).join('')
        : '<tr><td colspan="5" class="px-6 py-4 text-center">Aucune absence trouvée</td></tr>';
    
    document.querySelectorAll('.justify-btn').forEach(btn => {
        btn.addEventListener('click', (e) => openJustificationModal(e.target.getAttribute('data-absence-id')));
    });
}

// ==================== GESTION DES JUSTIFICATIONS ====================
async function loadStudentJustifications(statusFilter = 'all', startDate = null, endDate = null) {
    try {
        const justifications = (await fetchData('justifications')).filter(j => j.id_etudiant === currentStudent.id);
        const filteredJustifications = filterJustifications(justifications, statusFilter, startDate, endDate);
        
        const justificationsWithDetails = await Promise.all(
            filteredJustifications.map(async justification => ({
                ...justification,
                absence: await fetchData(`absences/${justification.id_absence}`).catch(() => null),
                traitant: justification.id_traitant 
                    ? await fetchData(`utilisateurs/${justification.id_traitant}`).catch(() => null)
                    : null
            }))
        );

        displayJustifications(justificationsWithDetails);
    } catch (error) {
        console.error("Erreur de chargement des justifications:", error);
        showToast('error', 'Impossible de charger les justifications');
    }
}

function filterJustifications(justifications, statusFilter, startDate, endDate) {
    let filtered = justifications;
    if (statusFilter !== 'all') filtered = filtered.filter(j => j.statut === statusFilter);
    if (startDate || endDate) {
        filtered = filtered.filter(j => {
            const date = new Date(j.date_justification);
            return (!startDate || date >= new Date(startDate)) && 
                   (!endDate || date <= new Date(endDate));
        });
    }
    return filtered;
}

function displayJustifications(justifications) {
    if (!elements.lists.justifications) return;
    
    elements.lists.justifications.innerHTML = justifications.length > 0
        ? justifications.map(j => {
            const statusClass = j.statut === 'acceptée' ? 'badge-success' 
                              : j.statut === 'en attente' ? 'badge-warning' 
                              : 'badge-error';
            
            return `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">${formatDate(j.date_justification)}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${j.absence?.module?.libelle || 'Inconnu'} (${formatDate(j.absence?.date_absence)})</td>
                    <td class="px-6 py-4 whitespace-nowrap">${j.motif}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="badge ${statusClass}">${j.statut}</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">${j.commentaire_traitement || 'Aucun'}</td>
                </tr>
            `;
        }).join('')
        : '<tr><td colspan="5" class="px-6 py-4 text-center">Aucune justification trouvée</td></tr>';
}

// ==================== MODAL DE JUSTIFICATION ====================
async function openJustificationModal(absenceId) {
    try {
        const absence = await fetchData(`absences/${absenceId}`);
        if (!absence) return;

        const course = await fetchData(`cours/${absence.id_cours}`).catch(() => null);
        const module = course ? await fetchData(`modules/${course.id_module}`).catch(() => null) : null;

        if (elements.modals.justifyAbsence) {
            const dateInput = document.getElementById('absence-date');
            const courseInput = document.getElementById('absence-course');
            
            if (dateInput) dateInput.value = formatDate(absence.date_absence);
            if (courseInput) courseInput.value = module?.libelle || 'Inconnu';
            
            elements.modals.justifyAbsence.showModal();
        }
    } catch (error) {
        console.error("Erreur lors de l'ouverture du modal:", error);
        showToast('error', 'Erreur lors de l\'ouverture du formulaire');
    }
}

async function submitJustification() {
    try {
        const absenceId = elements.modals.justifyAbsence?.dataset.absenceId;
        const reason = document.getElementById('justification-reason')?.value;
        const fileInput = document.getElementById('justification-file');

        if (!reason) {
            showToast('error', 'Veuillez saisir un motif de justification');
            return;
        }

        const justificationData = {
            id_absence: absenceId,
            id_etudiant: currentStudent.id,
            motif: reason,
            date_justification: new Date().toISOString(),
            statut: 'en attente'
        };

        if (fileInput?.files[0]) {
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            formData.append('data', JSON.stringify(justificationData));
            await sendData('justifications', formData, 'POST', true);
        } else {
            await sendData('justifications', justificationData);
        }

        showToast('success', 'Justification soumise avec succès');
        closeJustificationModal();
        await Promise.all([loadStudentAbsences(), loadStudentJustifications()]);
    } catch (error) {
        console.error("Erreur lors de la soumission:", error);
        showToast('error', 'Erreur lors de la soumission de la justification');
    }
}

function closeJustificationModal() {
    if (elements.modals.justifyAbsence) {
        elements.modals.justifyAbsence.close();
        const reasonInput = document.getElementById('justification-reason');
        const fileInput = document.getElementById('justification-file');
        
        if (reasonInput) reasonInput.value = '';
        if (fileInput) fileInput.value = '';
    }
}

// ==================== GESTION DES ÉVÉNEMENTS ====================
function setupEventListeners() {
    // Navigation par onglets
    if (elements.tabs.courses) {
        elements.tabs.courses.addEventListener('click', () => showSection('courses'));
    }
    if (elements.tabs.absences) {
        elements.tabs.absences.addEventListener('click', () => showSection('absences'));
    }
    if (elements.tabs.justifications) {
        elements.tabs.justifications.addEventListener('click', () => showSection('justifications'));
    }
    
    // Filtres
    if (elements.filters.semester) {
        elements.filters.semester.addEventListener('change', (e) => loadStudentCourses(e.target.value));
    }
    if (elements.buttons.filterAbsences) {
        elements.buttons.filterAbsences.addEventListener('click', () => {
            loadStudentAbsences(
                elements.filters.absenceStartDate?.value,
                elements.filters.absenceEndDate?.value
            );
        });
    }
    if (elements.buttons.filterJustifications) {
        elements.buttons.filterJustifications.addEventListener('click', () => {
            loadStudentJustifications(
                elements.filters.justificationStatus?.value,
                elements.filters.justificationStartDate?.value,
                elements.filters.justificationEndDate?.value
            );
        });
    }
    
    // Modal
    if (elements.buttons.submitJustification) {
        elements.buttons.submitJustification.addEventListener('click', submitJustification);
    }
    if (elements.buttons.cancelJustification) {
        elements.buttons.cancelJustification.addEventListener('click', closeJustificationModal);
    }
    
    // Déconnexion
    if (elements.buttons.logout) {
        elements.buttons.logout.addEventListener('click', () => {
            localStorage.removeItem('authToken');
            window.location.href = '/login.html';
        });
    }
}

function showSection(section) {
    // Masquer toutes les sections
    Object.values(elements.sections).forEach(s => {
        if (s) s.classList.add('hidden');
    });
    
    // Désactiver tous les onglets
    Object.values(elements.tabs).forEach(t => {
        if (t) t.classList.remove('active');
    });
    
    // Afficher la section sélectionnée
    if (elements.sections[section]) {
        elements.sections[section].classList.remove('hidden');
    }
    if (elements.tabs[section]) {
        elements.tabs[section].classList.add('active');
    }
}

// ==================== INITIALISATION ====================
async function initializeApp() {
    try {
                initRouter();
                logOut();
        currentStudent = await loadCurrentUser();
        if (!currentStudent) {
            window.location.href = '/login.html';
            return;
        }
        
        setupEventListeners();
        await loadStudentData();
        showSection('courses');
    } catch (error) {
        console.error("Erreur d'initialisation:", error);
        showToast('error', 'Échec du chargement de l\'application');
    }
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp().catch(error => {
        console.error("Erreur critique:", error);
        showToast('error', 'Une erreur critique est survenue');
    });
});

function logOut() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        // Implémentez la logique de déconnexion ici
        window.location.href = '/frontend/public/index.html';
    }
    );
}