// app/api/phases/[phaseId]/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

export async function GET(request, { params }) {
  try {
    const { phaseId } = params;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Récupération des détails de la phase ${phaseId}`);
    
    try {
      // Essayer de récupérer directement la phase (endpoint qui n'existe peut-être pas dans le backend)
      const response = await axios.get(`${API_URL}/api/phases/${phaseId}`, {
        headers: { 'Authorization': authHeader }
      });
      
      return NextResponse.json(response.data);
    } catch (directError) {
      console.log(`Échec de l'accès direct à la phase, tentative alternative...`);
      
      // Plan B: Récupérer toutes les phases puis filtrer
      try {
        // Récupérer les dossiers en cours
        const dossiersResponse = await axios.get(`${API_URL}/api/dossiers`, {
          params: { statut: 'EN_COURS' },
          headers: { 'Authorization': authHeader }
        });
        
        const dossiers = Array.isArray(dossiersResponse.data) 
          ? dossiersResponse.data 
          : (dossiersResponse.data.content || []);
        
        // Pour chaque dossier, récupérer ses phases
        for (const dossier of dossiers) {
          try {
            const phasesResponse = await axios.get(`${API_URL}/api/phases/dossier/${dossier.id}`, {
              headers: { 'Authorization': authHeader }
            });
            
            const phases = Array.isArray(phasesResponse.data) 
              ? phasesResponse.data 
              : [];
            
            // Chercher la phase correspondante
            const matchingPhase = phases.find(p => p.id.toString() === phaseId.toString());
            
            if (matchingPhase) {
              // Enrichir avec les infos du dossier
              matchingPhase.dossier = dossier;
              return NextResponse.json(matchingPhase);
            }
          } catch (err) {
            console.warn(`Impossible de récupérer les phases pour le dossier ${dossier.id}:`, err);
          }
        }
        
        // Si on arrive ici, c'est qu'on n'a pas trouvé la phase
        throw new Error("Phase non trouvée");
      } catch (err) {
        // Si on arrive ici, c'est qu'on n'a pas trouvé la phase après avoir tout essayé
        // Retourner une erreur 404
        return NextResponse.json(
          { message: 'Phase non trouvée' },
          { status: 404 }
        );
      }
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails de la phase ${params.phaseId}:`, error);
    
    // En développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      console.log('Utilisation de données simulées en développement suite à une erreur');
      return NextResponse.json(getStaticPhaseDetails(params.phaseId));
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}

// Fonction pour obtenir des données statiques pour une phase
function getStaticPhaseDetails(id) {
  const now = new Date();
  
  // Liste de phases simulées
  const simulatedPhases = [
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
      description: 'Phase de discussion initiale pour le dossier 20',
      dateDebut: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
      dateFin: null, // Phase active
      dossier: {
        id: 107,
        numeroDossier: 'DOS-2025-004',
        typeDemande: { libelle: 'Licence 1 Informatique' },
        nomDeposant: 'Dubois',
        prenomDeposant: 'Jean',
        dateCreation: new Date(now - 22 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  ];
  
  // Chercher la phase correspondante
  const matchingPhase = simulatedPhases.find(p => p.id.toString() === id.toString());
  
  // Si on la trouve, la retourner
  if (matchingPhase) {
    return matchingPhase;
  }
  
  // Sinon, créer une phase simulée avec l'ID demandé
  return {
    id: parseInt(id),
    type: 'DISCUSSION',
    description: `Phase de discussion pour le dossier ${parseInt(id) + 100}`,
    dateDebut: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
    dateFin: null, // Phase active
    dossier: {
      id: parseInt(id) + 100,
      numeroDossier: `DOS-2025-${id.toString().padStart(3, '0')}`,
      typeDemande: { libelle: 'Licence 1 Informatique' },
      nomDeposant: 'Utilisateur',
      prenomDeposant: `N°${id}`,
      dateCreation: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString()
    }
  };
}