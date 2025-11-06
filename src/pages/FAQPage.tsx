import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import SEO from '../components/SEO';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const faqs: FAQItem[] = [
    {
      category: 'Réservation',
      question: 'Comment réserver un photobooth ?',
      answer: 'Vous pouvez réserver directement en ligne via notre page de réservation. Sélectionnez votre modèle de photobooth, la date et l\'heure de votre événement, puis remplissez vos coordonnées. Notre équipe vous contactera sous 24h pour confirmer.'
    },
    {
      category: 'Réservation',
      question: 'Quel est le délai minimum de réservation ?',
      answer: 'Nous recommandons de réserver au moins 2 semaines à l\'avance pour garantir la disponibilité du modèle souhaité. Cependant, pour les réservations urgentes, contactez-nous directement, nous ferons de notre mieux pour vous accommoder.'
    },
    {
      category: 'Réservation',
      question: 'Puis-je annuler ou modifier ma réservation ?',
      answer: 'Oui, les modifications et annulations sont possibles jusqu\'à 7 jours avant l\'événement. L\'acompte de 30% est remboursable en cas d\'annulation dans ce délai. Contactez-nous pour toute modification.'
    },
    {
      category: 'Tarifs',
      question: 'Quels sont les tarifs de location ?',
      answer: 'Nos tarifs varient selon le modèle choisi et la durée de location. Le Premium Booth commence à 650€ pour 4 heures, le Mirror Booth à 750€, et le 360° Booth à 950€. Des forfaits personnalisés sont disponibles pour les événements plus longs.'
    },
    {
      category: 'Tarifs',
      question: 'Y a-t-il des frais supplémentaires ?',
      answer: 'Le prix inclut l\'installation, l\'animateur, les accessoires et les tirages illimités. Des frais de déplacement peuvent s\'appliquer pour les événements en dehors de Paris (au-delà de 50km). Personnalisation spéciale et décors sur mesure disponibles en supplément.'
    },
    {
      category: 'Tarifs',
      question: 'Faut-il verser un acompte ?',
      answer: 'Oui, un acompte de 30% est demandé pour confirmer votre réservation. Le solde est à régler le jour de l\'événement. Nous acceptons les paiements par carte bancaire, virement et espèces.'
    },
    {
      category: 'Technique',
      question: 'Quelle surface est nécessaire pour installer un photobooth ?',
      answer: 'Un espace de 3m x 3m minimum est recommandé pour le Premium et Mirror Booth. Le 360° Booth nécessite un espace de 4m x 4m pour permettre la rotation complète. Nous vous conseillons lors de la réservation.'
    },
    {
      category: 'Technique',
      question: 'Avez-vous besoin d\'une prise électrique ?',
      answer: 'Oui, une prise électrique standard 220V est nécessaire à proximité de l\'installation (maximum 5m). Nos équipements sont peu consommateurs d\'énergie. Pour les événements en extérieur sans accès électrique, contactez-nous pour des solutions alternatives.'
    },
    {
      category: 'Technique',
      question: 'Le photobooth fonctionne-t-il en extérieur ?',
      answer: 'Oui, nos photobooths peuvent être installés en extérieur si les conditions météorologiques le permettent. Nous recommandons un abri (tente, pergola) pour protéger l\'équipement de la pluie et du soleil direct. Contactez-nous pour évaluer la faisabilité.'
    },
    {
      category: 'Service',
      question: 'Un animateur est-il fourni ?',
      answer: 'Oui, un animateur professionnel est présent durant toute la durée de location. Il s\'occupe de l\'installation, aide vos invités, gère l\'équipement et assure le bon déroulement. Notre équipe est souriante et discrète.'
    },
    {
      category: 'Service',
      question: 'Peut-on personnaliser les photos ?',
      answer: 'Absolument ! Nous offrons la personnalisation avec votre logo, vos couleurs, des messages personnalisés et des cadres thématiques. Envoyez-nous vos éléments graphiques au moins 5 jours avant l\'événement pour la création.'
    },
    {
      category: 'Service',
      question: 'Les photos sont-elles imprimées immédiatement ?',
      answer: 'Oui, les photos sont imprimées en 10 secondes environ après la prise de vue. Vos invités repartent avec leurs souvenirs instantanément. Les tirages sont de qualité professionnelle sur papier photo résistant.'
    },
    {
      category: 'Service',
      question: 'Peut-on partager les photos sur les réseaux sociaux ?',
      answer: 'Oui, tous nos photobooths offrent le partage instantané par email, SMS et réseaux sociaux (Facebook, Instagram, Twitter). Vos invités peuvent aussi télécharger leurs photos via QR code. Toutes les photos sont également accessibles en ligne après l\'événement.'
    },
    {
      category: 'Accessoires',
      question: 'Des accessoires sont-ils fournis ?',
      answer: 'Oui, nous fournissons une large sélection d\'accessoires amusants : chapeaux, lunettes, moustaches, pancartes, boas, etc. Plus de 50 accessoires variés adaptés à votre type d\'événement. Accessoires personnalisés disponibles sur demande.'
    },
    {
      category: 'Accessoires',
      question: 'Puis-je apporter mes propres accessoires ?',
      answer: 'Bien sûr ! Vous pouvez apporter vos propres accessoires personnalisés ou thématiques. Nous les intégrerons à notre collection. C\'est un excellent moyen d\'ajouter une touche personnelle à votre événement.'
    }
  ];

  const categories = ['all', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFAQs = selectedCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <div>
      <SEO
        title="FAQ - Questions Fréquentes sur la Location de Photobooth | PixBooth"
        description="Toutes les réponses à vos questions sur la location de photobooths : tarifs, réservation, installation, personnalisation et services. Conseils d'experts PixBooth."
        keywords="faq photobooth, questions photobooth, tarif location photobooth, comment réserver photobooth, installation photobooth, personnalisation photos"
        url="/faq"
        structuredData={structuredData}
      />

      <div className="bg-accent-purple text-white py-16">
        <div className="container-custom">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center">Questions Fréquentes</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto text-center">
            Trouvez toutes les réponses à vos questions sur nos services de location de photobooths.
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              {category === 'all' ? 'Toutes' : category}
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {filteredFAQs.map((faq, index) => (
            <motion.div
              key={index}
              className="card overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 pr-4">
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-2">
                    {faq.category}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="flex-shrink-0 text-primary" size={24} />
                ) : (
                  <ChevronDown className="flex-shrink-0 text-gray-400" size={24} />
                )}
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto mt-12 card p-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-l-4 border-primary">
          <h2 className="text-2xl font-bold mb-4">Vous ne trouvez pas votre réponse ?</h2>
          <p className="text-gray-600 mb-6">
            Notre équipe est là pour répondre à toutes vos questions spécifiques.
            N'hésitez pas à nous contacter par téléphone, email ou via notre formulaire de contact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="/contact" className="btn-primary">
              Nous Contacter
            </a>
            <a href="/booking" className="btn-outline">
              Faire une Réservation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
