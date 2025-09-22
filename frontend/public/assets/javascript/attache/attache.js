import { initRouter } from '../../../../src/router/router.js';
import { API_BASE_URL, fetchData, sendData } from '../../../../src/services/api.js';
import { getCurrentUser } from '../../../../src/store/authStore.js';

// État global
let currentAttache = null;
let assignedClasses = [];
let currentStudents = [];
let currentJustifications = [];
let currentInscriptions = [];

// Éléments DOM
const elements = {
    sections: {
        students: document.getElementById('students-section'),
        absences: document.getElementById('absences-section'),
        justifications: document.getElementById('justifications-section'),
        inscriptions: document.getElementById('inscriptions-section')
    },
    tabs: {
        students: document.getElementById('students-tab'),
        absences: document.getElementById('absences-tab'),
        justifications: document.getElementById('justifications-tab'),
        inscriptions: document.getElementById('inscriptions-tab')
    },
    filters: {
        class: document.getElementById('class-filter'),
        absenceClass: document.getElementById('absence-class-filter'),
        justificationClass: document.getElementById('justification-class-filter'),
        inscriptionClass: document.getElementById('inscription-class-filter'),
        inscriptionStatus: document.getElementById('inscription-status-filter')
    },
    buttons: {
        filterStudents: document.getElementById('filter-students-btn'),
        filterAbsences: document.getElementById('filter-absences-btn'),
        filterJustifications: document.getElementById('filter-justifications-btn'),
        filterInscriptions: document.getElementById('filter-inscriptions-btn'),
        logout: document.getElementById('logout-btn'),
        acceptJustification: document.getElementById('accept-justification-btn'),
        rejectJustification: document.getElementById('reject-justification-btn')
    },
    infoDisplays: {
        attacheName: document.getElementById('attache-name'),
        attacheFirstname: document.getElementById('attache-firstname'),
        attacheInitials: document.getElementById('attache-initials'),
        attacheClasses: document.getElementById('attache-classes')
    }
};

