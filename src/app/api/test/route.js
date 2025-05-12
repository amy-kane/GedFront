// app/api/test/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Retourner des données fictives pour tester l'interface
    const sampleData = [
      {
        id: 1,
        type: 'LICENCE1',
        libelle: 'Licence 1 Informatique',
        description: 'Demande d\'inscription en Licence 1 Informatique',
        dateCreation: new Date().toISOString()
      },
      {
        id: 2,
        type: 'MASTER1_SIR',
        libelle: 'Master 1 SIR',
        description: 'Demande d\'inscription en Master 1 Systèmes d\'Information et Réseaux',
        dateCreation: new Date().toISOString()
      }
    ];
    
    return NextResponse.json(sampleData);
  } catch (error) {
    console.error('Erreur test API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}