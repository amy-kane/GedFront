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
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white rounded-full p-2 mr-3">
                <div className="text-blue-900 font-bold text-xl">UCAD</div>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Université Cheikh Anta Diop</h1>
                <p className="text-sm md:text-base">Faculté des Sciences et Techniques - Département Mathématiques-Informatique</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/register')}
                className="bg-white text-blue-900 font-semibold px-6 py-2 rounded-md hover:bg-blue-100 transition-colors"
              >
                Déposer ma candidature
              </button>
              <button
                onClick={() => router.push('/login')}
                className="bg-transparent border border-white text-white px-4 py-2 rounded-md hover:bg-white hover:text-blue-900 transition-colors"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bannière principale */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Formation d'Excellence en Informatique</h2>
              <p className="text-lg mb-6">
                Le Département Mathématiques-Informatique de l'UCAD propose des formations de qualité adaptées aux besoins du marché et aux enjeux technologiques actuels.
              </p>
              <button
                onClick={() => router.push('/register')}
                className="bg-white text-blue-900 text-lg font-bold px-8 py-3 rounded-md hover:bg-blue-100 transition-colors shadow-lg"
              >
                Déposer ma candidature
              </button>
            </div>
            <div className="hidden md:block">
              {/* Placeholder pour une image - dans un projet réel, remplacez par une image pertinente */}
              <div className="bg-blue-700 h-64 rounded-lg flex items-center justify-center">
                <span className="text-6xl">🎓</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section de présentation */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre département</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Le Département Mathématiques-Informatique de l'UCAD est reconnu pour la qualité de son enseignement et de sa recherche. Nos programmes sont conçus pour préparer les étudiants aux défis du monde numérique.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">👨‍🏫</div>
              <h3 className="text-xl font-semibold mb-2">Corps enseignant qualifié</h3>
              <p className="text-gray-600">
                Nos enseignants-chercheurs sont des experts reconnus dans leurs domaines respectifs.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-xl font-semibold mb-2">Recherche innovante</h3>
              <p className="text-gray-600">
                Nos laboratoires de recherche travaillent sur des projets à la pointe de la technologie.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-2">Partenariats internationaux</h3>
              <p className="text-gray-600">
                Nous collaborons avec des universités et entreprises du monde entier.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section des filières */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos filières</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Découvrez nos formations et trouvez celle qui correspond à votre projet professionnel.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filieres.map((filiere) => (
              <div 
                key={filiere.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setFiliereSelectionnee(filiere)}
              >
                <div className="p-6">
                  <div className="text-4xl mb-4">{filiere.imageIcon}</div>
                  <h3 className="text-xl font-bold mb-2 text-blue-900">{filiere.titre}</h3>
                  <p className="text-gray-600 mb-4">{filiere.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Critères: {filiere.admissionCriteres}</span>
                    <button className="text-blue-600 hover:text-blue-800">
                      En savoir plus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Bouton de candidature après présentation des filières */}
          <div className="mt-12 text-center">
            <button
              onClick={() => router.push('/register')}
              className="bg-blue-600 text-white text-lg font-semibold px-8 py-3 rounded-md hover:bg-blue-700 transition-colors shadow-md"
            >
              Déposer ma candidature
            </button>
          </div>
        </div>
      </section>

      {/* Section témoignages */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Témoignages d'étudiants</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Découvrez ce que nos anciens étudiants pensent de leur formation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-200 h-12 w-12 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4">
                  MS
                </div>
                <div>
                  <h3 className="font-semibold">Modou Sall</h3>
                  <p className="text-sm text-gray-600">Diplômé Master BI, Promotion 2023</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "La formation en Business Intelligence m'a permis d'acquérir des compétences très recherchées sur le marché. J'ai trouvé un emploi avant même la fin de mon stage de fin d'études."
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-200 h-12 w-12 rounded-full flex items-center justify-center text-blue-600 font-bold mr-4">
                  FD
                </div>
                <div>
                  <h3 className="font-semibold">Fatou Diop</h3>
                  <p className="text-sm text-gray-600">Diplômée Master RETEL, Promotion 2022</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "Les enseignements en RETEL sont à la pointe de la technologie. Les travaux pratiques et les projets m'ont donné une expérience concrète qui fait la différence dans mon métier actuel."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pied de page */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-400 mb-2">Département Mathématiques-Informatique</p>
              <p className="text-gray-400 mb-2">Faculté des Sciences et Techniques</p>
              <p className="text-gray-400 mb-2">Université Cheikh Anta Diop</p>
              <p className="text-gray-400">Dakar, Sénégal</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Liens utiles</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">À propos de l'UCAD</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Faculté des Sciences</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Recherche</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Conditions d'admission</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Suivez-nous</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white text-2xl">📱</a>
                <a href="#" className="text-gray-400 hover:text-white text-2xl">💻</a>
                <a href="#" className="text-gray-400 hover:text-white text-2xl">📧</a>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Université Cheikh Anta Diop - Département Mathématiques-Informatique. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Modal pour les détails de filière */}
      {filiereSelectionnee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-blue-900">{filiereSelectionnee.titre}</h3>
                  <p className="text-gray-500">Département Mathématiques-Informatique</p>
                </div>
                <button 
                  onClick={() => setFiliereSelectionnee(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-6">
                <div className="text-5xl mb-4">{filiereSelectionnee.imageIcon}</div>
                <p className="text-gray-600 mb-4">{filiereSelectionnee.description}</p>
                <div className="bg-gray-100 p-4 rounded-md mb-4">
                  <h4 className="font-semibold mb-2">Critères d'admission</h4>
                  <p className="text-gray-600">{filiereSelectionnee.admissionCriteres}</p>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Débouchés professionnels</h4>
                  <ul className="list-disc pl-5 text-gray-600">
                    {filiereSelectionnee.id === 1 && (
                      <>
                        <li>Développeur d'applications</li>
                        <li>Administrateur système junior</li>
                        <li>Technicien informatique</li>
                        <li>Support technique</li>
                      </>
                    )}
                    {filiereSelectionnee.id === 2 && (
                      <>
                        <li>Administrateur systèmes et réseaux</li>
                        <li>Responsable infrastructure IT</li>
                        <li>Architecte de systèmes d'information</li>
                        <li>Consultant en systèmes d'information</li>
                      </>
                    )}
                    {filiereSelectionnee.id === 3 && (
                      <>
                        <li>Ingénieur télécommunications</li>
                        <li>Spécialiste en réseaux mobiles</li>
                        <li>Architecte réseaux</li>
                        <li>Responsable infrastructure télécom</li>
                      </>
                    )}
                    {filiereSelectionnee.id === 4 && (
                      <>
                        <li>Data Analyst</li>
                        <li>Chef de projet BI</li>
                        <li>Consultant décisionnel</li>
                        <li>Architecte de données</li>
                      </>
                    )}
                    {filiereSelectionnee.id === 5 && (
                      <>
                        <li>Bio-informaticien</li>
                        <li>Analyste de données génomiques</li>
                        <li>Chercheur en bio-informatique</li>
                        <li>Data Scientist spécialisé en biologie</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => router.push('/register')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Déposer ma candidature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}