import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_BASE_URL || 'http://localhost:8081';

// Gestion des requêtes GET pour /api/votes/phase/[phaseId]/statistiques
// Route bonus pour récupérer des statistiques complètes
export async function GET(request, { params }) {
  try {
    const { phaseId } = params;
    
    // Récupérer le token d'autorisation
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }
    
    console.log(`Récupération des statistiques complètes pour la phase ${phaseId}`);
    
    try {
      // Récupérer les votes et la moyenne en parallèle
      const [votesResponse, moyenneResponse] = await Promise.all([
        axios.get(`${API_URL}/api/votes/phase/${phaseId}`, {
          headers: { 'Authorization': authHeader }
        }),
        axios.get(`${API_URL}/api/votes/phase/${phaseId}/resultats`, {
          headers: { 'Authorization': authHeader }
        })
      ]);
      
      const votes = votesResponse.data || [];
      const moyenne = moyenneResponse.data;
      
      // Calculer les statistiques complètes
      const statistiques = calculateStatistics(votes, moyenne);
      
      return NextResponse.json(statistiques);
    } catch (apiError) {
      console.error("Erreur API lors de la récupération des statistiques:", apiError);
      
      // En développement, retourner des statistiques simulées
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json(getSimulatedStatistics(phaseId));
      }
      
      return NextResponse.json(
        { message: apiError.response?.data?.message || 'Erreur lors de la récupération des statistiques' },
        { status: apiError.response?.status || 500 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    
    return NextResponse.json(
      { message: 'Erreur lors de la récupération des statistiques' },
      { status: 500 }
    );
  }
}

// Fonction pour calculer les statistiques complètes
function calculateStatistics(votes, moyenne) {
  if (!votes || votes.length === 0) {
    return {
      moyenne: 0,
      nombreVotes: 0,
      min: 0,
      max: 0,
      mediane: 0,
      ecartType: 0,
      distribution: getEmptyDistribution()
    };
  }

  const notes = votes.map(vote => vote.note).sort((a, b) => a - b);
  const min = Math.min(...notes);
  const max = Math.max(...notes);
  
  // Calcul de la médiane
  const middle = Math.floor(notes.length / 2);
  const mediane = notes.length % 2 === 0 
    ? (notes[middle - 1] + notes[middle]) / 2 
    : notes[middle];

  // Calcul de l'écart-type
  const variance = notes.reduce((sum, note) => sum + Math.pow(note - moyenne, 2), 0) / notes.length;
  const ecartType = Math.sqrt(variance);

  return {
    moyenne: parseFloat(moyenne.toFixed(1)),
    nombreVotes: votes.length,
    min,
    max,
    mediane: parseFloat(mediane.toFixed(1)),
    ecartType: parseFloat(ecartType.toFixed(1)),
    distribution: calculateDistribution(notes)
  };
}

// Fonction pour calculer la distribution des notes par tranches
function calculateDistribution(notes) {
  const tranches = [
    { label: '0-5', min: 0, max: 5, count: 0, color: 'bg-red-500' },
    { label: '6-10', min: 6, max: 10, count: 0, color: 'bg-orange-500' },
    { label: '11-15', min: 11, max: 15, count: 0, color: 'bg-yellow-500' },
    { label: '16-20', min: 16, max: 20, count: 0, color: 'bg-green-500' }
  ];

  notes.forEach(note => {
    const tranche = tranches.find(t => note >= t.min && note <= t.max);
    if (tranche) tranche.count++;
  });

  // Ajouter les pourcentages
  const total = notes.length;
  tranches.forEach(tranche => {
    tranche.percentage = total > 0 ? (tranche.count / total) * 100 : 0;
  });

  return tranches;
}

// Fonction pour retourner une distribution vide
function getEmptyDistribution() {
  return [
    { label: '0-5', min: 0, max: 5, count: 0, percentage: 0, color: 'bg-red-500' },
    { label: '6-10', min: 6, max: 10, count: 0, percentage: 0, color: 'bg-orange-500' },
    { label: '11-15', min: 11, max: 15, count: 0, percentage: 0, color: 'bg-yellow-500' },
    { label: '16-20', min: 16, max: 20, count: 0, percentage: 0, color: 'bg-green-500' }
  ];
}

// Fonction pour obtenir des statistiques simulées
function getSimulatedStatistics(phaseId) {
  const votesSimules = getSimulatedVotes(phaseId);
  const moyenne = votesSimules.reduce((sum, vote) => sum + vote.note, 0) / votesSimules.length;
  
  return calculateStatistics(votesSimules, moyenne);
}