// Fonction pour afficher les notifications toast
function showToast(type, message) {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} shadow-lg max-w-md`;
    toast.innerHTML = `
        <div>
            <span>${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Supprimer le toast après 5 secondes
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Formater une date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

// Afficher une section spécifique
function showSection(sectionId) {
    // Masquer toutes les sections
    Object.values(elements.sections).forEach(section => {
        if (section) section.classList.add('hidden');
    });
    
    // Désactiver tous les onglets
    Object.values(elements.tabs).forEach(tab => {
        if (tab) tab.classList.remove('active');
    });
    
    // Afficher la section demandée
    if (elements.sections[sectionId]) {
        elements.sections[sectionId].classList.remove('hidden');
    }
    
    // Activer l'onglet correspondant
    if (elements.tabs[sectionId]) {
        elements.tabs[sectionId].classList.add('active');
    }
}

// Initialisation
async function initializeApp() {
    try {
        initRouter();
        logOut();
        currentAttache = await loadCurrentAttache();
        if (!currentAttache) {
            window.location.href = '/frontend/public/index.html';
            return;
        }

        await loadAssignedClasses();
        setupEventListeners();
        await loadInitialData();
        showSection('students');
    } catch (error) {
        console.error("Erreur d'initialisation:", error);
        showToast('error', 'Échec du chargement de l\'application');
    }
}

// Charger l'attaché connecté
async function loadCurrentAttache() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            window.location.href = '/frontend/public/index.html';
            return null;
        }
        
        const attaches = await fetchData('attaches');
        const attache = attaches.find(a => a.id_utilisateur === user.id);
        
        if (!attache) {
            showToast('error', 'Accès non autorisé - Vous n\'êtes pas un attaché');
            window.location.href = '/';
            return null;
        }

        // Mise à jour de l'interface
        if (elements.infoDisplays.attacheName) {
            elements.infoDisplays.attacheName.textContent = `${user.prenom} ${user.nom}`;
        }
        if (elements.infoDisplays.attacheFirstname) {
            elements.infoDisplays.attacheFirstname.textContent = user.prenom || 'Attaché';
        }
        if (elements.infoDisplays.attacheInitials) {
            elements.infoDisplays.attacheInitials.textContent = 
                `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() || 'AT';
        }

        return { ...user, ...attache };
    } catch (error) {
        console.error("Erreur de chargement de l'attaché:", error);
        showToast('error', 'Erreur de chargement du profil');
        return null;
    }
}

// Charger les classes assignées
async function loadAssignedClasses() {
    try {
        const classesAttaches = await fetchData('classes_attaches');
        const assignedClassesIds = classesAttaches
            .filter(ca => ca.id_attache === currentAttache.id)
            .map(ca => ca.id_classe);

        assignedClasses = await Promise.all(
            assignedClassesIds.map(id => fetchData(`classes/${id}`).catch(() => null))
        );
        assignedClasses = assignedClasses.filter(c => c !== null);

        // Mettre à jour les filtres des classes
        const classOptions = assignedClasses.map(c => `
            <option value="${c.id}">${c.libelle}</option>
        `).join('');

        Object.values(elements.filters).forEach(filter => {
            if (filter && filter.id !== 'inscription-status-filter') {
                filter.innerHTML = `
                    <option value="">Toutes les classes</option>
                    ${classOptions}
                `;
            }
        });

        // Mettre à jour le compteur de classes
        if (elements.infoDisplays.attacheClasses) {
            elements.infoDisplays.attacheClasses.textContent = 
                `${assignedClasses.length} classe${assignedClasses.length > 1 ? 's' : ''}`;
        }

        return assignedClasses;
    } catch (error) {
        console.error("Erreur de chargement des classes:", error);
        showToast('error', 'Impossible de charger les classes');
        return [];
    }
}

// Charger les données initiales
async function loadInitialData() {
    await Promise.all([
        loadStudents(),
        loadJustifications(),
        loadInscriptions()
    ]);
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    // Navigation par onglets
    if (elements.tabs.students) {
        elements.tabs.students.addEventListener('click', () => showSection('students'));
    }
    if (elements.tabs.absences) {
        elements.tabs.absences.addEventListener('click', () => showSection('absences'));
    }
    if (elements.tabs.justifications) {
        elements.tabs.justifications.addEventListener('click', () => showSection('justifications'));
    }
    if (elements.tabs.inscriptions) {
        elements.tabs.inscriptions.addEventListener('click', () => showSection('inscriptions'));
    }

    // Filtres
    if (elements.buttons.filterStudents) {
        elements.buttons.filterStudents.addEventListener('click', () => {
            const classId = elements.filters.class.value;
            loadStudents(classId);
        });
    }

    if (elements.buttons.filterInscriptions) {
        elements.buttons.filterInscriptions.addEventListener('click', () => {
            const classId = elements.filters.inscriptionClass.value;
            const status = elements.filters.inscriptionStatus.value;
            loadInscriptions(status, classId);
        });
    }

    // Déconnexion
    if (elements.buttons.logout) {
        elements.buttons.logout.addEventListener('click', () => {
            // Implémentez la logique de déconnexion ici
            window.location.href = '/login.html';
        });
    }

    // Traitement des justifications
    if (elements.buttons.acceptJustification) {
        elements.buttons.acceptJustification.addEventListener('click', () => {
            const justificationId = elements.buttons.acceptJustification.dataset.justificationId;
            if (justificationId) {
                processJustification(justificationId, 'acceptée');
            }
        });
    }

    if (elements.buttons.rejectJustification) {
        elements.buttons.rejectJustification.addEventListener('click', () => {
            const justificationId = elements.buttons.rejectJustification.dataset.justificationId;
            if (justificationId) {
                processJustification(justificationId, 'refusée');
            }
        });
    }
}

/* GESTION DES ÉTUDIANTS */
async function loadStudents(classId = '') {
    try {
        let students = [];
        const etudiants = await fetchData('etudiants');
        
        if (classId) {
            students = etudiants.filter(e => e.id_classe === classId);
        } else {
            const classIds = assignedClasses.map(c => c.id);
            students = etudiants.filter(e => classIds.includes(e.id_classe));
        }

        currentStudents = await Promise.all(
            students.map(async student => {
                const user = await fetchData(`utilisateurs/${student.id_utilisateur}`).catch(() => null);
                const classe = assignedClasses.find(c => c.id === student.id_classe);
                return { ...student, user, classe };
            })
        );

        displayStudents();
    } catch (error) {
        console.error("Erreur de chargement des étudiants:", error);
        showToast('error', 'Impossible de charger les étudiants');
    }
}

function displayStudents() {
    const studentsList = document.getElementById('students-list');
    if (!studentsList) return;

    studentsList.innerHTML = currentStudents.length > 0
        ? currentStudents.map(student => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${student.matricule}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${student.user ? `${student.user.prenom} ${student.user.nom}` : 'Inconnu'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${student.classe?.libelle || 'Classe inconnue'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${student.user?.telephone || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="btn btn-xs btn-info view-student-btn" data-student-id="${student.id}">
                        <i class="ri-eye-line mr-1"></i> Voir
                    </button>
                </td>
            </tr>
        `).join('')
        : '<tr><td colspan="5" class="px-6 py-4 text-center">Aucun étudiant trouvé</td></tr>';

    document.querySelectorAll('.view-student-btn').forEach(btn => {
        btn.addEventListener('click', () => openStudentModal(btn.dataset.studentId));
    });
}

