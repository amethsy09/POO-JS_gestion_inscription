import { professeurManager } from './professeur.manager.js';

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await professeurManager.init();
    } catch (error) {
        console.error('Erreur lors du chargement de l\'application:', error);
    }
});