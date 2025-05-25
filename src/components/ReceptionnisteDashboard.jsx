// components/ReceptionnisteDashboard.jsx
'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReceptionnisteDashboard = () => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    soumis: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDossiers, setFilteredDossiers] = useState([]);

  // Configuration axios avec token
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
          if (decodedPayload.role === 'RECEPTIONNISTE') {
            console.log('✅ Le token a le rôle RECEPTIONNISTE');
          } else {
            console.log('⚠️ ERREUR: Le token a le rôle', decodedPayload.role, 'au lieu de RECEPTIONNISTE');
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
    
    // Récupérer seulement les dossiers SOUMIS
    const soumisResponse = await axios.get('/api/dossiers', {
      params: { statut: 'SOUMIS' },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log("=== DONNÉES SOUMIS ===");
    console.log("SOUMIS response:", soumisResponse.data);
    
    // Fonction d'extraction commune
    const extractCount = (response, label) => {
      const data = response.data;
      
      if (data?.totalElements !== undefined) {
        console.log(`${label} via totalElements:`, data.totalElements);
        return data.totalElements;
      }
      
      if (data?.content && Array.isArray(data.content)) {
        console.log(`${label} via content.length:`, data.content.length);
        return data.content.length;
      }
      
      if (Array.isArray(data)) {
        console.log(`${label} via data.length:`, data.length);
        return data.length;
      }
      
      console.log(`${label} - structure inconnue, retour 0`);
      return 0;
    };
    
    // Fonction d'extraction des dossiers pour l'affichage
    const extractDossiers = (response) => {
      const data = response.data;
      
      if (data?.content && Array.isArray(data.content)) {
        return data.content;
      }
      
      if (Array.isArray(data)) {
        return data;
      }
      
      return [];
    };
    
    // Calculer les stats (seulement SOUMIS)
    const soumisCount = extractCount(soumisResponse, 'SOUMIS');
    
    console.log("=== STATS FINALES ===");
    console.log("SOUMIS:", soumisCount);
    
    // Mettre à jour les stats
    setStats({
      soumis: soumisCount
    });
    
    // Extraire les dossiers SOUMIS pour l'affichage
    const dossiersData = extractDossiers(soumisResponse);
    setDossiers(dossiersData);
    setFilteredDossiers(dossiersData);
    
    setLoading(false);
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    setLoading(false);
  }
};

// Récupérer uniquement les dossiers SOUMIS
const fetchSoumisDossiers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/dossiers', {
      params: { statut: 'SOUMIS' },
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log("Réponse dossiers SOUMIS:", response.data);
    
    // Extraire les données selon la structure de la réponse
    const dossiersData = Array.isArray(response.data) 
      ? response.data 
      : (response.data.content || []);
    
    setDossiers(dossiersData);
    setFilteredDossiers(dossiersData);
  } catch (error) {
    console.error("Erreur lors de la récupération des dossiers SOUMIS:", error);
    alert("Erreur lors de la récupération des dossiers: " + (error.response?.data?.message || error.message));
  }
};

  // Récupérer les statistiques avec debug détaillé
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      console.log("=== DÉBUT FETCHSTATS RÉCEPTIONNISTE ===");
      
      let soumis = 0;
      let complet = 0; 
      let incomplet = 0;
      
      // Appel 1: Dossiers SOUMIS
      try {
        const soumisResponse = await axios.get('/api/dossiers', {
          params: { statut: 'SOUMIS' },
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log("=== RÉPONSE SOUMIS ===");
        console.log("Status:", soumisResponse.status);
        console.log("Data complète:", soumisResponse.data);
        console.log("Type de data:", typeof soumisResponse.data);
        console.log("Est un array?", Array.isArray(soumisResponse.data));
        
        if (soumisResponse.data?.content) {
          soumis = soumisResponse.data.content.length;
          console.log("SOUMIS via content.length:", soumis);
        } else if (soumisResponse.data?.totalElements !== undefined) {
          soumis = soumisResponse.data.totalElements;
          console.log("SOUMIS via totalElements:", soumis);
        } else if (Array.isArray(soumisResponse.data)) {
          soumis = soumisResponse.data.length;
          console.log("SOUMIS via data.length:", soumis);
        } else {
          console.log("SOUMIS - structure non reconnue");
        }
      } catch (error) {
        console.error("Erreur récupération SOUMIS:", error.response?.status, error.response?.data);
      }
      
      // Appel 2: Dossiers COMPLET  
      try {
        const completResponse = await axios.get('/api/dossiers', {
          params: { statut: 'COMPLET' },
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log("=== RÉPONSE COMPLET ===");
        console.log("Status:", completResponse.status);
        console.log("Data complète:", completResponse.data);
        console.log("Type de data:", typeof completResponse.data);
        console.log("Est un array?", Array.isArray(completResponse.data));
        
        if (completResponse.data?.content) {
          complet = completResponse.data.content.length;
          console.log("COMPLET via content.length:", complet);
        } else if (completResponse.data?.totalElements !== undefined) {
          complet = completResponse.data.totalElements;
          console.log("COMPLET via totalElements:", complet);
        } else if (Array.isArray(completResponse.data)) {
          complet = completResponse.data.length;
          console.log("COMPLET via data.length:", complet);
        } else {
          console.log("COMPLET - structure non reconnue");
        }
      } catch (error) {
        console.error("Erreur récupération COMPLET:", error.response?.status, error.response?.data);
      }
      
      // Appel 3: Dossiers INCOMPLET
      try {
        const incompletResponse = await axios.get('/api/dossiers', {
          params: { statut: 'INCOMPLET' },
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log("=== RÉPONSE INCOMPLET ===");
        console.log("Status:", incompletResponse.status);
        console.log("Data complète:", incompletResponse.data);
        console.log("Type de data:", typeof incompletResponse.data);
        console.log("Est un array?", Array.isArray(incompletResponse.data));
        
        if (incompletResponse.data?.content) {
          incomplet = incompletResponse.data.content.length;
          console.log("INCOMPLET via content.length:", incomplet);
        } else if (incompletResponse.data?.totalElements !== undefined) {
          incomplet = incompletResponse.data.totalElements;
          console.log("INCOMPLET via totalElements:", incomplet);
        } else if (Array.isArray(incompletResponse.data)) {
          incomplet = incompletResponse.data.length;
          console.log("INCOMPLET via data.length:", incomplet);
        } else {
          console.log("INCOMPLET - structure non reconnue");
        }
      } catch (error) {
        console.error("Erreur récupération INCOMPLET:", error.response?.status, error.response?.data);
      }

      console.log("=== RÉSULTATS FINAUX ===");
      console.log("SOUMIS:", soumis);
      console.log("COMPLET:", complet);
      console.log("INCOMPLET:", incomplet);

      setStats({
        soumis,
        complet,
        incomplet
      });
      
      console.log("=== FIN FETCHSTATS ===");
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }
  };

  // Récupérer uniquement les dossiers à traiter (SOUMIS)
  const fetchDossiers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/dossiers', {
        params: { statut: 'SOUMIS' },
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Extraire les données selon la structure de la réponse
      const dossiersData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.content || []);
      
      console.log("Dossiers SOUMIS récupérés:", dossiersData);
      setDossiers(dossiersData);
      setFilteredDossiers(dossiersData);
      
      // Récupérer séparément les statistiques complètes
      await fetchStats();
      
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des dossiers:", error);
      alert("Erreur lors de la récupération des dossiers: " + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  // Consulter les documents d'un dossier
  const consulterDossier = async (dossierId) => {
    try {
      const dossierDetail = dossiers.find(d => d.id === dossierId);
      setSelectedDossier(dossierDetail);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/documents/dossier/${dossierId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setDocuments(response.data);
    } catch (error) {
      console.error("Erreur lors de la consultation du dossier:", error);
      alert("Erreur lors de la consultation du dossier");
    }
  };

// Marquer un dossier comme complet
const marquerComplet = async (dossierId) => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `/api/dossiers/${dossierId}/statut?statut=COMPLET`,
      {},
      { headers: { 'Authorization': `Bearer ${token}` }}
    );
    
    // Recharger toutes les données
    await fetchAllData();
    setSelectedDossier(null);
    alert("Le dossier a été marqué comme COMPLET");
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    alert("Erreur lors du changement de statut: " + (error.response?.data?.message || error.message));
  }
};

// Marquer un dossier comme incomplet
const marquerIncomplet = async (dossierId) => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `/api/dossiers/${dossierId}/statut?statut=INCOMPLET`,
      {},
      { headers: { 'Authorization': `Bearer ${token}` }}
    );
    
    // Recharger toutes les données
    await fetchAllData();
    setSelectedDossier(null);
    alert("Le dossier a été marqué comme INCOMPLET");
  } catch (error) {
    console.error("Erreur lors du changement de statut:", error);
    alert("Erreur lors du changement de statut: " + (error.response?.data?.message || error.message));
  }
};
  // Prévisualiser un document avec gestion explicite du type MIME
  // Prévisualiser un document
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

  return (
    <div className="p-6">
      {/* Stats Cards - Seulement SOUMIS */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-6">
        <StatCard 
          icon={<DocumentsIcon className="h-10 w-10 text-blue-600" />} 
          title="Dossiers à traiter" 
          value={stats.soumis.toString()}
          color="bg-blue-100"
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
                <tr key={dossier.id} className="hover:bg-gray-50">
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
                      <button 
                        className="text-green-600 hover:text-green-800"
                        onClick={() => marquerComplet(dossier.id)}
                        title="Marquer comme complet"
                      >
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => marquerIncomplet(dossier.id)}
                        title="Marquer comme incomplet"
                      >
                        <XIcon className="h-5 w-5" />
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
          
          <div className="mt-6 flex justify-end space-x-3">
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              onClick={() => marquerComplet(selectedDossier.id)}
            >
              Marquer comme complet
            </button>
            <button 
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              onClick={() => marquerIncomplet(selectedDossier.id)}
            >
              Marquer comme incomplet
            </button>
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
    case 'SOUMIS':
      return (
        <span className="flex items-center">
          <svg className="h-5 w-5 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <span className="text-blue-600 font-semibold">SOUMIS</span>
        </span>
      );
    case 'INCOMPLET':
      return (
        <span className="flex items-center">
          <svg className="h-5 w-5 mr-1 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-yellow-600 font-semibold">INCOMPLET</span>
        </span>
      );
    case 'COMPLET':
      return (
        <span className="flex items-center">
          <svg className="h-5 w-5 mr-1 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-indigo-600 font-semibold">COMPLET</span>
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

const CheckDocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const RejectDocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 8h3m-3-3h3m-3 3v3m-3-3h.01M9 16h.01" />
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

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export default ReceptionnisteDashboard;