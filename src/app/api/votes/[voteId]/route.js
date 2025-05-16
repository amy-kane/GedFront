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
    const decision = url.searchParams.get('decision');
    const commentaire = url.searchParams.get('commentaire');
    
    if (!decision) {
      return NextResponse.json(
        { message: 'Décision requise' },
        { status: 400 }
      );
    }
    
    console.log(`Modification du vote ${voteId}: ${decision}`);
    
    // Appeler l'API backend
    try {
      const response = await axios.put(`${API_URL}/api/votes/${voteId}`, null, {
        params: {
          decision: decision,
          commentaire: commentaire
        },
        headers: { 'Authorization': authHeader }
      });
      
      return NextResponse.json(response.data);
    } catch (apiError) {
      console.error("Erreur API lors de la modification du vote:", apiError);
      
      // En développement, retourner des données simulées
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          id: parseInt(voteId),
          decision: decision,
          commentaire: commentaire,
          dateCreation: new Date().toISOString(),
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
        { message: apiError.response?.data?.message || 'Erreur lors de la modification du vote' },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la modification du vote:", error);
    
    return NextResponse.json(
      { message: 'Erreur lors de la modification du vote' },
      { status: 500 }
    );
  }
}