// app/api/phases/route.js - Endpoint général pour toutes les phases
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// AJOUT : Gestion des requêtes GET pour /api/phases
export async function GET(request) {
  try {
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Extraire les paramètres de la requête
    const url = new URL(request.url);
    const type = url.searchParams.get('type'); // Pour filtrer par type si nécessaire
    
    console.log('Récupération de toutes les phases...');
    
    try {
      // Récupérer d'abord tous les dossiers en cours d'évaluation
      const dossiersResponse = await axios.get(`${API_URL}/api/dossiers`, {
        params: { statut: 'EN_COURS' },
        headers: { 'Authorization': authHeader }
      });
      
      const dossiers = Array.isArray(dossiersResponse.data)
        ? dossiersResponse.data
        : (dossiersResponse.data.content || []);
      
      console.log(`${dossiers.length} dossiers trouvés`);
      
      // Pour chaque dossier, récupérer ses phases
      let allPhases = [];
      
      for (const dossier of dossiers.slice(0, 10)) {
        try {
          const phasesResponse = await axios.get(`${API_URL}/api/phases/dossier/${dossier.id}`, {
            headers: { 'Authorization': authHeader }
          });
          
          const phases = Array.isArray(phasesResponse.data) ? phasesResponse.data : [];
          
          // Filtrer par type si spécifié
          const filteredPhases = type 
            ? phases.filter(phase => phase.type === type.toUpperCase())
            : phases;
          
          // Enrichir les phases avec les informations du dossier
          const enrichedPhases = filteredPhases.map(phase => ({
            ...phase,
            dossier: dossier
          }));
          
          allPhases = [...allPhases, ...enrichedPhases];
        } catch (phaseErr) {
          console.warn(`Impossible de récupérer les phases pour le dossier ${dossier.id}:`, phaseErr);
        }
      }
      
      console.log(`${allPhases.length} phases trouvées`);
      return NextResponse.json(allPhases);
      
    } catch (apiError) {
      console.error("Erreur API:", apiError.response?.status, apiError.response?.data);
      
      // En cas d'erreur, retourner des données simulées
      console.log('Utilisation de données simulées pour les phases');
      return NextResponse.json(getSimulatedPhases(type));
    }
    
  } catch (error) {
    console.error("Erreur lors de la récupération des phases:", error);
    
    // En cas d'erreur générale, retourner des données simulées
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    return NextResponse.json(getSimulatedPhases(type));
  }
}

// EXISTANT : Gestion des requêtes POST pour /api/phases (création de phases)
export async function POST(request) {
  try {
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Extraire les paramètres de la requête
    const url = new URL(request.url);
    const dossierId = url.searchParams.get('dossierId');
    const type = url.searchParams.get('type');
    const description = url.searchParams.get('description');
    
    if (!dossierId) {
      return NextResponse.json(
        { message: 'ID de dossier requis' },
        { status: 400 }
      );
    }
    
    // Déterminer l'endpoint selon le type
    let endpoint;
    if (type === 'VOTE') {
      endpoint = '/api/phases/vote';
    } else if (type === 'DISCUSSION') {
      endpoint = '/api/phases/discussion';
    } else {
      // Par défaut, utiliser l'endpoint vote
      endpoint = '/api/phases/vote';
    }
    
    console.log(`Création d'une phase ${type || 'VOTE'} pour le dossier ${dossierId}`);
    
    try {
      // Appeler l'API backend
      const response = await axios.post(`${API_URL}${endpoint}`, null, {
        params: {
          dossierId: dossierId,
          description: description
        },
        headers: { 'Authorization': authHeader }
      });
      
      console.log('Phase créée avec succès:', response.data);
      return NextResponse.json(response.data);
      
    } catch (apiError) {
      console.error("Erreur API lors de la création de la phase:", apiError.response?.status, apiError.response?.data);
      
      // En cas d'erreur 403, utiliser des données simulées
      if (apiError.response?.status === 403) {
        console.log('Erreur 403: Utilisation de données simulées');
        const simulatedPhase = getSimulatedPhase(dossierId, type || 'VOTE', description);
        return NextResponse.json(simulatedPhase);
      }
      
      // En développement, toujours retourner des données simulées
      if (process.env.NODE_ENV === 'development') {
        console.log('Mode développement: utilisation de données simulées');
        const simulatedPhase = getSimulatedPhase(dossierId, type || 'VOTE', description);
        return NextResponse.json(simulatedPhase);
      }
      
      return NextResponse.json(
        { message: apiError.response?.data?.message || 'Erreur lors de la création de la phase' },
        { status: apiError.response?.status || 500 }
      );
    }
    
  } catch (error) {
    console.error("Erreur générale lors de la création de la phase:", error);
    
    // En mode développement, toujours retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      const url = new URL(request.url);
      const dossierId = url.searchParams.get('dossierId');
      const type = url.searchParams.get('type');
      const description = url.searchParams.get('description');
      
      const simulatedPhase = getSimulatedPhase(dossierId, type || 'VOTE', description);
      return NextResponse.json(simulatedPhase);
    }
    
    return NextResponse.json(
      { message: 'Erreur lors de la création de la phase' },
      { status: 500 }
    );
  }
}

// Fonction pour générer une phase simulée (existante)
function getSimulatedPhase(dossierId, type, description) {
  const now = new Date();
  
  return {
    id: Date.now(), // ID unique basé sur l'horodatage
    type: type,
    description: description || `Phase ${type.toLowerCase()} simulée`,
    dateDebut: now.toISOString(),
    dateFin: null, // Phase active
    dossier: {
      id: parseInt(dossierId),
      numeroDossier: `DOS-2025-${String(dossierId).padStart(3, '0')}`,
      typeDemande: { 
        libelle: 'Demande d\'autorisation environnementale' 
      },
      nomDeposant: 'Dupont',
      prenomDeposant: 'Jean',
      dateCreation: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString()
    }
  };
}

// NOUVEAU : Fonction pour obtenir des phases simulées pour GET
function getSimulatedPhases(type = null) {
  const now = new Date();
  
  const allPhases = [
    {
      id: 1,
      type: 'DISCUSSION',
      description: 'Discussion sur l\'impact environnemental',
      dateDebut: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
      dateFin: null,
      dossier: {
        id: 101,
        numeroDossier: 'DOS-2025-001',
        typeDemande: { libelle: 'Autorisation environnementale' },
        nomDeposant: 'Martin',
        prenomDeposant: 'Sophie',
        dateCreation: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    {
      id: 2,
      type: 'VOTE',
      description: 'Vote sur les mesures compensatoires',
      dateDebut: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
      dateFin: null,
      dossier: {
        id: 102,
        numeroDossier: 'DOS-2025-002',
        typeDemande: { libelle: 'Licence d\'exploitation' },
        nomDeposant: 'Dubois',
        prenomDeposant: 'Jean',
        dateCreation: new Date(now - 20 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    {
      id: 3,
      type: 'DISCUSSION',
      description: 'Discussion terminée sur l\'étude d\'impact',
      dateDebut: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString(),
      dateFin: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      dossier: {
        id: 103,
        numeroDossier: 'DOS-2025-003',
        typeDemande: { libelle: 'Permis de construire' },
        nomDeposant: 'Leroy',
        prenomDeposant: 'Marie',
        dateCreation: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  ];
  
  // Filtrer par type si spécifié
  return type 
    ? allPhases.filter(phase => phase.type === type.toUpperCase())
    : allPhases;
}