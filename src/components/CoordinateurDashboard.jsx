// components/CoordinateurDashboard.jsx
'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CoordinateurDashboard = () => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [activePhase, setActivePhase] = useState(null);
  const [phases, setPhases] = useState([]);
  const [stats, setStats] = useState({
    complet: 0,
    enCours: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDossiers, setFilteredDossiers] = useState([]);
  const [phaseDescription, setPhaseDescription] = useState('');
  const [phaseType, setPhaseType] = useState('DISCUSSION');
  const [showNewPhaseModal, setShowNewPhaseModal] = useState(false);
  const [showTerminerPhaseModal, setShowTerminerPhaseModal] = useState(false);
  const [prolongationJours, setProlongationJours] = useState(7);
  const [showProlongerPhaseModal, setShowProlongerPhaseModal] = useState(false);
  const [resultatsVote, setResultatsVote] = useState(null);
  const [notification, setNotification] = useState(null);

  // Fonction pour afficher une notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fonction pour calculer les stats à partir des dossiers filtrés
  const calculateStats = (dossiers) => {
    const completCount = dossiers.filter(d => d.statut === 'COMPLET').length;
    const enCoursCount = dossiers.filter(d => d.statut === 'EN_COURS').length;
    
    setStats({
      complet: completCount,
      enCours: enCoursCount
    });
    
    console.log("=== STATS CALCULÉES ===");
    console.log("COMPLET:", completCount);
    console.log("EN_COURS:", enCoursCount);
  };

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
          if (decodedPayload.role === 'COORDINATEUR') {
            console.log('✅ Le token a le rôle COORDINATEUR');
          } else {
            console.log('⚠️ ERREUR: Le token a le rôle', decodedPayload.role, 'au lieu de COORDINATEUR');
          }
        };
        
        debugJwt();
      } catch (e) {
        console.error('Erreur lors du décodage du token:', e);
      }
    }
    
    fetchAllData();
  }, []);

  // Effet pour filtrer les dossiers selon le terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDossiers(dossiers);
    } else {
      const filtered = dossiers.filter(dossier => 
        dossier.numeroDossier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dossier.nomDeposant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dossier.prenomDeposant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dossier.typeDemande?.libelle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDossiers(filtered);
    }
  }, [searchTerm, dossiers]);

  // Nouvelle fonction qui coordonne toutes les requêtes
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      
      // Récupérer les dossiers COMPLET et EN_COURS pour le coordinateur
      const completResponse = await axios.get('/api/dossiers', {
        params: { statut: 'COMPLET' },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const enCoursResponse = await axios.get('/api/dossiers', {
        params: { statut: 'EN_COURS' },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Extraire les données selon la structure de la réponse
      const extractDossiers = (response) => {
        if (response.data && typeof response.data === 'object') {
          if (Array.isArray(response.data.content)) {
            return response.data.content;
          } else if (Array.isArray(response.data)) {
            return response.data;
          }
        }
        return [];
      };
      
      // Extraire les dossiers des réponses
      const completDossiers = extractDossiers(completResponse);
      const enCoursDossiers = extractDossiers(enCoursResponse);
      
      // Ajouter une propriété pour identifier visuellement les dossiers
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
      
      // Convertir le Map en tableau et filtrer pour ne garder que COMPLET et EN_COURS
      const uniqueDossiers = Array.from(uniqueDossiersMap.values())
        .filter(dossier => ['COMPLET', 'EN_COURS'].includes(dossier.statut));
      
      console.log("Nombre de dossiers après déduplication et filtrage:", uniqueDossiers.length);
      console.log("Dossiers filtrés:", uniqueDossiers.map(d => ({ id: d.id, numero: d.numeroDossier, statut: d.statut })));
      
      // Mettre à jour les dossiers et calculer les stats
      setDossiers(uniqueDossiers);
      setFilteredDossiers(uniqueDossiers);
      calculateStats(uniqueDossiers);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      setLoading(false);
    }
  };

  // Récupérer les dossiers du coordinateur
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
        return Array.isArray(response.data) 
          ? response.data 
          : (response.data.content || []);
      };
      
      // Combiner les dossiers
      const completDossiers = extractDossiers(completResponse);
      const enCoursDossiers = extractDossiers(enCoursResponse);
      
      // Ajouter une propriété pour identifier visuellement les dossiers et filtrer
      const allDossiers = [
        ...completDossiers.map(d => ({ ...d, listType: 'COMPLET' })),
        ...enCoursDossiers.map(d => ({ ...d, listType: 'EN_COURS' }))
      ].filter(dossier => ['COMPLET', 'EN_COURS'].includes(dossier.statut));
      
      console.log("Dossiers filtrés (fetchDossiers):", allDossiers.map(d => ({ numero: d.numeroDossier, statut: d.statut })));
      
      setDossiers(allDossiers);
      setFilteredDossiers(allDossiers);
      calculateStats(allDossiers);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des dossiers:", error);
      setLoading(false);
    }
  };

  // Consulter un dossier
  const consulterDossier = async (dossierId) => {
    try {
      const dossierDetail = dossiers.find(d => d.id === dossierId);
      setSelectedDossier(dossierDetail);
      
      // Réinitialiser les données
      setDocuments([]);
      setActivePhase(null);
      setPhases([]);
      setResultatsVote(null);
      
      const token = localStorage.getItem('token');
      
      // Récupérer les documents du dossier
      const documentsResponse = await axios.get(`/api/documents/dossier/${dossierId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setDocuments(documentsResponse.data);
      
      // Récupérer les phases du dossier
      try {
        const phasesResponse = await axios.get(`/api/phases/dossier/${dossierId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setPhases(phasesResponse.data);
        
        // Récupérer la phase active si elle existe
        try {
          const activePhaseResponse = await axios.get(`/api/phases/dossier/${dossierId}/active`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          setActivePhase(activePhaseResponse.data);
          
          // Si c'est une phase de vote, récupérer les résultats
          if (activePhaseResponse.data && activePhaseResponse.data.type === 'VOTE') {
            try {
              const resultatsResponse = await axios.get(`/api/phases/${activePhaseResponse.data.id}/resultats`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              setResultatsVote(resultatsResponse.data);
            } catch (error) {
              console.error("Erreur lors de la récupération des résultats du vote:", error);
            }
          }
        } catch (error) {
          // Pas de phase active, c'est normal
          console.log("Pas de phase active pour ce dossier");
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des phases:", error);
      }
    } catch (error) {
      console.error("Erreur lors de la consultation du dossier:", error);
      showNotification("Erreur lors de la consultation du dossier", 'error');
    }
  };

  // Prévisualiser un document
  const previsualiserDocument = async (documentId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification("Session expirée. Veuillez vous reconnecter.", 'error');
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
        showNotification("Accès refusé. Vous n'avez pas les permissions nécessaires pour prévisualiser ce document.", 'error');
      } else {
        showNotification("Erreur lors de la prévisualisation du document: " + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  // Fonction pour initier une nouvelle phase
  const initierPhase = async () => {
    try {
      if (!phaseDescription.trim()) {
        showNotification("Veuillez fournir une description pour la phase", 'error');
        return;
      }
      
      const token = localStorage.getItem('token');
      const endpoint = phaseType === 'DISCUSSION' ? 'discussion' : 'vote';
      
      const response = await axios.post(`/api/phases/${endpoint}`, null, {
        params: {
          dossierId: selectedDossier.id,
          description: phaseDescription
        },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fermer le modal et rafraîchir les données
      setShowNewPhaseModal(false);
      setPhaseDescription('');
      showNotification(`Phase de ${phaseType.toLowerCase()} initiée avec succès`, 'success');
      
      // Rafraîchir les données du dossier
      consulterDossier(selectedDossier.id);
      
      // Rafraîchir la liste des dossiers car le statut a changé
      fetchAllData();
    } catch (error) {
      console.error("Erreur lors de l'initiation de la phase:", error);
      showNotification("Erreur lors de l'initiation de la phase: " + (error.response?.data?.message || error.message), 'error');
    }
  };

  // Fonction pour terminer une phase
  const terminerPhase = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`/api/phases/${activePhase.id}/terminer`, null, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fermer le modal et rafraîchir les données
      setShowTerminerPhaseModal(false);
      showNotification("Phase terminée avec succès", 'success');
      
      // Rafraîchir les données du dossier
      consulterDossier(selectedDossier.id);
    } catch (error) {
      console.error("Erreur lors de la terminaison de la phase:", error);
      showNotification("Erreur lors de la terminaison de la phase: " + (error.response?.data?.message || error.message), 'error');
    }
  };

  // Fonction pour prolonger une phase
  const prolongerPhase = async () => {
    try {
      if (!prolongationJours || prolongationJours <= 0) {
        showNotification("Veuillez spécifier un nombre de jours valide", 'error');
        return;
      }
      
      const token = localStorage.getItem('token');
      
      await axios.put(`/api/phases/${activePhase.id}/prolonger`, null, {
        params: {
          joursSupplementaires: prolongationJours
        },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fermer le modal et rafraîchir les données
      setShowProlongerPhaseModal(false);
      setProlongationJours(7);
      showNotification(`Phase prolongée de ${prolongationJours} jours`, 'success');
      
      // Rafraîchir les données du dossier
      consulterDossier(selectedDossier.id);
    } catch (error) {
      console.error("Erreur lors de la prolongation de la phase:", error);
      showNotification("Erreur lors de la prolongation de la phase: " + (error.response?.data?.message || error.message), 'error');
    }
  };

  return (
    <div className="p-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[9999] max-w-md w-full bg-white rounded-lg shadow-lg border-l-4 ${
          notification.type === 'success' ? 'border-green-500' : 
          notification.type === 'error' ? 'border-red-500' : 
          notification.type === 'info' ? 'border-blue-500' : 'border-yellow-500'
        } p-4 transform transition-all duration-300 ease-in-out`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === 'success' && (
                <CheckIcon className="h-5 w-5 text-green-400" />
              )}
              {notification.type === 'error' && (
                <XCircleIcon className="h-5 w-5 text-red-400" />
              )}
              {notification.type === 'info' && (
                <InfoIcon className="h-5 w-5 text-blue-400" />
              )}
              {notification.type === 'warning' && (
                <ExclamationIcon className="h-5 w-5 text-yellow-400" />
              )}
            </div>
            <div className="ml-3 w-0 flex-1 pt-0.5">
              <p className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' : 
                notification.type === 'error' ? 'text-red-800' : 
                notification.type === 'info' ? 'text-blue-800' : 'text-yellow-800'
              }`}>
                {notification.message}
              </p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                className={`inline-flex rounded-md text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  notification.type === 'success' ? 'focus:ring-green-500' : 
                  notification.type === 'error' ? 'focus:ring-red-500' : 
                  notification.type === 'info' ? 'focus:ring-blue-500' : 'focus:ring-yellow-500'
                }`}
                onClick={() => setNotification(null)}
              >
                <span className="sr-only">Fermer</span>
                <XIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards - Seulement COMPLET et EN_COURS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatCard 
          icon={<DocumentsIcon className="h-10 w-10 text-blue-500" />} 
          title="Dossiers complets" 
          value={stats.complet.toString()}
          color="bg-blue-50"
        />
        <StatCard 
          icon={<DiscussionIcon className="h-10 w-10 text-purple-500" />} 
          title="Dossiers en cours" 
          value={stats.enCours.toString()}
          color="bg-purple-50"
        />
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Rechercher un dossier..." 
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
      
      {/* Titre principal */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Dossiers à traiter</h2>
      
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
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    Chargement des dossiers...
                  </div>
                </td>
              </tr>
            ) : filteredDossiers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center">
                  {searchTerm ? 'Aucun dossier trouvé pour cette recherche' : 'Aucun dossier à traiter'}
                </td>
              </tr>
            ) : (
              filteredDossiers.map((dossier) => (
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
                    {new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}
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
                      {dossier.statut === 'COMPLET' && (
                        <button 
                          className="text-purple-600 hover:text-purple-800"
                          onClick={() => {
                            setSelectedDossier(dossier);
                            setShowNewPhaseModal(true);
                          }}
                          title="Initier une phase"
                        >
                          <PlayIcon className="h-5 w-5" />
                        </button>
                      )}
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
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Détails du dossier : {selectedDossier.numeroDossier}
            </h3>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedDossier(null)}
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
          
          {/* Informations du dossier avec style amélioré */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-1">Déposant</p>
              <p className="text-lg font-bold text-gray-900">{selectedDossier.nomDeposant} {selectedDossier.prenomDeposant}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-1">Type de demande</p>
              <p className="text-lg font-bold text-gray-900">{selectedDossier.typeDemande?.libelle || "N/A"}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-1">Adresse</p>
              <p className="text-lg font-bold text-gray-900">{selectedDossier.adresseDeposant || "N/A"}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-1">Email</p>
              <p className="text-lg font-bold text-blue-600 break-all">{selectedDossier.emailDeposant || "N/A"}</p>
            </div>
          </div>
          
          {/* Onglets pour naviguer entre documents, phases, etc. */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button className="border-b-2 border-indigo-500 py-4 px-1 text-sm font-medium text-indigo-600">
                Aperçu
              </button>
            </nav>
          </div>
          
          {/* Phase active */}
          {activePhase ? (
            <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-semibold text-gray-900">
                  Phase active : {activePhase.type === 'DISCUSSION' ? 'Discussion' : 'Vote'}
                </h4>
                <div className="flex space-x-2">
                  <button 
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    onClick={() => setShowProlongerPhaseModal(true)}
                  >
                    Prolonger
                  </button>
                  <button 
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    onClick={() => setShowTerminerPhaseModal(true)}
                  >
                    Terminer
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">{activePhase.description}</p>
              <p className="text-xs text-gray-500">
                Démarrée le {new Date(activePhase.dateDebut).toLocaleDateString('fr-FR')} à {new Date(activePhase.dateDebut).toLocaleTimeString()}
              </p>
              
              {/* Afficher les résultats du vote si c'est une phase de vote */}
              {activePhase.type === 'VOTE' && resultatsVote && (
                <div className="mt-4 p-3 bg-white rounded border border-gray-200">
                  <h5 className="text-sm font-medium mb-2">Résultats actuels</h5>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-50 p-2 rounded">
                      <span className="block text-green-600 font-bold text-lg">{resultatsVote.FAVORABLE || 0}</span>
                      <span className="text-xs text-gray-600">Favorable</span>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <span className="block text-red-600 font-bold text-lg">{resultatsVote.DEFAVORABLE || 0}</span>
                      <span className="text-xs text-gray-600">Défavorable</span>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded">
                      <span className="block text-yellow-600 font-bold text-lg">{resultatsVote.COMPLEMENT_REQUIS || 0}</span>
                      <span className="text-xs text-gray-600">Complément requis</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : selectedDossier.statut === 'COMPLET' ? (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <p className="text-sm text-blue-700">
                  Ce dossier est complet et prêt pour initier une phase de traitement.
                </p>
                <button 
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  onClick={() => setShowNewPhaseModal(true)}
                >
                  Démarrer une phase
                </button>
              </div>
            </div>
          ) : null}
          
          {/* Historique des phases */}
          {phases.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-2">Historique des phases</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="divide-y divide-gray-200">
                  {phases.map((phase) => (
                    <li key={phase.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {phase.type === 'DISCUSSION' ? 'Discussion' : 'Vote'}
                            {phase.id === activePhase?.id && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{phase.description}</p>
                          <p className="text-xs text-gray-500">
                            Du {new Date(phase.dateDebut).toLocaleDateString('fr-FR')}
                            {phase.dateFin && ` au ${new Date(phase.dateFin).toLocaleDateString('fr-FR')}`}
                          </p>
                        </div>
                        {phase.type === 'VOTE' && (
                          <button 
                            className="px-3 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem('token');
                                const resultatsResponse = await axios.get(`/api/phases/${phase.id}/resultats`, {
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                
                                showNotification(`Résultats du vote:\nFavorable: ${resultatsResponse.data.FAVORABLE || 0}\nDéfavorable: ${resultatsResponse.data.DEFAVORABLE || 0}\nComplément requis: ${resultatsResponse.data.COMPLEMENT_REQUIS || 0}`, 'info');
                              } catch (error) {
                                console.error("Erreur lors de la récupération des résultats:", error);
                                showNotification("Erreur lors de la récupération des résultats", 'error');
                              }
                            }}
                          >
                            Voir les résultats
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Documents du dossier */}
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
          
          {/* Actions du dossier */}
          {selectedDossier.statut === 'COMPLET' && (
            <div className="mt-6 flex justify-end">
              <button 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                onClick={() => setShowNewPhaseModal(true)}
              >
                Démarrer une phase
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Modal pour créer une nouvelle phase */}
      {showNewPhaseModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}>
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Démarrer une nouvelle phase</h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de phase</label>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-indigo-600"
                      value="DISCUSSION"
                      checked={phaseType === 'DISCUSSION'}
                      onChange={() => setPhaseType('DISCUSSION')}
                    />
                    <span className="ml-2">Discussion</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio h-4 w-4 text-indigo-600"
                      value="VOTE"
                      checked={phaseType === 'VOTE'}
                      onChange={() => setPhaseType('VOTE')}
                    />
                    <span className="ml-2">Vote</span>
                  </label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="Description de la phase..."
                  value={phaseDescription}
                  onChange={(e) => setPhaseDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowNewPhaseModal(false)}
                >
                  Annuler
                </button>
                <button 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  onClick={initierPhase}
                >
                  Démarrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal pour terminer une phase */}
      {showTerminerPhaseModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}>
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full mx-4">
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
                  onClick={() => setShowTerminerPhaseModal(false)}
                >
                  Annuler
                </button>
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  onClick={terminerPhase}
                >
                  Terminer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal pour prolonger une phase */}
      {showProlongerPhaseModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}>
          <div className="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full mx-4">
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
                  onClick={() => setShowProlongerPhaseModal(false)}
                >
                  Annuler
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={prolongerPhase}
                >
                  Prolonger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
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
    case 'VALIDE':
      return (
        <span className="flex items-center">
          <svg className="h-5 w-5 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-green-600 font-semibold">VALIDÉ</span>
        </span>
      );
    case 'REFUSE':
      return (
        <span className="flex items-center">
          <svg className="h-5 w-5 mr-1 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          <span className="text-red-600 font-semibold">REFUSÉ</span>
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
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

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

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const ExclamationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
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

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export default CoordinateurDashboard;