// app/api/votes/phase/[phaseId]/mon-vote/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour /api/votes/phase/[phaseId]/mon-vote
export async function GET(request, { params }) {
  try {
    const { phaseId } = params;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Récupération de mon vote pour la phase ${phaseId}`);
    
    // Appeler l'API backend
    try {
      const response = await axios.get(`${API_URL}/api/votes/phase/${phaseId}/mon-vote`, {
        headers: { 'Authorization': authHeader }
      });
      
      return NextResponse.json(response.data);
    } catch (apiError) {
      // Si 404, c'est normal (pas de vote trouvé)
      if (apiError.response?.status === 404) {
        return NextResponse.json(null, { status: 404 });
      }
      
      console.error("Erreur API lors de la récupération de mon vote:", apiError);
      
      // En développement, on peut simuler un vote aléatoirement
      if (process.env.NODE_ENV === 'development' && Math.random() > 0.7) {
        const decisions = ['FAVORABLE', 'DEFAVORABLE', 'COMPLEMENT_REQUIS'];
        return NextResponse.json({
          id: 999,
          decision: decisions[Math.floor(Math.random() * decisions.length)],
          commentaire: "Mon vote simulé",
          dateCreation: new Date().toISOString(),
          utilisateur: {
            id: 1,
            nom: "Coordinateur",
            prenom: "Test",
            role: "COORDINATEUR"
          },
          phase: { id: parseInt(phaseId) }
        });
      }
      
      return NextResponse.json(
        { message: apiError.response?.data?.message || 'Erreur lors de la récupération de mon vote' },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de mon vote:", error);
    
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de mon vote' },
      { status: 500 }
    );
  }
}