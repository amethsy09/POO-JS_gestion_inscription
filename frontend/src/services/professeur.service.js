import { authStore } from "../store/authStore.js";

const API_BASE_URL = 'http://localhost:3000';

export class ProfesseurService {
    constructor() {
        this.currentProfessor = null;
    }

    // Récupérer le professeur connecté via authStore
    async getCurrentProfessor() {
        try {
            const user = authStore.getCurrentUser();
            if (!user) throw new Error('Aucun utilisateur connecté');
            
            // Vérifier que l'utilisateur est bien un professeur
            if (!authStore.isProfessor()) {
                throw new Error('Accès réservé aux professeurs');
            }

            const professeurs = await this.fetchData('professeurs');
            const utilisateurs = await this.fetchData('utilisateurs');
            
            this.currentProfessor = professeurs.find(p => p.id_utilisateur === user.id.toString());
            
            if (!this.currentProfessor) throw new Error('Professeur non trouvé');
            
            // Ajouter les informations utilisateur au professeur
            this.currentProfessor.user = utilisateurs.find(u => u.id === user.id.toString());
            
            return this.currentProfessor;
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    // Récupérer les cours du professeur
    async getCoursByProfesseur() {
        try {
            const professor = await this.getCurrentProfessor();
            const [cours, modules, semestres, coursClasses, classes] = await Promise.all([
                this.fetchData('cours'),
                this.fetchData('modules'),
                this.fetchData('semestres'),
                this.fetchData('cours_classes'),
                this.fetchData('classes')
            ]);

            return cours
                .filter(c => c.id_professeur === professor.id.toString())
                .map(cours => {
                    const module = modules.find(m => m.id === cours.id_module);
                    const semestre = semestres.find(s => s.id === cours.id_semestre);
                    const classesIds = coursClasses
                        .filter(cc => cc.id_cours === cours.id.toString())
                        .map(cc => cc.id_classe);
                    const classesCours = classes.filter(cl => classesIds.includes(cl.id));

                    return {
                        ...cours,
                        module,
                        semestre,
                        classes: classesCours
                    };
                })
                .sort((a, b) => new Date(b.date_cours) - new Date(a.date_cours)); // Plus récent d'abord
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    // Récupérer les étudiants d'un cours
    async getEtudiantsByCours(coursId) {
        try {
            const [coursClasses, etudiants, utilisateurs, inscriptions, anneeScolaire] = await Promise.all([
                this.fetchData('cours_classes'),
                this.fetchData('etudiants'),
                this.fetchData('utilisateurs'),
                this.fetchData('inscriptions'),
                this.fetchData('annee_scolaire')
            ]);

            const currentYear = anneeScolaire.find(y => y.est_active === 1);
            const classesIds = coursClasses
                .filter(cc => cc.id_cours === coursId.toString())
                .map(cc => cc.id_classe);

            return etudiants
                .filter(etudiant => classesIds.includes(etudiant.id_classe))
                .map(etudiant => {
                    const user = utilisateurs.find(u => u.id === etudiant.id_utilisateur);
                    const inscription = inscriptions.find(i => 
                        i.id_etudiant === etudiant.id && 
                        i.annee_scolaire === currentYear.libelle
                    );

                    return {
                        ...etudiant,
                        user,
                        inscription,
                        present: true, // Par défaut présent
                        justified: false
                    };
                })
                .filter(etudiant => etudiant.inscription?.statut === 'validée');
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    // Marquer les absences
    async marquerAbsences(coursId, absences) {
        try {
            const professor = await this.getCurrentProfessor();
            const dateAbsence = new Date().toISOString().split('T')[0];
            const heureMarquage = new Date().toISOString().replace('T', ' ').substring(0, 19);

            const results = await Promise.all(
                absences.map(async (absence) => {
                    if (!absence.present) {
                        return this.sendData('absences', {
                            id_etudiant: absence.id_etudiant,
                            id_cours: coursId,
                            date_absence: dateAbsence,
                            heure_marquage: heureMarquage,
                            id_marqueur: professor.id,
                            justified: absence.justified ? "justifier" : "non justifier"
                        });
                    }
                    return null;
                })
            );

            return results.filter(result => result !== null);
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }

    // Méthodes utilitaires pour les appels API
    async fetchData(endpoint) {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`);
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return await response.json();
    }

    async sendData(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        return await response.json();
    }
}

export const professeurService = new ProfesseurService();