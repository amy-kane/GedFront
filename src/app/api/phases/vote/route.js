// app/api/phases/vote/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const dossierId = url.searchParams.get('dossierId');
    const description = url.searchParams.get('description');
    
    if (!dossierId || !description) {
      return NextResponse.json(
        { message: 'ID de dossier et description requis' },
        { status: 400 }
      );
    }
    
    console.log(`Création d'une phase de vote pour le dossier ${dossierId}`);
    
    try {
      const response = await axios.post(`${API_URL}/api/phases/vote`, null, {
        params: {
          dossierId: dossierId,
          type: 'VOTE',
          description: description
        },
        headers: { 'Authorization': authHeader }
      });
      
      return NextResponse.json(response.data);
    } catch (apiError) {
      console.error("Erreur API:", apiError);
      
      // Données simulées pour le développement
      const simulatedPhase = {
        id: Date.now(),
        type: 'VOTE',
        description: description,
        dateDebut: new Date().toISOString(),
        dateFin: null,
        dossierId: parseInt(dossierId)
      };
      return NextResponse.json(simulatedPhase);
    }
  } catch (error) {
    console.error("Erreur:", error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la phase de vote' },
      { status: 500 }
    );
  }
}