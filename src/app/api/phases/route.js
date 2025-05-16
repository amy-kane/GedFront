// app/api/phases/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour /api/phases
export async function GET(request) {
  try {
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Récupération de toutes les phases`);
    
    // Récupération des dossiers en cours
    const dossiersResponse = await axios.get(`${API_URL}/api/dossiers`, {
      params: { statut: 'EN_COURS' },
      headers: {
        'Authorization': authHeader
      }
    });
    
    // Extraire les dossiers
    const dossiers = Array.isArray(dossiersResponse.data) 
      ? dossiersResponse.data 
      : (dossiersResponse.data.content || []);
    
    // Tableau pour stocker toutes les phases
    let allPhases = [];
    
    // Pour chaque dossier, récupérer ses phases
    for (const dossier of dossiers.slice(0, 5)) { // Limiter à 5 dossiers pour éviter trop de requêtes
      try {
        const phasesResponse = await axios.get(`${API_URL}/api/phases/dossier/${dossier.id}`, {
          headers: {
            'Authorization': authHeader
          }
        });
        
        const dossierPhases = Array.isArray(phasesResponse.data) 
          ? phasesResponse.data
          : [];
        
        // Enrichir chaque phase avec l'information du dossier
        const enrichedPhases = dossierPhases.map(phase => ({
          ...phase,
          dossier: dossier
        }));
        
        allPhases = [...allPhases, ...enrichedPhases];
      } catch (err) {
        console.warn(`Impossible de récupérer les phases pour le dossier ${dossier.id}:`, err);
      }
    }
    
    return NextResponse.json(allPhases);
  } catch (error) {
    console.error(`Erreur lors de la récupération de toutes les phases:`, error);
    
    // En développement, retourner des données statiques
    if (process.env.NODE_ENV === 'development') {
      console.log('Utilisation de données statiques en développement suite à une erreur');
      return NextResponse.json(getStaticPhases());
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}

// Fonction pour obtenir des données statiques de phases
function getStaticPhases() {
  const now = new Date();
  return [
    {
      id: 1,
      type: 'DISCUSSION',
      description: 'Examen des mesures compensatoires proposées en zone humide',
      dateDebut: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
      dateFin: null, // Phase active
      dossier: {
        id: 105,
        numeroDossier: 'ENV-2024-105',
        typeDemande: { libelle: 'Autorisation environnementale' },
        nomDeposant: 'EcoÉnergie Renouvelable',
        prenomDeposant: '',
        dateCreation: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    {
      id: 2,
      type: 'DISCUSSION',
      description: 'Analyse technique des systèmes anti-incendie du bâtiment',
      dateDebut: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
      dateFin: null, // Phase active
      dossier: {
        id: 106,
        numeroDossier: 'BAT-2024-047',
        typeDemande: { libelle: 'Permis de construire ERP' },
        nomDeposant: 'Martin',
        prenomDeposant: 'Sophie',
        dateCreation: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    {
      id: 3,
      type: 'DISCUSSION',
      description: 'Évaluation de l\'impact architectural sur zone protégée',
      dateDebut: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
      dateFin: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(), // Phase terminée
      dossier: {
        id: 107,
        numeroDossier: 'URB-2024-123',
        typeDemande: { libelle: 'Permis de construire' },
        nomDeposant: 'Dubois',
        prenomDeposant: 'Jean',
        dateCreation: new Date(now - 22 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  ];
}