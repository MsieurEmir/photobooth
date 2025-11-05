import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Printer, Users, Gift, Clock, Image } from 'lucide-react';

const features = [
  {
    icon: <Camera className="w-8 h-8 text-primary" />,
    title: "Photobooths Modernes",
    description: "Nos photobooths sont équipés des dernières technologies pour une expérience utilisateur optimale."
  },
  {
    icon: <Printer className="w-8 h-8 text-primary" />,
    title: "Impressions Instantanées",
    description: "Imprimez vos photos en quelques secondes avec une qualité professionnelle."
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Parfait pour Groupes",
    description: "Spacieux pour accueillir vos amis et créer des souvenirs ensemble."
  },
  {
    icon: <Gift className="w-8 h-8 text-primary" />,
    title: "Accessoires Inclus",
    description: "Chapeaux, lunettes et autres accessoires amusants pour des photos mémorables."
  },
  {
    icon: <Clock className="w-8 h-8 text-primary" />,
    title: "Service Rapide",
    description: "Installation et démontage rapides par notre équipe professionnelle."
  },
  {
    icon: <Image className="w-8 h-8 text-primary" />,
    title: "Galerie Numérique",
    description: "Accédez à toutes vos photos en ligne après votre événement."
  }
];

const Features = () => {
  return (
    <section id="features" className="section bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Pourquoi Choisir Nos <span className="text-primary">Photobooths</span>
          </motion.h2>
          <motion.div 
            className="w-20 h-1 bg-secondary mx-auto mb-6"
            initial={{ width: 0 }}
            whileInView={{ width: 80 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          />
          <motion.p 
            className="max-w-2xl mx-auto text-gray-600"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Nos photobooths combinent élégance, facilité d'utilisation et divertissement pour rendre votre événement inoubliable.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="card p-6 hover:border-l-4 hover:border-primary"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;