// components/NotificationsPage.jsx
'use client';
import React, { useState, useEffect } from 'react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('toutes');
  const [processingAction, setProcessingAction] = useState(false);

  // Récupération des notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token d\'authentification manquant');
      }

      const response = await fetch('/api/notifications', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Notifications récupérées:', data);
      setNotifications(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      setError(error.message || 'Erreur lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };

  // Marquer une notification comme lue
  const marquerCommeLue = async (notificationId) => {
    try {
      setProcessingAction(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/notifications/${notificationId}/marquer-lue`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du marquage comme lu');
      }
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, lue: true }
            : notif
        )
      );
      
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      alert('Erreur lors du marquage de la notification');
    } finally {
      setProcessingAction(false);
    }
  };

  // Marquer toutes comme lues
  const marquerToutesCommeLues = async () => {
    try {
      setProcessingAction(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/notifications/marquer-toutes-lues', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du marquage de toutes comme lues');
      }
      
      const result = await response.json();
      console.log(`${result.count} notifications marquées comme lues`);
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, lue: true }))
      );
      
      alert(`${result.count} notifications marquées comme lues`);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes comme lues:', error);
      alert('Erreur lors du marquage des notifications');
    } finally {
      setProcessingAction(false);
    }
  };

  // Supprimer les notifications lues
  const supprimerNotificationsLues = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les notifications lues ?')) {
      return;
    }
    
    try {
      setProcessingAction(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/notifications/lues', {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      
      const result = await response.json();
      console.log(`${result.count} notifications supprimées`);
      
      setNotifications(prev => prev.filter(notif => !notif.lue));
      
      alert(`${result.count} notifications supprimées`);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression des notifications');
    } finally {
      setProcessingAction(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const notificationsFiltrees = notifications.filter(notif => {
    switch (filter) {
      case 'non-lues':
        return !notif.lue;
      case 'lues':
        return notif.lue;
      default:
        return true;
    }
  });

  const countNonLues = notifications.filter(n => !n.lue).length;

  const formaterDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    
    try {
      const date = new Date(dateString);
      const maintenant = new Date();
      const diffMs = maintenant - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHeures = Math.floor(diffMs / 3600000);
      const diffJours = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'À l\'instant';
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHeures < 24) return `Il y a ${diffHeures}h`;
      if (diffJours < 7) return `Il y a ${diffJours} jour${diffJours > 1 ? 's' : ''}`;
      
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Date invalide';
    }
  };

  const getNotificationIcon = (notification) => {
    const message = notification.message?.toLowerCase() || '';
    
    if (message.includes('nouveau dossier soumis') || message.includes('nouveau dossier à évaluer')) {
      return <DocumentPlusIcon className="h-6 w-6 text-blue-500" />;
    }
    if (message.includes('complet') && message.includes('transmis')) {
      return <CheckCircleIcon className="h-6 w-6 text-emerald-500" />;
    }
    if (message.includes('incomplet')) {
      return <ExclamationTriangleIcon className="h-6 w-6 text-amber-500" />;
    }
    if (message.includes('approuvé') || message.includes('félicitations')) {
      return <CheckBadgeIcon className="h-6 w-6 text-green-500" />;
    }
    if (message.includes('rejeté') || message.includes('regrettons')) {
      return <XCircleIcon className="h-6 w-6 text-red-500" />;
    }
    if (message.includes('phase') && message.includes('initiée')) {
      return <ClockIcon className="h-6 w-6 text-purple-500" />;
    }
    if (message.includes('rapport')) {
      return <DocumentTextIcon className="h-6 w-6 text-indigo-500" />;
    }
    
    return <BellIcon className="h-6 w-6 text-slate-500" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full animate-bounce"></div>
          </div>
          <span className="text-slate-600 text-lg font-medium">Chargement des notifications...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-sm border border-red-200 rounded-2xl p-8 max-w-md w-full shadow-xl">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center mr-4">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800">Erreur</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button 
            onClick={fetchNotifications}
            className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* En-tête avec design moderne */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BellIcon className="h-6 w-6 text-white" />
                </div>
                {countNonLues > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse">
                    {countNonLues}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-slate-600 mt-1 flex items-center space-x-2">
                  <span>{countNonLues > 0 ? `${countNonLues} notification${countNonLues > 1 ? 's' : ''} non lue${countNonLues > 1 ? 's' : ''}` : 'Toutes vos notifications sont à jour'}</span>
                  {countNonLues === 0 && <span className="text-green-500">✨</span>}
                </p>
              </div>
            </div>
            
            <button 
              onClick={fetchNotifications}
              disabled={processingAction}
              className="group p-3 bg-white/80 hover:bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm"
              title="Actualiser"
            >
              <ArrowPathIcon className="h-5 w-5 text-slate-600 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </div>

        {/* Filtres avec design pills */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex bg-white/70 backdrop-blur-sm rounded-2xl p-1.5 shadow-md">
              {[
                { key: 'toutes', label: 'Toutes', count: notifications.length },
                { key: 'non-lues', label: 'Non lues', count: countNonLues },
                { key: 'lues', label: 'Lues', count: notifications.length - countNonLues }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === key
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md transform scale-105'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              {countNonLues > 0 && (
                <button
                  onClick={marquerToutesCommeLues}
                  disabled={processingAction}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-medium hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Marquer toutes comme lues
                </button>
              )}

              {notifications.some(n => n.lue) && (
                <button
                  onClick={supprimerNotificationsLues}
                  disabled={processingAction}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl text-sm font-medium hover:from-red-600 hover:to-pink-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Supprimer les lues
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Liste des notifications avec animations */}
        <div className="space-y-4">
          {notificationsFiltrees.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <BellSlashIcon className="h-12 w-12 text-slate-400" />
                </div>
                <div className="absolute -top-2 -right-8 w-6 h-6 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full animate-bounce delay-300"></div>
                <div className="absolute -bottom-2 -left-8 w-4 h-4 bg-gradient-to-br from-blue-200 to-blue-300 rounded-full animate-bounce delay-700"></div>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {filter === 'non-lues' ? 'Aucune notification non lue' : 
                 filter === 'lues' ? 'Aucune notification lue' : 
                 'Aucune notification'}
              </h3>
              <p className="text-slate-600 max-w-md mx-auto">
                {filter === 'toutes' ? 
                  'Vous serez notifié des nouveaux événements concernant vos dossiers.' :
                  `Aucune notification ${filter === 'non-lues' ? 'non lue' : 'lue'} pour le moment.`}
              </p>
            </div>
          ) : (
            notificationsFiltrees.map((notification, index) => (
              <div 
                key={notification.id}
                className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] border-l-4 ${
                  notification.lue 
                    ? 'border-l-slate-300 hover:bg-white/90' 
                    : 'border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-white/80'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'slideIn 0.5s ease-out forwards'
                }}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 p-3 rounded-2xl ${
                      notification.lue 
                        ? 'bg-slate-100' 
                        : 'bg-gradient-to-br from-blue-50 to-indigo-50 ring-2 ring-blue-100'
                    } transition-all duration-200`}>
                      {getNotificationIcon(notification)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={`${
                            notification.lue 
                              ? 'text-slate-600' 
                              : 'text-slate-800 font-medium'
                          } leading-relaxed`}>
                            {notification.message}
                          </p>
                          
                          {notification.dossier && (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200">
                                Dossier {notification.dossier.numeroDossier}
                              </span>
                              {notification.dossier.typeDemande?.libelle && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                                  {notification.dossier.typeDemande.libelle}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-3 ml-4">
                          <div className="text-right">
                            <span className="text-xs text-slate-500 block">
                              {formaterDate(notification.dateCreation)}
                            </span>
                          </div>
                          
                          {!notification.lue && (
                            <button
                              onClick={() => marquerCommeLue(notification.id)}
                              disabled={processingAction}
                              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-200 transform hover:scale-110 group-hover:opacity-100 opacity-70 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Marquer comme lu"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Indicateur de traitement */}
      {processingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 flex items-center space-x-4 shadow-2xl">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-slate-700 font-medium">Traitement en cours...</span>
          </div>
        </div>
      )}

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
            transform: translate3d(0, -10px, 0);
          }
          70% {
            animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
            transform: translate3d(0, -5px, 0);
          }
          90% {
            transform: translate3d(0,-2px,0);
          }
        }
      `}</style>
    </div>
  );
};

// Icônes SVG optimisées
const BellIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const BellSlashIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.707 3.707l16.586 16.586M9.88 9.88a6.002 6.002 0 00-.22 1.278V14.158c0 .538-.214 1.055-.595 1.436L4 21h5m6 0v1a3 3 0 11-6 0v-1m6 0H9m11-4.842a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341" />
  </svg>
);

const DocumentPlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckBadgeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);

const ExclamationTriangleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const XCircleIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const DocumentTextIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowPathIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export default NotificationsPage;