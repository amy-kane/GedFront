// components/AdminDashboard.jsx - Version complète avec données réelles

'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [dossiers, setDossiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDossier, setSelectedDossier] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    approuves: 0,
    rejetes: 0,
    notifications: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDossiers, setFilteredDossiers] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  // Configuration axios avec token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchStats(),
        fetchAllDossiers()
      ]);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      setLoading(false);
    }
  };

  // Récupérer les statistiques depuis différents endpoints
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Récupérer tous les dossiers pour calculer les stats
      const allDossiersResponse = await axios.get('/api/dossiers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Extraire les dossiers de la réponse
      const extractDossiers = (response) => {
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
          return response.data.content;
        }
        return [];
      };

      const allDossiers = extractDossiers(allDossiersResponse);
      
      // Calculer les statistiques
      const total = allDossiers.length;
      const approuves = allDossiers.filter(d => d.statut === 'APPROUVE').length;
      const rejetes = allDossiers.filter(d => d.statut === 'REJETE').length;
      
      // Pour les notifications, on peut compter les dossiers nécessitant une action
      const notifications = allDossiers.filter(d => 
        d.statut === 'SOUMIS' || d.statut === 'COMPLET' || d.statut === 'INCOMPLET'
      ).length;

      setStats({
        total,
        approuves,
        rejetes,
        notifications
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
    }
  };

  // Récupérer tous les dossiers
  const fetchAllDossiers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/api/dossiers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Extraire les dossiers de la réponse
      const extractDossiers = (response) => {
        if (response.data && Array.isArray(response.data)) {
          return response.data;
        } else if (response.data && response.data.content && Array.isArray(response.data.content)) {
          return response.data.content;
        }
        return [];
      };

      const dossiersData = extractDossiers(response);
      
      // Dédupliquer par ID
      const uniqueDossiers = Array.from(
        new Map(dossiersData.map(dossier => [dossier.id, dossier])).values()
      );

      setDossiers(uniqueDossiers);
      setFilteredDossiers(uniqueDossiers);
    } catch (error) {
      console.error("Erreur lors de la récupération des dossiers:", error);
    }
  };

  // Consulter un dossier spécifique
  const consulterDossier = async (dossierId) => {
    try {
      const dossierDetail = dossiers.find(d => d.id === dossierId);
      setSelectedDossier(dossierDetail);
      
      // Réinitialiser les documents
      setDocuments([]);
      
      const token = localStorage.getItem('token');
      
      // Récupérer les documents du dossier - utiliser l'endpoint qui existe
      try {
        const documentsResponse = await axios.get(`/api/documents/dossier/${dossierId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setDocuments(documentsResponse.data || []);
      } catch (docError) {
        console.log("Pas de documents trouvés ou endpoint non disponible:", docError.message);
        // Si l'endpoint documents n'existe pas, on continue sans documents
        setDocuments([]);
      }
    } catch (error) {
      console.error("Erreur lors de la consultation du dossier:", error);
      if (error.response?.status === 403) {
        alert("Accès refusé. Vous n'avez pas les permissions pour consulter ce dossier.");
      } else {
        alert("Erreur lors de la consultation du dossier: " + (error.response?.data?.message || error.message));
      }
    }
  };

  // Prévisualiser un document (comme dans MembreComiteDashboard)
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
      
      if (response.status !== 200) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const fileBlob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(fileBlob);
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

  // Télécharger un document
  const telechargerDocument = (documentId) => {
    const token = localStorage.getItem('token');
    window.open(`/api/documents/${documentId}/download?token=${token}`, '_blank');
  };

  // Actions sur les dossiers - utiliser l'endpoint correct
  const approuverDossier = async (dossierId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir approuver ce dossier ?')) return;
    
    try {
      setActionLoading(dossierId);
      const token = localStorage.getItem('token');
      
      // Utiliser l'endpoint PUT pour mettre à jour le dossier
      const formData = new FormData();
      formData.append('statut', 'APPROUVE');
      
      await axios.put(`/api/dossiers/${dossierId}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      alert('Dossier approuvé avec succès');
      fetchAllData(); // Rafraîchir les données
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      if (error.response?.status === 403) {
        alert("Accès refusé. Vous n'avez pas les permissions pour approuver ce dossier.");
      } else {
        alert("Erreur lors de l'approbation du dossier: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setActionLoading(null);
    }
  };

  const rejeterDossier = async (dossierId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir rejeter ce dossier ?')) return;
    
    try {
      setActionLoading(dossierId);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('statut', 'REJETE');
      
      await axios.put(`/api/dossiers/${dossierId}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      alert('Dossier rejeté avec succès');
      fetchAllData(); // Rafraîchir les données
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      if (error.response?.status === 403) {
        alert("Accès refusé. Vous n'avez pas les permissions pour rejeter ce dossier.");
      } else {
        alert("Erreur lors du rejet du dossier: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Marquer comme incomplet
  const marquerIncomplet = async (dossierId) => {
    if (!window.confirm('Marquer ce dossier comme incomplet ?')) return;
    
    try {
      setActionLoading(dossierId);
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('statut', 'INCOMPLET');
      
      await axios.put(`/api/dossiers/${dossierId}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      alert('Dossier marqué comme incomplet');
      fetchAllData(); // Rafraîchir les données
    } catch (error) {
      console.error("Erreur lors du marquage incomplet:", error);
      if (error.response?.status === 403) {
        alert("Accès refusé. Vous n'avez pas les permissions pour modifier ce dossier.");
      } else {
        alert("Erreur lors du marquage: " + (error.response?.data?.message || error.message));
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard 
          icon={<DocumentsIcon className="h-10 w-10 text-blue-500" />} 
          title="Dossiers totaux" 
          value={stats.total.toString()} 
          color="bg-blue-50"
        />
        <StatCard 
          icon={<CheckDocumentIcon className="h-10 w-10 text-green-500" />} 
          title="Dossiers approuvés" 
          value={stats.approuves.toString()} 
          color="bg-green-50"
        />
        <StatCard 
          icon={<RejectDocumentIcon className="h-10 w-10 text-red-500" />} 
          title="Dossiers rejetés" 
          value={stats.rejetes.toString()} 
          color="bg-red-50"
        />
        <StatCard 
          icon={<NotificationIcon className="h-10 w-10 text-yellow-500" />} 
          title="Notifications" 
          value={stats.notifications.toString()} 
          color="bg-yellow-50"
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
      
      {/* Raccourci vers la gestion des utilisateurs */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium text-gray-700 mb-2">Accès rapides</h3>
        <div className="flex flex-wrap gap-2">
          <a 
            href="/admin/users"
            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
          >
            <UsersIcon />
            <span className="ml-2">Gestion des utilisateurs</span>
          </a>
          <a 
            href="/admin/types-demande"
            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
          >
            <DocumentIcon />
            <span className="ml-2">Types de demande</span>
          </a>
          <a 
            href="/admin/statistiques"
            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors"
          >
            <ChartIcon />
            <span className="ml-2">Statistiques</span>
          </a>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button className="py-2 px-4 text-blue-600 border-b-2 border-blue-600 font-medium">
          Tous les dossiers ({filteredDossiers.length})
        </button>
      </div>
      
      {/* Dossiers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numéro Dossier
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type de demande
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Déposeur
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documents
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
                <td colSpan={8} className="px-3 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    Chargement des dossiers...
                  </div>
                </td>
              </tr>
            ) : filteredDossiers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-center">
                  {searchTerm ? 'Aucun dossier trouvé pour cette recherche' : 'Aucun dossier disponible'}
                </td>
              </tr>
            ) : (
              filteredDossiers.map((dossier) => (
                <tr key={dossier.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dossier.numeroDossier || `DOS-${dossier.id}`}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <ChevronRightIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {dossier.typeDemande?.libelle || "N/A"}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {dossier.nomDeposant} {dossier.prenomDeposant}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-4 w-4 mr-1 text-gray-400" />
                      {dossier.nombreDocuments || 0}
                    </div>
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
                        disabled={actionLoading === dossier.id}
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-800"
                        onClick={() => approuverDossier(dossier.id)}
                        title="Approuver"
                        disabled={actionLoading === dossier.id}
                      >
                        {actionLoading === dossier.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        ) : (
                          <CheckIcon className="h-5 w-5" />
                        )}
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => rejeterDossier(dossier.id)}
                        title="Rejeter"
                        disabled={actionLoading === dossier.id}
                      >
                        <XIcon className="h-5 w-5" />
                      </button>
                      <button 
                        className="text-yellow-600 hover:text-yellow-800"
                        onClick={() => marquerIncomplet(dossier.id)}
                        title="Marquer incomplet"
                        disabled={actionLoading === dossier.id}
                      >
                        <ExclamationIcon className="h-5 w-5" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-800" title="Plus d'options">
                        <DotsHorizontalIcon className="h-5 w-5" />
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
        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Détails du dossier : {selectedDossier.numeroDossier || `DOS-${selectedDossier.id}`}
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
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{selectedDossier.emailDeposant || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Téléphone</p>
              <p className="font-medium">{selectedDossier.telephoneDeposant || "N/A"}</p>
            </div>
          </div>
          
          {/* Documents du dossier */}
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-900 mb-2">Documents du dossier</h4>
            
            {documents.length === 0 ? (
              <p className="text-gray-500">Aucun document dans ce dossier</p>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <ul className="divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <li key={doc.document?.id || doc.id} className="py-3 flex justify-between items-center">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{doc.document?.nom || doc.nom || 'Document sans nom'}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800 p-1"
                          onClick={() => previsualiserDocument(doc.document?.id || doc.id)}
                          title="Prévisualiser"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-gray-600 hover:text-gray-800 p-1"
                          onClick={() => telechargerDocument(doc.document?.id || doc.id)}
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
        </div>
      )}
    </div>
  );
};

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
    case 'EN_COURS':
      return (
        <span className="flex items-center">
          <svg className="h-5 w-5 mr-1 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          <span className="text-purple-600 font-semibold">EN_COURS</span>
        </span>
      );
    case 'APPROUVE':
      return (
        <span className="flex items-center">
          <svg className="h-5 w-5 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-green-600 font-semibold">APPROUVE</span>
        </span>
      );
    case 'REJETE':
      return (
        <span className="flex items-center">
          <svg className="h-5 w-5 mr-1 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-600 font-semibold">REJETE</span>
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

// Composants d'icônes
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

const NotificationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const DocumentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
  </svg>
);

const ChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
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

const ExclamationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const DotsHorizontalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

export default AdminDashboard;