async function openStudentModal(studentId) {
    try {
        const student = currentStudents.find(s => s.id === studentId);
        if (!student) return;

        const modal = document.getElementById('student-modal');
        const details = document.getElementById('student-details');

        if (modal && details) {
            details.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-semibold">Informations personnelles</h4>
                        <div class="mt-2 space-y-2">
                            <p><span class="font-medium">Matricule:</span> ${student.matricule}</p>
                            <p><span class="font-medium">Nom complet:</span> ${student.user?.prenom || ''} ${student.user?.nom || ''}</p>
                            <p><span class="font-medium">Email:</span> ${student.user?.email || 'N/A'}</p>
                            <p><span class="font-medium">Téléphone:</span> ${student.user?.telephone || 'N/A'}</p>
                            <p><span class="font-medium">Adresse:</span> ${student.user?.adresse || 'N/A'}</p>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold">Informations académiques</h4>
                        <div class="mt-2 space-y-2">
                            <p><span class="font-medium">Classe:</span> ${student.classe?.libelle || 'N/A'}</p>
                            <p><span class="font-medium">Date d'inscription:</span> ${formatDate(student.date_inscription)}</p>
                            <p><span class="font-medium">Statut:</span> ${student.statut || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                <div class="mt-4">
                    <button class="btn btn-sm btn-primary view-absences-btn" data-student-id="${student.id}">
                        <i class="ri-calendar-event-line mr-1"></i> Voir les absences
                    </button>
                </div>
            `;

            const viewAbsencesBtn = details.querySelector('.view-absences-btn');
            if (viewAbsencesBtn) {
                viewAbsencesBtn.addEventListener('click', () => {
                    modal.close();
                    showSection('absences');
                    if (elements.filters.absenceClass) {
                        elements.filters.absenceClass.value = student.id_classe;
                    }
                });
            }

            modal.showModal();
        }
    } catch (error) {
        console.error("Erreur lors de l'ouverture du modal étudiant:", error);
        showToast('error', 'Erreur lors du chargement des détails');
    }
}

/* GESTION DES JUSTIFICATIONS */
async function loadJustifications(status = 'en attente') {
    try {
        const justifications = await fetchData('justifications');
        const classIds = assignedClasses.map(c => c.id);
        
        currentJustifications = await Promise.all(
            justifications
                .filter(j => j.statut === status)
                .map(async j => {
                    const absence = await fetchData(`absences/${j.id_absence}`).catch(() => null);
                    if (!absence || !classIds.includes(absence.id_classe)) return null;
                    
                    const student = await fetchData(`etudiants/${absence.id_etudiant}`).catch(() => null);
                    const user = student ? await fetchData(`utilisateurs/${student.id_utilisateur}`).catch(() => null) : null;
                    const course = await fetchData(`cours/${absence.id_cours}`).catch(() => null);
                    const module = course ? await fetchData(`modules/${course.id_module}`).catch(() => null) : null;
                    
                    return { 
                        ...j, 
                        absence, 
                        student: { ...student, user },
                        course,
                        module
                    };
                })
        );
        
        currentJustifications = currentJustifications.filter(j => j !== null);
        displayJustifications();
    } catch (error) {
        console.error("Erreur de chargement des justifications:", error);
        showToast('error', 'Impossible de charger les justifications');
    }
}

function displayJustifications() {
    const justificationsList = document.getElementById('justifications-list');
    if (!justificationsList) return;

    justificationsList.innerHTML = currentJustifications.length > 0
        ? currentJustifications.map(j => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${formatDate(j.date_justification)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${j.student?.user ? `${j.student.user.prenom} ${j.student.user.nom}` : 'Étudiant inconnu'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${j.module?.libelle || 'Cours inconnu'}</td>
                <td class="px-6 py-4 whitespace-nowrap">${formatDate(j.absence?.date_absence)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="badge ${j.statut === 'en attente' ? 'badge-warning' : 'badge-success'}">
                        ${j.statut}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button class="btn btn-xs btn-primary process-justification-btn" data-justification-id="${j.id}">
                        <i class="ri-task-line mr-1"></i> Traiter
                    </button>
                </td>
            </tr>
        `).join('')
        : '<tr><td colspan="6" class="px-6 py-4 text-center">Aucune justification à traiter</td></tr>';

    document.querySelectorAll('.process-justification-btn').forEach(btn => {
        btn.addEventListener('click', () => openJustificationModal(btn.dataset.justificationId));
    });
}

async function openJustificationModal(justificationId) {
    try {
        const justification = currentJustifications.find(j => j.id === justificationId);
        if (!justification) return;

        const modal = document.getElementById('justification-modal');
        const details = document.getElementById('justification-details');

        if (modal && details) {
            details.innerHTML = `
                <div class="space-y-2">
                    <p><span class="font-medium">Étudiant:</span> ${justification.student?.user ? `${justification.student.user.prenom} ${justification.student.user.nom}` : 'Inconnu'}</p>
                    <p><span class="font-medium">Module:</span> ${justification.module?.libelle || 'Inconnu'}</p>
                    <p><span class="font-medium">Date d'absence:</span> ${formatDate(justification.absence?.date_absence)}</p>
                    <p><span class="font-medium">Motif:</span> ${justification.motif || 'Non spécifié'}</p>
                    <p><span class="font-medium">Preuve:</span> ${justification.preuve ? '<a href="#" class="link">Voir la preuve</a>' : 'Aucune preuve'}</p>
                </div>
            `;

            if (elements.buttons.acceptJustification) {
                elements.buttons.acceptJustification.dataset.justificationId = justificationId;
            }
            if (elements.buttons.rejectJustification) {
                elements.buttons.rejectJustification.dataset.justificationId = justificationId;
            }

            modal.showModal();
        }
    } catch (error) {
        console.error("Erreur lors de l'ouverture du modal de justification:", error);
        showToast('error', 'Erreur lors du chargement de la justification');
    }
}

async function processJustification(justificationId, status) {
    try {
        const comment = document.getElementById('justification-comment')?.value || '';
        
        await sendData(`justifications/${justificationId}`, {
            statut: status,
            commentaire_traitement: comment,
            id_traitant: currentAttache.id,
            date_traitement: new Date().toISOString()
        }, 'PATCH');

        showToast('success', `Justification ${status === 'acceptée' ? 'acceptée' : 'refusée'} avec succès`);
        document.getElementById('justification-modal').close();
        await loadJustifications('en attente');
    } catch (error) {
        console.error("Erreur lors du traitement:", error);
        showToast('error', 'Erreur lors du traitement de la justification');
    }
}

/* GESTION DES INSCRIPTIONS */
async function loadInscriptions(status = 'en attente', classId = '') {
    try {
        const inscriptions = await fetchData('inscriptions');
        const classIds = assignedClasses.map(c => c.id);
        
        currentInscriptions = await Promise.all(
            inscriptions
                .filter(i => i.statut === status && (classId ? i.id_classe === classId : classIds.includes(i.id_classe)))
                .map(async i => {
                    const etudiant = await fetchData(`etudiants/${i.id_etudiant}`).catch(() => null);
                    const user = etudiant ? await fetchData(`utilisateurs/${etudiant.id_utilisateur}`).catch(() => null) : null;
                    const classe = assignedClasses.find(c => c.id === i.id_classe);
                    
                    return { ...i, etudiant: { ...etudiant, user }, classe };
                })
        );
        
        displayInscriptions();
    } catch (error) {
        console.error("Erreur de chargement des inscriptions:", error);
        showToast('error', 'Impossible de charger les inscriptions');
    }
}

function displayInscriptions() {
    const inscriptionsList = document.getElementById('inscriptions-list');
    if (!inscriptionsList) return;

    inscriptionsList.innerHTML = currentInscriptions.length > 0
        ? currentInscriptions.map(i => `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">${formatDate(i.date_demande)}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${i.etudiant?.user ? `${i.etudiant.user.prenom} ${i.etudiant.user.nom}` : 'Inconnu'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">${i.classe?.libelle || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="badge ${i.type === 'inscription' ? 'badge-info' : 'badge-warning'}">
                        ${i.type === 'inscription' ? 'Inscription' : 'Réinscription'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="badge ${i.statut === 'validée' ? 'badge-success' : i.statut === 'rejetée' ? 'badge-error' : 'badge-warning'}">
                        ${i.statut}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap space-x-2">
                    ${i.statut === 'en attente' ? `
                        <button class="btn btn-xs btn-success validate-inscription-btn" data-id="${i.id}">
                            <i class="ri-check-line"></i> Valider
                        </button>
                        <button class="btn btn-xs btn-error reject-inscription-btn" data-id="${i.id}">
                            <i class="ri-close-line"></i> Rejeter
                        </button>
                    ` : ''}
                    <button class="btn btn-xs btn-info view-inscription-btn" data-id="${i.id}">
                        <i class="ri-eye-line"></i> Voir
                    </button>
                </td>
            </tr>
        `).join('')
        : '<tr><td colspan="6" class="px-6 py-4 text-center">Aucune demande</td></tr>';

    // Gestion des événements
    document.querySelectorAll('.validate-inscription-btn').forEach(btn => {
        btn.addEventListener('click', () => processInscription(btn.dataset.id, 'validée'));
    });
    
    document.querySelectorAll('.reject-inscription-btn').forEach(btn => {
        btn.addEventListener('click', () => processInscription(btn.dataset.id, 'rejetée'));
    });
    
    document.querySelectorAll('.view-inscription-btn').forEach(btn => {
        btn.addEventListener('click', () => openInscriptionModal(btn.dataset.id));
    });
}

async function openInscriptionModal(inscriptionId) {
    try {
        const inscription = currentInscriptions.find(i => i.id === inscriptionId);
        if (!inscription) return;

        const modal = document.getElementById('inscription-modal');
        const details = document.getElementById('inscription-details');
        const actions = document.getElementById('inscription-actions');

        if (modal && details && actions) {
            // Détails de l'inscription
            details.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 class="font-semibold">Informations personnelles</h4>
                        <div class="mt-2 space-y-2">
                            <p><span class="font-medium">Nom complet:</span> ${inscription.etudiant?.user ? `${inscription.etudiant.user.prenom} ${inscription.etudiant.user.nom}` : 'Inconnu'}</p>
                            <p><span class="font-medium">Date de naissance:</span> ${formatDate(inscription.etudiant?.date_naissance)}</p>
                            <p><span class="font-medium">Lieu de naissance:</span> ${inscription.etudiant?.lieu_naissance || 'N/A'}</p>
                        </div>
                    </div>
                    <div>
                        <h4 class="font-semibold">Informations académiques</h4>
                        <div class="mt-2 space-y-2">
                            <p><span class="font-medium">Classe:</span> ${inscription.classe?.libelle || 'N/A'}</p>
                            <p><span class="font-medium">Type:</span> ${inscription.type === 'inscription' ? 'Nouvelle inscription' : 'Réinscription'}</p>
                            <p><span class="font-medium">Statut:</span> ${inscription.statut}</p>
                        </div>
                    </div>
                </div>
                <div class="mt-4">
                    <h4 class="font-semibold">Documents joints</h4>
                    <div class="mt-2 grid grid-cols-2 gap-2">
                        <a href="#" class="link flex items-center">
                            <i class="ri-file-text-line mr-2"></i> Bulletin scolaire
                        </a>
                        <a href="#" class="link flex items-center">
                            <i class="ri-image-line mr-2"></i> Photo d'identité
                        </a>
                    </div>
                </div>
            `;

            // Actions disponibles
            actions.innerHTML = inscription.statut === 'en attente' ? `
                <button class="btn btn-error reject-inscription-btn" data-id="${inscription.id}">
                    <i class="ri-close-line mr-1"></i> Rejeter
                </button>
                <button class="btn btn-success validate-inscription-btn" data-id="${inscription.id}">
                    <i class="ri-check-line mr-1"></i> Valider
                </button>
            ` : '';

            // Ajouter les événements aux boutons
            document.querySelectorAll('.validate-inscription-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    processInscription(btn.dataset.id, 'validée');
                    modal.close();
                });
            });
            
            document.querySelectorAll('.reject-inscription-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    processInscription(btn.dataset.id, 'rejetée');
                    modal.close();
                });
            });

            modal.showModal();
        }
    } catch (error) {
        console.error("Erreur lors de l'ouverture du modal d'inscription:", error);
        showToast('error', 'Erreur lors du chargement des détails');
    }
}

async function processInscription(id, action) {
    try {
        await sendData(`inscriptions/${id}/${action}`, {}, 'POST');
        showToast('success', `Demande ${action} avec succès`);
        await loadInscriptions('en attente');
    } catch (error) {
        showToast('error', `Échec du traitement: ${error.message}`);
    }
}

function logOut() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        // Implémentez la logique de déconnexion ici
        window.location.href = '/frontend/public/index.html';
    }
    );
}

// Initialisation
document.addEventListener('DOMContentLoaded', initializeApp);