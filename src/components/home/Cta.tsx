import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Cta = () => {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full transform translate-x-1/3 translate-y-1/3"></div>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Prêt à Créer des Souvenirs Inoubliables?
          </motion.h2>
          
          <motion.p 
            className="text-lg text-white opacity-90 mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Réservez dès maintenant et offrez à vos invités une expérience unique et mémorable.
            Nos photobooths sont disponibles pour tous types d'événements.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              to="/booking"
              className="btn-accent text-lg px-8 py-4 shadow-lg"
            >
              Réserver Maintenant
            </Link>
            <Link
              to="/contact"
              className="btn-outline border-white text-white hover:bg-white hover:text-primary text-lg px-8 py-4"
            >
              Nous Contacter
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Cta;