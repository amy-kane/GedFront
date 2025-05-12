// app/membre-comite/discussions/page.js
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function DiscussionsPage() {
  const [loading, setLoading] = useState(true);
  const [phasesDiscussion, setPhasesDiscussion] = useState([]);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [activeFilter, setActiveFilter] = useState('active'); // 'active', 'all', 'past'
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    fetchPhasesDiscussion();
  }, []);

  const fetchPhasesDiscussion = async () => {
    try {
      setLoading(true);
      
      // Dans un environnement réel, nous ferions un appel à une API dédiée
      // Cette API devrait retourner toutes les phases de discussion accessibles au membre du comité
      // Pour le moment, nous simulons des données
      
      // Exemple de structure pour les phases de discussion
      const mockPhases = [
        {
          id: 1,
          type: 'DISCUSSION',
          description: 'Discussion sur l\'impact environnemental du projet',
          dateDebut: new Date().toISOString(),
          dateFin: null, // Phase active
          dossier: {
            id: 105,
            numeroDossier: 'DOS-2024-105',
            typeDemande: { libelle: 'Autorisation environnementale' },
            nomDeposant: 'Green Energy',
            prenomDeposant: '',
            dateCreation: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          },
          commentairesCount: 12
        },
        {
          id: 2,
          type: 'DISCUSSION',
          description: 'Évaluation technique du dossier de rénovation',
          dateDebut: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          dateFin: null, // Phase active
          dossier: {
            id: 106,
            numeroDossier: 'DOS-2024-106',
            typeDemande: { libelle: 'Autorisation de travaux' },
            nomDeposant: 'Martin',
            prenomDeposant: 'Sophie',
            dateCreation: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          },
          commentairesCount: 8
        },
        {
          id: 3,
          type: 'DISCUSSION',
          description: 'Discussion préliminaire sur les aspects architecturaux',
          dateDebut: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          dateFin: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // Phase terminée
          dossier: {
            id: 107,
            numeroDossier: 'DOS-2024-107',
            typeDemande: { libelle: 'Permis de construire' },
            nomDeposant: 'Dubois',
            prenomDeposant: 'Jean',
            dateCreation: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString()
          },
          commentairesCount: 15
        }
      ];
      
      setPhasesDiscussion(mockPhases);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des phases de discussion:", error);
      setLoading(false);
    }
  };

  const handlePhaseSelect = async (phase) => {
    setSelectedPhase(phase);
    await fetchCommentaires(phase.id);
  };

  const fetchCommentaires = async (phaseId) => {
    try {
      setCommentaires([]);
      
      // Dans un environnement réel, nous ferions un appel API pour récupérer les commentaires
      // const response = await axios.get(`/api/phases/${phaseId}/commentaires`);
      
      // Simulation des commentaires
      const mockCommentaires = [
        {
          id: 101,
          contenu: "L'étude d'impact environnemental semble incomplète sur le volet biodiversité. Il faudrait demander un inventaire plus exhaustif des espèces présentes sur le site.",
          dateCreation: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
          utilisateur: {
            id: 201,
            nom: "Dupont",
            prenom: "Marie",
            role: "MEMBRE_COMITE"
          }
        },
        {
          id: 102,
          contenu: "Je suis d'accord avec Marie. De plus, l'étude hydraulique devrait être approfondie compte tenu de la proximité avec la zone humide identifiée.",
          dateCreation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          utilisateur: {
            id: 202,
            nom: "Martin",
            prenom: "Paul",
            role: "MEMBRE_COMITE"
          }
        },
        {
          id: 103,
          contenu: "Les mesures compensatoires proposées semblent appropriées, mais je m'interroge sur leur pérennité et leur suivi dans le temps.",
          dateCreation: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
          utilisateur: {
            id: 203,
            nom: "Lefebvre",
            prenom: "Thomas",
            role: "MEMBRE_COMITE"
          }
        },
        {
          id: 104,
          contenu: "Après vérification des normes en vigueur, le projet respecte bien les seuils d'émission définis par la réglementation.",
          dateCreation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          utilisateur: {
            id: 204,
            nom: "Dubois",
            prenom: "Sophie",
            role: "COORDINATEUR"
          }
        },
        {
          id: 105,
          contenu: "J'ai consulté l'avis de l'autorité environnementale et leurs recommandations semblent avoir été partiellement prises en compte. Nous devrions demander des précisions sur les points restants.",
          dateCreation: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
          utilisateur: {
            id: 205,
            nom: "Moreau",
            prenom: "Julie",
            role: "MEMBRE_COMITE"
          }
        }
      ];
      
      // Tri des commentaires par date (plus récents en dernier)
      mockCommentaires.sort((a, b) => new Date(a.dateCreation) - new Date(b.dateCreation));
      
      setCommentaires(mockCommentaires);
    } catch (error) {
      console.error("Erreur lors de la récupération des commentaires:", error);
    }
  };

  const submitComment = async () => {
    try {
      if (!newComment.trim()) {
        alert("Veuillez saisir un commentaire");
        return;
      }
      
      // Dans un environnement réel, nous ferions un appel API pour ajouter le commentaire
      // const response = await axios.post('/api/commentaires', {
      //   phaseId: selectedPhase.id,
      //   contenu: newComment
      // });
      
      // Simulation d'un nouveau commentaire
      const nouveauCommentaire = {
        id: Math.floor(Math.random() * 1000) + 200,
        contenu: newComment,
        dateCreation: new Date().toISOString(),
        utilisateur: {
          id: 301,
          nom: "Utilisateur",
          prenom: "Actuel",
          role: "MEMBRE_COMITE"
        }
      };
      
      // Ajouter le commentaire à la liste
      setCommentaires([...commentaires, nouveauCommentaire]);
      
      // Mettre à jour le compteur de commentaires dans la phase
      const updatedPhases = phasesDiscussion.map(phase => {
        if (phase.id === selectedPhase.id) {
          return { ...phase, commentairesCount: phase.commentairesCount + 1 };
        }
        return phase;
      });
      
      setPhasesDiscussion(updatedPhases);
      setSelectedPhase(prevPhase => ({ ...prevPhase, commentairesCount: prevPhase.commentairesCount + 1 }));
      
      // Réinitialiser le champ de saisie
      setNewComment('');
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
    }
  };

  // Filtrer les phases selon le filtre actif
  const filteredPhases = phasesDiscussion.filter(phase => {
    if (activeFilter === 'active') return phase.dateFin === null;
    if (activeFilter === 'past') return phase.dateFin !== null;
    return true; // 'all'
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Discussions</h1>
      
      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex items-center space-x-4">
          <label className="font-medium text-gray-700">Afficher:</label>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded-md ${
                activeFilter === 'active' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('active')}
            >
              Discussions actives
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                activeFilter === 'past' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('past')}
            >
              Discussions passées
            </button>
            <button
              className={`px-3 py-1 rounded-md ${
                activeFilter === 'all' 
                  ? 'bg-blue-100 text-blue-700 font-medium' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              Toutes
            </button>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Liste des phases de discussion */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
              <h2 className="font-semibold text-blue-800">Phases de discussion</h2>
            </div>
            
            {loading ? (
              <div className="p-4 text-center">Chargement...</div>
            ) : filteredPhases.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucune phase de discussion trouvée</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredPhases.map(phase => (
                  <li 
                    key={phase.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${selectedPhase?.id === phase.id ? 'bg-blue-50' : ''}`}
                    onClick={() => handlePhaseSelect(phase)}
                  >
                    <div>
                      <p className="font-medium text-gray-900 flex items-center">
                        {phase.dossier.numeroDossier}
                        {phase.dateFin === null ? (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            Terminée
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 truncate">{phase.description}</p>
                      <p className="text-xs text-gray-500">
                        {phase.dateFin ? 
                          `Du ${new Date(phase.dateDebut).toLocaleDateString()} au ${new Date(phase.dateFin).toLocaleDateString()}` : 
                          `Depuis le ${new Date(phase.dateDebut).toLocaleDateString()}`
                        }
                      </p>
                      <div className="mt-1 flex items-center">
                        <CommentIcon className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-500">{phase.commentairesCount} commentaires</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Section de discussion */}
        <div className="md:col-span-2">
          {selectedPhase ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Discussion - Dossier {selectedPhase.dossier.numeroDossier}
                </h3>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
                    {selectedPhase.description}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Type de demande</p>
                    <p className="font-medium">{selectedPhase.dossier.typeDemande.libelle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Déposant</p>
                    <p className="font-medium">{selectedPhase.dossier.nomDeposant} {selectedPhase.dossier.prenomDeposant}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date de début</p>
                    <p className="font-medium">{new Date(selectedPhase.dateDebut).toLocaleDateString()}</p>
                  </div>
                  {selectedPhase.dateFin && (
                    <div>
                      <p className="text-sm text-gray-600">Date de fin</p>
                      <p className="font-medium">{new Date(selectedPhase.dateFin).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                
                {/* Fil de discussion */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Commentaires</h4>
                  
                  {commentaires.length === 0 ? (
                    <div className="text-center text-gray-500 py-6">
                      Aucun commentaire pour le moment. Soyez le premier à participer à la discussion !
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {commentaires.map(comment => (
                        <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900">
                                {comment.utilisateur.prenom} {comment.utilisateur.nom}
                                {comment.utilisateur.role === 'COORDINATEUR' && (
                                  <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                                    Coordinateur
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(comment.dateCreation).toLocaleDateString()} à {new Date(comment.dateCreation).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <p className="mt-2 text-gray-700">{comment.contenu}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Formulaire de commentaire pour les phases actives */}
                {selectedPhase.dateFin === null && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Ajouter un commentaire</h5>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Votre commentaire..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    ></textarea>
                    <div className="mt-2 flex justify-end">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={submitComment}
                      >
                        Commenter
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Bouton pour accéder au dossier complet */}
                <div className="mt-6 flex justify-end">
                  <button
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    onClick={() => {
                      // Dans un environnement réel, nous redirigerions vers la page du dossier
                      alert("Redirection vers le dossier " + selectedPhase.dossier.numeroDossier);
                    }}
                  >
                    Voir le dossier complet
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">Sélectionnez une discussion</h3>
              <p className="mt-1 text-sm text-gray-500">
                Cliquez sur une phase de discussion dans la liste pour voir les commentaires et participer
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icônes
const CommentIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
  </svg>
);