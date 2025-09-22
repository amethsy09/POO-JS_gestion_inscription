import { initRouter } from "../../../../src/router/router.js";
import { getCurrentUser } from "../../../../src/store/authStore.js";
import { handleRpSidebar, renderRpHeader } from "../../../../src/utils/rp.utils.js";

// ==================== CONFIGURATION ====================
const API_BASE_URL = 'http://localhost:3000';
const CURRENT_PAGE = 'professeur';

// ==================== ÉTAT GLOBAL ====================
let currentProfessor = null;
let currentProfessorCourses = [];
let currentCourseStudents = [];

// ==================== RÉFÉRENCES DOM ====================
const elements = {
    sections: {
        courses: document.getElementById('courses-section'),
        absences: document.getElementById('absences-section')
    },
    tabs: {
        courses: document.getElementById('courses-tab'),
        absences: document.getElementById('absences-tab')
    },
    lists: {
        courses: document.getElementById('courses-list'),
        students: document.getElementById('students-list')
    },
    forms: {
        courseSelect: document.getElementById('course-select'),
        absenceForm: document.getElementById('absence-form')
    },
    buttons: {
        saveAbsences: document.getElementById('save-absences-btn')
    },
    filters: {
        status: document.getElementById('status-filter')
    },
    infoDisplays: {
        profName: document.getElementById('prof-name'),
        courseTitle: document.getElementById('selected-course-title')
    },
    containers: {
        header: document.getElementById('header-container'),
        sidebar: document.getElementById('sidebar-container')
    },
    modals: {
        courseDetails: document.getElementById('course-details-modal')
    }
};

// ==================== INITIALISATION ====================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeApp();
        setupLogout();
    } catch (error) {
        console.error("Erreur d'initialisation:", error);
        showToast('error', 'Échec du chargement de l\'application');
    }
});

async function initializeApp() {
    currentProfessor = await loadCurrentUser();
    renderHeaderAndSidebar();
    await loadProfessorCourses();
    setupEventListeners();
    initRouter();
    logOut
}

// ==================== FONCTIONS UTILITAIRES ====================
function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast toast-top toast-end`;
    toast.innerHTML = `
        <div class="alert alert-${type}">
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function formatTime(timeString) {
    return timeString?.substring(0, 5) || '--:--';
}

// ==================== GESTION UTILISATEUR ====================
async function loadCurrentUser() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            throw new Error("Aucun utilisateur connecté");
        }
        elements.infoDisplays.profName.textContent = `${user.prenom} ${user.nom}`;
        return user;
    } catch (error) {
        console.error("Erreur de chargement de l'utilisateur:", error);
        showToast('error', 'Erreur de connexion');
        throw error;
    }
}

function renderHeaderAndSidebar() {
    try {
        if (elements.containers.header) {
            renderRpHeader(elements.containers.header, currentProfessor, String(CURRENT_PAGE));
        }
        if (elements.containers.sidebar) {
            handleRpSidebar(elements.containers.sidebar, CURRENT_PAGE);
        }
    } catch (error) {
        console.error("Erreur dans renderHeaderAndSidebar:", error);
        // Solution de repli
        if (elements.containers.header) {
            elements.containers.header.innerHTML = `
                <div class="navbar bg-base-100">
                    <a class="btn btn-ghost normal-case text-xl">Espace Professeur</a>
                </div>
            `;
        }
    }
}

// ==================== GESTION DES ÉVÉNEMENTS ====================
function setupEventListeners() {
    elements.tabs.courses.addEventListener('click', showCoursesSection);
    elements.tabs.absences.addEventListener('click', showAbsencesSection);
    elements.forms.courseSelect.addEventListener('change', handleCourseSelection);
    elements.buttons.saveAbsences.addEventListener('click', saveAbsences);
    elements.filters.status.addEventListener('change', filterCoursesByStatus);
}

// ==================== GESTION DES SECTIONS ====================
function showCoursesSection() {
    elements.tabs.courses.classList.add('tab-active');
    elements.tabs.absences.classList.remove('tab-active');
    elements.sections.courses.classList.remove('hidden');
    elements.sections.absences.classList.add('hidden');
}

function showAbsencesSection() {
    elements.tabs.absences.classList.add('tab-active');
    elements.tabs.courses.classList.remove('tab-active');
    elements.sections.absences.classList.remove('hidden');
    elements.sections.courses.classList.add('hidden');
    loadCoursesForAbsence();
}

// ==================== GESTION DES COURS ====================
async function loadProfessorCourses() {
    try {
        const allCourses = await fetchData('cours');
        currentProfessorCourses = allCourses.filter(c => c.id_professeur === currentProfessor.id.toString());
        
        const coursesWithDetails = await Promise.all(
            currentProfessorCourses.map(async course => ({
                ...course,
                module: await fetchData(`modules/${course.id_module}`),
                classes: await getClassesForCourse(course.id)
            }))
        );
        
        displayCourses(coursesWithDetails);
    } catch (error) {
        console.error("Erreur de chargement des cours:", error);
        showToast('error', 'Impossible de charger les cours');
    }
}

