// src/app/admin/statistiques/page.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Statistiques() {
  const router = useRouter();
  
  // États pour gérer les données
  const [statsGlobales, setStatsGlobales] = useState(null);
  const [statsParType, setStatsParType] = useState(null);
  const [statsDemographiques, setStatsDemographiques] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ongletActif, setOngletActif] = useState('globales');

  // Couleurs pour les graphiques
  const COLORS = {
    SOUMIS: '#fbbf24',      // jaune
    COMPLET: '#3b82f6',     // bleu
    INCOMPLET: '#ef4444',   // rouge
    EN_COURS: '#8b5cf6',    // violet
    APPROUVE: '#10b981',    // vert
    REJETE: '#6b7280',      // gris
    MASCULIN: '#3b82f6',    // bleu
    FEMININ: '#ec4899',     // rose
    AUTRE: '#6b7280'        // gris
  };

  // Charger les données au montage du composant
  useEffect(() => {
    const fetchStatistiques = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Chargement parallèle de toutes les statistiques
        const [globalesRes, parTypeRes, demographiquesRes] = await Promise.all([
          axios.get('/api/statistiques/globales', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/statistiques/par-type-demande', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/statistiques/demographiques', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setStatsGlobales(globalesRes.data);
        setStatsParType(parTypeRes.data);
        setStatsDemographiques(demographiquesRes.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError('Impossible de charger les statistiques. Vérifiez vos droits d\'accès.');
        setLoading(false);
      }
    };

    fetchStatistiques();
  }, [router]);

  // Transformation des données pour les graphiques
  const transformStatutData = (parStatut) => {
    return Object.entries(parStatut || {}).map(([statut, count]) => ({
      name: statut,
      value: count,
      fill: COLORS[statut] || '#6b7280'
    }));
  };

  const transformSexeData = (parSexe) => {
    // ✅ Filtrer pour enlever "AUTRE"
    return Object.entries(parSexe || {})
      .filter(([sexe, count]) => sexe !== 'AUTRE')
      .map(([sexe, count]) => ({
        name: sexe,
        value: count,
        fill: COLORS[sexe] || '#6b7280'
      }));
  };

  const transformAgeData = (parAge) => {
    // ✅ Définir l'ordre correct des tranches d'âge
    const ordreCorrect = ["18-25", "26-35", "36-45", "46-55", "56+"];
    
    // Créer un objet ordonné selon l'ordre souhaité
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

  // Composant de carte statistique
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
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6">
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Tableau de bord statistiques</h1>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <Bar dataKey="ageMoyen" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tableau récapitulatif */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-6">Tableau récapitulatif</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type de demande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total dossiers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % Hommes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % Femmes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Âge moyen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(statsDemographiques.repartitionSexeParType || {}).map(([typeLabel, sexeStats]) => {
                    const total = (sexeStats.MASCULIN || 0) + (sexeStats.FEMININ || 0);
                    const pctHommes = total > 0 ? Math.round((sexeStats.MASCULIN || 0) / total * 100) : 0;
                    const pctFemmes = total > 0 ? Math.round((sexeStats.FEMININ || 0) / total * 100) : 0;
                    const ageMoyen = statsDemographiques.ageMoyenParType?.[typeLabel] || 0;
                    
                    return (
                      <tr key={typeLabel}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {typeLabel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {total}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pctHommes}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pctFemmes}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {Math.round(ageMoyen * 10) / 10} ans
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bouton d'export (optionnel) */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => {
            console.log('Export des statistiques...');
          }}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter les statistiques
          </div>
        </button>
      </div>
    </div>
  );
}