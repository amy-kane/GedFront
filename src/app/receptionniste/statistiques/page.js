// src/app/receptionniste/statistiques/page.js - Version RECEPTIONNISTE
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function StatistiquesReceptionniste() {
  const router = useRouter();
  
  // États pour gérer les données
  const [statsGlobales, setStatsGlobales] = useState(null);
  const [statsParType, setStatsParType] = useState(null);
  const [statsDemographiques, setStatsDemographiques] = useState(null);
  const [candidatsApprouves, setCandidatsApprouves] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ongletActif, setOngletActif] = useState('globales');
  const [exporting, setExporting] = useState(false);
  const [exportingType, setExportingType] = useState(null);

  // Couleurs pour les graphiques (thème bleu pour réceptionniste)
  const COLORS = {
    SOUMIS: '#fbbf24',      // jaune
    COMPLET: '#3b82f6',     // bleu (thème réceptionniste)
    INCOMPLET: '#ef4444',   // rouge
    EN_COURS: '#8b5cf6',    // violet
    APPROUVE: '#059669',    // vert
    REJETE: '#6b7280',      // gris
    MASCULIN: '#3b82f6',    // bleu (thème réceptionniste)
    FEMININ: '#ec4899',     // rose
    AUTRE: '#6b7280'        // gris
  };

  // Charger les données au montage du composant
  useEffect(() => {
    const fetchStatistiques = async () => {
      setLoading(true);
      setError('');
      
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        console.log('=== DEBUG RECEPTIONNISTE ===');
        console.log('Token exists:', !!token);
        console.log('User data:', user);
        
        if (!token) {
          console.log('Pas de token, redirection vers login');
          router.push('/login');
          return;
        }

        if (user) {
          const userData = JSON.parse(user);
          console.log('User role:', userData.role);
          console.log('User nom:', userData.nom);
          
          // Vérifier que l'utilisateur est bien réceptionniste
          if (userData.role !== 'RECEPTIONNISTE') {
            console.log('Utilisateur non autorisé, rôle:', userData.role);
            setError('Accès refusé: vous devez être RECEPTIONNISTE pour accéder à cette page.');
            setLoading(false);
            return;
          }
        }

        const headers = { Authorization: `Bearer ${token}` };
        console.log('Headers:', headers);

        // Tentative de chargement des statistiques globales d'abord
        console.log('Chargement des statistiques globales...');
        
        try {
          const globalesRes = await axios.get('/api/statistiques/globales', { headers });
          console.log('✅ Statistiques globales chargées:', globalesRes.data);
          setStatsGlobales(globalesRes.data);
        } catch (err) {
          console.error('❌ Erreur statistiques globales:', err.response?.data || err.message);
          throw new Error(`Erreur statistiques globales: ${err.response?.data?.error || err.message}`);
        }

        // Chargement des autres statistiques
        try {
          console.log('Chargement des statistiques par type...');
          const parTypeRes = await axios.get('/api/statistiques/par-type-demande', { headers });
          console.log('✅ Statistiques par type chargées');
          setStatsParType(parTypeRes.data);
        } catch (err) {
          console.error('❌ Erreur statistiques par type:', err.response?.data || err.message);
          // On continue même si cette partie échoue
        }

        try {
          console.log('Chargement des statistiques démographiques...');
          const demographiquesRes = await axios.get('/api/statistiques/demographiques', { headers });
          console.log('✅ Statistiques démographiques chargées');
          setStatsDemographiques(demographiquesRes.data);
        } catch (err) {
          console.error('❌ Erreur statistiques démographiques:', err.response?.data || err.message);
          // On continue même si cette partie échoue
        }

        try {
          console.log('Chargement des candidats approuvés...');
          const candidatsRes = await axios.get('/api/statistiques/candidats-approuves', { headers });
          console.log('✅ Candidats approuvés chargés:', candidatsRes.data.length, 'candidats');
          
          // Organiser les candidats par type de demande
          const candidatsParType = {};
          candidatsRes.data.forEach(candidat => {
            const type = candidat.typeDemande;
            if (!candidatsParType[type]) {
              candidatsParType[type] = [];
            }
            candidatsParType[type].push(candidat);
          });
          setCandidatsApprouves(candidatsParType);
        } catch (err) {
          console.error('❌ Erreur candidats approuvés:', err.response?.data || err.message);
          // Si l'endpoint n'existe pas encore, on continue sans erreur fatale
          if (err.response?.status === 404) {
            console.log('ℹ️ Endpoint candidats approuvés non disponible (404) - Mode dégradé');
            setCandidatsApprouves({});
          } else if (err.response?.status === 403) {
            console.log('⚠️ Pas d\'autorisation pour candidats approuvés (403) - Mode dégradé');
            setCandidatsApprouves({});
          } else {
            console.log('⚠️ Erreur candidats approuvés, continuation en mode dégradé');
            setCandidatsApprouves({});
          }
        }
        
        setLoading(false);
        console.log('=== FIN DEBUG RECEPTIONNISTE ===');
        
      } catch (err) {
        console.error('=== ERREUR GLOBALE ===');
        console.error('Status:', err.response?.status);
        console.error('Data:', err.response?.data);
        console.error('Message:', err.message);
        
        if (err.response?.status === 401) {
          console.log('Erreur 401, redirection vers login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
          return;
        }
        
        if (err.response?.status === 403) {
          setError(`Accès refusé: ${err.response.data?.error || 'Vous n\'avez pas les droits pour consulter les statistiques. Contactez un administrateur.'}`);
        } else {
          setError(`Erreur lors du chargement: ${err.response?.data?.error || err.message}`);
        }
        
        setLoading(false);
      }
    };

    fetchStatistiques();
  }, [router]);

  // ✅ FONCTION D'EXPORT FONCTIONNELLE
  const exportStatistics = async (format = 'excel') => {
    setExporting(true);
    
    try {
      // Préparer les données à exporter
      const exportData = {
        date: new Date().toISOString(),
        utilisateur: JSON.parse(localStorage.getItem('user') || '{}'),
        statistiques: {
          globales: statsGlobales,
          parType: statsParType,
          demographiques: statsDemographiques
        }
      };

      if (format === 'excel') {
        await exportToExcel(exportData);
      } else if (format === 'pdf') {
        await exportToPDF(exportData);
      } else if (format === 'csv') {
        await exportToCSV(exportData);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export des statistiques');
    } finally {
      setExporting(false);
    }
  };

  // ✅ EXPORT EXCEL FONCTIONNEL
  const exportToExcel = async (data) => {
    // Créer le contenu CSV (Excel peut lire les CSV)
    let csvContent = '';
    
    // En-tête du rapport
    csvContent += `Rapport Statistiques GED - RECEPTIONNISTE\n`;
    csvContent += `Date d'export: ${new Date().toLocaleDateString('fr-FR')}\n`;
    csvContent += `Exporté par: ${data.utilisateur.prenom} ${data.utilisateur.nom}\n\n`;

    // Statistiques globales
    if (data.statistiques.globales) {
      csvContent += `STATISTIQUES GLOBALES\n`;
      csvContent += `Total dossiers,${data.statistiques.globales.total}\n`;
      csvContent += `\nRépartition par statut\n`;
      Object.entries(data.statistiques.globales.parStatut || {}).forEach(([statut, count]) => {
        csvContent += `${statut},${count}\n`;
      });
      
      csvContent += `\nRépartition par sexe\n`;
      Object.entries(data.statistiques.globales.parSexe || {}).forEach(([sexe, count]) => {
        csvContent += `${sexe},${count}\n`;
      });
      
      csvContent += `\nRépartition par âge\n`;
      Object.entries(data.statistiques.globales.parAge || {}).forEach(([age, count]) => {
        csvContent += `${age},${count}\n`;
      });
    }

    // Statistiques par type
    if (data.statistiques.parType?.typesDemandeStats) {
      csvContent += `\n\nSTATISTIQUES PAR TYPE DE DEMANDE\n`;
      Object.entries(data.statistiques.parType.typesDemandeStats).forEach(([type, stats]) => {
        csvContent += `\n${type}\n`;
        csvContent += `Total,${stats.total}\n`;
        csvContent += `Statuts:\n`;
        Object.entries(stats.parStatut || {}).forEach(([statut, count]) => {
          csvContent += `  ${statut},${count}\n`;
        });
      });
    }

    // Données démographiques
    if (data.statistiques.demographiques) {
      csvContent += `\n\nDONNÉES DÉMOGRAPHIQUES\n`;
      csvContent += `Âge moyen par type:\n`;
      Object.entries(data.statistiques.demographiques.ageMoyenParType || {}).forEach(([type, age]) => {
        csvContent += `${type},${Math.round(age * 10) / 10} ans\n`;
      });
    }

    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `statistiques_RECEPTIONNISTE_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Export Excel terminé ! Le fichier a été téléchargé.');
  };

  // ✅ EXPORT PDF FONCTIONNEL (HTML vers PDF via impression)
  const exportToPDF = async (data) => {
    // Créer une nouvelle fenêtre avec le contenu formaté
    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Statistiques GED RECEPTIONNISTE - ${new Date().toLocaleDateString('fr-FR')}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
            .header h1 { color: #3b82f6; }
            .section { margin-bottom: 30px; }
            .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
            .stat-number { font-size: 2em; font-weight: bold; color: #3b82f6; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .footer { margin-top: 50px; text-align: center; font-size: 0.9em; color: #666; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rapport Statistiques GED - RECEPTIONNISTE</h1>
            <p>Date d'export: ${new Date().toLocaleDateString('fr-FR')}</p>
            <p>Exporté par: ${data.utilisateur.prenom || ''} ${data.utilisateur.nom || ''}</p>
          </div>

          <div class="section">
            <h2>Statistiques Globales</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">${data.statistiques.globales?.total || 0}</div>
                <div>Total dossiers</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${data.statistiques.globales?.parStatut?.APPROUVE || 0}</div>
                <div>Approuvés</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">${data.statistiques.globales?.parStatut?.REJETE || 0}</div>
                <div>Rejetés</div>
              </div>
            </div>

            <h3>Répartition par statut</h3>
            <table>
              <thead>
                <tr><th>Statut</th><th>Nombre</th></tr>
              </thead>
              <tbody>
                ${Object.entries(data.statistiques.globales?.parStatut || {}).map(([statut, count]) => 
                  `<tr><td>${statut}</td><td>${count}</td></tr>`
                ).join('')}
              </tbody>
            </table>

            <h3>Répartition par sexe</h3>
            <table>
              <thead>
                <tr><th>Sexe</th><th>Nombre</th></tr>
              </thead>
              <tbody>
                ${Object.entries(data.statistiques.globales?.parSexe || {}).map(([sexe, count]) => 
                  `<tr><td>${sexe}</td><td>${count}</td></tr>`
                ).join('')}
              </tbody>
            </table>
          </div>

          ${data.statistiques.parType?.typesDemandeStats ? `
          <div class="section">
            <h2>Statistiques par Type de Demande</h2>
            ${Object.entries(data.statistiques.parType.typesDemandeStats).map(([type, stats]) => `
              <h3>${type}</h3>
              <p><strong>Total:</strong> ${stats.total}</p>
              <table>
                <thead>
                  <tr><th>Statut</th><th>Nombre</th></tr>
                </thead>
                <tbody>
                  ${Object.entries(stats.parStatut || {}).map(([statut, count]) => 
                    `<tr><td>${statut}</td><td>${count}</td></tr>`
                  ).join('')}
                </tbody>
              </table>
            `).join('')}
          </div>
          ` : ''}

          <div class="footer">
            <p>Rapport généré automatiquement par le système GED - RECEPTIONNISTE</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé puis ouvrir la boîte de dialogue d'impression
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    
    alert('Export PDF lancé ! Utilisez la boîte de dialogue d\'impression pour sauvegarder en PDF.');
  };

  // ✅ EXPORT CSV SIMPLE
  const exportToCSV = async (data) => {
    let csvContent = 'Type,Statut,Nombre\n';
    
    // Ajouter les données globales
    Object.entries(data.statistiques.globales?.parStatut || {}).forEach(([statut, count]) => {
      csvContent += `Global,${statut},${count}\n`;
    });

    // Ajouter les données par type
    if (data.statistiques.parType?.typesDemandeStats) {
      Object.entries(data.statistiques.parType.typesDemandeStats).forEach(([type, stats]) => {
        Object.entries(stats.parStatut || {}).forEach(([statut, count]) => {
          csvContent += `${type},${statut},${count}\n`;
        });
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `statistiques_receptionniste_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Export CSV terminé !');
  };

  const exportCandidatesByType = async (typeLibelle, format = 'excel') => {
    setExportingType(typeLibelle);
    
    try {
      const token = localStorage.getItem('token');
      const candidats = candidatsApprouves[typeLibelle] || [];
      
      if (candidats.length === 0) {
        alert('Aucun candidat approuvé pour ce type de demande');
        return;
      }

      const exportData = {
        date: new Date().toISOString(),
        utilisateur: JSON.parse(localStorage.getItem('user') || '{}'),
        typeLibelle: typeLibelle,
        candidats: candidats
      };

      if (format === 'excel') {
        await exportCandidatsToExcel(exportData);
      } else if (format === 'csv') {
        await exportCandidatsToCSV(exportData);
      } else if (format === 'pdf') {
        await exportCandidatsToPDF(exportData);
      }
      
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      alert('Erreur lors de l\'export des candidats');
    } finally {
      setExportingType(null);
    }
  };

  // Export Excel pour candidats
  const exportCandidatsToExcel = async (data) => {
    let csvContent = '';
    
    // En-tête du rapport
    csvContent += `Liste des Candidats Approuvés - ${data.typeLibelle} (RECEPTIONNISTE)\n`;
    csvContent += `Date d'export: ${new Date().toLocaleDateString('fr-FR')}\n`;
    csvContent += `Exporté par: ${data.utilisateur.prenom} ${data.utilisateur.nom}\n`;
    csvContent += `Nombre de candidats: ${data.candidats.length}\n\n`;

    // En-têtes du tableau
    csvContent += `Numéro Dossier,Nom,Prénom,Sexe,Âge,Date de création\n`;
    
    // Données des candidats
    data.candidats.forEach(candidat => {
      csvContent += `${candidat.numeroDossier || ''},`;
      csvContent += `${candidat.nom || ''},`;
      csvContent += `${candidat.prenom || ''},`;
      csvContent += `${candidat.sexe || ''},`;
      csvContent += `${candidat.age || ''},`;
      csvContent += `${candidat.dateCreation ? new Date(candidat.dateCreation).toLocaleDateString('fr-FR') : ''}\n`;
    });

    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `candidats_RECEPTIONNISTE_${data.typeLibelle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Export Excel terminé ! Le fichier a été téléchargé.');
  };

  // Export CSV pour candidats
  const exportCandidatsToCSV = async (data) => {
    let csvContent = 'Numéro Dossier,Nom,Prénom,Sexe,Âge,Date de création\n';
    
    data.candidats.forEach(candidat => {
      csvContent += `${candidat.numeroDossier || ''},`;
      csvContent += `${candidat.nom || ''},`;
      csvContent += `${candidat.prenom || ''},`;
      csvContent += `${candidat.sexe || ''},`;
      csvContent += `${candidat.age || ''},`;
      csvContent += `${candidat.dateCreation ? new Date(candidat.dateCreation).toLocaleDateString('fr-FR') : ''}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `candidats_receptionniste_${data.typeLibelle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert('Export CSV terminé !');
  };

  const exportCandidatsToPDF = async (data) => {
    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Liste Candidats Approuvés - ${data.typeLibelle} (RECEPTIONNISTE)</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
            .header h1 { color: #3b82f6; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px 8px; text-align: left; }
            th { background-color: #3b82f6; color: white; font-weight: bold; }
            tr:nth-child(even) { background-color: #f8f9fa; }
            .sexe-badge { display: inline-block; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; color: white; }
            .sexe-m { background-color: #3b82f6; }
            .sexe-f { background-color: #e83e8c; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Liste des Candidats Approuvés - RECEPTIONNISTE</h1>
            <h2 style="color: #3b82f6; margin: 10px 0;">${data.typeLibelle}</h2>
            <p>Date d'export: ${new Date().toLocaleDateString('fr-FR')}</p>
            <p>Exporté par: ${data.utilisateur.prenom || ''} ${data.utilisateur.nom || ''}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Numéro Dossier</th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Sexe</th>
                <th>Âge</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${data.candidats.map((candidat) => `
                <tr>
                  <td><strong>${candidat.numeroDossier || '-'}</strong></td>
                  <td>${candidat.nom || '-'}</td>
                  <td>${candidat.prenom || '-'}</td>
                  <td>
                    <span class="sexe-badge ${candidat.sexe === 'MASCULIN' ? 'sexe-m' : candidat.sexe === 'FEMININ' ? 'sexe-f' : ''}">
                      ${candidat.sexe === 'MASCULIN' ? 'M' : candidat.sexe === 'FEMININ' ? 'F' : '-'}
                    </span>
                  </td>
                  <td>${candidat.age || '-'} ans</td>
                  <td>${candidat.dateCreation ? new Date(candidat.dateCreation).toLocaleDateString('fr-FR') : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            <p>Document généré automatiquement par le système GED - RECEPTIONNISTE</p>
            <p>Type: ${data.typeLibelle} | Total: ${data.candidats.length} candidat(s)</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
    
    alert('Export PDF lancé ! Utilisez la boîte de dialogue d\'impression pour sauvegarder en PDF.');
  };

  // Transformation des données pour les graphiques
  const transformStatutData = (parStatut) => {
    return Object.entries(parStatut || {}).map(([statut, count]) => ({
      name: statut,
      value: count,
      fill: COLORS[statut] || '#6b7280'
    }));
  };

  const transformSexeData = (parSexe) => {
    return Object.entries(parSexe || {})
      .filter(([sexe, count]) => sexe !== 'AUTRE')
      .map(([sexe, count]) => ({
        name: sexe,
        value: count,
        fill: COLORS[sexe] || '#6b7280'
      }));
  };

  const transformAgeData = (parAge) => {
    const ordreCorrect = ["18-25", "26-35", "36-45", "46-55", "56+"];
    
    return ordreCorrect.map(tranche => ({
      tranche,
      nombre: parAge[tranche] || 0
    }));
  };

  // Composant d'onglet
  const TabButton = ({ id, label, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );

  // Composant de carte statistique (thème bleu)
  const StatCard = ({ title, value, subtitle, color = 'blue' }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${color}-500`}>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-red-50 p-6 rounded-md border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Erreur d'accès aux statistiques
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <div className="mt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-100 px-4 py-2 rounded-md text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Réessayer
                  </button>
                  <button
                    onClick={() => router.push('/receptionniste')}
                    className="ml-3 bg-gray-100 px-4 py-2 rounded-md text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Retour à l'accueil
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tableau de bord statistiques - Réceptionniste</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble des dossiers et données démographiques</p>
      </div>

      {/* Navigation par onglets */}
      <div className="flex space-x-4 mb-8">
        <TabButton
          id="globales"
          label="Vue d'ensemble"
          active={ongletActif === 'globales'}
          onClick={setOngletActif}
        />
        <TabButton
          id="par-type"
          label="Par type de demande"
          active={ongletActif === 'par-type'}
          onClick={setOngletActif}
        />
        <TabButton
          id="demographiques"
          label="Données démographiques"
          active={ongletActif === 'demographiques'}
          onClick={setOngletActif}
        />
        <TabButton
          id="candidats-approuves"
          label="Candidats approuvés"
          active={ongletActif === 'candidats-approuves'}
          onClick={setOngletActif}
        />
      </div>

      {/* Contenu selon l'onglet actif */}
      {ongletActif === 'globales' && statsGlobales && (
        <div className="space-y-8">
          {/* Cartes récapitulatives */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total dossiers"
              value={statsGlobales.total}
              color="blue"
            />
            <StatCard
              title="Approuvés"
              value={statsGlobales.parStatut.APPROUVE || 0}
              color="green"
            />
            <StatCard
              title="En attente"
              value={(statsGlobales.parStatut.SOUMIS || 0) + (statsGlobales.parStatut.COMPLET || 0)}
              color="yellow"
            />
            <StatCard
              title="Rejetés"
              value={statsGlobales.parStatut.REJETE || 0}
              color="red"
            />
          </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Répartition par statut */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Répartition par statut</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={transformStatutData(statsGlobales.parStatut)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {transformStatutData(statsGlobales.parStatut).map((entry, index) => (
                      <Cell key={`statut-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Répartition par sexe */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Répartition par sexe</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={transformSexeData(statsGlobales.parSexe)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {transformSexeData(statsGlobales.parSexe).map((entry, index) => (
                      <Cell key={`sexe-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Répartition par âge */}
            <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Répartition par tranche d'âge</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transformAgeData(statsGlobales.parAge)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tranche" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="nombre" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Onglet Par type de demande */}
      {ongletActif === 'par-type' && statsParType && (
        <div className="space-y-8">
          <div className="grid gap-8">
            {Object.entries(statsParType.typesDemandeStats || {}).map(([typeLabel, typeStats]) => (
              <div key={typeLabel} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-6 text-gray-800">{typeLabel}</h3>
                
                {/* Cartes récapitulatives pour ce type */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                  <StatCard
                    title="Total"
                    value={typeStats.total}
                    color="blue"
                  />
                  <StatCard
                    title="Approuvés"
                    value={typeStats.parStatut.APPROUVE || 0}
                    color="green"
                  />
                  <StatCard
                    title="En cours"
                    value={typeStats.parStatut.EN_COURS || 0}
                    color="purple"
                  />
                  <StatCard
                    title="Rejetés"
                    value={typeStats.parStatut.REJETE || 0}
                    color="red"
                  />
                  <StatCard
                    title="Candidats retenus"
                    value={typeStats.nombreCandidatsApprouves || 0}
                    color="green"
                  />
                </div>

                {/* Graphiques pour ce type */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Statuts pour ce type */}
                  <div>
                    <h4 className="text-lg font-medium mb-3">Statuts</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={transformStatutData(typeStats.parStatut)}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          dataKey="value"
                        >
                          {transformStatutData(typeStats.parStatut).map((entry, index) => (
                            <Cell key={`statut-${typeLabel}-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Sexes pour ce type */}
                  <div>
                    <h4 className="text-lg font-medium mb-3">Répartition H/F</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={transformSexeData(typeStats.parSexe)}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          dataKey="value"
                        >
                          {transformSexeData(typeStats.parSexe).map((entry, index) => (
                            <Cell key={`sexe-${typeLabel}-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Âges pour ce type */}
                  <div>
                    <h4 className="text-lg font-medium mb-3">Tranches d'âge</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={transformAgeData(typeStats.parAge)}>
                        <XAxis dataKey="tranche" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="nombre" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onglet Données démographiques */}
      {ongletActif === 'demographiques' && statsDemographiques && (
        <div className="space-y-8">
          {/* Répartition hommes/femmes par type de demande */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-6">Répartition hommes/femmes par type de demande</h3>
            <div className="grid gap-6">
              {Object.entries(statsDemographiques.repartitionSexeParType || {}).map(([typeLabel, sexeStats]) => (
                <div key={typeLabel} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h4 className="text-lg font-medium mb-3">{typeLabel}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{sexeStats.MASCULIN || 0}</p>
                      <p className="text-sm text-gray-600">Hommes</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-pink-600">{sexeStats.FEMININ || 0}</p>
                      <p className="text-sm text-gray-600">Femmes</p>
                    </div>
                  </div>
                  
                  {/* Barre de progression */}
                  <div className="mt-3">
                    {(() => {
                      const total = (sexeStats.MASCULIN || 0) + (sexeStats.FEMININ || 0);
                      const pctHommes = total > 0 ? ((sexeStats.MASCULIN || 0) / total * 100) : 0;
                      const pctFemmes = total > 0 ? ((sexeStats.FEMININ || 0) / total * 100) : 0;
                      
                      return (
                        <div className="w-full bg-gray-200 rounded-full h-3 flex overflow-hidden">
                          <div className="bg-blue-500 h-full" style={{ width: `${pctHommes}%` }}></div>
                          <div className="bg-pink-500 h-full" style={{ width: `${pctFemmes}%` }}></div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Âge moyen par type de demande */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-6">Âge moyen par type de demande</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={Object.entries(statsDemographiques.ageMoyenParType || {}).map(([type, age]) => ({
                  type,
                  ageMoyen: Math.round(age * 10) / 10
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} ans`, 'Âge moyen']} />
                <Legend />
                <Bar dataKey="ageMoyen" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ✅ NOUVEL ONGLET : Candidats approuvés */}
      {ongletActif === 'candidats-approuves' && (
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-6">Liste des candidats approuvés par type de demande</h3>
            
            {/* Vérifier si les données sont disponibles */}
            {Object.entries(candidatsApprouves).length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center justify-center">
                    <svg className="h-8 w-8 text-yellow-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="text-lg font-medium text-yellow-800">Aucun candidat approuvé trouvé</h4>
                      <p className="text-yellow-700 mt-1">
                        Il n'y a actuellement aucun candidat avec un dossier approuvé, ou cette fonctionnalité n'est pas encore disponible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(candidatsApprouves).map(([typeLabel, candidats]) => (
                  <div key={typeLabel} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-800">{typeLabel}</h4>
                      <div className="flex space-x-2">
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                          {candidats.length} candidat{candidats.length > 1 ? 's' : ''} approuvé{candidats.length > 1 ? 's' : ''}
                        </span>
                        <button
                          onClick={() => exportCandidatesByType(typeLabel, 'excel')}
                          disabled={exportingType === typeLabel}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {exportingType === typeLabel ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          ) : (
                            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          Excel
                        </button>
                        <button
                          onClick={() => exportCandidatesByType(typeLabel, 'csv')}
                          disabled={exportingType === typeLabel}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {exportingType === typeLabel ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          ) : (
                            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          CSV
                        </button>
                        <button
                          onClick={() => exportCandidatesByType(typeLabel, 'pdf')}
                          disabled={exportingType === typeLabel}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                          {exportingType === typeLabel ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          ) : (
                            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                          PDF
                        </button>
                      </div>
                    </div>
                    
                    {candidats.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-gray-500">Aucun candidat approuvé pour ce type de demande</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Numéro Dossier
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Nom
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Prénom
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sexe
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Âge
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {candidats.map((candidat, index) => (
                              <tr key={candidat.id || index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {candidat.numeroDossier || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {candidat.nom || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {candidat.prenom || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    candidat.sexe === 'MASCULIN' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : candidat.sexe === 'FEMININ'
                                      ? 'bg-pink-100 text-pink-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {candidat.sexe === 'MASCULIN' ? 'M' : candidat.sexe === 'FEMININ' ? 'F' : '-'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {candidat.age || '-'} ans
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {candidat.dateCreation ? new Date(candidat.dateCreation).toLocaleDateString('fr-FR') : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ BOUTONS D'EXPORT FONCTIONNELS - Thème bleu */}
      <div className="mt-8 flex justify-end space-x-3">
        <div className="flex space-x-2">
          <button
            onClick={() => exportStatistics('csv')}
            disabled={exporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {exporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            Export CSV
          </button>

          <button
            onClick={() => exportStatistics('excel')}
            disabled={exporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {exporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
            Export Excel
          </button>

          <button
            onClick={() => exportStatistics('pdf')}
            disabled={exporting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {exporting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            )}
            Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}