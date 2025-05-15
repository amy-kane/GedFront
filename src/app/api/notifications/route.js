// app/api/notifications/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour récupérer toutes les notifications
export async function GET(request) {
  try {
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log('Récupération des notifications');
    
    // D'abord récupérer les notifications non lues
    const nonLuesResponse = await axios.get(`${API_URL}/api/notifications/non-lues`, {
      headers: {
        'Authorization': authHeader
      }
    });
    
    // Pour un système de production complet, nous devrions également récupérer
    // les notifications lues, mais l'API actuelle ne le permet pas directement.
    // Nous utilisons donc uniquement les notifications non lues pour le moment.
    const notifications = nonLuesResponse.data || [];
    
    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Erreur lors de la récupération des notifications:", error);
    
    return NextResponse.json(
      { message: error.response?.data?.message || 'Erreur serveur' },
      { status: error.response?.status || 500 }
    );
  }
}