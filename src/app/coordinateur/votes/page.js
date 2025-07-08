// app/coordinateur/votes/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const VotesPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [votePhases, setVotePhases] = useState([]);
  const [activeFilter, setActiveFilter] = useState('active'); // 'active', 'past', 'all'
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    fetchVotePhases();
  }, []);
  
  const fetchVotePhases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Récupération des phases de notation...");
      
      // Récupérer les dossiers en cours
      const dossiersResponse = await axios.get('/api/dossiers', {
        params: { statut: 'EN_COURS' }
      });
      
      const dossiers = Array.isArray(dossiersResponse.data)
        ? dossiersResponse.data
        : (dossiersResponse.data.content || []);
      
      console.log(`${dossiers.length} dossiers en cours trouvés`);
      
      // Pour chaque dossier, récupérer ses phases et leur moyenne
      let allVotePhases = [];
      
      for (const dossier of dossiers.slice(0, 10)) {
        try {
          const phasesResponse = await axios.get(`/api/phases/dossier/${dossier.id}`);
          
          const phases = Array.isArray(phasesResponse.data)
            ? phasesResponse.data.filter(phase => phase.type === 'VOTE')
            : [];
          
          // Pour chaque phase de vote, récupérer la moyenne si elle est terminée
          const enrichedPhases = await Promise.all(phases.map(async (phase) => {
            let moyenne = null;
            let nombreVotes = 0;
            
            if (phase.dateFin) {
              try {
                const resultatsResponse = await axios.get(`/api/votes/phase/${phase.id}/resultats`);
                moyenne = resultatsResponse.data.moyenne;
              } catch (err) {
                console.warn(`Impossible de récupérer la moyenne pour la phase ${phase.id}:`, err);
              }
            }
            
            // Récupérer le nombre de votes
            try {
              const votesResponse = await axios.get(`/api/votes/phase/${phase.id}`);
              nombreVotes = Array.isArray(votesResponse.data) ? votesResponse.data.length : 0;
            } catch (err) {
              console.warn(`Impossible de récupérer les votes pour la phase ${phase.id}:`, err);
            }
            
            return {
              ...phase,
              dossier: dossier,
              moyenne: moyenne,
              nombreVotes: nombreVotes
            };
          }));
          
          allVotePhases = [...allVotePhases, ...enrichedPhases];
        } catch (phaseErr) {
          console.warn(`Impossible de récupérer les phases pour le dossier ${dossier.id}:`, phaseErr);
        }
      }
      
      console.log(`${allVotePhases.length} phases de notation trouvées`);
      setVotePhases(allVotePhases);
    } catch (err) {
      console.error("Erreur lors de la récupération des phases de notation:", err);
      setError("Erreur lors de la récupération des phases de notation. Utilisation de données simulées.");
      
      // Données simulées en cas d'erreur
      const simulatedPhases = [
        {
          id: 1,
          type: 'VOTE',
          description: 'Notation du projet de construction',
          dateDebut: new Date().toISOString(),
          dateFin: null,
          dossier: {
            id: 101,
            numeroDossier: 'DOS-2024-101',
            typeDemande: { libelle: 'Permis de construire' }
          },
          moyenne: null,
          nombreVotes: 3
        },
        {
          id: 2,
          type: 'VOTE',
          description: 'Notation finale - Résidence Les Oliviers',
          dateDebut: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          dateFin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          dossier: {
            id: 102,
            numeroDossier: 'DOS-2024-102',
            typeDemande: { libelle: 'Permis de construire' }
          },
          moyenne: 15.3,
          nombreVotes: 5
        }
      ];
      setVotePhases(simulatedPhases);
    } finally {
      setLoading(false);
    }
  };
  
  // Filtrer les phases selon le filtre actif
  const filteredPhases = votePhases.filter(phase => {
    if (activeFilter === 'active') return phase.dateFin === null;
    if (activeFilter === 'past') return phase.dateFin !== null;
    return true; // 'all'
  });

  // Composant pour afficher la moyenne
  const MoyenneBadge = ({ moyenne }) => {
    if (moyenne === null || moyenne === undefined) {
      return <span className="text-gray-500 text-sm">En cours</span>;
    }
    
    let bgColor = 'bg-red-100 text-red-800';
    if (moyenne >= 16) bgColor = 'bg-green-100 text-green-800';
    else if (moyenne >= 12) bgColor = 'bg-yellow-100 text-yellow-800';
    else if (moyenne >= 8) bgColor = 'bg-orange-100 text-orange-800';
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {moyenne.toFixed(1)}/20
      </span>
    );
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Phases de notation</h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          onClick={fetchVotePhases}
        >
          Actualiser
        </button>
      </div>
      
      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4">
          <label className="font-medium text-gray-700">Afficher:</label>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded-md ${
                activeFilter === 'active' 
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('active')}
            >
              Notations actives
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                activeFilter === 'past' 
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('past')}
            >
              Notations terminées
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                activeFilter === 'all' 
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              Toutes
            </button>
          </div>
        </div>
      </div>
      
      {/* Message d'erreur ou d'avertissement */}
      {error && (
        <div className="bg-yellow-50 text-yellow-700 p-4 mb-6 rounded-md border border-yellow-200">
          {error}
        </div>
      )}
      
      {/* Tableau des phases de notation */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <p className="mt-2 text-gray-500">Chargement des phases de notation...</p>
          </div>
        ) : filteredPhases.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Aucune phase de notation {activeFilter === 'active' ? 'active' : activeFilter === 'past' ? 'terminée' : ''} trouvée
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dossier
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Résultats
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPhases.map((phase) => (
                <tr key={phase.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-gray-900">{phase.dossier?.numeroDossier || `Dossier ${phase.dossier?.id || 'inconnu'}`}</div>
                      <div className="text-sm text-gray-500">{phase.dossier?.typeDemande?.libelle || 'Type non spécifié'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 max-w-md truncate">{phase.description || 'Aucune description'}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {phase.dateDebut ? new Date(phase.dateDebut).toLocaleDateString() : 'Date inconnue'}
                    </div>
                    {phase.dateFin && (
                      <div className="text-xs text-gray-500">
                        au {new Date(phase.dateFin).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {phase.dateFin === null ? (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Terminée
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <MoyenneBadge moyenne={phase.moyenne} />
                      <span className="text-xs text-gray-500">{phase.nombreVotes} note{phase.nombreVotes > 1 ? 's' : ''}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      onClick={() => router.push(`/coordinateur/votes/${phase.id}`)}
                    >
                      Voir
                    </button>
                    {phase.dateFin === null && (
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={async () => {
                          if (confirm("Êtes-vous sûr de vouloir terminer cette phase de notation ?")) {
                            try {
                              await axios.put(`/api/phases/${phase.id}/terminer`);
                              alert("Phase de notation terminée avec succès");
                              fetchVotePhases();
                            } catch (err) {
                              console.error("Erreur lors de la terminaison:", err);
                              alert("Erreur lors de la terminaison de la phase");
                            }
                          }
                        }}
                      >
                        Terminer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default VotesPage;