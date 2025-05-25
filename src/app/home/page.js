'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  
  // Données des filières disponibles
  const filieres = [
    {
      id: 1,
      titre: "Licence 1 Informatique",
      description: "Formation initiale en informatique préparant aux métiers du numérique.",
      admissionCriteres: "Baccalauréat scientifique ou équivalent",
      imageIcon: "🖥️"
    },
    {
      id: 2,
      titre: "Master 1 SIR",
      description: "Systèmes d'Information et Réseaux - Formation avancée pour les spécialistes en systèmes d'information et infrastructure réseau.",
      admissionCriteres: "Licence en informatique ou domaine connexe",
      imageIcon: "🌐"
    },
    {
      id: 3,
      titre: "Master 1 RETEL",
      description: "Réseaux de Télécommunications - Spécialisation dans les technologies de télécommunication et réseaux.",
      admissionCriteres: "Licence en informatique, télécommunications ou électronique",
      imageIcon: "📡"
    },
    {
      id: 4,
      titre: "Master 2 BI",
      description: "Business Intelligence - Formation aux techniques avancées d'analyse de données pour l'aide à la décision.",
      admissionCriteres: "Master 1 en informatique, mathématiques ou statistiques",
      imageIcon: "📊"
    },
    {
      id: 5,
      titre: "Master 2 Bio-informatique",
      description: "Application des méthodes informatiques aux données biologiques et génomiques.",
      admissionCriteres: "Master 1 en informatique, biologie ou domaine connexe",
      imageIcon: "🧬"
    }
  ];

  // État pour la filière sélectionnée
  const [filiereSelectionnee, setFiliereSelectionnee] = useState(null);

  return (
    <div className="min-h-screen bg-white">
      {/* En-tête moderne */}
      <header className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-full p-3 mr-4 shadow-lg transform hover:scale-105 transition-transform">
                <div className="text-blue-900 font-bold text-xl">UCAD</div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                  Université Cheikh Anta Diop
                </h1>
                <p className="text-sm md:text-base text-blue-100 font-medium">
                  Faculté des Sciences et Techniques - Département Mathématiques-Informatique
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/register')}
                className="bg-gradient-to-r from-white to-blue-50 text-blue-900 font-bold px-8 py-3 rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300 transform"
              >
                🎓 Déposer ma candidature
              </button>
              <button
                onClick={() => router.push('/login')}
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-full hover:bg-white hover:text-blue-900 transition-all duration-300 font-semibold"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section avec image moderne */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-20 overflow-hidden">
        {/* Motifs de fond décoratifs */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-48 -translate-y-48"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300 rounded-full translate-x-48 translate-y-48"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-blue-200">
                    Formation d'Excellence
                  </span>
                  <br />
                  <span className="text-blue-100">en Informatique</span>
                </h2>
                
                <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed font-light">
                  Le Département Mathématiques-Informatique de l'UCAD propose des formations de qualité 
                  <span className="font-semibold text-white"> adaptées aux besoins du marché</span> et aux 
                  enjeux technologiques actuels.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/register')}
                  className="bg-gradient-to-r from-white to-blue-50 text-blue-900 text-lg font-bold px-8 py-4 rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 transform flex items-center justify-center group"
                >
                  <span className="mr-2">🚀</span>
                  Déposer ma candidature
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </button>
                
                <button className="border-2 border-white text-white px-8 py-4 rounded-full hover:bg-white hover:text-blue-900 transition-all duration-300 font-semibold">
                  📋 Découvrir nos formations
                </button>
              </div>
              
              {/* Statistiques impressionnantes */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-blue-700">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">500+</div>
                  <div className="text-blue-200 text-sm">Diplômés par an</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">85%</div>
                  <div className="text-blue-200 text-sm">Taux d'insertion</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">20+</div>
                  <div className="text-blue-200 text-sm">Partenaires</div>
                </div>
              </div>
            </div>
            
            {/* Image des étudiants */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent z-10"></div>
                <img 
                  src="https://img.freepik.com/photos-gratuite/collegues-plan-moyen-posant-ensemble_23-2148950574.jpg"
                  alt="Étudiants de l'UCAD"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4">
                    <p className="text-blue-900 font-semibold">Nos étudiants excellents</p>
                    <p className="text-blue-700 text-sm">Rejoignez une communauté d'apprenants passionnés</p>
                  </div>
                </div>
              </div>
              
              {/* Éléments décoratifs flottants */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-full opacity-80 animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-full opacity-70 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section de présentation modernisée */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              🏛️ Notre Excellence
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Pourquoi choisir l'UCAD ?
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Le Département Mathématiques-Informatique de l'UCAD est reconnu pour la qualité de son enseignement 
              et de sa recherche. Nos programmes sont conçus pour préparer les étudiants aux défis du monde numérique.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl text-white">👨‍🏫</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Corps enseignant qualifié</h3>
              <p className="text-gray-600 leading-relaxed">
                Nos enseignants-chercheurs sont des experts reconnus dans leurs domaines respectifs, 
                alliant expertise académique et expérience professionnelle.
              </p>
            </div>
            
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl text-white">🔬</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Recherche innovante</h3>
              <p className="text-gray-600 leading-relaxed">
                Nos laboratoires de recherche travaillent sur des projets à la pointe de la technologie, 
                offrant aux étudiants un accès privilégié à l'innovation.
              </p>
            </div>
            
            <div className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-3xl text-white">🌍</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Partenariats internationaux</h3>
              <p className="text-gray-600 leading-relaxed">
                Nous collaborons avec des universités et entreprises du monde entier, 
                ouvrant des perspectives internationales à nos étudiants.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section des filières conservée */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              🎓 Formations
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Nos filières</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez nos formations et trouvez celle qui correspond à votre projet professionnel.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filieres.map((filiere) => (
              <div 
                key={filiere.id} 
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-100"
                onClick={() => setFiliereSelectionnee(filiere)}
              >
                <div className="p-8">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="text-3xl">{filiere.imageIcon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-blue-900 group-hover:text-blue-700 transition-colors">
                    {filiere.titre}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{filiere.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      <span className="font-semibold">Critères:</span> {filiere.admissionCriteres}
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 font-semibold group-hover:translate-x-1 transition-transform">
                      En savoir plus →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bouton de candidature après présentation des filières */}
          <div className="mt-16 text-center">
            <button
              onClick={() => router.push('/register')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold px-12 py-4 rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 transform"
            >
              🚀 Déposer ma candidature
            </button>
          </div>
        </div>
      </section>

      {/* Section témoignages avec image */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
        {/* Motifs de fond */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 -translate-y-48"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-300 rounded-full -translate-x-48 translate-y-48"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image des étudiants en cours */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent z-10"></div>
                <img 
                  src="https://media.istockphoto.com/id/1334063560/fr/photo/les-%C3%A9tudiants-afro-am%C3%A9ricains-se-penchent-en-e-penchant-avec-leur-professeur-pendant-un-cours.jpg"
                  alt="Étudiants en cours à l'UCAD"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4">
                    <p className="text-blue-900 font-semibold">Excellence pédagogique</p>
                    <p className="text-blue-700 text-sm">Un accompagnement personnalisé pour chaque étudiant</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Témoignages */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <div className="inline-block bg-white/20 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                  💬 Témoignages
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  Ce que disent nos étudiants
                </h2>
                <p className="text-xl text-blue-100 leading-relaxed">
                  Découvrez les expériences de nos anciens étudiants et leur réussite professionnelle.
                </p>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-br from-blue-400 to-blue-600 h-14 w-14 rounded-full flex items-center justify-center text-white font-bold mr-4 text-lg">
                      MS
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Modou Sall</h3>
                      <p className="text-blue-200 text-sm">Diplômé Master BI, Promotion 2023</p>
                    </div>
                  </div>
                  <p className="text-blue-100 italic leading-relaxed">
                    "La formation en Business Intelligence m'a permis d'acquérir des compétences très recherchées sur le marché. 
                    J'ai trouvé un emploi avant même la fin de mon stage de fin d'études."
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-br from-purple-400 to-purple-600 h-14 w-14 rounded-full flex items-center justify-center text-white font-bold mr-4 text-lg">
                      FD
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Fatou Diop</h3>
                      <p className="text-blue-200 text-sm">Diplômée Master RETEL, Promotion 2022</p>
                    </div>
                  </div>
                  <p className="text-blue-100 italic leading-relaxed">
                    "Les enseignements en RETEL sont à la pointe de la technologie. Les travaux pratiques et les projets 
                    m'ont donné une expérience concrète qui fait la différence dans mon métier actuel."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pied de page modernisé */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full p-3 mr-4">
                  <div className="text-white font-bold text-xl">UCAD</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Université Cheikh Anta Diop</h3>
                  <p className="text-gray-400">Excellence académique depuis 1957</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed max-w-md">
                Le Département Mathématiques-Informatique forme les leaders technologiques de demain 
                avec des programmes d'excellence reconnus internationalement.
              </p>
              <div className="flex space-x-4">
                <div className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full transition-colors cursor-pointer">
                  <span className="text-xl">📱</span>
                </div>
                <div className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full transition-colors cursor-pointer">
                  <span className="text-xl">💻</span>
                </div>
                <div className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full transition-colors cursor-pointer">
                  <span className="text-xl">📧</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6 text-blue-400">Contact</h3>
              <div className="space-y-3 text-gray-400">
                <p className="flex items-center"><span className="mr-2">🏢</span>Département Math-Info</p>
                <p className="flex items-center"><span className="mr-2">🏛️</span>Faculté des Sciences et Techniques</p>
                <p className="flex items-center"><span className="mr-2">📍</span>UCAD, Dakar, Sénégal</p>
                <p className="flex items-center"><span className="mr-2">📧</span>contact@ucad.edu.sn</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-6 text-blue-400">Liens utiles</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center"><span className="mr-2">→</span>À propos de l'UCAD</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center"><span className="mr-2">→</span>Faculté des Sciences</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center"><span className="mr-2">→</span>Recherche</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center"><span className="mr-2">→</span>Conditions d'admission</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} Université Cheikh Anta Diop - Département Mathématiques-Informatique. 
              <span className="text-blue-400"> Tous droits réservés.</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Modal pour les détails de filière conservée */}
      {filiereSelectionnee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-3xl font-bold text-blue-900 mb-2">{filiereSelectionnee.titre}</h3>
                  <p className="text-gray-500 text-lg">Département Mathématiques-Informatique</p>
                </div>
                <button 
                  onClick={() => setFiliereSelectionnee(null)}
                  className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
              
              <div className="mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-20 h-20 rounded-3xl flex items-center justify-center mb-6">
                  <span className="text-4xl">{filiereSelectionnee.imageIcon}</span>
                </div>
                <p className="text-gray-600 mb-6 text-lg leading-relaxed">{filiereSelectionnee.description}</p>
                
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl mb-6 border border-blue-100">
                  <h4 className="font-bold mb-3 text-blue-900 text-lg">🎯 Critères d'admission</h4>
                  <p className="text-gray-700">{filiereSelectionnee.admissionCriteres}</p>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-bold mb-4 text-gray-900 text-lg">🚀 Débouchés professionnels</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filiereSelectionnee.id === 1 && (
                      <>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">💻</span>Développeur d'applications</div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">⚙️</span>Administrateur système junior</div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">🔧</span>Technicien informatique</div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">🎧</span>Support technique</div>
                      </>
                    )}
                    {filiereSelectionnee.id === 2 && (
                      <>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">🖥️</span>Administrateur systèmes et réseaux</div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">🏗️</span>Responsable infrastructure IT</div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">🏛️</span>Architecte de systèmes d'information</div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">💼</span>Consultant en systèmes d'information</div>
                      </>
                    )}
                    {filiereSelectionnee.id === 3 && (
                      <>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">📡</span>Ingénieur télécommunications</div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">📱</span>Spécialiste en réseaux mobiles</div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">🌐</span>Architecte réseaux</div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">🏢</span>Responsable infrastructure télécom</div>
                      </>
                    )}
                    {filiereSelectionnee.id === 4 && (
                      <>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">📊</span>Data Analyst</div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">👨‍💼</span>Chef de projet BI</div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">💡</span>Consultant décisionnel</div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">🏗️</span>Architecte de données</div>
                      </>
                    )}
                    {filiereSelectionnee.id === 5 && (
                      <>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">🧬</span>Bio-informaticien</div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">🔬</span>Analyste de données génomiques</div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">👨‍🔬</span>Chercheur en bio-informatique</div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg"><span className="mr-2">📈</span>Data Scientist spécialisé en biologie</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => router.push('/register')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300 transform font-semibold"
                >
                  🚀 Déposer ma candidature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}