async function getClassesForCourse(courseId) {
    try {
        const coursClasses = await fetchData('cours_classes');
        const classesIds = coursClasses
            .filter(cc => cc.id_cours === courseId.toString())
            .map(cc => cc.id_classe);
        
        return await Promise.all(classesIds.map(id => fetchData(`classes/${id}`)));
    } catch (error) {
        console.error("Erreur de récupération des classes:", error);
        return [];
    }
}

function displayCourses(courses) {
    if (!elements.lists.courses) return;
    
    elements.lists.courses.innerHTML = courses.length > 0 
        ? courses.map(createCourseRow).join('')
        : '<tr><td colspan="7" class="text-center">Aucun cours trouvé</td></tr>';
}

function createCourseRow(course) {
    const startTime = formatTime(course.heure_debut);
    const endTime = formatTime(course.heure_fin);
    const classNames = course.classes?.map(c => c.libelle).join(', ') || 'Aucune classe';
    const statusClass = course.statut === 'planifié' ? 'badge-info' : 'badge-success';
    
    return `
        <tr>
            <td>${course.module?.libelle || 'Inconnu'}</td>
            <td>${course.date_cours || 'Date inconnue'}</td>
            <td>${startTime} - ${endTime}</td>
            <td>${course.salle || 'Salle inconnue'}</td>
            <td>${classNames}</td>
            <td><span class="badge ${statusClass}">${course.statut || 'Inconnu'}</span></td>
            <td>
                <button class="btn btn-xs btn-outline" 
                        onclick="showCourseDetails('${course.id}')">
                    Détails
                </button>
            </td>
        </tr>
    `;
}

function filterCoursesByStatus() {
    const status = elements.filters.status.value;
    const filtered = status === 'all' 
        ? currentProfessorCourses 
        : currentProfessorCourses.filter(c => c.statut === status);
    displayCourses(filtered);
}

// ==================== GESTION DES ABSENCES ====================
async function loadCoursesForAbsence() {
    elements.forms.courseSelect.innerHTML = '<option disabled selected>Sélectionnez un cours</option>';
    
    const plannedCourses = currentProfessorCourses.filter(c => c.statut === 'planifié');
    if (plannedCourses.length === 0) {
        elements.forms.courseSelect.innerHTML = '<option disabled>Aucun cours planifié</option>';
        return;
    }

    for (const course of plannedCourses) {
        const module = await fetchData(`modules/${course.id_module}`);
        const option = document.createElement('option');
        option.value = course.id;
        option.textContent = `${module.libelle} - ${course.date_cours} (${formatTime(course.heure_debut)})`;
        elements.forms.courseSelect.appendChild(option);
    }
}

async function handleCourseSelection(event) {
    const courseId = event.target.value;
    if (courseId) {
        await loadStudentsForCourse(courseId);
        elements.forms.absenceForm.classList.remove('hidden');
    } else {
        elements.forms.absenceForm.classList.add('hidden');
    }
}

async function loadStudentsForCourse(courseId) {
    try {
        const coursClasses = await fetchData('cours_classes');
        const classIds = coursClasses
            .filter(cc => cc.id_cours === courseId.toString())
            .map(cc => cc.id_classe);
        
        const [allStudents, allUsers, inscriptions] = await Promise.all([
            fetchData('etudiants'),
            fetchData('utilisateurs'),
            fetchData('inscriptions')
        ]);
        
        const currentYear = (await fetchData('annee_scolaire')).find(y => y.est_active === 1);
        
        currentCourseStudents = allStudents
            .filter(s => classIds.includes(s.id_classe))
            .map(student => {
                const user = allUsers.find(u => u.id === student.id_utilisateur);
                const inscription = inscriptions.find(i => 
                    i.id_etudiant === student.id && 
                    i.annee_scolaire === currentYear.libelle
                );
                return { ...student, user, inscription };
            })
            .filter(s => s.inscription?.statut === 'validée');
        
        displayStudents();
        updateSelectedCourseTitle(courseId);
    } catch (error) {
        console.error("Erreur de chargement des étudiants:", error);
        showToast('error', 'Erreur de chargement des étudiants');
    }
}

function displayStudents() {
    elements.lists.students.innerHTML = currentCourseStudents.length > 0
        ? currentCourseStudents.map(createStudentRow).join('')
        : '<tr><td colspan="3" class="text-center">Aucun étudiant</td></tr>';
    
    setupAbsenceCheckboxes();
}

