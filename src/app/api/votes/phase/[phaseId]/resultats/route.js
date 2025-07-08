import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour /api/votes/phase/[phaseId]/resultats
export async function GET(request, { params }) {
  try {
    const { phaseId } = params;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Récupération des résultats pour la phase ${phaseId}`);
    
    // Appeler l'API backend
    try {
      const response = await axios.get(`${API_URL}/api/votes/phase/${phaseId}/resultats`, {
        headers: { 'Authorization': authHeader }
      });
      
      // Le backend retourne directement la moyenne (Double)
      // On l'encapsule dans un objet pour plus de clarté
      return NextResponse.json({ 
        moyenne: response.data,
        phaseId: parseInt(phaseId)
      });
    } catch (apiError) {
      console.error("Erreur API lors de la récupération des résultats:", apiError);
      
      // En développement, retourner une moyenne simulée
      if (process.env.NODE_ENV === 'development') {
        // Simuler une moyenne réaliste basée sur les notes simulées
        const moyennesSimulees = [12.4, 13.8, 15.2, 16.7, 14.1, 11.9, 17.3];
        const moyenneSimulee = moyennesSimulees[parseInt(phaseId) % moyennesSimulees.length];
        
        return NextResponse.json({ 
          moyenne: moyenneSimulee,
          phaseId: parseInt(phaseId),
          simulated: true
        });
      }
      
      return NextResponse.json(
        { message: apiError.response?.data?.message || 'Erreur lors de la récupération des résultats' },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des résultats:", error);
    
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des résultats' },
      { status: 500 }
    );
  }
}