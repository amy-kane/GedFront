// app/coordinateur/votes/page.js
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function VotesPage() {
  const [loading, setLoading] = useState(true);
  const [phaseVotes, setPhaseVotes] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [phaseVoteDetails, setPhaseVoteDetails] = useState([]);
  const [votesDetail, setVotesDetail] = useState(null);
  const [filterStatus, setFilterStatus] = useState('active'); // 'active', 'all', 'terminated'
  
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
      
      // Dans un environnement réel, nous ferions un appel API
      // const response = await axios.get('/api/phases?type=VOTE');
      
      // Données simulées
      const mockPhaseVotes = [
        {
          id: 1,
          description: "Vote sur le projet de construction du centre commercial",
          dateDebut: new Date().toISOString(),
          dateFin: null, // Phase active
          dossier: {
            id: 101,
            numeroDossier: "DOS-2024-101",
            nomDeposant: "SCI Horizon",
            prenomDeposant: ""
          },
          votesStats: {
            FAVORABLE: 2,
            DEFAVORABLE: 1,
            COMPLEMENT_REQUIS: 0,
            total: 3
          }
        },
        {
          id: 2,
          description: "Vote sur la demande de permis de construire pour la résidence Les Oliviers",
          dateDebut: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          dateFin: null, // Phase active
          dossier: {
            id: 102,
            numeroDossier: "DOS-2024-102",
            nomDeposant: "Dupont",
            prenomDeposant: "Jean"
          },
          votesStats: {
            FAVORABLE: 3,
            DEFAVORABLE: 0,
            COMPLEMENT_REQUIS: 1,
            total: 4
          }
        },
        {
          id: 3,
          description: "Vote final sur le projet d'agrandissement du parc industriel",
          dateDebut: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          dateFin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Phase terminée
          dossier: {
            id: 103,
            numeroDossier: "DOS-2024-103",
            nomDeposant: "Entreprises Modernes",
            prenomDeposant: ""
          },
          votesStats: {
            FAVORABLE: 5,
            DEFAVORABLE: 2,
            COMPLEMENT_REQUIS: 0,
            total: 7
          }
        }
      ];
      
      setPhaseVotes(mockPhaseVotes);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des phases de vote:", error);
      setLoading(false);
    }
  };

  const handlePhaseSelect = async (phase) => {
    try {
      setSelectedPhase(phase);
      
      // Dans un environnement réel, nous ferions un appel API
      // const response = await axios.get(`/api/phases/${phase.id}/votes`);
      
      // Données simulées
      const mockVotes = [
        {
          id: 101,
          utilisateur: {
            id: 201,
            nom: "Martin",
            prenom: "Sophie",
            email: "sophie.martin@example.com",
            role: "MEMBRE_COMITE"
          },
          decision: "FAVORABLE",
          commentaire: "Projet en accord avec le plan d'urbanisme local.",
          dateVote: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 102,
          utilisateur: {
            id: 202,
            nom: "Dubois",
            prenom: "Pierre",
            email: "pierre.dubois@example.com",
            role: "MEMBRE_COMITE"
          },
          decision: "FAVORABLE",
          commentaire: "Impact environnemental limité et bien étudié.",
          dateVote: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 103,
          utilisateur: {
            id: 203,
            nom: "Leclerc",
            prenom: "Marie",
            email: "marie.leclerc@example.com",
            role: "MEMBRE_COMITE"
          },
          decision: "DEFAVORABLE",
          commentaire: "Inquiétudes concernant l'augmentation du trafic routier.",
          dateVote: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      setPhaseVoteDetails(mockVotes);
    } catch (error) {
      console.error("Erreur lors de la récupération des votes de la phase:", error);
      alert("Erreur lors de la récupération des votes de la phase");
    }
  };

  const handleVoteDetail = (vote) => {
    setVotesDetail(vote);
  };

  const filteredPhases = phaseVotes.filter(phase => {
    if (filterStatus === 'active') return phase.dateFin === null;
    if (filterStatus === 'terminated') return phase.dateFin !== null;
    return true; // 'all'
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Suivi des votes</h1>
      
      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4">
          <label className="font-medium text-gray-700">Afficher:</label>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded-md ${
                filterStatus === 'active' 
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setFilterStatus('active')}
            >
              Votes actifs
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                filterStatus === 'terminated' 
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setFilterStatus('terminated')}
            >
              Votes terminés
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                filterStatus === 'all' 
                  ? 'bg-indigo-100 text-indigo-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setFilterStatus('all')}
            >
              Tous
            </button>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liste des phases de vote */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
              <h2 className="font-semibold text-indigo-800">Phases de vote</h2>
            </div>
            
            {loading ? (
              <div className="p-4 text-center">Chargement...</div>
            ) : filteredPhases.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucune phase de vote trouvée</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredPhases.map(phase => (
                  <li 
                    key={phase.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedPhase?.id === phase.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => handlePhaseSelect(phase)}
                  >
                    <div>
                      <p className="font-medium text-gray-900 flex items-center">
                        {phase.dossier.numeroDossier}
                        {phase.dateFin === null ? (
                          <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Actif
                          </span>
                        ) : (
                          <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            Terminé
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{phase.description}</p>
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                          <span className="text-xs">{phase.votesStats.FAVORABLE}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
                          <span className="text-xs">{phase.votesStats.DEFAVORABLE}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1"></span>
                          <span className="text-xs">{phase.votesStats.COMPLEMENT_REQUIS}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          ({phase.votesStats.total} votes)
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Détails des votes */}
        <div className="md:col-span-2">
          {selectedPhase ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Votes - {selectedPhase.dossier.numeroDossier}
                </h3>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
                    {selectedPhase.description}
                  </p>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Résultats actuels</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-600">Favorable</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {selectedPhase.votesStats.FAVORABLE}
                        </div>
                      </div>
                      <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-green-500 h-full rounded-full"
                          style={{ width: `${(selectedPhase.votesStats.FAVORABLE / selectedPhase.votesStats.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-600">Défavorable</span>
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                          {selectedPhase.votesStats.DEFAVORABLE}
                        </div>
                      </div>
                      <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-red-500 h-full rounded-full"
                          style={{ width: `${(selectedPhase.votesStats.DEFAVORABLE / selectedPhase.votesStats.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-600">Complément requis</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {selectedPhase.votesStats.COMPLEMENT_REQUIS}
                        </div>
                      </div>
                      <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-yellow-500 h-full rounded-full"
                          style={{ width: `${(selectedPhase.votesStats.COMPLEMENT_REQUIS / selectedPhase.votesStats.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">Détails des votes</h4>
                  
                  {phaseVoteDetails.length === 0 ? (
                    <p className="text-gray-500 italic">Aucun vote enregistré pour le moment</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {phaseVoteDetails.map(vote => (
                        <div
                          key={vote.id}
                          className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                            votesDetail?.id === vote.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                          }`}
                          onClick={() => handleVoteDetail(vote)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">
                                {vote.utilisateur.prenom} {vote.utilisateur.nom}
                              </p>
                              <p className="text-xs text-gray-500">
                                {vote.utilisateur.email}
                              </p>
                            </div>
                            <DecisionBadge decision={vote.decision} />
                          </div>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {vote.commentaire}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Le {new Date(vote.dateVote).toLocaleDateString()} à {new Date(vote.dateVote).toLocaleTimeString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Détail complet d'un vote */}
                {votesDetail && (
                  <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h5 className="font-medium">Détail du vote</h5>
                        <p className="text-sm">
                          {votesDetail.utilisateur.prenom} {votesDetail.utilisateur.nom} ({votesDetail.utilisateur.email})
                        </p>
                      </div>
                      <DecisionBadge decision={votesDetail.decision} />
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Commentaire</p>
                      <p className="text-gray-800 bg-white p-3 rounded-md">
                        {votesDetail.commentaire}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Vote effectué le {new Date(votesDetail.dateVote).toLocaleDateString()} à {new Date(votesDetail.dateVote).toLocaleTimeString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Sélectionnez une phase de vote</h3>
              <p className="mt-1 text-sm text-gray-500">
                Cliquez sur une phase dans la liste pour voir les détails des votes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Composant Badge pour les décisions
const DecisionBadge = ({ decision }) => {
  switch (decision) {
    case 'FAVORABLE':
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          Favorable
        </span>
      );
    case 'DEFAVORABLE':
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          Défavorable
        </span>
      );
    case 'COMPLEMENT_REQUIS':
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          Complément requis
        </span>
      );
    default:
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
          {decision}
        </span>
      );
  }
};