// app/deposant/dossiers/[id]/suivi/page.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import React from 'react';

// Composant Layout Principal
const PageLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-semibold text-gray-900">Suivi de Dossier</h1>
              </div>
            </div>
            <nav className="flex space-x-8">
              <a href="/deposant/dashboard" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium transition-colors">
                Tableau de bord
              </a>
              <a href="/deposant/dossiers" className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium transition-colors">
                Mes dossiers
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2024 Plateforme de Gestion des Dossiers. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Composant Breadcrumb
const Breadcrumb = ({ dossier }) => {
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <a href="/deposant/dashboard" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
            </svg>
            Accueil
          </a>
        </li>
        <li>
          <div className="flex items-center">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
            </svg>
            <a href="/deposant/dossiers" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
              Mes dossiers
            </a>
          </div>
        </li>
        <li aria-current="page">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
            </svg>
            <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
              {dossier?.numeroDossier || 'Suivi'}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  );
};

// Composant Actions Rapides
const QuickActions = ({ dossier }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Actions rapides</h3>
      <div className="flex flex-wrap gap-2">
        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          Télécharger le récapitulatif
        </button>
        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
          </svg>
          Partager
        </button>
      </div>
    </div>
  );
};

/**
 * Page de suivi d'un dossier
 * 
 * Cette page permet au déposant de suivre l'évolution de son dossier après soumission.
 * Elle est en lecture seule et n'autorise aucune modification du dossier.
 * 
 * @param {Object} params - Paramètres de route contenant l'ID du dossier
 */
