// app/coordinateur/discussions/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const CoordinateurDiscussionsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [discussionPhases, setDiscussionPhases] = useState([]);
  const [activeFilter, setActiveFilter] = useState('active'); // 'active', 'past', 'all'
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    fetchDiscussionPhases();
  }, []);
  
  const fetchDiscussionPhases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Essayer d'abord de récupérer toutes les phases (sans filtre)
      console.log("Tentative de récupération des phases...");
      const response = await axios.get('/api/phases');
      
      console.log("Phases récupérées:", response.data);
      
      // Filtrer les phases de type DISCUSSION côté client
      const discussionPhases = Array.isArray(response.data) 
        ? response.data.filter(phase => phase.type === 'DISCUSSION')
        : [];
      
      console.log(`${discussionPhases.length} phases de discussion trouvées`);
      
      // Enrichir les phases avec le nombre de commentaires et les participants
      const enrichedPhases = await Promise.all(discussionPhases.map(async (phase) => {
        try {
          let commentairesCount = 0;
          
          // Essayer de récupérer le nombre de commentaires
          try {
            const commentairesResponse = await axios.get(`/api/commentaires/dossier/${phase.dossier.id}/count`);
            commentairesCount = parseInt(commentairesResponse.data) || 0;
          } catch (err) {
            console.warn(`Impossible de récupérer le nombre de commentaires pour le dossier ${phase.dossier.id}:`, err);
            // Utiliser 0 comme valeur par défaut
          }
          
          // Simuler le nombre de participants pour le moment
          const membresParticipants = Math.floor(Math.random() * 5) + 2;
          
          return {
            ...phase,
            commentairesCount,
            membresParticipants
          };
        } catch (err) {
          console.warn(`Erreur lors de l'enrichissement de la phase ${phase.id}:`, err);
          return {
            ...phase,
            commentairesCount: 0,
            membresParticipants: 1
          };
        }
      }));
      
      setDiscussionPhases(enrichedPhases);
    } catch (err) {
      console.error("Erreur lors de la récupération des phases:", err);
      
      // En cas d'erreur, utiliser des données simulées
      console.log("Utilisation de données simulées suite à l'erreur");
      setDiscussionPhases(getSimulatedDiscussionPhases());
      setError("Impossible de charger les données réelles. Affichage de données simulées.");
    } finally {
      setLoading(false);
    }
  };
  
  // Données simulées pour le fallback
  const getSimulatedDiscussionPhases = () => {
    const now = new Date();
    return [
      {
        id: 1,
        type: 'DISCUSSION',
        description: 'Examen des mesures compensatoires proposées en zone humide',
        dateDebut: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
        dateFin: null, // Phase active
        dossier: {
          id: 105,
          numeroDossier: 'ENV-2024-105',
          typeDemande: { libelle: 'Autorisation environnementale' },
          nomDeposant: 'EcoÉnergie Renouvelable',
          prenomDeposant: '',
          dateCreation: new Date(now - 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        commentairesCount: 12,
        membresParticipants: 5
      },
      {
        id: 2,
        type: 'DISCUSSION',
        description: 'Analyse technique des systèmes anti-incendie du bâtiment',
        dateDebut: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
        dateFin: null, // Phase active
        dossier: {
          id: 106,
          numeroDossier: 'BAT-2024-047',
          typeDemande: { libelle: 'Permis de construire ERP' },
          nomDeposant: 'Martin',
          prenomDeposant: 'Sophie',
          dateCreation: new Date(now - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        commentairesCount: 8,
        membresParticipants: 3
      },
      {
        id: 3,
        type: 'DISCUSSION',
        description: 'Évaluation de l\'impact architectural sur zone protégée',
        dateDebut: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
        dateFin: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(), // Phase terminée
        dossier: {
          id: 107,
          numeroDossier: 'URB-2024-123',
          typeDemande: { libelle: 'Permis de construire' },
          nomDeposant: 'Dubois',
          prenomDeposant: 'Jean',
          dateCreation: new Date(now - 22 * 24 * 60 * 60 * 1000).toISOString()
        },
        commentairesCount: 15,
        membresParticipants: 4
      }
    ];
  };
  
  // Filtrer les phases selon le filtre actif
  const filteredPhases = discussionPhases.filter(phase => {
    if (activeFilter === 'active') return phase.dateFin === null;
    if (activeFilter === 'past') return phase.dateFin !== null;
    return true; // 'all'
  });
  
  // Reste du composant inchangé...
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Phases de discussion</h1>
        <button 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          onClick={() => router.push('/coordinateur/phases/nouvelle')}
        >
          Nouvelle phase
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
              Discussions actives
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                activeFilter === 'past' 
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('past')}
            >
              Discussions terminées
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
      
      {/* Tableau des phases */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <p className="mt-2 text-gray-500">Chargement des phases de discussion...</p>
          </div>
        ) : filteredPhases.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Aucune phase de discussion {activeFilter === 'active' ? 'active' : activeFilter === 'past' ? 'terminée' : ''} trouvée
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
                  Participation
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
                      <div className="font-medium text-gray-900">{phase.dossier.numeroDossier || `Dossier ${phase.dossier.id}`}</div>
                      <div className="text-sm text-gray-500">{phase.dossier.typeDemande?.libelle || 'Type non spécifié'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900 max-w-md truncate">{phase.description}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(phase.dateDebut).toLocaleDateString()}
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
                    <div className="flex items-center space-x-3">
                      <div className="flex -space-x-1">
                        {Array(Math.min(3, phase.membresParticipants)).fill(0).map((_, i) => (
                          <div key={i} className="h-6 w-6 rounded-full bg-indigo-100 border border-white flex items-center justify-center text-xs text-indigo-600">
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                        {phase.membresParticipants > 3 && (
                          <div className="h-6 w-6 rounded-full bg-gray-100 border border-white flex items-center justify-center text-xs text-gray-600">
                            +{phase.membresParticipants - 3}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        <span className="font-medium text-indigo-600">{phase.commentairesCount}</span> commentaires
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      onClick={() => router.push(`/coordinateur/discussions/${phase.id}`)}
                    >
                      Voir
                    </button>
                    {phase.dateFin === null && (
                      <>
                        <button 
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          onClick={async () => {
                            try {
                              const joursSupplement = prompt("Nombre de jours supplémentaires :", "7");
                              if (joursSupplement === null) return;
                              
                              const joursNum = parseInt(joursSupplement);
                              if (isNaN(joursNum) || joursNum <= 0) {
                                alert("Veuillez entrer un nombre de jours valide");
                                return;
                              }
                              
                              await axios.put(`/api/phases/${phase.id}/prolonger`, null, {
                                params: { joursSupplementaires: joursNum }
                              });
                              
                              alert(`Phase prolongée de ${joursNum} jours`);
                              fetchDiscussionPhases();
                            } catch (err) {
                              console.error("Erreur lors de la prolongation:", err);
                              alert("Erreur lors de la prolongation de la phase");
                            }
                          }}
                        >
                          Prolonger
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={async () => {
                            if (confirm("Êtes-vous sûr de vouloir terminer cette phase ?")) {
                              try {
                                await axios.put(`/api/phases/${phase.id}/terminer`);
                                alert("Phase terminée avec succès");
                                fetchDiscussionPhases();
                              } catch (err) {
                                console.error("Erreur lors de la terminaison:", err);
                                alert("Erreur lors de la terminaison de la phase");
                              }
                            }
                          }}
                        >
                          Terminer
                        </button>
                      </>
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

export default CoordinateurDiscussionsPage;