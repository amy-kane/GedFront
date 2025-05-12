// app/api/dossiers/[id]/statut/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes PUT pour /api/dossiers/[id]/statut
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    console.log(`Mise à jour du statut pour le dossier ID: ${id}`);

    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    // Récupérer le statut depuis l'URL de la requête
    const url = new URL(request.url);
    const statut = url.searchParams.get('statut');
    
    if (!statut) {
      return NextResponse.json({ error: 'Statut manquant dans la requête' }, { status: 400 });
    }
    
    console.log(`Mise à jour du dossier ${id} vers le statut: ${statut}`);
    
    // Appel au backend pour mettre à jour le statut - NOTEZ LE CHANGEMENT ICI
    const response = await axios.put(
      `${API_URL}/api/dossiers/${id}/statut?statut=${statut}`,  // Envoi en tant que paramètre URL
      {},  // Corps vide
      {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(`Statut du dossier ${id} mis à jour avec succès`);
    return NextResponse.json(response.data || { message: 'Statut mis à jour avec succès' });
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut du dossier ${params.id}:`, error);
    
    // Log détaillé pour le débogage
    if (error.response) {
      console.error('Statut de l\'erreur:', error.response.status);
      console.error('Données de l\'erreur:', error.response.data);
    }
    
    // Si le statut n'est pas reconnu par le backend
    if (error.response?.status === 400) {
      return NextResponse.json(
        { message: 'Statut non valide' },
        { status: 400 }
      );
    }
    
    // Si l'utilisateur n'a pas les permissions nécessaires
    if (error.response?.status === 403) {
      return NextResponse.json(
        { message: 'Vous n\'avez pas les permissions nécessaires pour modifier le statut de ce dossier' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur lors de la mise à jour du statut' },
      { status: error.response?.status || 500 }
    );
  }
}