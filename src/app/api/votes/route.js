// app/api/votes/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes POST pour /api/votes
export async function POST(request) {
  try {
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Extraire les paramètres de la requête
    const url = new URL(request.url);
    const phaseId = url.searchParams.get('phaseId');
    const note = url.searchParams.get('note');
    const commentaire = url.searchParams.get('commentaire');
    
    if (!phaseId || note === null || note === undefined) {
      return NextResponse.json(
        { message: 'ID de phase et note requis' },
        { status: 400 }
      );
    }
    
    // Valider la note (0-20)
    const noteInt = parseInt(note);
    if (isNaN(noteInt) || noteInt < 0 || noteInt > 20) {
      return NextResponse.json(
        { message: 'La note doit être un nombre entre 0 et 20' },
        { status: 400 }
      );
    }
    
    console.log(`Ajout d'une note pour la phase ${phaseId}: ${noteInt}/20`);
    
    // Appeler l'API backend
    try {
      const response = await axios.post(`${API_URL}/api/votes`, null, {
        params: {
          phaseId: phaseId,
          note: noteInt,
          commentaire: commentaire
        },
        headers: { 'Authorization': authHeader }
      });
      
      return NextResponse.json(response.data);
    } catch (apiError) {
      console.error("Erreur API lors de l'ajout de la note:", apiError);
      
      // En développement, retourner des données simulées
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(getSimulatedVote(phaseId, noteInt, commentaire));
      }
      
      return NextResponse.json(
        { message: apiError.response?.data?.message || 'Erreur lors de l\'ajout de la note' },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de la note:", error);
    
    // En développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(getSimulatedVote());
    }
    
    return NextResponse.json(
      { message: 'Erreur lors de l\'ajout de la note' },
      { status: 500 }
    );
  }
}

// Fonction pour obtenir une note simulée
function getSimulatedVote(phaseId = 1, note = 15, commentaire = '') {
  return {
    id: Date.now(),
    note: note,
    commentaire: commentaire,
    dateCreation: new Date().toISOString(),
    utilisateur: {
      id: 1,
      nom: "Coordinateur",
      prenom: "Test",
      role: "COORDINATEUR"
    },
    phase: { id: parseInt(phaseId) },
    dossier: { id: 1 }
  };
}