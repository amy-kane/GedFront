// components/NotificationBadge.jsx
'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Composant badge pour afficher le nombre de notifications non lues
 * À intégrer dans les layouts des différents rôles
 */
const NotificationBadge = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get('/api/notifications/non-lues', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Si la réponse est un tableau, compter les éléments
        if (Array.isArray(response.data)) {
          setCount(response.data.length);
        } 
        // Si la réponse est un objet avec un compte
        else if (response.data && typeof response.data.count === 'number') {
          setCount(response.data.count);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération du nombre de notifications:", error);
        setLoading(false);
      }
    };

    fetchNotificationCount();
    
    // Mettre à jour le compteur toutes les 60 secondes
    const interval = setInterval(fetchNotificationCount, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Si aucune notification ou en cours de chargement, ne rien afficher
  if (loading || count === 0) {
    return null;
  }

  return (
    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default NotificationBadge;