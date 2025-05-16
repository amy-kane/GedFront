// app/api/phases/votes/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

export async function GET(request) {
  try {
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log('Récupération de toutes les phases de vote');
    
    // Récupérer d'abord tous les dossiers en cours d'évaluation
    try {
      const dossiersResponse = await axios.get(`${API_URL}/api/dossiers`, {
        params: { statut: 'EN_COURS' },
        headers: { 'Authorization': authHeader }
      });
      
      const dossiers = Array.isArray(dossiersResponse.data)
        ? dossiersResponse.data
        : (dossiersResponse.data.content || []);
      
      console.log(`${dossiers.length} dossiers trouvés`);
      
      // Pour chaque dossier, récupérer ses phases
      let allVotePhases = [];
      
      for (const dossier of dossiers.slice(0, 10)) {
        try {
          const phasesResponse = await axios.get(`${API_URL}/api/phases/dossier/${dossier.id}`, {
            headers: { 'Authorization': authHeader }
          });
          
          const phases = Array.isArray(phasesResponse.data)
            ? phasesResponse.data.filter(phase => phase.type === 'VOTE')
            : [];
          
          // Enrichir les phases avec les informations du dossier
          const enrichedPhases = phases.map(phase => ({
            ...phase,
            dossier: dossier
          }));
          
          allVotePhases = [...allVotePhases, ...enrichedPhases];
        } catch (phaseErr) {
          console.warn(`Impossible de récupérer les phases pour le dossier ${dossier.id}:`, phaseErr);
        }
      }
      
      return NextResponse.json(allVotePhases);
    } catch (apiError) {
      console.error("Erreur API:", apiError);
      throw apiError;
    }
  } catch (error) {
    console.error("Erreur générale:", error);
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des phases de vote' },
      { status: 500 }
    );
  }
}