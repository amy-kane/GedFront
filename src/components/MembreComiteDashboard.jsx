// components/MembreComiteDashboard.jsx
'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MembreComiteDashboard = () => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [activePhase, setActivePhase] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [monVote, setMonVote] = useState(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [decision, setDecision] = useState('FAVORABLE');
  const [commentaireVote, setCommentaireVote] = useState('');
  const [stats, setStats] = useState({
    enAttente: 0,
    enCours: 0
  });

  // Configurez axios pour inclure le token dans chaque requête
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Déboguer le token
      try {
        const debugJwt = () => {
          // Diviser le token en trois parties
          const [header, payload, signature] = token.split('.');
          
          // Décoder le payload (seconde partie)
          const decodedPayload = JSON.parse(atob(payload));
          console.log('Token décodé:', decodedPayload);
          
          // Vérifier l'expiration
          const expTime = decodedPayload.exp * 1000; // Convertir en millisecondes
          const now = Date.now();
          
          if (now > expTime) {
            console.log('⚠️ ERREUR: Le token est expiré depuis', new Date(expTime).toLocaleString());
          } else {
            console.log('✅ Le token est valide jusqu\'au', new Date(expTime).toLocaleString());
          }
          
          // Vérifier le rôle
          if (decodedPayload.role === 'MEMBRE_COMITE') {
            console.log('✅ Le token a le rôle MEMBRE_COMITE');
          } else {
            console.log('⚠️ ERREUR: Le token a le rôle', decodedPayload.role, 'au lieu de MEMBRE_COMITE');
          }
        };
        
        debugJwt();
      } catch (e) {
        console.error('Erreur lors du décodage du token:', e);
      }
    }
    
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les statistiques
      await fetchStats();
      
      // Récupérer les dossiers à traiter
      await fetchDossiers();
      
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      setLoading(false);
    }
  };

  // Fonction pour récupérer les statistiques
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const completResponse = await axios.get('/api/dossiers', {
        params: { statut: 'COMPLET' },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const enCoursResponse = await axios.get('/api/dossiers', {
        params: { statut: 'EN_COURS' },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fonction pour extraire le nombre d'éléments
      const getCount = (response) => {
        if (response.data && typeof response.data === 'object') {
          if (typeof response.data.totalElements === 'number') {
            return response.data.totalElements;
          } else if (Array.isArray(response.data.content)) {
            return response.data.content.length;
          } else if (typeof response.data.numberOfElements === 'number') {
            return response.data.numberOfElements;
          }
        } else if (Array.isArray(response.data)) {
          return response.data.length;
        }
        return 0;
      };
      
      // Dédupliquer par ID avant de compter
      const extractDossiers = (response) => {
        let dossiers = [];
        if (response.data && Array.isArray(response.data)) {
          dossiers = response.data;
        } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
          dossiers = response.data.content;
        }
        
        // Déduplique les dossiers par ID
        const uniqueDossiers = Array.from(
          new Map(dossiers.map(dossier => [dossier.id, dossier])).values()
        );
        
        return uniqueDossiers;
      };
      
      const completDossiers = extractDossiers(completResponse);
      const enCoursDossiers = extractDossiers(enCoursResponse);
      
      // Mettre à jour les stats
      setStats({
        enAttente: completDossiers.length,
        enCours: enCoursDossiers.length
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }
  };

  const fetchDossiers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Récupérer les dossiers COMPLET
      const completResponse = await axios.get('/api/dossiers', {
        params: { statut: 'COMPLET' },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Récupérer les dossiers EN_COURS
      const enCoursResponse = await axios.get('/api/dossiers', {
        params: { statut: 'EN_COURS' },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fonction pour extraire les dossiers
      const extractDossiers = (response) => {
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
          return response.data.content;
        }
        return [];
      };
      
      // Extraire tous les dossiers
      const completDossiers = extractDossiers(completResponse);
      const enCoursDossiers = extractDossiers(enCoursResponse);
      
      // Ajouter une propriété pour identifier le statut 
      const taggedCompletDossiers = completDossiers.map(d => ({ ...d, listType: 'COMPLET' }));
      const taggedEnCoursDossiers = enCoursDossiers.map(d => ({ ...d, listType: 'EN_COURS' }));
      
      // Fusionner les listes et dédupliquer par ID
      const allDossiers = [...taggedCompletDossiers, ...taggedEnCoursDossiers];
      
      // Utiliser un Map pour dédupliquer par ID
      const uniqueDossiersMap = new Map();
      allDossiers.forEach(dossier => {
        // On ne remplace un dossier existant que si le nouveau a un statut plus récent
        // (EN_COURS est considéré plus récent que COMPLET)
        if (!uniqueDossiersMap.has(dossier.id) || 
            (dossier.listType === 'EN_COURS' && uniqueDossiersMap.get(dossier.id).listType === 'COMPLET')) {
          uniqueDossiersMap.set(dossier.id, dossier);
        }
      });
      
      // Convertir le Map en tableau
      const uniqueDossiers = Array.from(uniqueDossiersMap.values());
      
      console.log("Nombre de dossiers après déduplication:", uniqueDossiers.length);
      setDossiers(uniqueDossiers);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des dossiers:", error);
      setLoading(false);
    }
  };

  const consulterDossier = async (dossierId) => {
    try {
      const dossierDetail = dossiers.find(d => d.id === dossierId);
      setSelectedDossier(dossierDetail);
      
      // Réinitialiser les données
      setDocuments([]);
      setActivePhase(null);
      setCommentaires([]);
      setMonVote(null);
      
      const token = localStorage.getItem('token');
      
      // Récupérer les documents du dossier
      const documentsResponse = await axios.get(`/api/documents/dossier/${dossierId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setDocuments(documentsResponse.data);
      
      // Récupérer les commentaires du dossier
      const commentairesResponse = await axios.get(`/api/commentaires/dossier/${dossierId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setCommentaires(commentairesResponse.data.content || commentairesResponse.data);
      
      // Récupérer la phase active si elle existe
      try {
        const activePhaseResponse = await axios.get(`/api/phases/dossier/${dossierId}/active`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setActivePhase(activePhaseResponse.data);
        
        // Si c'est une phase de vote, récupérer mon vote s'il existe
        if (activePhaseResponse.data && activePhaseResponse.data.type === 'VOTE') {
          try {
            const monVoteResponse = await axios.get(`/api/votes/phase/${activePhaseResponse.data.id}/mon-vote`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setMonVote(monVoteResponse.data);
          } catch (error) {
            // Pas de vote encore, c'est normal
            console.log("Pas encore de vote pour cette phase");
          }
        }
      } catch (error) {
        // Pas de phase active, c'est normal
        console.log("Pas de phase active pour ce dossier");
      }
    } catch (error) {
      console.error("Erreur lors de la consultation du dossier:", error);
      alert("Erreur lors de la consultation du dossier");
    }
  };

  const previsualiserDocument = async (documentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Session expirée. Veuillez vous reconnecter.");
        return;
      }
      
      const response = await axios.get(`/api/documents/${documentId}/preview`, {
        responseType: 'blob',
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Vérifier si la réponse est valide
      if (response.status !== 200) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      // Forcer le type MIME correct
      const fileBlob = new Blob([response.data], { type: 'application/pdf' });
      
      // Créer une URL pour le blob
      const url = window.URL.createObjectURL(fileBlob);
      
      // Ouvrir dans une nouvelle fenêtre
      window.open(url, '_blank');
    } catch (error) {
      console.error("Erreur lors de la prévisualisation du document:", error);
      
      if (error.response?.status === 403) {
        alert("Accès refusé. Vous n'avez pas les permissions nécessaires pour prévisualiser ce document.");
      } else {
        alert("Erreur lors de la prévisualisation du document: " + (error.response?.data?.message || error.message));
      }
    }
  };

  const ajouterCommentaire = async () => {
    try {
      if (!newComment.trim()) {
        alert("Veuillez saisir un commentaire");
        return;
      }
      
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`/api/commentaires`, null, {
        params: {
          dossierId: selectedDossier.id,
          contenu: newComment
        },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Ajouter le nouveau commentaire à la liste
      setCommentaires([...commentaires, response.data]);
      
      // Réinitialiser le champ de saisie
      setNewComment('');
      
      alert("Commentaire ajouté avec succès");
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error);
      alert("Erreur lors de l'ajout du commentaire: " + (error.response?.data?.message || error.message));
    }
  };

  const submitVote = async () => {
    try {
      if (!activePhase) {
        alert("Aucune phase active pour voter");
        return;
      }
      
      const token = localStorage.getItem('token');
      
      if (monVote) {
        // Modifier un vote existant
        await axios.put(`/api/votes/${monVote.id}`, null, {
          params: {
            decision,
            commentaire: commentaireVote
          },
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        alert("Vote modifié avec succès");
      } else {
        // Créer un nouveau vote
        await axios.post(`/api/votes`, null, {
          params: {
            phaseId: activePhase.id,
            decision,
            commentaire: commentaireVote
          },
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        alert("Vote enregistré avec succès");
      }
      
      // Fermer le modal et rafraîchir les données
      setShowVoteModal(false);
      setCommentaireVote('');
      
      // Récupérer le vote mis à jour
      if (activePhase.type === 'VOTE') {
        try {
          const monVoteResponse = await axios.get(`/api/votes/phase/${activePhase.id}/mon-vote`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          setMonVote(monVoteResponse.data);
        } catch (error) {
          console.error("Erreur lors de la récupération du vote:", error);
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du vote:", error);
      alert("Erreur lors de l'envoi du vote: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatCard 
          icon={<DocumentsIcon className="h-10 w-10 text-blue-500" />} 
          title="Dossiers en attente" 
          value={stats.enAttente.toString()}
          color="bg-blue-50"
        />
        <StatCard 
          icon={<DiscussionIcon className="h-10 w-10 text-purple-500" />} 
          title="Dossiers en cours d'évaluation" 
          value={stats.enCours.toString()}
          color="bg-purple-50"
        />
      </div>
      
      {/* Titre principal */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Dossiers à évaluer</h2>
      
      {/* Dossiers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numéro Dossier
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type de demande
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Déposant
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center">
                  Chargement des dossiers...
                </td>
              </tr>
            ) : dossiers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center">
                  Aucun dossier à évaluer
                </td>
              </tr>
            ) : (
              dossiers.map((dossier) => (
                <tr key={dossier.id} className={`hover:bg-gray-50 ${dossier.listType === 'EN_COURS' ? 'bg-purple-50' : ''}`}>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dossier.numeroDossier}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dossier.typeDemande?.libelle || "N/A"}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dossier.nomDeposant} {dossier.prenomDeposant}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(dossier.dateCreation).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <StatusBadge status={dossier.statut} />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => consulterDossier(dossier.id)}
                        title="Consulter"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Section détails du dossier sélectionné */}
      {selectedDossier && (
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Détails du dossier : {selectedDossier.numeroDossier}
            </h3>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedDossier(null)}
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Informations du dossier */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Déposant</p>
              <p className="font-medium">{selectedDossier.nomDeposant} {selectedDossier.prenomDeposant}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Type de demande</p>
              <p className="font-medium">{selectedDossier.typeDemande?.libelle || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Adresse</p>
              <p className="font-medium">{selectedDossier.adresseDeposant || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{selectedDossier.emailDeposant || "N/A"}</p>
            </div>
          </div>
          
          {/* Onglets pour naviguer entre documents, commentaires, votes */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button className="border-b-2 border-indigo-500 py-4 px-1 text-sm font-medium text-indigo-600">
                Aperçu
              </button>
            </nav>
          </div>
          
          {/* Phase active */}
          {activePhase && (
            <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-semibold text-gray-900">
                  Phase active : {activePhase.type === 'DISCUSSION' ? 'Discussion' : 'Vote'}
                </h4>
                {activePhase.type === 'VOTE' && (
                  <button 
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    onClick={() => {
                      setDecision(monVote?.decision || 'FAVORABLE');
                      setCommentaireVote(monVote?.commentaire || '');
                      setShowVoteModal(true);
                    }}
                  >
                    {monVote ? 'Modifier mon vote' : 'Voter'}
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 mb-2">{activePhase.description}</p>
              <p className="text-xs text-gray-500">
                Démarrée le {new Date(activePhase.dateDebut).toLocaleDateString()} à {new Date(activePhase.dateDebut).toLocaleTimeString()}
              </p>
              
              {/* Afficher mon vote si disponible */}
              {monVote && (
                <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                  <h5 className="text-sm font-medium mb-2">Mon vote</h5>
                  <div className="flex items-center space-x-2">
                    <DecisionBadge decision={monVote.decision} />
                    <span className="text-sm text-gray-600">{monVote.commentaire}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Documents du dossier */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">Documents du dossier</h4>
            
            {documents.length === 0 ? (
              <p className="text-gray-500">Aucun document dans ce dossier</p>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <li key={doc.document.id} className="py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{doc.document.nom}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800 p-1"
                          onClick={() => previsualiserDocument(doc.document.id)}
                          title="Prévisualiser"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-800 p-1"
                          onClick={() => {
                            const token = localStorage.getItem('token');
                            window.open(`/api/documents/${doc.document.id}/download?token=${token}`, '_blank');
                          }}
                          title="Télécharger"
                        >
                          <DownloadIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Commentaires */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">Commentaires</h4>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              {commentaires.length === 0 ? (
                <p className="text-gray-500">Aucun commentaire sur ce dossier</p>
              ) : (
                <ul className="space-y-4">
                  {commentaires.map((commentaire) => (
                    <li key={commentaire.id} className="bg-white p-3 rounded-md shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{commentaire.utilisateur?.prenom} {commentaire.utilisateur?.nom}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(commentaire.dateCreation).toLocaleDateString()} à {new Date(commentaire.dateCreation).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">{commentaire.contenu}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Formulaire d'ajout de commentaire */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h5 className="text-sm font-medium mb-2">Ajouter un commentaire</h5>
              <textarea 
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
                placeholder="Votre commentaire..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <div className="mt-2 flex justify-end">
                <button 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  onClick={ajouterCommentaire}
                >
                  Commenter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal pour voter */}
      {showVoteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {monVote ? 'Modifier mon vote' : 'Voter'}
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Votre décision</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    className={`p-2 rounded-md ${decision === 'FAVORABLE' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100 border border-gray-300'}`}
                    onClick={() => setDecision('FAVORABLE')}
                  >
                    <span className="block text-center text-sm font-medium mb-1">Favorable</span>
                    <CheckIcon className="h-5 w-5 mx-auto text-green-500" />
                  </button>
                  <button 
                    className={`p-2 rounded-md ${decision === 'DEFAVORABLE' ? 'bg-red-100 border-2 border-red-500' : 'bg-gray-100 border border-gray-300'}`}
                    onClick={() => setDecision('DEFAVORABLE')}
                  >
                    <span className="block text-center text-sm font-medium mb-1">Défavorable</span>
                    <XIcon className="h-5 w-5 mx-auto text-red-500" />
                  </button>
                  <button 
                    className={`p-2 rounded-md ${decision === 'COMPLEMENT_REQUIS' ? 'bg-yellow-100 border-2 border-yellow-500' : 'bg-gray-100 border border-gray-300'}`}
                    onClick={() => setDecision('COMPLEMENT_REQUIS')}
                    >
                    <span className="block text-center text-sm font-medium mb-1">Complément</span>
                    <InfoIcon className="h-5 w-5 mx-auto text-yellow-500" />
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Commentaire (facultatif)</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="Justifiez votre décision..."
                  value={commentaireVote}
                  onChange={(e) => setCommentaireVote(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowVoteModal(false)}
                >
                  Annuler
                </button>
                <button 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={submitVote}
                >
                  {monVote ? 'Modifier' : 'Voter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour afficher le badge de décision
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
      return null;
  }
};

// Composants graphiques
const StatCard = ({ icon, title, value, color }) => (
  <div className={`${color} rounded-xl shadow-sm overflow-hidden`}>
    <div className="p-5">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-5">
          <div className="text-gray-500 text-sm font-medium">{title}</div>
          <div className="mt-1 text-3xl font-semibold text-gray-900">{value}</div>
        </div>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  switch(status) {
    case 'COMPLET':
      return (
        <span className="flex items-center">
          <svg className="h-5 w-5 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-blue-600 font-semibold">COMPLET</span>
        </span>
      );
    case 'EN_COURS':
      return (
        <span className="flex items-center">
          <svg className="h-5 w-5 mr-1 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="text-purple-600 font-semibold">EN COURS</span>
        </span>
      );
    default:
      return (
        <span className="flex items-center">
          <svg className="h-5 w-5 mr-1 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-600 font-semibold">{status}</span>
        </span>
      );
  }
};

// Icônes
const DocumentsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const DiscussionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export default MembreComiteDashboard;