function createStudentRow(student) {
    return `
        <tr>
            <td>
                <div class="flex items-center gap-3">
                    <div class="avatar">
                        <div class="mask mask-squircle w-12 h-12">
                            <img src="${student.user.avatar}" alt="${student.user.prenom} ${student.user.nom}" />
                        </div>
                    </div>
                    <div>
                        <div class="font-bold">${student.user.prenom} ${student.user.nom}</div>
                        <div class="text-sm opacity-50">${student.matricule}</div>
                    </div>
                </div>
            </td>
            <td>
                <input type="checkbox" class="checkbox checkbox-primary absence-checkbox" 
                       id="absent-${student.id}" data-student-id="${student.id}" />
                <label for="absent-${student.id}" class="ml-2">Absent</label>
            </td>
            <td>
                <input type="checkbox" class="checkbox checkbox-success justified-checkbox" 
                       id="justified-${student.id}" data-student-id="${student.id}" disabled />
                <label for="justified-${student.id}" class="ml-2">Justifié</label>
            </td>
        </tr>
    `;
}

function setupAbsenceCheckboxes() {
    document.querySelectorAll('.absence-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const studentId = this.dataset.studentId;
            const justifiedCheckbox = document.querySelector(`.justified-checkbox[data-student-id="${studentId}"]`);
            justifiedCheckbox.disabled = !this.checked;
            justifiedCheckbox.checked = this.checked ? justifiedCheckbox.checked : false;
        });
    });
}

async function updateSelectedCourseTitle(courseId) {
    const course = currentProfessorCourses.find(c => c.id === courseId);
    if (!course) return;
    
    const module = await fetchData(`modules/${course.id_module}`);
    elements.infoDisplays.courseTitle.textContent = 
        `${module.libelle} - ${course.date_cours} (${formatTime(course.heure_debut)}-${formatTime(course.heure_fin)})`;
}

async function saveAbsences() {
    try {
        const courseId = elements.forms.courseSelect.value;
        if (!courseId) return;

        const absentStudents = Array.from(document.querySelectorAll('.absence-checkbox:checked'))
            .map(checkbox => ({
                studentId: checkbox.dataset.studentId,
                justified: document.querySelector(`.justified-checkbox[data-student-id="${checkbox.dataset.studentId}"]`).checked
            }));

        await Promise.all(absentStudents.map(student => 
            sendData('absences', {
                id_etudiant: student.studentId,
                id_cours: courseId,
                date_absence: new Date().toISOString().split('T')[0],
                heure_marquage: new Date().toISOString().replace('T', ' ').substring(0, 19),
                id_marqueur: currentProfessor.id,
                justified: student.justified ? "justifier" : "non justifier"
            })
        ));

        showToast('success', `Absences enregistrées (${absentStudents.length})`);
        resetAbsenceForm();
    } catch (error) {
        console.error("Erreur d'enregistrement:", error);
        showToast('error', 'Erreur d\'enregistrement');
    }
}

function resetAbsenceForm() {
    elements.forms.courseSelect.value = '';
    elements.forms.absenceForm.classList.add('hidden');
    elements.lists.students.innerHTML = '';
}

// ==================== FONCTIONS API ====================
async function fetchData(endpoint, id = "") {
    const url = id ? `${API_BASE_URL}/${endpoint}/${id}` : `${API_BASE_URL}/${endpoint}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
}

async function sendData(endpoint, data, method = "POST") {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
}

// ==================== GESTION DU MODAL ====================
window.showCourseDetails = function(courseId) {
    const course = currentProfessorCourses.find(c => c.id === courseId);
    if (!course || !elements.modals.courseDetails) return;

    // Remplissage du modal
    document.getElementById('modal-course-title').textContent = course.module?.libelle || 'Détails du cours';
    document.getElementById('modal-course-date').textContent = course.date_cours || 'Non spécifié';
    document.getElementById('modal-course-time').textContent = `${formatTime(course.heure_debut)} - ${formatTime(course.heure_fin)}`;
    document.getElementById('modal-course-room').textContent = course.salle || 'Non spécifié';
    
    const statusElement = document.getElementById('modal-course-status');
    statusElement.textContent = course.statut || 'Inconnu';
    statusElement.className = 'font-medium ' + 
        (course.statut === 'planifié' ? 'text-info' : 'text-success');
    
    document.getElementById('modal-course-classes').textContent = 
        course.classes?.map(c => c.libelle).join(', ') || 'Aucune classe';
    document.getElementById('modal-course-description').textContent = 
        course.module?.description || 'Aucune description disponible';
    
    // Ouverture du modal
    elements.modals.courseDetails.showModal();
};

function logOut() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        // Implémentez la logique de déconnexion ici
        window.location.href = '/frontend/public/index.html';
    }
    );
}