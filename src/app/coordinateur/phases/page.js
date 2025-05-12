// app/coordinateur/phases/page.js
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function PhasesPage() {
  const [loading, setLoading] = useState(true);
  const [activePhases, setActivePhases] = useState([]);
  const [completedPhases, setCompletedPhases] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [phasesFilter, setPhasesFilter] = useState('all'); // 'all', 'discussion', 'vote'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest'
  const [showProlongerModal, setShowProlongerModal] = useState(false);
  const [prolongationJours, setProlongationJours] = useState(7);
  const [showTerminerModal, setShowTerminerModal] = useState(false);
  const [votesData, setVotesData] = useState(null);
  const [showVotesModal, setShowVotesModal] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    fetchAllPhases();
  }, []);

  const fetchAllPhases = async () => {
    try {
      setLoading(true);
      
      // Dans un vrai scénario, on ferait appel à une API qui récupère toutes les phases
      // Pour le moment, on simule avec une liste statique
      
      // Exemple d'appel API qui pourrait être implémenté
      // const response = await axios.get('/api/phases');
      
      // Données simulées
      const mockActivePhases = [
        {
          id: 1,
          type: 'DISCUSSION',
          description: 'Discussion sur le dossier de construction',
          dateDebut: new Date().toISOString(),
          dateFin: null,
          dossier: {
            id: 101,
            numeroDossier: 'DOS-2024-101',
            nomDeposant: 'Martin',
            prenomDeposant: 'Pierre'
          }
        },
        {
          id: 2,
          type: 'VOTE',
          description: 'Vote sur la demande de permis',
          dateDebut: new Date().toISOString(),
          dateFin: null,
          dossier: {
            id: 102,
            numeroDossier: 'DOS-2024-102',
            nomDeposant: 'Dupont',
            prenomDeposant: 'Marie'
          }
        }
      ];
      
      const mockCompletedPhases = [
        {
          id: 3,
          type: 'DISCUSSION',
          description: 'Discussion préliminaire sur le projet',
          dateDebut: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          dateFin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          dossier: {
            id: 103,
            numeroDossier: 'DOS-2024-103',
            nomDeposant: 'Dubois',
            prenomDeposant: 'Jean'
          }
        },
        {
          id: 4,
          type: 'VOTE',
          description: 'Vote final sur le projet de rénovation',
          dateDebut: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          dateFin: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          dossier: {
            id: 104,
            numeroDossier: 'DOS-2024-104',
            nomDeposant: 'Leroy',
            prenomDeposant: 'Sophie'
          }
        }
      ];
      
      setActivePhases(mockActivePhases);
      setCompletedPhases(mockCompletedPhases);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des phases:", error);
      setLoading(false);
    }
  };
  
  const filteredActivePhases = activePhases.filter(phase => {
    if (phasesFilter === 'all') return true;
    return phase.type.toLowerCase() === phasesFilter;
  });
  
  const filteredCompletedPhases = completedPhases.filter(phase => {
    if (phasesFilter === 'all') return true;
    return phase.type.toLowerCase() === phasesFilter;
  }).sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.dateFin) - new Date(a.dateFin);
    } else {
      return new Date(a.dateFin) - new Date(b.dateFin);
    }
  });
  
  const handlePhaseClick = (phase) => {
    setSelectedPhase(phase);
  };
  
  const handleProlongerPhase = async () => {
    try {
      if (!prolongationJours || prolongationJours <= 0) {
        alert("Veuillez spécifier un nombre de jours valide");
        return;
      }
      
      // En production, appeler l'API pour prolonger la phase
      // await axios.put(`/api/phases/${selectedPhase.id}/prolonger?joursSupplementaires=${prolongationJours}`);
      
      alert(`Phase prolongée de ${prolongationJours} jours`);
      setShowProlongerModal(false);
      setProlongationJours(7);
      
      // Rafraîchir les données
      fetchAllPhases();
    } catch (error) {
      console.error("Erreur lors de la prolongation de la phase:", error);
      alert("Erreur lors de la prolongation de la phase");
    }
  };
  
  const handleTerminerPhase = async () => {
    try {
      // En production, appeler l'API pour terminer la phase
      // await axios.put(`/api/phases/${selectedPhase.id}/terminer`);
      
      alert("Phase terminée");
      setShowTerminerModal(false);
      
      // Rafraîchir les données
      fetchAllPhases();
    } catch (error) {
      console.error("Erreur lors de la terminaison de la phase:", error);
      alert("Erreur lors de la terminaison de la phase");
    }
  };
  
  const handleViewVotes = async (phaseId) => {
    try {
      // En production, appeler l'API pour récupérer les résultats du vote
      // const response = await axios.get(`/api/phases/${phaseId}/resultats`);
      // setVotesData(response.data);
      
      // Données simulées
      setVotesData({
        FAVORABLE: 3,
        DEFAVORABLE: 1,
        COMPLEMENT_REQUIS: 2
      });
      
      setShowVotesModal(true);
    } catch (error) {
      console.error("Erreur lors de la récupération des résultats du vote:", error);
      alert("Erreur lors de la récupération des résultats du vote");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion des phases</h1>
      
      {/* Filtres et tri */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <label className="font-medium text-gray-700">Type de phase:</label>
            <select 
              className="border border-gray-300 rounded px-3 py-1"
              value={phasesFilter}
              onChange={(e) => setPhasesFilter(e.target.value)}
            >
              <option value="all">Toutes</option>
              <option value="discussion">Discussion</option>
              <option value="vote">Vote</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="font-medium text-gray-700">Tri:</label>
            <select 
              className="border border-gray-300 rounded px-3 py-1"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Plus récentes</option>
              <option value="oldest">Plus anciennes</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liste des phases */}
        <div className="md:col-span-1">
          {/* Phases actives */}
          <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
            <div className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
              <h2 className="font-semibold text-indigo-800">Phases actives</h2>
            </div>
            
            {loading ? (
              <div className="p-4 text-center">Chargement...</div>
            ) : filteredActivePhases.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucune phase active</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredActivePhases.map(phase => (
                  <li 
                    key={phase.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedPhase?.id === phase.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => handlePhaseClick(phase)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {phase.type === 'DISCUSSION' ? 'Discussion' : 'Vote'}
                        <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 truncate">{phase.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Dossier: {phase.dossier.numeroDossier}
                      </p>
                      <p className="text-xs text-gray-500">
                        Démarrée le {new Date(phase.dateDebut).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Phases terminées */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h2 className="font-semibold text-gray-700">Phases terminées</h2>
            </div>
            
            {loading ? (
              <div className="p-4 text-center">Chargement...</div>
            ) : filteredCompletedPhases.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucune phase terminée</div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredCompletedPhases.map(phase => (
                  <li 
                    key={phase.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedPhase?.id === phase.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => handlePhaseClick(phase)}
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {phase.type === 'DISCUSSION' ? 'Discussion' : 'Vote'}
                        <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          Terminée
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 truncate">{phase.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Dossier: {phase.dossier.numeroDossier}
                      </p>
                      <p className="text-xs text-gray-500">
                        Du {new Date(phase.dateDebut).toLocaleDateString()} au {new Date(phase.dateFin).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Détails de la phase */}
        <div className="md:col-span-2">
          {selectedPhase ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Phase de {selectedPhase.type === 'DISCUSSION' ? 'discussion' : 'vote'}
                </h3>
                <div className="flex space-x-2">
                  {!selectedPhase.dateFin && (
                    <>
                      <button 
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        onClick={() => {
                          setProlongationJours(7);
                          setShowProlongerModal(true);
                        }}
                      >
                        Prolonger
                      </button>
                      <button 
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        onClick={() => setShowTerminerModal(true)}
                      >
                        Terminer
                      </button>
                    </>
                  )}
                  {selectedPhase.type === 'VOTE' && (
                    <button 
                      className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                      onClick={() => handleViewVotes(selectedPhase.id)}
                    >
                      Voir résultats
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Dossier</p>
                    <p className="font-medium">{selectedPhase.dossier.numeroDossier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Déposant</p>
                    <p className="font-medium">{selectedPhase.dossier.nomDeposant} {selectedPhase.dossier.prenomDeposant}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de début</p>
                    <p className="font-medium">{new Date(selectedPhase.dateDebut).toLocaleDateString()} à {new Date(selectedPhase.dateDebut).toLocaleTimeString()}</p>
                  </div>
                  {selectedPhase.dateFin && (
                    <div>
                      <p className="text-sm text-gray-600">Date de fin</p>
                      <p className="font-medium">{new Date(selectedPhase.dateFin).toLocaleDateString()} à {new Date(selectedPhase.dateFin).toLocaleTimeString()}</p>
                    </div>
                  )}
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
                    {selectedPhase.description}
                  </p>
                </div>
                
                {/* Ici on pourrait ajouter d'autres éléments spécifiques à la phase */}
                {/* Par exemple, la liste des votes si c'est une phase de vote */}
                {/* Ou la liste des commentaires si c'est une phase de discussion */}
                
                <div className="flex justify-end mt-6">
                  <button 
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    onClick={() => setSelectedPhase(null)}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Sélectionnez une phase</h3>
              <p className="mt-1 text-sm text-gray-500">
                Cliquez sur une phase dans la liste pour voir ses détails et la gérer
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal pour prolonger une phase */}
      {showProlongerModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Prolonger la phase</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Jours supplémentaires</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Nombre de jours"
                  min="1"
                  value={prolongationJours}
                  onChange={(e) => setProlongationJours(parseInt(e.target.value))}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowProlongerModal(false)}
                >
                  Annuler
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={handleProlongerPhase}
                >
                  Prolonger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal pour terminer une phase */}
      {showTerminerModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Terminer la phase</h3>
            </div>
            <div className="p-6">
              <p className="mb-4 text-gray-600">
                Êtes-vous sûr de vouloir terminer cette phase ? Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowTerminerModal(false)}
                >
                  Annuler
                </button>
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  onClick={handleTerminerPhase}
                >
                  Terminer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal pour voir les résultats de vote */}
      {showVotesModal && votesData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Résultats du vote</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-green-600">{votesData.FAVORABLE || 0}</span>
                  <span className="text-sm text-gray-600">Favorable</span>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-red-600">{votesData.DEFAVORABLE || 0}</span>
                  <span className="text-sm text-gray-600">Défavorable</span>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-yellow-600">{votesData.COMPLEMENT_REQUIS || 0}</span>
                  <span className="text-sm text-gray-600">Complément requis</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={() => setShowVotesModal(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}