export default function SuiviDossier({ params }) {
    const paramsObj = React.use(params);
    const dossierId = paramsObj.id;
    const router = useRouter();
  
  // États pour gérer les données et l'interface
  const [dossier, setDossier] = useState(null);            // Données du dossier
  const [documents, setDocuments] = useState([]);          // Liste des documents
  const [isLoading, setIsLoading] = useState(true);        // État de chargement initial
  const [error, setError] = useState('');                  // Message d'erreur
  
  /**
   * Effet pour charger les données du dossier et des documents au chargement de la page
   */
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Vérification de l'authentification
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        
        // Récupération des informations du dossier
        const dossierResponse = await axios.get(`/api/dossiers/${dossierId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDossier(dossierResponse.data);
        
        // Récupération des documents
        const documentsResponse = await axios.get(`/api/documents/dossier/${dossierId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDocuments(documentsResponse.data);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Impossible de charger les informations du dossier.');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [dossierId, router]);

  /**
   * Rendu du statut du dossier avec style adapté
   */
  const renderStatut = (statut) => {
    // Configuration des styles et libellés selon le statut
    const statutConfig = {
      'SOUMIS': { color: 'bg-yellow-100 text-yellow-800', icon: '⏳', label: 'Soumis - En attente de vérification' },
      'INCOMPLET': { color: 'bg-red-100 text-red-800', icon: '⚠️', label: 'Incomplet - Documents manquants' },
      'COMPLET': { color: 'bg-blue-100 text-blue-800', icon: '📋', label: 'Complet - En attente d\'évaluation' },
      'EN_COURS': { color: 'bg-purple-100 text-purple-800', icon: '🔍', label: 'En cours d\'évaluation' },
      'APPROUVE': { color: 'bg-green-100 text-green-800', icon: '✅', label: 'Approuvé' },
      'REJETE': { color: 'bg-gray-100 text-gray-800', icon: '❌', label: 'Rejeté' }
    };
    
    const config = statutConfig[statut] || { color: 'bg-gray-100 text-gray-800', icon: '❓', label: statut };
    
    return (
      <div className={`rounded-md px-4 py-2 ${config.color} inline-flex items-center`}>
        <span className="mr-2">{config.icon}</span>
        <span className="font-medium">{config.label}</span>
      </div>
    );
  };
  
  /**
   * Fonction pour générer la timeline
   */
  const renderTimelineSteps = () => {
    if (!dossier) return null;
    
    // Création d'un tableau pour stocker les étapes de la timeline
    const timelineSteps = [];
    
    // Fonction pour formater les dates
    const formatDate = (date, includeTime = true) => {
      if (!date) return 'Date non disponible';
      
      const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      };
      
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      
      return new Date(date).toLocaleDateString('fr-FR', options);
    };
    
    // Obtenir le message selon le statut
    const getStatusMessage = (statut) => {
      switch(statut) {
        case 'INCOMPLET':
          return "Votre dossier a été marqué comme incomplet. Veuillez vérifier les documents manquants et resoumettez-les.";
        case 'COMPLET':
          return "Votre dossier a été validé comme complet et est désormais en attente d'évaluation par notre comité.";
        case 'EN_COURS':
          return "Votre dossier est actuellement en cours d'évaluation par notre comité.";
        case 'APPROUVE':
          return "Félicitations ! Votre dossier a été approuvé.";
        case 'REJETE':
          return "Nous sommes désolés, votre dossier a été rejeté.";
        default:
          return "";
      }
    };
    
    // 1. Étape Soumission (toujours présente)
    timelineSteps.push({
      id: "etape-soumission",
      title: "Dossier soumis",
      date: dossier.dateCreation,
      formattedDate: formatDate(dossier.dateCreation),
      message: "Votre dossier a été soumis avec succès et est en attente de vérification par nos services.",
      iconClass: "bg-green-500",
      iconPath: "M5 13l4 4L19 7", // Checkmark
      textClass: "text-gray-900"
    });
    
    // 2. Étape Changement de statut (si différent de SOUMIS)
    if (dossier.statut && dossier.statut !== 'SOUMIS') {
      timelineSteps.push({
        id: "etape-statut-change",
        title: `Statut mis à jour: ${dossier.statut}`,
        date: dossier.dateModification,
        formattedDate: formatDate(dossier.dateModification),
        message: getStatusMessage(dossier.statut),
        iconClass: "bg-blue-500",
        iconPath: "M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11",
        textClass: "text-gray-900"
      });
    }
    
    // 3. Étape En attente (si statut ni APPROUVE ni REJETE)
    if (dossier.statut && !['APPROUVE', 'REJETE'].includes(dossier.statut)) {
      timelineSteps.push({
        id: "etape-en-attente",
        title: "En attente",
        date: null,
        formattedDate: "Date non disponible",
        message: "L'étape suivante de votre dossier est en attente de traitement.",
        iconClass: "bg-gray-300",
        iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
        textClass: "text-gray-500"
      });
    }
    
    // 4. Étape Décision finale (si statut APPROUVE ou REJETE)
    if (dossier.statut && ['APPROUVE', 'REJETE'].includes(dossier.statut)) {
      const isApproved = dossier.statut === 'APPROUVE';
      timelineSteps.push({
        id: "etape-decision-finale",
        title: `Décision finale: ${isApproved ? 'Dossier approuvé' : 'Dossier rejeté'}`,
        date: dossier.dateModification,
        formattedDate: formatDate(dossier.dateModification, false),
        message: isApproved 
          ? "Votre dossier a été approuvé. Vous recevrez prochainement un email avec les instructions à suivre pour finaliser votre demande."
          : "Nous sommes désolés, votre dossier a été rejeté. Pour connaître les raisons du rejet, veuillez contacter notre service d'assistance.",
        iconClass: isApproved ? "bg-green-500" : "bg-red-500",
        iconPath: isApproved 
          ? "M5 13l4 4L19 7" // Checkmark 
          : "M6 18L18 6M6 6l12 12", // X
        textClass: "text-gray-900"
      });
    }
    
    // Rendu des étapes
    return timelineSteps.map(step => (
      <div key={step.id} className="relative pl-10">
        <div className={`absolute left-0 top-1.5 w-7 h-7 rounded-full ${step.iconClass} flex items-center justify-center`}>
          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={step.iconPath} />
          </svg>
        </div>
        
        <div>
          <h3 className={`text-lg font-medium ${step.textClass}`}>{step.title}</h3>
          <p className="text-gray-600 text-sm">{step.formattedDate}</p>
          <p className="mt-2 text-gray-600">{step.message}</p>
        </div>
      </div>
    ));
  };

  /**
   * Affichage du chargement initial
   */
  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Chargement du dossier...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb dossier={dossier} />

        {/* Actions rapides */}
        <QuickActions dossier={dossier} />

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* En-tête avec statut - Amélioré */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-3xl font-bold">Dossier {dossier?.numeroDossier}</h1>
                <p className="text-blue-100 text-lg mt-1">{dossier?.typeDemande?.libelle}</p>
                <p className="text-blue-200 text-sm mt-2">
                  Créé le {dossier?.dateCreation 
                    ? new Date(dossier.dateCreation).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'Date non disponible'}
                </p>
              </div>
              
              <div className="flex flex-col items-start lg:items-end space-y-3">
                {dossier?.statut && renderStatut(dossier.statut)}
                <div className="text-right text-blue-100 text-sm">
                  <p>Dernière mise à jour :</p>
                  <p className="font-medium">
                    {dossier?.dateModification 
                      ? new Date(dossier.dateModification).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Non disponible'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Affichage des erreurs */}
          {error && (
            <div className="bg-red-50 p-4 border-b border-red-100">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
          
          <div className="p-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Informations du dossier - Améliorées */}
              <div className="xl:col-span-1 space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Informations personnelles
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Nom complet</p>
                        <p className="text-gray-900 font-semibold">{dossier?.prenomDeposant} {dossier?.nomDeposant}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Email</p>
                        <p className="text-gray-900">{dossier?.emailDeposant}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Sexe</p>
                          <p className="text-gray-900">{dossier?.sexeDeposant || 'Non spécifié'}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Âge</p>
                          <p className="text-gray-900">{dossier?.ageDeposant ? `${dossier.ageDeposant} ans` : 'Non spécifié'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Téléphone</p>
                        <p className="text-gray-900">{dossier?.telephoneDeposant}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Adresse</p>
                        <p className="text-gray-900">{dossier?.adresseDeposant}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents - Améliorés */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Documents ({documents.length})
                  </h2>
                  
                  <div className="space-y-3">
                    {documents.length === 0 ? (
                      <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 italic mt-2">Aucun document disponible</p>
                      </div>
                    ) : (
                      documents.map((doc, index) => (
                        <div 
                          key={doc.id ? `doc-${doc.id}` : `doc-index-${index}`} 
                          className="bg-white p-4 rounded-md border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="ml-3 flex-1">
                              <p className="font-medium text-gray-900">{doc.nom || `Document ${index + 1}`}</p>
                              <p className="text-sm text-gray-500">{doc.typeDocument || 'Document'}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              
              {/* Historique d'activité (timeline) - Plus large */}
              <div className="xl:col-span-2">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-full">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <svg className="h-6 w-6 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Historique du dossier
                  </h2>
                  
                  <div className="relative">
                    {/* Ligne verticale de la timeline */}
                    <div className="absolute left-3.5 top-0 h-full w-0.5 bg-gray-200"></div>
                    
                    <div className="space-y-8">
                      {/* Rendu des étapes de la timeline à partir de la fonction */}
                      {renderTimelineSteps()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Instructions et aide - Section élargie */}
            <div className="mt-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Besoin d'aide ?</h3>
                    <p className="text-blue-700 mb-4">
                      Pour toute question concernant votre dossier, n'hésitez pas à contacter notre service d'assistance. 
                      Notre équipe est disponible pour vous accompagner dans vos démarches.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center text-blue-800">
                        <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="font-medium">Email</p>
                          <p className="text-sm">support@exemple.fr</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-blue-800">
                        <svg className="h-5 w-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div>
                          <p className="font-medium">Téléphone</p>
                          <p className="text-sm">01 23 45 67 89</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-blue-200">
                      <p className="text-sm text-blue-600">
                        <svg className="inline h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Horaires d'ouverture : Lundi au Vendredi de 8h00 à 18h00
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}