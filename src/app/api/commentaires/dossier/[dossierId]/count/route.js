// app/api/commentaires/dossier/[dossierId]/count/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

export async function GET(request, { params }) {
  try {
    const { dossierId } = params;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Comptage des commentaires pour le dossier ${dossierId}`);
    
    // Appeler l'API backend
    try {
      const response = await axios.get(`${API_URL}/api/commentaires/dossier/${dossierId}/count`, {
        headers: { 'Authorization': authHeader }
      });
      
      return NextResponse.json(response.data);
    } catch (err) {
      // Si l'API échoue, essayons de récupérer tous les commentaires puis de les compter
      try {
        const commentsResponse = await axios.get(`${API_URL}/api/commentaires/dossier/${dossierId}`, {
          headers: { 'Authorization': authHeader }
        });
        
        const comments = commentsResponse.data.content || commentsResponse.data;
        const count = Array.isArray(comments) ? comments.length : 0;
        
        return NextResponse.json(count);
      } catch (commentsError) {
        // En développement, retourner une valeur aléatoire
        if (process.env.NODE_ENV === 'development') {
          return NextResponse.json(Math.floor(Math.random() * 15));
        }
        throw commentsError;
      }
    }
  } catch (error) {
    console.error(`Erreur lors du comptage des commentaires pour le dossier ${params.dossierId}:`, error);
    
    // En développement, retourner une valeur aléatoire
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(Math.floor(Math.random() * 15));
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}