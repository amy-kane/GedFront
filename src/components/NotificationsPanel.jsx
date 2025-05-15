// components/NotificationsPanel.jsx
'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, formatDistance } from 'date-fns';
import { fr } from 'date-fns/locale';

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Récupérer toutes les notifications
      const response = await axios.get('/api/notifications');
      
      setNotifications(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
      
      // En environnement de développement, simuler des données
      if (process.env.NODE_ENV === 'development') {
        const mockNotifications = generateMockNotifications();
        setNotifications(mockNotifications);
      }
      
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/marquer-lue`);
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, lue: true } : notif
        )
      );
    } catch (error) {
      console.error("Erreur lors du marquage de la notification comme lue:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/marquer-toutes-lues');
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, lue: true }))
      );
    } catch (error) {
      console.error("Erreur lors du marquage de toutes les notifications comme lues:", error);
    }
  };

  const deleteReadNotifications = async () => {
    try {
      await axios.delete('/api/notifications/lues');
      
      // Mettre à jour l'état local
      setNotifications(prev => 
        prev.filter(notif => !notif.lue)
      );
    } catch (error) {
      console.error("Erreur lors de la suppression des notifications lues:", error);
    }
  };

  // Filtrer les notifications selon le filtre actif
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.lue;
    if (filter === 'read') return notification.lue;
    return true; // 'all'
  });

  // Formater la date relative (il y a X jours, heures, etc.)
  const formatRelativeDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistance(date, new Date(), { addSuffix: true, locale: fr });
    } catch (error) {
      return "Date inconnue";
    }
  };

  // Générer des données fictives pour le développement
  const generateMockNotifications = () => {
    const now = new Date();
    
    return [
      {
        id: 1,
        message: "Nouveau dossier à évaluer: DOS-2024-105",
        lue: false,
        dateCreation: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        dossier: {
          id: 105,
          numeroDossier: "DOS-2024-105"
        }
      },
      {
        id: 2,
        message: "Nouvelle phase de DISCUSSION initiée pour le dossier DOS-2024-103",
        lue: false,
        dateCreation: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        dossier: {
          id: 103,
          numeroDossier: "DOS-2024-103"
        }
      },
      {
        id: 3,
        message: "La phase de VOTE pour le dossier DOS-2024-101 est terminée",
        lue: true,
        dateCreation: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        dossier: {
          id: 101,
          numeroDossier: "DOS-2024-101"
        }
      },
      {
        id: 4,
        message: "Un rapport concernant votre dossier DOS-2024-104 a été envoyé: Rapport d'évaluation final",
        lue: true,
        dateCreation: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        dossier: {
          id: 104,
          numeroDossier: "DOS-2024-104"
        },
        rapport: {
          id: 10,
          titre: "Rapport d'évaluation final"
        }
      }
    ];
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Notifications</h1>
      
      {/* En-tête avec filtres et actions */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <label className="font-medium text-gray-700">Filtrer:</label>
            <div className="flex space-x-1">
              <button
                className={`px-3 py-1 rounded-md ${
                  filter === 'all' 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setFilter('all')}
              >
                Toutes
              </button>
              <button
                className={`px-3 py-1 rounded-md ${
                  filter === 'unread' 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setFilter('unread')}
              >
                Non lues
              </button>
              <button
                className={`px-3 py-1 rounded-md ${
                  filter === 'read' 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setFilter('read')}
              >
                Lues
              </button>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={markAllAsRead}
            >
              Tout marquer comme lu
            </button>
            <button
              className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              onClick={deleteReadNotifications}
            >
              Supprimer les lues
            </button>
          </div>
        </div>
      </div>
      
      {/* Liste des notifications */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        {loading ? (
          <div className="p-6 text-center">
            <svg className="animate-spin h-10 w-10 text-gray-400 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p>Chargement des notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Pas de notifications</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'unread' 
                ? "Vous n'avez pas de notifications non lues" 
                : filter === 'read' 
                  ? "Vous n'avez pas de notifications lues" 
                  : "Vous n'avez pas de notifications"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredNotifications.map(notification => (
              <li 
                key={notification.id} 
                className={`p-4 hover:bg-gray-50 ${!notification.lue ? 'bg-blue-50' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className={`text-sm ${!notification.lue ? 'font-semibold' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <span>{formatRelativeDate(notification.dateCreation)}</span>
                      <span className="mx-1">•</span>
                      <span>
                        <a 
                          href={`/dossiers/${notification.dossier.id}`} 
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Voir le dossier {notification.dossier.numeroDossier}
                        </a>
                      </span>
                      {notification.rapport && (
                        <>
                          <span className="mx-1">•</span>
                          <span>
                            <a 
                              href={`/rapports/${notification.rapport.id}`} 
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Voir le rapport
                            </a>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {!notification.lue && (
                    <button
                      className="ml-4 bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full hover:bg-blue-200"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Marquer comme lu
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;