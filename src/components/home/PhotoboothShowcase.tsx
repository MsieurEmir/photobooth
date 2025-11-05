import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const photoboothTypes = [
  {
    name: "Premium Booth",
    description: "Notre modèle haut de gamme avec fonctionnalités avancées pour une expérience immersive.",
    image: "https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    price: "À partir de 650€",
    features: ["Écran tactile 24\"", "Fond vert", "GIF animés", "Partage réseaux sociaux"]
  },
  {
    name: "Mirror Booth",
    description: "Un miroir interactif élégant pour les événements sophistiqués.",
    image: "https://images.pexels.com/photos/5935738/pexels-photo-5935738.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    price: "À partir de 750€",
    features: ["Écran miroir", "Animations tactiles", "Signatures numériques", "Élégant et moderne"]
  },
  {
    name: "360° Booth",
    description: "Une expérience immersive à 360 degrés pour des vidéos spectaculaires.",
    image: "https://balloonsme.com/cdn/shop/products/360photoboothmain_720x.jpg?v=1683733109",
    price: "À partir de 950€",
    features: ["Plateforme rotative", "Vidéos slow motion", "Montage instantané", "Partage direct"]
  }
];

const PhotoboothShowcase = () => {
  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Nos <span className="text-primary">Photobooths</span>
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
            Découvrez notre sélection exclusive de photobooths pour rendre votre événement inoubliable.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {photoboothTypes.map((booth, index) => (
            <motion.div
              key={index}
              className="card overflow-hidden group hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={booth.image} 
                  alt={booth.name} 
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="bg-primary px-3 py-1 rounded-full text-sm font-medium">
                    {booth.price}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-3">{booth.name}</h3>
                <p className="text-gray-600 mb-4">{booth.description}</p>
                <ul className="space-y-2 mb-6">
                  {booth.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-accent-coral rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link 
                  to={`/booking`} 
                  className="btn-primary w-full text-center justify-center"
                >
                  Réserver maintenant
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhotoboothShowcase;