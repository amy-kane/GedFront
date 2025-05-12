// app/api/commentaires/dossier/[dossierId]/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour récupérer les commentaires d'un dossier
export async function GET(request, { params }) {
  try {
    const { dossierId } = params;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Récupération des commentaires pour le dossier ${dossierId}`);
    
    // Extraire les paramètres de pagination si présents
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || 0;
    const size = url.searchParams.get('size') || 20;
    
    // Appeler l'API backend
    const response = await axios.get(
      `${API_URL}/api/commentaires/dossier/${dossierId}`,
      {
        params: {
          page: page,
          size: size
        },
        headers: {
          'Authorization': authHeader
        }
      }
    );
    
    // Vérifier si la réponse contient les commentaires dédupliqués par ID
    const commentaires = response.data;
    if (commentaires && commentaires.content && Array.isArray(commentaires.content)) {
      // Dédupliquer les commentaires par ID
      const uniqueCommentairesMap = new Map();
      commentaires.content.forEach(commentaire => {
        uniqueCommentairesMap.set(commentaire.id, commentaire);
      });
      
      // Convertir le Map en tableau
      const uniqueCommentaires = Array.from(uniqueCommentairesMap.values());
      
      // Reconstruire l'objet de pagination avec les commentaires dédupliqués
      const dedupedResponse = {
        ...commentaires,
        content: uniqueCommentaires,
        numberOfElements: uniqueCommentaires.length
      };
      
      return NextResponse.json(dedupedResponse);
    }
    
    // Si la réponse est déjà un tableau simple, le dédupliquer
    if (Array.isArray(response.data)) {
      const uniqueCommentaires = Array.from(
        new Map(response.data.map(item => [item.id, item])).values()
      );
      return NextResponse.json(uniqueCommentaires);
    }
    
    // Retourner la réponse originale si la structure n'est pas reconnue
    return NextResponse.json(response.data);
    
  } catch (error) {
    console.error(`Erreur lors de la récupération des commentaires pour le dossier ${params.dossierId}:`, error);
    
    // Gestion des erreurs spécifiques
    if (error.response?.status === 403) {
      return NextResponse.json(
        { message: 'Vous n\'avez pas les droits pour consulter les commentaires de ce dossier' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}