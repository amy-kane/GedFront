// api/auth/[...ayth]/route.js
import { NextResponse } from 'next/server';
import axios from 'axios';

// Configuration de l'URL du backend Spring Boot
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

// Fonction pour gérer les requêtes POST (login, register, etc.)
export async function POST(request) {
  try {
    // Extraire le chemin après /api/auth/
    const pathname = request.nextUrl.pathname;
    const segments = pathname.split('/api/auth/')[1];
    
    // Construire l'URL du backend
    const backendUrl = `${API_URL}/api/auth/${segments}`;
    
    // Récupérer le corps de la requête
    const body = await request.text();
    
    // Récupérer les en-têtes
    const headers = Object.fromEntries(request.headers);
    
    // Transférer la requête au backend
    const response = await axios({
      method: 'POST',
      url: backendUrl,
      data: body,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        ...headers,
        // Supprimer les en-têtes qui pourraient causer des problèmes
        host: undefined,
        'content-length': undefined
      }
    });
    
    // Renvoyer la réponse du backend
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Erreur API:', error.message);
    
    if (error.response) {
      // Le backend a répondu avec une erreur
      return NextResponse.json(error.response.data, { 
        status: error.response.status 
      });
    } else {
      // Erreur de connexion
      return NextResponse.json({ 
        message: 'Erreur de connexion au serveur' 
      }, { status: 500 });
    }
  }
}

// Fonction pour gérer les requêtes GET (me, etc.)
export async function GET(request) {
  try {
    // Extraire le chemin après /api/auth/
    const pathname = request.nextUrl.pathname;
    const segments = pathname.split('/api/auth/')[1];
    
    // Construire l'URL du backend
    const backendUrl = `${API_URL}/api/auth/${segments}`;
    
    // Récupérer les en-têtes, notamment Authorization
    const headers = Object.fromEntries(request.headers);
    
    // Transférer la requête au backend
    const response = await axios({
      method: 'GET',
      url: backendUrl,
      headers: {
        ...headers,
        // Supprimer les en-têtes qui pourraient causer des problèmes
        host: undefined,
        'content-length': undefined
      }
    });
    
    // Renvoyer la réponse du backend
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error('Erreur API:', error.message);
    
    if (error.response) {
      // Le backend a répondu avec une erreur
      return NextResponse.json(error.response.data, { 
        status: error.response.status 
      });
    } else {
      // Erreur de connexion
      return NextResponse.json({ 
        message: 'Erreur de connexion au serveur' 
      }, { status: 500 });
    }
  }
}