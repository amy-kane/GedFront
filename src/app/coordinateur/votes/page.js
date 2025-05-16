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
      
      console.log("Récupération des phases de vote...");
      
      // Récupérer les dossiers en cours
      const dossiersResponse = await axios.get('/api/dossiers', {
        params: { statut: 'EN_COURS' }
      });
      
      const dossiers = Array.isArray(dossiersResponse.data)
        ? dossiersResponse.data
        : (dossiersResponse.data.content || []);
      
      console.log(`${dossiers.length} dossiers en cours trouvés`);
      
      // Pour chaque dossier, récupérer ses phases
      let allVotePhases = [];
      
      for (const dossier of dossiers.slice(0, 10)) {
        try {
          const phasesResponse = await axios.get(`/api/phases/dossier/${dossier.id}`);
          
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
      
      console.log(`${allVotePhases.length} phases de vote trouvées`);
      setVotePhases(allVotePhases);
    } catch (err) {
      console.error("Erreur lors de la récupération des phases de vote:", err);
      setError("Erreur lors de la récupération des phases de vote. Veuillez réessayer.");
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
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Phases de vote</h1>
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
              Votes actifs
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                activeFilter === 'past' 
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('past')}
            >
              Votes terminés
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                activeFilter === 'all' 
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              Tous
            </button>
          </div>
        </div>
      </div>
      
      {/* Message d'erreur ou d'avertissement */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 mb-6 rounded-md border border-red-200">
          {error}
        </div>
      )}
      
      {/* Tableau des phases de vote */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <p className="mt-2 text-gray-500">Chargement des phases de vote...</p>
          </div>
        ) : filteredPhases.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Aucune phase de vote {activeFilter === 'active' ? 'active' : activeFilter === 'past' ? 'terminée' : ''} trouvée
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
                          if (confirm("Êtes-vous sûr de vouloir terminer cette phase de vote ?")) {
                            try {
                              await axios.put(`/api/phases/${phase.id}/terminer`);
                              alert("Phase de vote terminée avec succès");
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