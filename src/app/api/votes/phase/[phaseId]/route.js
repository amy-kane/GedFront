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
    
    console.log(`Récupération des votes pour la phase ${phaseId}`);
    
    // Appeler l'API backend
    try {
      const response = await axios.get(`${API_URL}/api/votes/phase/${phaseId}`, {
        headers: { 'Authorization': authHeader }
      });
      
      return NextResponse.json(response.data);
    } catch (apiError) {
      console.error("Erreur API lors de la récupération des votes:", apiError);
      
      // Si erreur 403, c'est probablement une question de rôle
      if (apiError.response && apiError.response.status === 403) {
        console.log("Erreur 403: Permission insuffisante pour voir tous les votes");
        
        // Essayer de récupérer uniquement notre propre vote
        try {
          const monVoteResponse = await axios.get(`${API_URL}/api/votes/phase/${phaseId}/mon-vote`, {
            headers: { 'Authorization': authHeader }
          });
          
          // Si on a trouvé notre vote, le renvoyer sous forme de tableau
          if (monVoteResponse.data) {
            return NextResponse.json([monVoteResponse.data]);
          }
        } catch (monVoteError) {
          console.warn("Impossible de récupérer notre propre vote:", monVoteError);
        }
      }
      
      // En développement, retourner des données simulées
      if (process.env.NODE_ENV === 'development') {
        console.log('Renvoi de votes simulés (phase ID ', phaseId, ')');
        return NextResponse.json(getSimulatedVotes(phaseId));
      }
      
      return NextResponse.json(
        { message: apiError.response?.data?.message || 'Erreur lors de la récupération des votes' },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des votes:", error);
    
    // En développement, retourner des données simulées
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(getSimulatedVotes(params.phaseId));
    }
    
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des votes' },
      { status: 500 }
    );
  }
}