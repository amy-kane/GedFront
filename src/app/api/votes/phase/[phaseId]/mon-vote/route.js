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
    
    console.log(`Récupération de ma note pour la phase ${phaseId}`);
    
    // Appeler l'API backend
    try {
      const response = await axios.get(`${API_URL}/api/votes/phase/${phaseId}/mon-vote`, {
        headers: { 'Authorization': authHeader }
      });
      
      return NextResponse.json(response.data);
    } catch (apiError) {
      // Si 404, c'est normal (pas de note trouvée)
      if (apiError.response?.status === 404) {
        return NextResponse.json(null, { status: 404 });
      }
      
      console.error("Erreur API lors de la récupération de ma note:", apiError);
      
      // En développement, on peut simuler une note aléatoirement
      if (process.env.NODE_ENV === 'development' && Math.random() > 0.6) {
        const notes = [11, 12, 14, 15, 16, 17, 18];
        const commentaires = [
          "Dossier satisfaisant dans l'ensemble",
          "Projet conforme aux attentes",
          "Quelques réserves mais acceptable",
          "Bon dossier technique",
          "Excellente présentation"
        ];
        
        return NextResponse.json({
          id: 999,
          note: notes[Math.floor(Math.random() * notes.length)],
          commentaire: commentaires[Math.floor(Math.random() * commentaires.length)],
          dateCreation: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
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
        { message: apiError.response?.data?.message || 'Erreur lors de la récupération de ma note' },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de ma note:", error);
    
    return NextResponse.json(
      { message: 'Erreur lors de la récupération de ma note' },
      { status: 500 }
    );
  }
}