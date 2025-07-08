// app/api/votes/phase/[phaseId]/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour /api/votes/phase/[phaseId]
export async function GET(request, { params }) {
  try {
    const { phaseId } = params;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Récupération des notes pour la phase ${phaseId}`);
    
    // Appeler l'API backend
    try {
      const response = await axios.get(`${API_URL}/api/votes/phase/${phaseId}`, {
        headers: { 'Authorization': authHeader }
      });
      
      return NextResponse.json(response.data);
    } catch (apiError) {
      console.error("Erreur API lors de la récupération des notes:", apiError);
      
      // Si erreur 403, c'est probablement une question de rôle
      if (apiError.response && apiError.response.status === 403) {
        console.log("Erreur 403: Permission insuffisante pour voir toutes les notes");
        
        // Essayer de récupérer uniquement notre propre note
        try {
          const monVoteResponse = await axios.get(`${API_URL}/api/votes/phase/${phaseId}/mon-vote`, {
            headers: { 'Authorization': authHeader }
          });
          
          // Si on a trouvé notre note, la renvoyer sous forme de tableau
          if (monVoteResponse.data) {
            return NextResponse.json([monVoteResponse.data]);
          }
        } catch (monVoteError) {
          console.warn("Impossible de récupérer notre propre note:", monVoteError);
        }
      }
      
      // En développement, retourner des données simulées
      if (process.env.NODE_ENV === 'development') {
        console.log('Renvoi de notes simulées (phase ID ', phaseId, ')');
        return NextResponse.json(getSimulatedVotes(phaseId));
      }
      
      return NextResponse.json(
        { message: apiError.response?.data?.message || 'Erreur lors de la récupération des notes' },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des notes:", error);
    
    // En développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(getSimulatedVotes(params.phaseId));
    }
    
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des notes' },
      { status: 500 }
    );
  }
}

// Fonction pour générer des notes simulées
function getSimulatedVotes(phaseId) {
  return [
    {
      id: 101,
      note: 16,
      commentaire: "Le projet répond aux exigences techniques",
      dateCreation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      utilisateur: {
        id: 201,
        nom: "Martin",
        prenom: "Sophie",
        role: "MEMBRE_COMITE"
      }
    },
    {
      id: 102,
      note: 12,
      commentaire: "Quelques réserves sur l'impact environnemental",
      dateCreation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      utilisateur: {
        id: 202,
        nom: "Dubois",
        prenom: "Jean",
        role: "MEMBRE_COMITE"
      }
    },
    {
      id: 103,
      note: 18,
      commentaire: "Excellent dossier, très complet",
      dateCreation: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      utilisateur: {
        id: 203,
        nom: "Lemaire",
        prenom: "Marie",
        role: "MEMBRE_COMITE"
      }
    },
    {
      id: 104,
      note: 9,
      commentaire: "Dossier incomplet, manque d'études d'impact",
      dateCreation: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      utilisateur: {
        id: 204,
        nom: "Rousseau",
        prenom: "Pierre",
        role: "MEMBRE_COMITE"
      }
    },
    {
      id: 105,
      note: 14,
      commentaire: "Projet acceptable avec conditions",
      dateCreation: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      utilisateur: {
        id: 205,
        nom: "Lefebvre",
        prenom: "Claire",
        role: "MEMBRE_COMITE"
      }
    }
  ];
}