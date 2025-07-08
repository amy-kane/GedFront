// app/api/votes/[voteId]/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes PUT pour /api/votes/[voteId]
export async function PUT(request, { params }) {
  try {
    const { voteId } = params;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Extraire les paramètres de la requête
    const url = new URL(request.url);
    const note = url.searchParams.get('note');
    const commentaire = url.searchParams.get('commentaire');
    
    if (note === null || note === undefined) {
      return NextResponse.json(
        { message: 'Note requise' },
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
    
    console.log(`Modification de la note ${voteId}: ${noteInt}/20`);
    
    // Appeler l'API backend
    try {
      const response = await axios.put(`${API_URL}/api/votes/${voteId}`, null, {
        params: {
          note: noteInt,
          commentaire: commentaire
        },
        headers: { 'Authorization': authHeader }
      });
      
      return NextResponse.json(response.data);
    } catch (apiError) {
      console.error("Erreur API lors de la modification de la note:", apiError);
      
      // En développement, retourner des données simulées
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          id: parseInt(voteId),
          note: noteInt,
          commentaire: commentaire,
          dateCreation: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          dateModification: new Date().toISOString(),
          utilisateur: {
            id: 1,
            nom: "Coordinateur",
            prenom: "Test",
            role: "COORDINATEUR"
          }
        });
      }
      
      return NextResponse.json(
        { message: apiError.response?.data?.message || 'Erreur lors de la modification de la note' },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la modification de la note:", error);
    
    return NextResponse.json(
      { message: 'Erreur lors de la modification de la note' },
      { status: 500 }
    );
  }
}